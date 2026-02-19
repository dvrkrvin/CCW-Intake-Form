// API module for communicating with the Python backend
const api = {
    // Base URL for your Python server
    // TODO: In production, consider reading this from a config object rather than
    // hardcoding it here so deploys don't require manual source edits.
    baseUrl: 'https://aiservicewriter-production.up.railway.app',

    // Timeout (ms) for all requests. Without this, a stalled server holds
    // isSubmitting=true indefinitely, leaving the submit button permanently disabled.
    requestTimeoutMs: 30000,

    /**
     * Wraps fetch() with an AbortController timeout.
     * @param {string} url
     * @param {RequestInit} options
     * @returns {Promise<Response>}
     */
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.requestTimeoutMs);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            return response;
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error(`Request timed out after ${this.requestTimeoutMs / 1000}s. Please try again.`);
            }
            throw err;
        } finally {
            clearTimeout(timer);
        }
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
            const response = await this.fetchWithTimeout(`${this.baseUrl}/run-task`, {
                method: 'POST',
                body: form,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
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
            const response = await this.fetchWithTimeout(`${this.baseUrl}/run-task`, {
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
            const response = await this.fetchWithTimeout(`${this.baseUrl}/api/health`, {
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
