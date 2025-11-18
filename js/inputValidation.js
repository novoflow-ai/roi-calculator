// ============================================================================
// INPUT VALIDATION - Handles input sanitization, validation, and edge cases
// ============================================================================

// Note: calculate() is called via window.calculate to avoid circular dependencies

// Ensure capacity always has a value - calculate from monthlyAppointments if empty
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

// Input validation: Ensure empty inputs default to 0 and enforce min/max limits
export function validateInput(inputId, defaultValue = 0) {
    const input = document.getElementById(inputId);
    if (input) {
        // Store the last valid value
        let lastValidValue = input.value || defaultValue;
        
        // Prevent minus sign from being typed in the first place
        input.addEventListener('keydown', function(e) {
            // Block minus sign, hyphen, or negative sign
            if (e.key === '-' || e.key === 'Minus' || e.keyCode === 189 || e.keyCode === 109) {
                e.preventDefault();
                return false;
            }
        });
        
        // Also use beforeinput event (more modern, catches paste and other input methods)
        input.addEventListener('beforeinput', function(e) {
            // Block any input that contains a minus sign
            if (e.data && e.data.includes('-')) {
                e.preventDefault();
                return false;
            }
        });
        
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
            let newValue = currentValue.substring(0, start) + pastedText + currentValue.substring(end);
            
            // Remove any minus signs from the entire new value
            if (newValue.includes('-')) {
                newValue = newValue.replace(/-/g, '');
                // If empty after removing minus, set to 0
                if (newValue === '') {
                    newValue = '0';
                }
            }
            
            // If field would be empty, allow it
            if (newValue === '' || newValue === null) {
                return;
            }
            
            // Explicitly reject if value still contains any minus signs
            if (newValue.includes('-')) {
                e.preventDefault();
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
            
            // Prevent negative values - remove ALL minus signs immediately
            // This is a safety net in case keydown/beforeinput didn't catch it
            if (this.value.includes('-')) {
                this.value = this.value.replace(/-/g, '');
                // If empty after removing minus, set to 0
                if (this.value === '') {
                    this.value = '0';
                }
            }
            
            // Double-check: if value still contains minus signs, revert immediately
            if (this.value.includes('-')) {
                this.value = lastValidValue;
                return;
            }
            
            // Prevent leading zero spam (e.g., "000000" -> "0", "000123" -> "123")
            // But allow "0" and "0." for decimal inputs
            if (this.value.length > 1 && this.value.startsWith('0') && !this.value.startsWith('0.')) {
                // Remove leading zeros
                this.value = this.value.replace(/^0+/, '') || '0';
            }
            
            // Check if value is invalid (NaN) or contains non-numeric characters (except decimal point)
            // Also explicitly check for minus signs in the regex
            if (isNaN(parseFloat(this.value)) || !/^\d*\.?\d*$/.test(this.value) || this.value.includes('-')) {
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
                if (window.calculate) window.calculate(); // Recalculate when value is set
                return;
            }
            
            // Enforce min limit (prevent negative values)
            if (value < min) {
                this.value = min;
                lastValidValue = min;
                if (window.calculate) window.calculate();
                return;
            }
            
            // Enforce max limit if it exists
            if (max !== null && !isNaN(max) && value > max) {
                this.value = max;
                lastValidValue = max;
                if (window.calculate) window.calculate();
                return;
            }
            
            // Value is valid
            lastValidValue = this.value;
            if (window.calculate) window.calculate(); // Recalculate when value is set
        });
    }
}

// Initialize input validation on all inputs
export function initializeInputValidation() {
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

