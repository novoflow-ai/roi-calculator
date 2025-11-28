// ============================================================================
// LEAD FORM - Handles email submission and Google Sheets integration
// ============================================================================

import { GOOGLE_SCRIPT_URL } from './constants.js';
import { getCalculatorData } from './utils.js';
import { calculate } from './calculations.js';

// Lead form submission with Google Sheets integration
export function initializeLeadForm() {
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            
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
}

