// ============================================================================
// UTILITY FUNCTIONS - Helper functions for formatting and data handling
// ============================================================================

import { defaultValues } from './constants.js';

// Track if user has customized values
let hasCustomizedValues = false;

// Track user interactions with inputs
export function trackValueChange() {
    hasCustomizedValues = true;
}

// Get current calculator values
export function getCalculatorData() {
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

// Format currency for display
export function formatCurrency(amount) {
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
    return '$' + Math.abs(Math.round(cappedAmount)).toLocaleString();
}

