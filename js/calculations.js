// ============================================================================
// CALCULATIONS - Core ROI calculation logic
// ============================================================================

import { 
    NF_RECOVER_ABANDON, 
    NF_RECOVER_CANCEL_SD, 
    NF_RECOVER_CANCEL_FUT, 
    NF_SHOW_LIFT, 
    NF_HANDLING_SHARE, 
    NF_AFTER_HOURS_SHARE,
    NF_FEE_PER_SUCCESS,
    NF_FIXED_MONTHLY,
    NF_ONE_TIME_SETUP,
    SETUP_AMORT_MONTHS,
    STAFF_METRICS,
    ADVANCED_PARAMS
} from './constants.js';
import { ensureCapacity } from './inputValidation.js';
import { updateUI } from './uiUpdates.js';

// Main calculation function
export function calculate() {
    // GUARDRAILS IMPLEMENTATION:
    // 1. No_double_counting_cancellations: Recovered appointments capped at actual cancellations
    // 2. Collections_not_charges: All revenue calculations use collection rate (not gross charges)
    // 3. Capacity_respected: Total attended appointments capped to capacity, revenue adjusted accordingly
    
    // Ensure capacity is set before calculations
    ensureCapacity();
    
    // Get input values
    let monthlyAppointments = parseFloat(document.getElementById('monthlyAppointments').value) || 0;
    let avgRevenue = parseFloat(document.getElementById('avgRevenue').value) || 0;
    let noShowRate = parseFloat(document.getElementById('noShowRate').value) / 100 || 0;
    let cancellationRate = parseFloat(document.getElementById('cancellationRate').value) / 100 || 0;
    let callAbandonmentRate = parseFloat(document.getElementById('callAbandonmentRate').value) / 100 || 0;
    let staffCount = parseFloat(document.getElementById('staffCount').value) || 0;
    let annualStaffCost = parseFloat(document.getElementById('staffCost').value) || 0;
    let inboundCalls = parseFloat(document.getElementById('inboundCalls').value) || (monthlyAppointments * 1.3); // Use input or fallback to calculation
    let collectionRate = parseFloat(document.getElementById('collectionRate').value) / 100 || 0.90; // Convert percentage to decimal
    
    // Ensure capacity always has a value - calculate from monthlyAppointments if needed
    let capacity = parseFloat(document.getElementById('capacity').value);
    if (isNaN(capacity) || capacity <= 0) {
        capacity = Math.max(100, Math.round(monthlyAppointments * 1.2)); // Minimum 100, or 1.2x monthly appointments
        // Update the input field with the calculated value
        const capacityInput = document.getElementById('capacity');
        if (capacityInput) {
            capacityInput.value = capacity;
        }
    }
    
    let workHrsPerFTE = parseFloat(document.getElementById('workHrsPerFTE').value) || 160;
    let timeMinPerTask = parseFloat(document.getElementById('timeMinPerTask')?.value) || 5;
    let sameDayShare = parseFloat(document.getElementById('sameDayShare').value) / 100 || 0.70; // Convert percentage to decimal
    let convCallToAppt = parseFloat(document.getElementById('convCallToAppt').value) / 100 || 0.70; // Convert percentage to decimal
    
    // Clamp rate values to valid ranges (0-1)
    noShowRate = Math.max(0, Math.min(1, noShowRate));
    cancellationRate = Math.max(0, Math.min(1, cancellationRate));
    callAbandonmentRate = Math.max(0, Math.min(1, callAbandonmentRate));
    collectionRate = Math.max(0, Math.min(1, collectionRate));
    sameDayShare = Math.max(0, Math.min(1, sameDayShare));
    convCallToAppt = Math.max(0, Math.min(1, convCallToAppt));
    
    // ============================================================================
    // EDGE CASE: Rate combination validation
    // ============================================================================
    // Validate rate combinations don't exceed 100%
    if (noShowRate + cancellationRate > 1) {
        // Cap cancellation rate to ensure total doesn't exceed 100%
        cancellationRate = Math.max(0, 1 - noShowRate);
        // Update the input field
        const cancellationRateInput = document.getElementById('cancellationRate');
        if (cancellationRateInput) {
            cancellationRateInput.value = Math.round(cancellationRate * 100);
        }
    }
    
    // ============================================================================
    // EDGE CASE: Logical consistency checks
    // ============================================================================
    // Validate capacity is at least equal to monthly appointments
    if (capacity < monthlyAppointments) {
        capacity = monthlyAppointments;
        const capacityInput = document.getElementById('capacity');
        if (capacityInput) {
            capacityInput.value = capacity;
        }
    }
    
    // Validate inboundCalls makes logical sense
    if (inboundCalls < monthlyAppointments) {
        inboundCalls = monthlyAppointments; // Minimum should be at least monthly appointments
    }
    
    // Ensure timeMinPerTask has a minimum value
    if (timeMinPerTask <= 0) {
        timeMinPerTask = 1; // Minimum 1 minute
    }
    
    // Calculate monthly staff cost
    const monthlyStaffCost = Math.max(0, annualStaffCost / 12); // Ensure non-negative
    
    // ============================================================================
    // INTERMEDIATE CALCULATIONS (needed for main outputs)
    // ============================================================================
    
    // Calculate recovered appointments for booking and cancellation recovery
    // Formula: APPTS_RECOVER_ABANDON = INBOUND_CALLS * ABANDON_RATE * NF_RECOVER_ABANDON * CONV_CALL_TO_APPT
    const apptsRecoverAbandonRaw = inboundCalls * callAbandonmentRate * NF_RECOVER_ABANDON * convCallToAppt;
    
    // After-hours bookings boost from 24/7 availability
    // Formula: afterHoursBookings = APPTS_BASE * NF_HANDLING_SHARE * NF_AFTER_HOURS_SHARE
    const afterHoursBookings = monthlyAppointments * NF_HANDLING_SHARE * NF_AFTER_HOURS_SHARE;
    const additionalBookings = apptsRecoverAbandonRaw + afterHoursBookings;
    
    // Formula: APPTS_RECOVER_CANCEL_SD = APPTS_BASE * CANCEL_RATE * SAME_DAY_SHARE * NF_RECOVER_CANCEL_SD
    const recoveredSameDay = monthlyAppointments * cancellationRate * sameDayShare * NF_RECOVER_CANCEL_SD;
    
    // Formula: APPTS_RECOVER_CANCEL_FUT = APPTS_BASE * CANCEL_RATE * (1 - SAME_DAY_SHARE) * NF_RECOVER_CANCEL_FUT
    const recoveredFuture = monthlyAppointments * cancellationRate * (1 - sameDayShare) * NF_RECOVER_CANCEL_FUT;
    
    const monthlyCancellations = monthlyAppointments * cancellationRate;
    // EDGE CASE: Ensure recoveredAppointments is never negative
    let recoveredAppointments = Math.max(0, Math.min(recoveredSameDay + recoveredFuture, monthlyCancellations)); // GUARDRAIL: No_double_counting_cancellations
    
    const totalNewAppointments = additionalBookings + recoveredAppointments;
    // EDGE CASE: Round very small values to prevent precision issues
    const overallRecoveryRate = monthlyCancellations > 0 
        ? Math.max(0, Math.min(1, recoveredAppointments / monthlyCancellations)) 
        : 0;
    
    // ============================================================================
    // MAIN OUTPUT CALCULATIONS (in specified order)
    // ============================================================================
    
    // 1. ATTEND_INCREMENTAL
    // Formula: ATTEND_INCREMENTAL = min(CAP_MONTHLY_APPTS - APPTS_ATTENDED_BASE,
    //                                    APPTS_RECOVER_ABANDON + APPTS_RECOVER_CANCEL_SD + APPTS_RECOVER_CANCEL_FUT + APPTS_RECOVER_SHOWS)
    const noShowReduction = 1 - noShowRate;
    const baseAttended = monthlyAppointments * noShowReduction; // APPTS_ATTENDED_BASE
    
    const apptsRecoverAbandon = apptsRecoverAbandonRaw * noShowReduction;
    const apptsRecoverCancelSD = recoveredSameDay * noShowReduction;
    const apptsRecoverCancelFUT = recoveredFuture * noShowReduction;
    
    // APPTS_RECOVER_SHOWS: APPTS_NF_SCHEDULED * NF_SHOW_LIFT
    const apptsNF_Scheduled = monthlyAppointments * NF_HANDLING_SHARE;
    const apptsRecoverShows = apptsNF_Scheduled * NF_SHOW_LIFT;
    
    const totalRecoveredAttended = apptsRecoverAbandon + apptsRecoverCancelSD + apptsRecoverCancelFUT + apptsRecoverShows;
    
    // Calculate available capacity
    const capacityAvailable = capacity > 0 ? Math.max(0, capacity - baseAttended) : 1000000; // Default to large number if capacity is 0
    
    // EDGE CASE: Ensure ATTEND_INCREMENTAL is never negative
    const ATTEND_INCREMENTAL = Math.max(0, Math.min(capacityAvailable, totalRecoveredAttended));
    
    // 2. REVENUE_UPLIFT_COLLECTIONS
    // Formula: REVENUE_UPLIFT = ATTEND_INCREMENTAL * AVG_CHARGE * COLLECTION_RATE
    // EDGE CASE: Ensure revenue is never negative
    const REVENUE_UPLIFT = Math.max(0, ATTEND_INCREMENTAL * avgRevenue * collectionRate);
    
    // Calculate booking and recovery revenue for UI display purposes
    // (These are used for display but REVENUE_UPLIFT is the official calculation)
    const bookingRevenueGross = additionalBookings * avgRevenue;
    const bookingRevenue = bookingRevenueGross * collectionRate; // GUARDRAIL: Collections_not_charges
    const recoveryRevenueGross = recoveredAppointments * avgRevenue;
    const recoveryRevenue = recoveryRevenueGross * collectionRate; // GUARDRAIL: Collections_not_charges
    
    // Calculate capacity adjustment factor for display purposes
    // EDGE CASE: Handle division by zero in capacity adjustment
    let capacityAdjustmentFactor = 1.0;
    if (capacityAvailable < totalRecoveredAttended && totalRecoveredAttended > 0) {
        capacityAdjustmentFactor = capacityAvailable / totalRecoveredAttended;
        // Clamp to valid range [0, 1]
        capacityAdjustmentFactor = Math.max(0, Math.min(1, capacityAdjustmentFactor));
    } else if (totalRecoveredAttended === 0) {
        capacityAdjustmentFactor = 1.0; // No adjustment needed if nothing recovered
    }
    const bookingRevenueAdjusted = bookingRevenue * capacityAdjustmentFactor;
    const recoveryRevenueAdjusted = recoveryRevenue * capacityAdjustmentFactor;
    
    // 3. STAFF_SAVINGS
    // Formula breakdown:
    // TASKS_AUTOMATED = additionalBookings + recoveredAppointments + baselineAppointmentsHandled
    //   where baselineAppointmentsHandled = APPTS_BASE * NF_HANDLING_SHARE
    // HOURS_SAVED = TASKS_AUTOMATED * TIME_MIN_PER_TASK / 60
    // HOURLY_RATE = (STAFF_FULLY_LOADED / 12) / WORK_HRS_PER_FTE
    // STAFF_SAVINGS = HOURS_SAVED * HOURLY_RATE * STAFF_FTE
    const baselineAppointmentsHandled = monthlyAppointments * NF_HANDLING_SHARE;
    STAFF_METRICS.TASKS_AUTOMATED = Math.round(
        additionalBookings + recoveredAppointments + baselineAppointmentsHandled
    );
    const hoursSaved = STAFF_METRICS.TASKS_AUTOMATED * timeMinPerTask / 60;
    
    // Calculate hourly rate (handle division by zero)
    const hourlyRate = workHrsPerFTE > 0 ? monthlyStaffCost / workHrsPerFTE : 0;
    
    // EDGE CASE: Ensure STAFF_SAVINGS is never negative
    const STAFF_SAVINGS = Math.max(0, hoursSaved * hourlyRate * Math.max(1, staffCount));
    
    // 4. TOTAL_BENEFIT
    const TOTAL_BENEFIT = REVENUE_UPLIFT + STAFF_SAVINGS;
    
    // 5. NOVOFLOW_VARIABLE_FEES
    // Formula: VARIABLE_FEES = totalNewAppointments * NF_FEE_PER_SUCCESS
    // EDGE CASE: Ensure fees are never negative
    const VARIABLE_FEES = Math.max(0, totalNewAppointments * NF_FEE_PER_SUCCESS);
    
    // 6. NOVOFLOW_FIXED_FEES
    const FIXED_FEES = NF_FIXED_MONTHLY + (NF_ONE_TIME_SETUP / SETUP_AMORT_MONTHS);
    
    // 7. TOTAL_COST
    const TOTAL_COST = VARIABLE_FEES + FIXED_FEES;
    
    // 8. NET_IMPACT
    const NET_IMPACT = TOTAL_BENEFIT - TOTAL_COST;
    
    // 9. ROI
    // Handle division by zero
    const ROI = TOTAL_COST > 0 ? (NET_IMPACT / TOTAL_COST * 100) : 0;
    
    // 10. PAYBACK_MONTHS
    // Handle division by zero and negative values
    const PAYBACK_MONTHS = NET_IMPACT > 0 && NF_ONE_TIME_SETUP > 0 ? (NF_ONE_TIME_SETUP / NET_IMPACT) : null;
    
    // 11. CAPACITY_USED_%
    const totalAttended = baseAttended + ATTEND_INCREMENTAL;
    // EDGE CASE: Cap capacity used at 100% for display (though guardrails prevent exceeding in calculations)
    const CAPACITY_USED_PERCENT = capacity > 0 
        ? Math.min(100, Math.max(0, (totalAttended / capacity * 100))) 
        : 0;
    
    // Calculate sensitivity ROI values
    const sensitivityROIs = calculateSensitivityROI(ROI, monthlyAppointments, avgRevenue, noShowRate, cancellationRate, callAbandonmentRate, staffCount, annualStaffCost, inboundCalls, collectionRate, capacity, workHrsPerFTE, timeMinPerTask, sameDayShare, convCallToAppt, monthlyStaffCost);
    
    // Update UI with all calculated values
    updateUI({
        additionalBookings,
        bookingRevenueAdjusted,
        recoveryRevenueAdjusted,
        recoveredAppointments,
        overallRecoveryRate,
        totalNewAppointments,
        STAFF_SAVINGS,
        ATTEND_INCREMENTAL,
        REVENUE_UPLIFT,
        TOTAL_BENEFIT,
        VARIABLE_FEES,
        FIXED_FEES,
        TOTAL_COST,
        NET_IMPACT,
        ROI,
        PAYBACK_MONTHS,
        CAPACITY_USED_PERCENT,
        sensitivityROIs
    });
}

// Calculate ROI with different confidence levels for sensitivity analysis
export function calculateSensitivityROI(baseROI, monthlyAppointments, avgRevenue, noShowRate, cancellationRate, callAbandonmentRate, staffCount, annualStaffCost, inboundCalls, collectionRate, capacity, workHrsPerFTE, timeMinPerTask, sameDayShare, convCallToAppt, monthlyStaffCost) {
    
    // Calculate ROI for low and high confidence levels
    // LOW = BASE * CONFIDENCE_LOW
    // MID = BASE
    // HIGH = BASE * (1 / CONFIDENCE_HIGH) to ensure HIGH > MID
    const results = {
        mid: baseROI  // MID = BASE
    };
    
    // Calculate low ROI (pessimistic scenario) - adjust recovery rates DOWN
    const lowConfidenceFactor = ADVANCED_PARAMS.CONFIDENCE_LOW;  // 0.50
    const adjustedRecoverAbandonLow = NF_RECOVER_ABANDON * lowConfidenceFactor;
    const adjustedRecoverCancelSDLow = NF_RECOVER_CANCEL_SD * lowConfidenceFactor;
    const adjustedRecoverCancelFUTLow = NF_RECOVER_CANCEL_FUT * lowConfidenceFactor;
    const adjustedShowLiftLow = NF_SHOW_LIFT * lowConfidenceFactor;
    
    // Calculate high ROI (optimistic scenario) - adjust recovery rates UP
    // Use inverse to scale UP: if CONFIDENCE_HIGH = 0.80, then multiplier = 1/0.80 = 1.25
    const highConfidenceFactor = 1.0 / ADVANCED_PARAMS.CONFIDENCE_HIGH;  // 1.0 / 0.80 = 1.25
    const adjustedRecoverAbandonHigh = Math.min(1.0, NF_RECOVER_ABANDON * highConfidenceFactor);
    const adjustedRecoverCancelSDHigh = Math.min(1.0, NF_RECOVER_CANCEL_SD * highConfidenceFactor);
    const adjustedRecoverCancelFUTHigh = Math.min(1.0, NF_RECOVER_CANCEL_FUT * highConfidenceFactor);
    const adjustedShowLiftHigh = Math.min(1.0, NF_SHOW_LIFT * highConfidenceFactor);
    
    // Calculate ROI for low and high scenarios - both in scenarios array
    const scenarios = [
        { level: 'low', recoverAbandon: adjustedRecoverAbandonLow, recoverCancelSD: adjustedRecoverCancelSDLow, recoverCancelFUT: adjustedRecoverCancelFUTLow, showLift: adjustedShowLiftLow, confidenceFactor: ADVANCED_PARAMS.CONFIDENCE_LOW },
        { level: 'high', recoverAbandon: adjustedRecoverAbandonHigh, recoverCancelSD: adjustedRecoverCancelSDHigh, recoverCancelFUT: adjustedRecoverCancelFUTHigh, showLift: adjustedShowLiftHigh, confidenceFactor: ADVANCED_PARAMS.CONFIDENCE_HIGH }
    ];
    
    for (const scenario of scenarios) {
        const { level, recoverAbandon, recoverCancelSD, recoverCancelFUT, showLift, confidenceFactor } = scenario;
        
        // Recalculate with adjusted rates
        const apptsRecoverAbandonRaw = inboundCalls * callAbandonmentRate * recoverAbandon * convCallToAppt;
        const afterHoursBookings = monthlyAppointments * NF_HANDLING_SHARE * NF_AFTER_HOURS_SHARE;
        const additionalBookings = apptsRecoverAbandonRaw + afterHoursBookings;
        
        const recoveredSameDay = monthlyAppointments * cancellationRate * sameDayShare * recoverCancelSD;
        const recoveredFuture = monthlyAppointments * cancellationRate * (1 - sameDayShare) * recoverCancelFUT;
        const monthlyCancellations = monthlyAppointments * cancellationRate;
        const recoveredAppointments = Math.min(recoveredSameDay + recoveredFuture, monthlyCancellations);
        
        const totalNewAppointments = additionalBookings + recoveredAppointments;
        
        // Calculate attended incremental
        const noShowReduction = 1 - noShowRate;
        const baseAttended = monthlyAppointments * noShowReduction;
        
        const apptsRecoverAbandon = apptsRecoverAbandonRaw * noShowReduction;
        const apptsRecoverCancelSD = recoveredSameDay * noShowReduction;
        const apptsRecoverCancelFUT = recoveredFuture * noShowReduction;
        
        const apptsNF_Scheduled = monthlyAppointments * NF_HANDLING_SHARE;
        const apptsRecoverShows = apptsNF_Scheduled * showLift;
        
        const totalRecoveredAttended = apptsRecoverAbandon + apptsRecoverCancelSD + apptsRecoverCancelFUT + apptsRecoverShows;
        
        // Calculate available capacity
        const capacityAvailable = capacity > 0 ? Math.max(0, capacity - baseAttended) : 1000000; // Default to large number if capacity is 0
        
        // EDGE CASE: Ensure ATTEND_INCREMENTAL is never negative
        const ATTEND_INCREMENTAL = Math.max(0, Math.min(capacityAvailable, totalRecoveredAttended));
        
        // Calculate revenue and costs
        // EDGE CASE: Ensure revenue is never negative
        const REVENUE_UPLIFT = Math.max(0, ATTEND_INCREMENTAL * avgRevenue * collectionRate);
        
        const baselineAppointmentsHandled = monthlyAppointments * NF_HANDLING_SHARE;
        const TASKS_AUTOMATED = Math.round(additionalBookings + recoveredAppointments + baselineAppointmentsHandled);
        const hoursSaved = TASKS_AUTOMATED * timeMinPerTask / 60;
        
        // Calculate hourly rate (handle division by zero)
        const hourlyRate = workHrsPerFTE > 0 ? monthlyStaffCost / workHrsPerFTE : 0;
        
        // EDGE CASE: Ensure STAFF_SAVINGS is never negative
        const STAFF_SAVINGS = Math.max(0, hoursSaved * hourlyRate * Math.max(1, staffCount));
        
        const TOTAL_BENEFIT = REVENUE_UPLIFT + STAFF_SAVINGS;
        // EDGE CASE: Ensure fees are never negative
        const VARIABLE_FEES = Math.max(0, totalNewAppointments * NF_FEE_PER_SUCCESS);
        const FIXED_FEES = NF_FIXED_MONTHLY + (NF_ONE_TIME_SETUP / SETUP_AMORT_MONTHS);
        const TOTAL_COST = VARIABLE_FEES + FIXED_FEES;
        const NET_IMPACT = TOTAL_BENEFIT - TOTAL_COST;
        
        // Handle division by zero
        const calculatedROI = TOTAL_COST > 0 ? (NET_IMPACT / TOTAL_COST * 100) : 0;
        
        results[level] = calculatedROI;
    }
    
    return {
        low: results.low,
        mid: results.mid,
        high: results.high
    };
}

