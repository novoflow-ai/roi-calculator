# ROI Calculator - Modular Architecture

## File Structure

The calculator has been modularized into separate files for better organization and maintainability:

### 📁 `js/constants.js`
**Purpose**: All constants and configuration values
- Default values for inputs
- Novoflow performance metrics (NF_RECOVER_ABANDON, etc.)
- Novoflow pricing (NF_FEE_PER_SUCCESS, etc.)
- Advanced parameters
- Google Sheets integration URL

### 📁 `js/utils.js`
**Purpose**: Utility and helper functions
- `trackValueChange()` - Tracks user customization
- `getCalculatorData()` - Collects current calculator values
- `formatCurrency()` - Formats currency for display

### 📁 `js/inputValidation.js`
**Purpose**: Input validation and sanitization
- `validateInput()` - Validates individual inputs (prevents negatives, zero spam, enforces min/max)
- `ensureCapacity()` - Ensures capacity always has a valid value
- `initializeInputValidation()` - Sets up validation for all inputs

### 📁 `js/calculations.js`
**Purpose**: Core calculation logic
- `calculate()` - Main calculation function (ROI, revenue, costs, etc.)
- `calculateSensitivityROI()` - Sensitivity analysis with different confidence levels

### 📁 `js/uiUpdates.js`
**Purpose**: UI updates and interactions
- `switchTab()` - Handles tab switching (booking/cancellation/combined)
- `updateUI()` - Updates all DOM elements with calculated values

### 📁 `js/leadForm.js`
**Purpose**: Lead form submission
- `initializeLeadForm()` - Sets up email submission and Google Sheets integration

### 📁 `js/main.js`
**Purpose**: Application initialization
- Initializes all modules
- Makes functions globally available for inline event handlers
- Coordinates application startup

## Module Dependencies

```
main.js
├── constants.js (imported by all calculation modules)
├── utils.js
├── inputValidation.js
│   └── (uses window.calculate to avoid circular dependency)
├── calculations.js
│   ├── constants.js
│   ├── inputValidation.js (ensureCapacity)
│   └── uiUpdates.js (updateUI)
├── uiUpdates.js
│   └── utils.js (formatCurrency)
└── leadForm.js
    ├── constants.js (GOOGLE_SCRIPT_URL)
    └── utils.js (getCalculatorData)
```

## Usage

The HTML file loads only `main.js`:
```html
<script type="module" src="js/main.js"></script>
```

All other modules are imported automatically through ES6 module imports.

## Global Functions

These functions are made globally available for inline event handlers:
- `window.calculate` - Main calculation function
- `window.switchTab` - Tab switching function
- `window.trackValueChange` - Track user customization

## Benefits of Modularization

1. **Better Organization**: Each file has a clear, single responsibility
2. **Easier Maintenance**: Changes to calculations don't affect UI code
3. **Reusability**: Functions can be imported where needed
4. **Testability**: Each module can be tested independently
5. **Readability**: Easier to find and understand specific functionality

