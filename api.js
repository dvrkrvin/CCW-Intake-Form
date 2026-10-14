// API module for communicating with the Python backend
const api = {
    // Base URL for your Python server
    // baseUrl: 'https://aiservicewriter-production.up.railway.app',
    baseUrl: 'https://ai-service-writer.fly.dev',

    // Only curated explanations reach the customer. Keep raw server details in the console.
    submissionErrorMessage(error = {}) {
        const kept = ' Your entries and signature have been kept.';
        const checkOrder = ' Please ask reception to check for an existing order before trying again.';
        const detail = String(error.serverMessage || '');
        const upstream = detail.match(/Shopmonkey (?:Create|Update) Error(?: for bike \d+)?:\s*(\d{3})/i);
        const status = upstream ? Number(upstream[1]) : error.status;
        if (error.orderIds?.length) {
            return 'An order was created, but we could not finish confirming your check-in.' + kept
                + ' Please ask reception to review the order before submitting again.';
        }
        if (error.networkFailure) {
            return 'We could not reach the check-in service. The connection may have been interrupted.' + kept + checkOrder;
        }
        if (status === 429) {
            return 'The check-in service is handling too many requests right now.' + kept + checkOrder;
        }
        if (status >= 500) {
            return 'The check-in service is temporarily unavailable or could not finish processing your request.' + kept + checkOrder;
        }
        if (status === 401 || status === 403) {
            return 'The check-in service could not access the shop’s order system.' + kept + ' Please ask reception for assistance.';
        }
        if (status === 413) {
            return 'The signed intake document was too large to send.' + kept + ' Please ask reception for assistance.';
        }
        if (status === 400 || status === 422) {
            const knownReasons = [
                [/^Express Visit services cannot exceed 30 minutes$/, 'The selected Express services exceed the 30-minute limit. Please reduce your selections.'],
                [/^At least one Express Visit service is required$/, 'Please select at least one Express service.'],
                [/^Express Visit contains (?:an invalid|a duplicate) service selection$/, 'One of the Express service selections could not be accepted. Please ask reception to review your selections.'],
                [/^(?:Quantity is only available|Express service quantity)/, 'An Express service quantity could not be accepted. Please ask reception to review your quantities.'],
                [/^Express Visit terms must be acknowledged$/, 'Please accept the Express Visit terms before submitting.'],
                [/^Bike \d+ is not approved for electrical diagnostics$/, 'Electrical diagnostics are not available for the selected bike. Please ask reception to review the requested service.'],
                [/^No phone number provided$/, 'Please enter your phone number before submitting.']
            ];
            const reason = knownReasons.find(([pattern]) => pattern.test(detail));
            return (reason ? reason[1] : 'The check-in service could not accept some of the submitted details. Please ask reception to review your contact information and requested services.') + kept;
        }
        return 'We could not confirm that your check-in was completed.' + kept + checkOrder;
    },
    
    /**
     * Submit service intake form with customer data and signed PDF
     * @param {Object} formData - Customer information and form data
     * @param {Blob} pdfBlob - Generated PDF blob of signed terms
     * @returns {Promise<Object>} Response from server
     */
    async submitServiceIntake(formData, pdfBlob) {
        try {
            // Create FormData to send both JSON and PDF file
            const form = new FormData();
            
            // Add JSON data as a string
            form.append('data', JSON.stringify(formData));
            
            // Add PDF file
            const fileName = `service_intake_${formData.customerInfo.lastName}_${Date.now()}.pdf`;
            form.append('pdf', pdfBlob, fileName);
            
            // Send to server
            let response;
            try {
                response = await fetch(`${this.baseUrl}/run-task`, {
                    method: 'POST',
                    body: form,
                });
            } catch (cause) {
                const error = new Error('Check-in connection failed', { cause });
                error.networkFailure = true;
                throw error;
            }

            let result;
            try {
                result = await response.json();
            } catch {
                // Proxies may return an HTML error page instead of JSON.
            }
            if (!response.ok || !result || result.success !== true) {
                const error = new Error(`HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.serverMessage = result?.message || result?.error || '';
                error.orderIds = Array.isArray(result?.order_ids) ? result.order_ids : [];
                throw error;
            }
            return result;
            
        } catch (error) {
            error.customerMessage = this.submissionErrorMessage(error);
            console.error('API Error:', error);
            throw error;
        }
    },

    // SIMPLE TEST - Just sends JSON, no PDF
    async submitServiceIntakeTest() {
        try {
            const testData = {
                test: true,
                message: 'Simple test from frontend'
            };
            
            // Send to server with JSON
            const response = await fetch(`${this.baseUrl}/run-task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Success! Server returned:', result);
            return result;
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    /**
     * Health check endpoint to verify server connectivity
     * @returns {Promise<Object>} Server status
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/api/health`, {
                method: 'GET',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
