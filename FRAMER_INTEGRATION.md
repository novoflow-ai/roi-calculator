# Framer Integration Guide for Novoflow ROI Calculator

## Quick Setup (3 Methods)

### Method 1: Embed as HTML Component (Recommended)
1. In Framer, add a **Code Component** to your page
2. Switch to "HTML" mode
3. Copy the entire contents of `embed-calculator.html`
4. Paste into the HTML component
5. Set the component height to at least 800px (or auto)
6. The calculator will automatically adapt to your page's width

### Method 2: iFrame Embed
1. Host `embed-calculator.html` on your server or CDN
2. In Framer, add an **Embed** component
3. Use this code:
```html
<iframe 
    src="https://yourdomain.com/embed-calculator.html" 
    width="100%" 
    height="900" 
    frameborder="0"
    style="border: none; border-radius: 24px;">
</iframe>
```

### Method 3: Code Override (Advanced)
1. Create a new Code Override in Framer
2. Use the calculator logic from the script section
3. Apply to custom Framer components

## Features of the Embed Version

### ✅ What's Included
- **Accurate ROI calculations** based on industry research
- **3 calculation modes**: Appointment Booking, Cancellation Recovery, Combined
- **Specialty presets** for Dermatology, Radiology, Optometry, Rheumatology
- **Responsive design** that works on all screen sizes
- **Clean styling** that integrates with your site
- **No external dependencies** (except fonts)

### 🎨 Styling Features
- **Transparent background** - inherits your page background
- **Novoflow brand colors** - Purple gradient (#8733c7 to #b769ff)
- **Custom fonts** - Creato Display fonts from Framer CDN
- **Responsive breakpoints** - Mobile, tablet, and desktop optimized
- **Smooth animations** - Hover effects and transitions

### 📊 Calculation Methodology
- **Appointment Booking**: Captures 80% of abandoned calls + 15% after-hours boost
- **Cancellation Recovery**: 65% recovery rate for same-week cancellations
- **Staff Savings**: 0.5-1 FTE reduction based on volume
- **Success-based pricing**: $50 per successful action (customizable)

## Customization Options

### Changing Default Values
Edit these lines in the HTML:
```javascript
// Line 434-441 - Default input values
value="1000"  // Monthly appointments
value="200"   // Average revenue
value="25"    // No-show rate
value="20"    // Cancellation rate
value="25"    // Call abandonment rate
value="2"     // Staff count
value="60000" // Annual staff cost
value="50"    // Novoflow fee
```

### Adjusting Colors
To match your brand, modify these CSS variables:
```css
/* Primary purple gradient */
background: linear-gradient(135deg, #8733c7 0%, #b769ff 100%);

/* Active tab color */
color: #8733c7;
border-bottom: 3px solid #8733c7;
```

### Changing Calculation Logic
Modify these constants in the script:
```javascript
// Line 615-620 - Key assumptions
const capturedAbandoned = abandonedCalls * 0.8; // Change capture rate
const afterHoursBookings = monthlyAppointments * 0.15; // Change after-hours boost
const sameWeekCancellations = monthlyCancellations * 0.7; // Change same-week %
const recoveryRate = 0.65; // Change recovery success rate
```

## Mobile Optimization

The calculator automatically adjusts for mobile with:
- **Stacked layout** for inputs and results
- **Larger touch targets** for buttons
- **Adjusted font sizes** for readability
- **Full-width specialty buttons**
- **Responsive grid layouts**

## Performance Notes

- **Page load**: ~50KB total (including styles and scripts)
- **No external API calls** (runs entirely client-side)
- **Font loading**: Uses Framer's CDN for Creato Display fonts
- **Google Fonts**: Loaded async for Manrope/Instrument Sans

## Troubleshooting

### Calculator not showing?
- Check component height (minimum 800px recommended)
- Ensure JavaScript is enabled in the embed component
- Verify no Content Security Policy blocks

### Fonts not loading?
- The Creato Display fonts use Framer's CDN
- Fallback fonts will display if CDN is unavailable

### Calculations seem off?
- All calculations use the accurate methodology from research
- Check the assumptions note at the bottom
- Default values are industry averages

## Testing Your Integration

1. **Test all tabs**: Switch between Booking, Recovery, and Combined
2. **Test specialty presets**: Click each specialty button
3. **Test mobile view**: Resize to mobile breakpoints
4. **Test calculations**: Adjust inputs and verify ROI updates
5. **Test responsive**: Check layout at different widths

## Support

For questions about:
- **Calculator logic**: See `README_ROI_METHODOLOGY.md`
- **Embedding issues**: Check Framer's embed documentation
- **Customization**: Modify the HTML/CSS/JS as needed

## Quick Copy-Paste Embed Code

For fastest setup, use this in a Framer Embed component:

```html
<div style="width: 100%; min-height: 800px;">
    <!-- Paste entire contents of embed-calculator.html here -->
</div>
```

---

*Note: The calculator uses research-based calculations that are significantly more accurate than the original version. See the methodology document for complete details on the calculation approach.*
