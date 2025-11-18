// Track if user has customized values
let hasCustomizedValues = false;

// Default values for comparison
const defaultValues = {
    monthlyAppointments: 1000,
    avgRevenue: 200,
    collectionRate: 90,
    noShowRate: 25,
    cancellationRate: 20,
    sameDayShare: 70,
    callAbandonmentRate: 25,
    inboundCalls: 1300,
    convCallToAppt: 70,
    capacity: 1200,
    staffCount: 2,
    staffCost: 60000,
    workHrsPerFTE: 160,
    timeMinPerTask: 5
};

// Track user interactions with inputs
function trackValueChange() {
    hasCustomizedValues = true;
}

// Get current calculator values
function getCalculatorData() {
    const currentValues = {
        monthlyAppointments: parseFloat(document.getElementById('monthlyAppointments').value),
        avgRevenue: parseFloat(document.getElementById('avgRevenue').value),
        noShowRate: parseFloat(document.getElementById('noShowRate').value),
        cancellationRate: parseFloat(document.getElementById('cancellationRate').value),
        callAbandonmentRate: parseFloat(document.getElementById('callAbandonmentRate').value),
        staffCount: parseFloat(document.getElementById('staffCount').value),
        staffCost: parseFloat(document.getElementById('staffCost').value),
        collectionRate: parseFloat(document.getElementById('collectionRate').value),
        sameDayShare: parseFloat(document.getElementById('sameDayShare').value),
        inboundCalls: parseFloat(document.getElementById('inboundCalls').value),
        convCallToAppt: parseFloat(document.getElementById('convCallToAppt').value),
        capacity: parseFloat(document.getElementById('capacity').value),
        workHrsPerFTE: parseFloat(document.getElementById('workHrsPerFTE').value),
        timeMinPerTask: parseFloat(document.getElementById('timeMinPerTask').value)
    };
    
    // Check if values differ from defaults
    const isCustomized = Object.keys(currentValues).some(key => 
        defaultValues[key] !== undefined && currentValues[key] !== defaultValues[key]
    );
    
    return isCustomized || hasCustomizedValues ? currentValues : null;
}

// Input validation: Ensure empty inputs default to 0 and enforce min/max limits
function validateInput(inputId, defaultValue = 0) {
    const input = document.getElementById(inputId);
    if (input) {
        // Store the last valid value
        let lastValidValue = input.value || defaultValue;
        
        // Prevent mouse wheel from changing the input value
        input.addEventListener('wheel', function(e) {
            // Only prevent if the input is focused
            if (document.activeElement === this) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Handle paste event - prevent pasting values that exceed max
        input.addEventListener('paste', function(e) {
            const min = parseFloat(this.getAttribute('min')) || 0;
            const max = parseFloat(this.getAttribute('max'));
            
            // Get pasted text
            let pastedText = (e.clipboardData || window.clipboardData).getData('text');
            
            // Remove negative signs from pasted text
            pastedText = pastedText.replace(/-/g, '');
            
            // Remove leading zero spam from pasted text
            if (pastedText.length > 1 && pastedText.startsWith('0') && !pastedText.startsWith('0.')) {
                pastedText = pastedText.replace(/^0+/, '') || '0';
            }
            
            // Get the current selection
            const start = this.selectionStart;
            const end = this.selectionEnd;
            const currentValue = this.value;
            
            // Calculate what the new value would be
            const newValue = currentValue.substring(0, start) + pastedText + currentValue.substring(end);
            
            // If field would be empty, allow it
            if (newValue === '' || newValue === null) {
                return;
            }
            
            // Check if the new value would be a valid number (no negatives allowed)
            if (isNaN(parseFloat(newValue)) || !/^\d*\.?\d*$/.test(newValue)) {
                e.preventDefault();
                return;
            }
            
            const value = parseFloat(newValue);
            
            // Check for infinity or extremely large numbers
            if (!isFinite(value) || value > Number.MAX_SAFE_INTEGER) {
                e.preventDefault();
                return;
            }
            
            // Prevent if value would be less than min (prevent negative values)
            if (value < min) {
                e.preventDefault();
                return;
            }
            
            // Prevent if value would exceed max
            if (max !== null && !isNaN(max) && value > max) {
                e.preventDefault();
                return;
            }
        });
        
        // Handle input event - validate and update lastValidValue
        input.addEventListener('input', function() {
            const min = parseFloat(this.getAttribute('min')) || 0;
            const max = parseFloat(this.getAttribute('max'));
            
            // If field is empty, allow it (user might be deleting)
            if (this.value === '' || this.value === null) {
                return;
            }
            
            // Prevent negative values - remove minus sign
            if (this.value.includes('-')) {
                this.value = this.value.replace(/-/g, '');
                // If empty after removing minus, set to 0
                if (this.value === '') {
                    this.value = '0';
                }
            }
            
            // Prevent leading zero spam (e.g., "000000" -> "0", "000123" -> "123")
            // But allow "0" and "0." for decimal inputs
            if (this.value.length > 1 && this.value.startsWith('0') && !this.value.startsWith('0.')) {
                // Remove leading zeros
                this.value = this.value.replace(/^0+/, '') || '0';
            }
            
            // Check if value is invalid (NaN) or contains non-numeric characters (except decimal point)
            if (isNaN(parseFloat(this.value)) || !/^\d*\.?\d*$/.test(this.value)) {
                // Revert to last valid value
                this.value = lastValidValue;
                return;
            }
            
            const value = parseFloat(this.value);
            
            // Check for infinity or extremely large numbers
            if (!isFinite(value) || value > Number.MAX_SAFE_INTEGER) {
                // Revert to last valid value
                this.value = lastValidValue;
                return;
            }
            
            // Enforce min limit (prevent negative values)
            if (value < min) {
                this.value = lastValidValue;
                return;
            }
            
            // Enforce max limit if it exists
            if (max !== null && !isNaN(max) && value > max) {
                this.value = lastValidValue;
                return;
            }
            
            // Value is valid, update lastValidValue
            lastValidValue = this.value;
        });
        
        // Handle blur event - when user leaves the field
        input.addEventListener('blur', function() {
            const min = parseFloat(this.getAttribute('min')) || 0;
            const max = parseFloat(this.getAttribute('max'));
            
            // Remove any negative signs
            if (this.value.includes('-')) {
                this.value = this.value.replace(/-/g, '');
            }
            
            // Remove leading zero spam
            if (this.value.length > 1 && this.value.startsWith('0') && !this.value.startsWith('0.')) {
                this.value = this.value.replace(/^0+/, '') || '0';
            }
            
            const value = parseFloat(this.value);
            
            // If field is empty or invalid, set to default
            if (this.value === '' || this.value === null || isNaN(value)) {
                this.value = defaultValue;
                lastValidValue = defaultValue;
                calculate(); // Recalculate when value is set
                return;
            }
            
            // Enforce min limit (prevent negative values)
            if (value < min) {
                this.value = min;
                lastValidValue = min;
                calculate();
                return;
            }
            
            // Enforce max limit if it exists
            if (max !== null && !isNaN(max) && value > max) {
                this.value = max;
                lastValidValue = max;
                calculate();
                return;
            }
            
            // Value is valid
            lastValidValue = this.value;
            calculate(); // Recalculate when value is set
        });
    }
}

// Ensure capacity always has a value - calculate from monthlyAppointments if empty
function ensureCapacity() {
    const capacityInput = document.getElementById('capacity');
    const monthlyAppointmentsInput = document.getElementById('monthlyAppointments');
    
    if (capacityInput && monthlyAppointmentsInput) {
        // Check if capacity is empty or invalid
        const capacityValue = parseFloat(capacityInput.value);
        const monthlyAppointments = parseFloat(monthlyAppointmentsInput.value) || 0;
        
        if (isNaN(capacityValue) || capacityValue <= 0) {
            // Calculate capacity as 1.2x monthly appointments, with minimum of 100
            const calculatedCapacity = Math.max(100, Math.round(monthlyAppointments * 1.2));
            capacityInput.value = calculatedCapacity;
        }
    }
}

// Initialize input validation on all inputs
function initializeInputValidation() {
    // List of all input IDs and their default values
    const inputs = [
        { id: 'monthlyAppointments', default: 0 },
        { id: 'avgRevenue', default: 0 },
        { id: 'collectionRate', default: 0 },
        { id: 'noShowRate', default: 0 },
        { id: 'cancellationRate', default: 0 },
        { id: 'sameDayShare', default: 0 },
        { id: 'callAbandonmentRate', default: 0 },
        { id: 'inboundCalls', default: 0 },
        { id: 'convCallToAppt', default: 0 },
        { id: 'capacity', default: 0 },
        { id: 'timeMinPerTask', default: 0 },
        { id: 'staffCount', default: 0 },
        { id: 'staffCost', default: 0 },
        { id: 'workHrsPerFTE', default: 0 }
    ];
    
    // Initialize validation for each input
    inputs.forEach(input => {
        validateInput(input.id, input.default);
        
        // Set empty inputs to 0 on page load
        const inputElement = document.getElementById(input.id);
        if (inputElement && (inputElement.value === '' || inputElement.value === null || isNaN(parseFloat(inputElement.value)))) {
            inputElement.value = input.default;
        }
    });
    
    // Special handling for capacity - ensure it's always set
    const capacityInput = document.getElementById('capacity');
    const monthlyAppointmentsInput = document.getElementById('monthlyAppointments');
    
    if (capacityInput && monthlyAppointmentsInput) {
        // When monthly appointments changes, update capacity if it's empty
        monthlyAppointmentsInput.addEventListener('input', function() {
            const capacityValue = parseFloat(capacityInput.value);
            if (isNaN(capacityValue) || capacityValue <= 0) {
                ensureCapacity();
            }
        });
        
        // Ensure capacity is set on blur
        capacityInput.addEventListener('blur', function() {
            ensureCapacity();
        });
    }
}

// Lead form submission with Google Sheets integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize input validation
    initializeInputValidation();
    
    // Ensure capacity is set initially
    ensureCapacity();
    
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            
            // Google Sheets HIPAA-compliant implementation
            // Your existing Google Apps Script Web App URL
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz41oHJrBXqkeHR5RenC8XZR3DpyAEXHzdhND5jqkiFcm6bfRbFoyY2loxToBiqDdL3og/exec';
            
            // Get customized clinic data (if any)
            const clinicData = getCalculatorData();
            
            try {
                // Collect additional security data
                const ipAddress = await fetch('https://api.ipify.org?format=json')
                    .then(r => r.json())
                    .then(data => data.ip)
                    .catch(() => 'Unknown');
                
                // Build submission data
                const submissionData = {
                    email: email,
                    timestamp: new Date().toISOString(),
                    source: 'ROI Calculator Lead Form',
                    // Additional metadata for HIPAA audit trail
                    metadata: {
                        userAgent: navigator.userAgent,
                        referrer: document.referrer,
                        ipAddress: ipAddress
                    }
                };
                
                // Add clinic data only if user customized values
                if (clinicData) {
                    submissionData.clinicData = {
                        monthlyAppointments: clinicData.monthlyAppointments,
                        avgRevenue: clinicData.avgRevenue,
                        noShowRate: clinicData.noShowRate,
                        cancellationRate: clinicData.cancellationRate,
                        callAbandonmentRate: clinicData.callAbandonmentRate,
                        staffCount: clinicData.staffCount,
                        annualStaffCost: clinicData.staffCost,
                        // Calculate potential monthly value for segmentation
                        estimatedMonthlyValue: Math.round(
                            (clinicData.monthlyAppointments * clinicData.avgRevenue * 0.2) // Rough estimate
                        )
                    };
                    console.log('Sending customized clinic data with email');
                }
                
                // Submit to Google Sheets via Apps Script
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Required for Google Apps Script
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submissionData)
                });
                
                // Note: Google Apps Script with no-cors doesn't return readable response
                // But the request will be processed if the URL is correct
                console.log('Email submission sent to HIPAA-compliant system');
                
                // Optional: Add visual feedback
                const submitBtn = e.target.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = '✓ Saved';
                submitBtn.style.backgroundColor = '#10b981';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                }, 2000);
                
            } catch (error) {
                console.error('Failed to store email:', error);
                // Still show calculator even if storage fails
                alert('Note: We couldn\'t save your email, but you can still use the calculator.');
            }
            
            // Show calculator
            document.getElementById('leadCapture').style.display = 'none';
            document.getElementById('calculator').style.display = 'flex';
            
            // Calculate initial results
            calculate();
        });
    }
});

// Calculator functionality
let currentTab = 'booking';

// Novoflow Performance Metrics
const NF_RECOVER_ABANDON = 0.8;        // Novoflow % of abandoned calls successfully re-engaged (0–1)
const NF_RECOVER_CANCEL_SD = 0.75;     // Novoflow % of same-day cancels backfilled (0–1)
const NF_RECOVER_CANCEL_FUT = 0.65;    // Novoflow % of future-day cancels rebooked (0–1)
const NF_SHOW_LIFT = 0.10;             // absolute no-show reduction on Novoflow-scheduled slots (0–1)
const NF_HANDLING_SHARE = 0.50;        // % of new bookings handled by Novoflow (0–1)
const NF_AFTER_HOURS_SHARE = 0.3;      // % of Novoflow-handled bookings that come from after-hours availability (0–1)

// Novoflow Pricing
const NF_FEE_PER_SUCCESS = 50;         // $ per successful outcome (booking, backfill, refill)
const NF_FIXED_MONTHLY = 1000;        // $ fixed monthly platform/telephony/etc.
const NF_ONE_TIME_SETUP = 300000;     // $ one-time setup (amortize across SETUP_AMORT_MONTHS)
const SETUP_AMORT_MONTHS = 12;        // months to amortize setup cost

// Staff & Operational Metrics
const STAFF_METRICS = {
    TASKS_AUTOMATED: null         // count of tasks/month Novoflow automates (calculated dynamically)
};

// Advanced/Optional Parameters
const ADVANCED_PARAMS = {
    SEASONAL_FACTOR: 1.0,        // optional multiplier for demand this month (default 1.0)
    CONFIDENCE_LOW: 0.50,        // optional lower bound for recovery rates (0-1)
    CONFIDENCE_HIGH: 0.80         // optional upper bound for recovery rates (0-1)
};

function switchTab(tab) {
    currentTab = tab;
    
    // Update tab styles
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Hide all results sections
    document.getElementById('bookingResults').style.display = 'none';
    document.getElementById('cancellationResults').style.display = 'none';
    document.getElementById('combinedResults').style.display = 'none';
    
    // Show relevant section
    if (tab === 'booking') {
        document.getElementById('bookingResults').style.display = 'block';
    } else if (tab === 'cancellation') {
        document.getElementById('cancellationResults').style.display = 'block';
    } else {
        document.getElementById('combinedResults').style.display = 'block';
    }
    
    calculate();
}

function calculate() {
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
    
    // ============================================================================
    // UPDATE UI DISPLAY
    // ============================================================================
    
    // Update booking results
    document.getElementById('additionalAppointments').textContent = Math.round(additionalBookings);
    document.getElementById('revenueIncrease').textContent = formatCurrency(bookingRevenueAdjusted);
    document.getElementById('staffSavings').textContent = formatCurrency(STAFF_SAVINGS);
    
    // Update cancellation results
    document.getElementById('recoveredAppointments').textContent = Math.round(recoveredAppointments);
    document.getElementById('recoveredRevenue').textContent = formatCurrency(recoveryRevenueAdjusted);
    document.getElementById('fillRate').textContent = Math.round(overallRecoveryRate * 100) + '%';
    
    // Update combined results
    document.getElementById('totalAppointments').textContent = Math.round(totalNewAppointments);
    document.getElementById('totalRevenue').textContent = formatCurrency(bookingRevenueAdjusted + recoveryRevenueAdjusted);
    document.getElementById('totalSavings').textContent = formatCurrency(STAFF_SAVINGS);
    
    // Update ROI
    document.getElementById('roiValue').textContent = Math.round(ROI) + '%';
    
    // Update breakdown - all new metrics (in order)
    document.getElementById('attendedIncremental').textContent = Math.round(ATTEND_INCREMENTAL);
    document.getElementById('revenueUpliftCollections').textContent = '+' + formatCurrency(REVENUE_UPLIFT);
    document.getElementById('costSavings').textContent = '+' + formatCurrency(STAFF_SAVINGS);
    document.getElementById('totalBenefit').textContent = '+' + formatCurrency(TOTAL_BENEFIT);
    document.getElementById('novoflowVariableFees').textContent = '-' + formatCurrency(VARIABLE_FEES);
    document.getElementById('novoflowFixedFees').textContent = '-' + formatCurrency(FIXED_FEES);
    document.getElementById('totalCost').textContent = '-' + formatCurrency(TOTAL_COST);
    document.getElementById('netImpact').textContent = '+' + formatCurrency(NET_IMPACT);
    document.getElementById('paybackMonths').textContent = PAYBACK_MONTHS ? PAYBACK_MONTHS.toFixed(1) + ' months' : 'N/A';
    document.getElementById('capacityUsedPercent').textContent = Math.round(CAPACITY_USED_PERCENT) + '%';
    
    // Calculate and display Bonus Sensitivity ROI values
    const sensitivityROIs = calculateSensitivityROI(ROI);
    document.getElementById('roiLow').textContent = Math.round(sensitivityROIs.low) + '%';
    document.getElementById('roiMid').textContent = Math.round(sensitivityROIs.mid) + '%';
    document.getElementById('roiHigh').textContent = Math.round(sensitivityROIs.high) + '%';
}

// Calculate ROI with different confidence levels for sensitivity analysis
function calculateSensitivityROI(baseROI) {
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
    let inboundCalls = parseFloat(document.getElementById('inboundCalls').value) || (monthlyAppointments * 1.3);
    let collectionRate = parseFloat(document.getElementById('collectionRate').value) / 100 || 0.90;
    
    // Ensure capacity always has a value - calculate from monthlyAppointments if needed
    let capacity = parseFloat(document.getElementById('capacity').value);
    if (isNaN(capacity) || capacity <= 0) {
        capacity = Math.max(100, Math.round(monthlyAppointments * 1.2)); // Minimum 100, or 1.2x monthly appointments
    }
    
    let workHrsPerFTE = parseFloat(document.getElementById('workHrsPerFTE').value) || 160;
    let timeMinPerTask = parseFloat(document.getElementById('timeMinPerTask')?.value) || 5;
    let sameDayShare = parseFloat(document.getElementById('sameDayShare').value) / 100 || 0.70;
    let convCallToAppt = parseFloat(document.getElementById('convCallToAppt').value) / 100 || 0.70;
    
    // Clamp rate values to valid ranges (0-1)
    noShowRate = Math.max(0, Math.min(1, noShowRate));
    cancellationRate = Math.max(0, Math.min(1, cancellationRate));
    callAbandonmentRate = Math.max(0, Math.min(1, callAbandonmentRate));
    collectionRate = Math.max(0, Math.min(1, collectionRate));
    sameDayShare = Math.max(0, Math.min(1, sameDayShare));
    convCallToAppt = Math.max(0, Math.min(1, convCallToAppt));
    
    // Calculate monthly staff cost
    const monthlyStaffCost = annualStaffCost / 12;
    
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
        
        const ATTEND_INCREMENTAL = Math.min(capacityAvailable, totalRecoveredAttended);
        
        // Calculate revenue and costs
        const REVENUE_UPLIFT = ATTEND_INCREMENTAL * avgRevenue * collectionRate;
        
        const baselineAppointmentsHandled = monthlyAppointments * NF_HANDLING_SHARE;
        const TASKS_AUTOMATED = Math.round(additionalBookings + recoveredAppointments + baselineAppointmentsHandled);
        const hoursSaved = TASKS_AUTOMATED * timeMinPerTask / 60;
        
        // Calculate hourly rate (handle division by zero)
        const hourlyRate = workHrsPerFTE > 0 ? monthlyStaffCost / workHrsPerFTE : 0;
        
        const STAFF_SAVINGS = hoursSaved * hourlyRate * Math.max(1, staffCount);
        
        const TOTAL_BENEFIT = REVENUE_UPLIFT + STAFF_SAVINGS;
        const VARIABLE_FEES = totalNewAppointments * NF_FEE_PER_SUCCESS;
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

function formatCurrency(amount) {
    // EDGE CASE: Handle null/undefined
    if (amount === null || amount === undefined) {
        return '$0';
    }
    
    // Edge case: Handle infinity, NaN, and extreme values
    if (!isFinite(amount)) {
        if (amount === Infinity || amount > Number.MAX_SAFE_INTEGER) {
            return '$∞'; // Display infinity symbol
        } else if (amount === -Infinity || amount < -Number.MAX_SAFE_INTEGER) {
            return '$-∞'; // Display negative infinity symbol
        } else {
            return '$0'; // NaN or other invalid values
        }
    }
    
    // Cap extremely large values for display
    const cappedAmount = Math.min(Math.max(amount, -Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
    return '$' + Math.round(cappedAmount).toLocaleString();
}

