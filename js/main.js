// ============================================================================
// MAIN - Application initialization and coordination
// ============================================================================

import { initializeInputValidation, ensureCapacity } from './inputValidation.js';
import { initializeLeadForm } from './leadForm.js';
import { calculate } from './calculations.js';
import { switchTab } from './uiUpdates.js';
import { trackValueChange } from './utils.js';

// Make functions globally available for inline event handlers (must be before DOMContentLoaded)
window.calculate = calculate;
window.switchTab = switchTab;
window.trackValueChange = trackValueChange;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize input validation
    initializeInputValidation();
    
    // Ensure capacity is set initially
    ensureCapacity();
    
    // Initialize lead form
    initializeLeadForm();
    
    // Calculate initial results if calculator is visible
    if (document.getElementById('calculator').style.display !== 'none') {
        calculate();
    }
});

