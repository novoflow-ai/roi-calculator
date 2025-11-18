// ============================================================================
// UI UPDATES - Handles all DOM updates and UI interactions
// ============================================================================

import { formatCurrency } from './utils.js';
import { calculate } from './calculations.js';

// Track current active tab
let currentTab = 'booking';

// Switch between calculator tabs
export function switchTab(tab) {
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

// Update all UI elements with calculated values
export function updateUI(results) {
    const {
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
    } = results;
    
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
    document.getElementById('roiLow').textContent = Math.round(sensitivityROIs.low) + '%';
    document.getElementById('roiMid').textContent = Math.round(sensitivityROIs.mid) + '%';
    document.getElementById('roiHigh').textContent = Math.round(sensitivityROIs.high) + '%';
}

