# ROI Calculator - Test Cases

## Edge Case Test Scenarios

### 1. Negative Value Prevention
**Test**: Try entering negative values
- **Input**: Type `-23232` in "Front Desk Staff Count"
- **Expected**: Minus sign is removed, value becomes `23232`
- **Input**: Type `-100` in "Monthly Appointments"
- **Expected**: Minus sign is removed, value becomes `100`

### 2. Zero Spam Prevention
**Test**: Try entering multiple leading zeros
- **Input**: Type `000000` in "Inbound Calls per Month"
- **Expected**: Value becomes `0` (leading zeros removed)
- **Input**: Type `000123` in "Monthly Appointments"
- **Expected**: Value becomes `123` (leading zeros removed)
- **Input**: Type `0.5` in "Collection Rate"
- **Expected**: Value stays `0.5` (decimal allowed)

### 3. Rate Combination Validation
**Test**: Set no-show rate + cancellation rate > 100%
- **Input**: Set "No-Show Rate" to `60%` and "Cancellation Rate" to `50%`
- **Expected**: Cancellation rate is automatically capped to `40%` (total = 100%)
- **Input**: Set "No-Show Rate" to `80%` and "Cancellation Rate" to `30%`
- **Expected**: Cancellation rate is automatically capped to `20%`

### 4. Capacity Validation
**Test**: Set capacity less than monthly appointments
- **Input**: Set "Monthly Appointments" to `1000` and "Capacity" to `500`
- **Expected**: Capacity is automatically increased to `1000` (at least equal to monthly appointments)

### 5. Inbound Calls Validation
**Test**: Set inbound calls less than monthly appointments
- **Input**: Set "Monthly Appointments" to `1000` and "Inbound Calls" to `500`
- **Expected**: Inbound calls is automatically set to `1000` (minimum = monthly appointments)

### 6. Time Per Task Edge Case
**Test**: Set time per task to 0 or negative
- **Input**: Set "Time per Task" to `0`
- **Expected**: Value is automatically set to `1` (minimum 1 minute)
- **Input**: Try to paste `-5` in "Time per Task"
- **Expected**: Negative sign is removed, value becomes `5`

### 7. Maximum Value Limits
**Test**: Try entering values exceeding max limits
- **Input**: Type `2000000` in "Monthly Appointments" (max: 1,000,000)
- **Expected**: Value is capped at `1000000`
- **Input**: Type `150` in "No-Show Rate" (max: 100)
- **Expected**: Value is capped at `100`

### 8. Empty Field Handling
**Test**: Delete all values from a field
- **Input**: Clear "Monthly Appointments" field completely
- **Expected**: On blur, value defaults to `0`
- **Input**: Clear "Capacity" field
- **Expected**: Capacity is auto-calculated as `monthlyAppointments * 1.2` (minimum 100)

### 9. Paste Validation
**Test**: Paste invalid values
- **Input**: Paste `-50000` in "Staff Cost"
- **Expected**: Negative sign removed, value becomes `50000`
- **Input**: Paste `000000123` in "Monthly Appointments"
- **Expected**: Leading zeros removed, value becomes `123`
- **Input**: Paste `abc123` in any numeric field
- **Expected**: Paste is prevented, value reverts to last valid value

### 10. Division by Zero Protection
**Test**: Set values that could cause division by zero
- **Input**: Set "Work Hours per FTE" to `0`
- **Expected**: Hourly rate calculation returns `0` (no division by zero error)
- **Input**: Set "Total Cost" to `0` (via extreme values)
- **Expected**: ROI calculation returns `0` instead of Infinity

### 11. Negative Calculation Results
**Test**: Verify calculations never produce negative results
- **Input**: Set very low values that might cause negative intermediate calculations
- **Expected**: All revenue, savings, and appointment values are clamped to minimum 0

### 12. Capacity Used Percentage
**Test**: Set capacity very low relative to appointments
- **Input**: Set "Capacity" to `100` and "Monthly Appointments" to `1000`
- **Expected**: Capacity is auto-adjusted to `1000`, capacity used % is capped at 100%

### 13. Recovery Rate Edge Cases
**Test**: Set cancellation rate to 0
- **Input**: Set "Cancellation Rate" to `0%`
- **Expected**: Recovery rate displays as `0%` (no division by zero)

### 14. Very Large Numbers
**Test**: Try entering extremely large numbers
- **Input**: Type `999999999999999` in "Monthly Appointments"
- **Expected**: Value is capped at max (1,000,000) or reverted to last valid value

### 15. Decimal Input Handling
**Test**: Enter decimal values in appropriate fields
- **Input**: Type `90.5` in "Collection Rate"
- **Expected**: Value is accepted (has step="0.1")
- **Input**: Type `25.75` in "No-Show Rate"
- **Expected**: Value is accepted and clamped to 0-100 range

### 16. Mouse Wheel Prevention
**Test**: Scroll mouse wheel over number inputs
- **Input**: Hover over "Monthly Appointments" and scroll wheel
- **Expected**: Value does not change (wheel scroll is prevented)

### 17. Selection and Replacement
**Test**: Select all and type new value
- **Input**: Cmd+A to select all in "Monthly Appointments", then type `500`
- **Expected**: Old value is replaced with `500`
- **Input**: Select text with Cmd+Shift+Left Arrow, then type `200`
- **Expected**: Selected text is replaced with `200`

## Regression Test Scenarios

### 18. Normal Operation
**Test**: Use calculator with normal values
- **Input**: Default values (1000 appointments, $200 revenue, etc.)
- **Expected**: All calculations work correctly, ROI is displayed, no errors

### 19. High Volume Clinic
**Test**: Large clinic scenario
- **Input**: 5000 monthly appointments, $500 avg revenue, 10 staff
- **Expected**: All calculations scale correctly, values stay within limits

### 20. Small Clinic
**Test**: Small clinic scenario
- **Input**: 50 monthly appointments, $100 avg revenue, 1 staff
- **Expected**: All calculations work, no negative values, capacity auto-calculated

