// ============================================================================
// INPUT VALIDATION - Handles input sanitization, validation, and edge cases
// ============================================================================

import { FIELDS_WITH_CALCULATIONS_DEFAULTS, HTML_DEFAULTS_FOR_REVERT } from './constants.js';

// Note: calculate() is called via window.calculate to avoid circular dependencies

/**
 * Sanitizes text by removing negative signs
 */
function removeNegativeSigns(text) {
    return text.replace(/-/g, '');
}

/**
 * Sanitizes text by removing decimal points
 */
function removeDecimalPoints(text) {
    return text.replace(/\./g, '');
}

/**
 * Removes leading zeros from text (but allows "0" and "0.")
 */
function removeLeadingZeros(text, allowDecimals = true) {
    if (text.length > 1 && text.startsWith('0') && !(allowDecimals && text.startsWith('0.'))) {
        return text.replace(/^0+/, '') || '0';
    }
    return text;
}

/**
 * Sanitizes pasted text based on validation rules
 */
function sanitizePastedText(pastedText, allowDecimals) {
    let sanitized = pastedText;
    
    // Remove negative signs
    sanitized = removeNegativeSigns(sanitized);
    
    // Remove decimal points if not allowed
    if (!allowDecimals) {
        sanitized = removeDecimalPoints(sanitized);
    }
    
    // Remove leading zeros
    sanitized = removeLeadingZeros(sanitized, allowDecimals);
    
    return sanitized;
}

/**
 * Gets the number regex pattern based on whether decimals are allowed
 */
function getNumberRegex(allowDecimals) {
    return allowDecimals ? /^\d*\.?\d*$/ : /^\d+$/;
}

/**
 * Validates if a value is a valid number
 */
function isValidNumber(value, allowDecimals) {
    if (value === '' || value === null) {
        return false;
    }
    
    const numberRegex = getNumberRegex(allowDecimals);
    const parsed = parseFloat(value);
    
    return !isNaN(parsed) && numberRegex.test(value) && !value.includes('-');
}

/**
 * Validates if a value is within min/max bounds
 */
function isWithinBounds(value, min, max) {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || !isFinite(numValue) || numValue > Number.MAX_SAFE_INTEGER) {
        return false;
    }
    
    if (numValue < min) {
        return false;
    }
    
    if (max !== null && !isNaN(max) && numValue > max) {
        return false;
    }
    
    return true;
}

/**
 * Checks if a key is a negative sign
 */
function isNegativeKey(key, keyCode) {
    return key === '-' || key === 'Minus' || keyCode === 189 || keyCode === 109;
}

/**
 * Checks if a key is a decimal point
 */
function isDecimalKey(key, keyCode) {
    return key === '.' || key === 'Decimal' || keyCode === 190 || keyCode === 110;
}

/**
 * Checks if input data contains invalid characters (letters, etc.)
 */
function containsInvalidCharacters(data, allowDecimals) {
    if (!data) return false;
    
    // Remove allowed characters and check if anything remains
    // Note: minus signs are handled separately, so we only check for digits and decimal point
    const allowedPattern = allowDecimals ? /[\d.]/g : /[\d]/g;
    const cleaned = data.replace(allowedPattern, '');
    
    // If anything remains after removing allowed chars, it's invalid
    return cleaned.length > 0;
}

/**
 * Sanitizes the current input value
 */
function sanitizeInputValue(value, allowDecimals) {
    let sanitized = value;
    
    // Remove negative signs
    if (sanitized.includes('-')) {
        sanitized = removeNegativeSigns(sanitized);
        if (sanitized === '') {
            sanitized = '0';
        }
    }
    
    // Remove decimal points if not allowed
    if (!allowDecimals && sanitized.includes('.')) {
        sanitized = removeDecimalPoints(sanitized);
    }
    
    // Remove leading zeros
    sanitized = removeLeadingZeros(sanitized, allowDecimals);
    
    return sanitized;
}

// ============================================================================
// EVENT HANDLERS - Individual event handler functions
// ============================================================================

/**
 * Creates a keydown event handler
 */
function createKeydownHandler(allowDecimals) {
    return function(e) {
        // Block negative signs
        if (isNegativeKey(e.key, e.keyCode)) {
            e.preventDefault();
            return false;
        }
        
        // Block decimal point if decimals are not allowed
        if (!allowDecimals && isDecimalKey(e.key, e.keyCode)) {
            e.preventDefault();
            return false;
        }
    };
}

/**
 * Creates a beforeinput event handler
 */
function createBeforeInputHandler(allowDecimals) {
    return function(e) {
        // Block negative signs
        if (e.data && e.data.includes('-')) {
            e.preventDefault();
            return false;
        }
        
        // Block decimal point if decimals are not allowed
        if (!allowDecimals && e.data && e.data.includes('.')) {
            e.preventDefault();
            return false;
        }
        
        // Block invalid characters (letters, etc.) - this fixes the letter input bug
        if (e.data && containsInvalidCharacters(e.data, allowDecimals)) {
            e.preventDefault();
            return false;
        }
    };
}

/**
 * Creates a wheel event handler
 */
function createWheelHandler() {
    return function(e) {
        // Only prevent if the input is focused
        if (document.activeElement === this) {
            e.preventDefault();
        }
    };
}

/**
 * Creates a paste event handler
 */
function createPasteHandler(allowDecimals, lastValidValueRef) {
    return function(e) {
        const min = parseFloat(this.getAttribute('min')) || 0;
        const max = parseFloat(this.getAttribute('max'));
        
        // Get pasted text
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        
        // Sanitize pasted text
        let sanitizedText = sanitizePastedText(pastedText, allowDecimals);
        
        // Get the current selection
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const currentValue = this.value;
        
        // Calculate what the new value would be
        let newValue = currentValue.substring(0, start) + sanitizedText + currentValue.substring(end);
        
        // Sanitize the entire new value
        newValue = sanitizeInputValue(newValue, allowDecimals);
        
        // If field would be empty, allow it
        if (newValue === '' || newValue === null) {
            return; // Allow empty paste
        }
        
        // Validate the new value
        if (!isValidNumber(newValue, allowDecimals)) {
            return;
        }
        
        // Check bounds
        if (!isWithinBounds(newValue, min, max)) {
            return;
        }
        
        this.value = newValue;
        lastValidValueRef.value = newValue;
        
        // Trigger input event to ensure other handlers run
        this.dispatchEvent(new Event('input', { bubbles: true }));
    };
}

/**
 * Creates an input event handler
 */
function createInputHandler(allowDecimals, lastValidValueRef, defaultValue) {
    return function() {
        const min = parseFloat(this.getAttribute('min')) || 0;
        const max = parseFloat(this.getAttribute('max'));
        
        // Store cursor position before any modifications
        const cursorPosition = this.selectionStart;
        const originalValue = this.value;
        
        // If field is empty, allow it (user might be deleting)
        if (this.value === '' || this.value === null) {
            return;
        }
        
        // Check for partial decimal input 
        const isValidPartial = allowDecimals && (this.value.endsWith('.') || this.value === '.');
        
        // Check if there are leading zeros that should be removed (but allow "0" and "0.")
        const hasLeadingZeros = this.value.length > 1 && 
                                 this.value.startsWith('0') && 
                                 !(allowDecimals && this.value.startsWith('0.'));
        
        const needsSanitization = !isValidPartial && (
            this.value.includes('-') || 
            (!allowDecimals && this.value.includes('.')) ||
            hasLeadingZeros
        );
        
        if (needsSanitization) {
            // Sanitize the value
            this.value = sanitizeInputValue(this.value, allowDecimals);
            // Restore cursor position after sanitization
            requestAnimationFrame(() => {
                const lengthDiff = this.value.length - originalValue.length;
                const newPosition = Math.max(0, Math.min(cursorPosition + lengthDiff, this.value.length));
                this.setSelectionRange(newPosition, newPosition);
            });
        }
        
        
        // Double-check: if value still contains minus signs, revert immediately
        if (this.value.includes('-')) {
            this.value = lastValidValueRef.value;
            requestAnimationFrame(() => {
                const newPosition = Math.min(cursorPosition, this.value.length);
                this.setSelectionRange(newPosition, newPosition);
            });
            return;
        }
        
        // For partial decimal input, allow it (user is still typing)
        if (isValidPartial) {
            lastValidValueRef.value = this.value;
            return;
        }
        
        // Validate the value
        if (!isValidNumber(this.value, allowDecimals)) {
            // Revert to last valid value
            this.value = lastValidValueRef.value;
            requestAnimationFrame(() => {
                const newPosition = Math.min(cursorPosition, this.value.length);
                this.setSelectionRange(newPosition, newPosition);
            });
            return;
        }
        
        const numValue = parseFloat(this.value);
        
        // Check for infinity or extremely large numbers
        if (!isFinite(numValue) || numValue > Number.MAX_SAFE_INTEGER) {
            // Revert to last valid value
            this.value = lastValidValueRef.value;
            requestAnimationFrame(() => {
                const newPosition = Math.min(cursorPosition, this.value.length);
                this.setSelectionRange(newPosition, newPosition);
            });
            return;
        }
        
        // Enforce min limit
        if (numValue < min) {
            this.value = lastValidValueRef.value;
            requestAnimationFrame(() => {
                const newPosition = Math.min(cursorPosition, this.value.length);
                this.setSelectionRange(newPosition, newPosition);
            });
            return;
        }
        
        // Enforce max limit if it exists
        if (max !== null && !isNaN(max) && numValue > max) {
            this.value = lastValidValueRef.value;
            requestAnimationFrame(() => {
                const newPosition = Math.min(cursorPosition, this.value.length);
                this.setSelectionRange(newPosition, newPosition);
            });
            return;
        }
        
        // Value is valid, update lastValidValue
        lastValidValueRef.value = this.value;
    };
}

/**
 * Creates a blur event handler
 */
function createBlurHandler(allowDecimals, lastValidValueRef, defaultValue, inputId) {
    return function() {
        const min = parseFloat(this.getAttribute('min')) || 0;
        const max = parseFloat(this.getAttribute('max'));
        
        // Sanitize the value
        this.value = sanitizeInputValue(this.value, allowDecimals);
        
        // Round to integer if decimals are not allowed
        let numValue = parseFloat(this.value);
        if (!allowDecimals && !isNaN(numValue)) {
            numValue = Math.round(numValue);
            this.value = numValue.toString();
        }
        
        // If field is empty or invalid, set to default
        if (this.value === '' || this.value === null || isNaN(numValue)) {
            this.value = defaultValue;
            lastValidValueRef.value = defaultValue;
            if (window.calculate) window.calculate();
            return;
        }
        
        // If value is 0 and this field should revert to default (only for fields that default in calculations.js)
        if (numValue === 0 && FIELDS_WITH_CALCULATIONS_DEFAULTS.has(inputId)) {
            const htmlDefault = HTML_DEFAULTS_FOR_REVERT[inputId];
            if (htmlDefault !== undefined) {
                this.value = htmlDefault;
                lastValidValueRef.value = htmlDefault;
                if (window.calculate) window.calculate();
                return;
            }
        }
        
        // Enforce min limit
        if (numValue < min) {
            this.value = min;
            lastValidValueRef.value = min;
            if (window.calculate) window.calculate();
            return;
        }
        
        // Enforce max limit if it exists
        if (max !== null && !isNaN(max) && numValue > max) {
            this.value = max;
            lastValidValueRef.value = max;
            if (window.calculate) window.calculate();
            return;
        }
        
        // Value is valid
        lastValidValueRef.value = this.value;
        if (window.calculate) window.calculate();
    };
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Input validation: Ensure empty inputs default to 0 and enforce min/max limits
 */
export function validateInput(inputId, defaultValue = 0, allowDecimals = true) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Store the last valid value in an object so we can update it in closures
    const lastValidValueRef = { value: input.value || defaultValue };
    
    // Attach event handlers
    input.addEventListener('keydown', createKeydownHandler(allowDecimals));
    input.addEventListener('beforeinput', createBeforeInputHandler(allowDecimals));
    input.addEventListener('wheel', createWheelHandler(), { passive: false });
    input.addEventListener('paste', createPasteHandler(allowDecimals, lastValidValueRef));
    input.addEventListener('input', createInputHandler(allowDecimals, lastValidValueRef, defaultValue));
    input.addEventListener('blur', createBlurHandler(allowDecimals, lastValidValueRef, defaultValue, inputId));
}

// ============================================================================
// CAPACITY MANAGEMENT
// ============================================================================

/**
 * Ensure capacity always has a value - calculate from monthlyAppointments if empty
 */
export function ensureCapacity() {
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

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize input validation on all inputs
 */
export function initializeInputValidation() {
    // List of all input IDs, their default values, and whether decimals are allowed
    // Integer-only fields: monthlyAppointments, inboundCalls, capacity, timeMinPerTask, staffCount, workHrsPerFTE
    const inputs = [
        { id: 'monthlyAppointments', default: 0, allowDecimals: false },
        { id: 'avgRevenue', default: 0, allowDecimals: true },
        { id: 'collectionRate', default: 0, allowDecimals: true },
        { id: 'noShowRate', default: 0, allowDecimals: true },
        { id: 'cancellationRate', default: 0, allowDecimals: true },
        { id: 'sameDayShare', default: 0, allowDecimals: true },
        { id: 'callAbandonmentRate', default: 0, allowDecimals: true },
        { id: 'inboundCalls', default: 0, allowDecimals: false },
        { id: 'convCallToAppt', default: 0, allowDecimals: true },
        { id: 'capacity', default: 0, allowDecimals: false },
        { id: 'timeMinPerTask', default: 0, allowDecimals: false },
        { id: 'staffCount', default: 0, allowDecimals: false },
        { id: 'staffCost', default: 0, allowDecimals: true },
        { id: 'workHrsPerFTE', default: 0, allowDecimals: false }
    ];
    
    // Initialize validation for each input
    inputs.forEach(input => {
        validateInput(input.id, input.default, input.allowDecimals);
        
        // Set empty inputs to their default values on page load
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
