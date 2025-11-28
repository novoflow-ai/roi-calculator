// ============================================================================
// CONSTANTS - Novoflow Performance Metrics and Configuration
// ============================================================================

// Default values for comparison
export const defaultValues = {
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

// Novoflow Performance Metrics
export const NF_RECOVER_ABANDON = 0.8;        // Novoflow % of abandoned calls successfully re-engaged (0–1)
export const NF_RECOVER_CANCEL_SD = 0.75;     // Novoflow % of same-day cancels backfilled (0–1)
export const NF_RECOVER_CANCEL_FUT = 0.65;    // Novoflow % of future-day cancels rebooked (0–1)
export const NF_SHOW_LIFT = 0.10;             // absolute no-show reduction on Novoflow-scheduled slots (0–1)
export const NF_HANDLING_SHARE = 0.50;        // % of new bookings handled by Novoflow (0–1)
export const NF_AFTER_HOURS_SHARE = 0.3;      // % of Novoflow-handled bookings that come from after-hours availability (0–1)

// Novoflow Pricing
export const NF_FEE_PER_SUCCESS = 50;         // $ per successful outcome (booking, backfill, refill)
export const NF_FIXED_MONTHLY = 1000;        // $ fixed monthly platform/telephony/etc.
export const NF_ONE_TIME_SETUP = 300000;     // $ one-time setup (amortize across SETUP_AMORT_MONTHS)
export const SETUP_AMORT_MONTHS = 12;        // months to amortize setup cost

// Staff & Operational Metrics
export const STAFF_METRICS = {
    TASKS_AUTOMATED: null         // count of tasks/month Novoflow automates (calculated dynamically)
};

// Advanced/Optional Parameters
export const ADVANCED_PARAMS = {
    SEASONAL_FACTOR: 1.0,        // optional multiplier for demand this month (default 1.0)
    CONFIDENCE_LOW: 0.50,        // optional lower bound for recovery rates (0-1)
    CONFIDENCE_HIGH: 0.80         // optional upper bound for recovery rates (0-1)
};

// Google Sheets integration URL
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz41oHJrBXqkeHR5RenC8XZR3DpyAEXHzdhND5jqkiFcm6bfRbFoyY2loxToBiqDdL3og/exec';

// Fields that default to non-zero values in calculations.js when 0 is inputted
// These fields will revert to their HTML default value when set to 0
export const FIELDS_WITH_CALCULATIONS_DEFAULTS = new Set([
    'collectionRate',      // defaults to 0.90 (90%) in calculations.js
    'workHrsPerFTE',      // defaults to 160 in calculations.js
    'timeMinPerTask',     // defaults to 5 in calculations.js
    'sameDayShare',       // defaults to 0.70 (70%) in calculations.js
    'convCallToAppt'      // defaults to 0.70 (70%) in calculations.js
]);

// HTML default values for fields that should revert when set to 0 (from HTML value attributes)
export const HTML_DEFAULTS_FOR_REVERT = {
    'collectionRate': 90,
    'workHrsPerFTE': 160,
    'timeMinPerTask': 5,
    'sameDayShare': 70,
    'convCallToAppt': 70
};

