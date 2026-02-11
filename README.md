# E-Moto Service Intake Form

A web-based service intake form system for Charged Cycle Works with digital signature capabilities.

## Files Included

- **form.html** - Main HTML page with the intake form
- **app.js** - Vue.js application logic
- **api.js** - API communication module for backend integration

## Features

✅ Customer information capture (all required fields)
✅ Digital Terms & Conditions with checkboxes and initials
✅ Digital signature pad
✅ PDF generation of signed documents
✅ Responsive design for iPad and desktop
✅ Form validation
✅ Integration with Python backend

## Setup Instructions

### 1. Configure Your Server URL

Edit **api.js** and update the `baseUrl` to match your Python server:

```javascript
baseUrl: 'http://your-server.com:5000',  // Update this line
```

### 2. Deploy Files

Upload all three files to your web server or host them locally:
- form.html
- app.js
- api.js

### 3. Access the Form

Open `form.html` in a web browser. The form works on:
- iPad (primary target)
- Desktop browsers
- Mobile devices

## Python Server Requirements

Your Python server should have an endpoint that accepts POST requests with the following structure:

### Endpoint: POST `/api/service-intake`

**Expected Request Format:**
- Content-Type: `multipart/form-data`
- Two parts:
  1. `data` - JSON string containing form data
  2. `pdf` - PDF file blob

**Sample Python Flask Handler:**

```python
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import json
import os

app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/service-intake', methods=['POST'])
def service_intake():
    try:
        # Get JSON data
        data_string = request.form.get('data')
        form_data = json.loads(data_string)
        
        # Get PDF file
        pdf_file = request.files.get('pdf')
        
        if not pdf_file:
            return jsonify({'success': False, 'message': 'No PDF file provided'}), 400
        
        # Save PDF
        filename = secure_filename(pdf_file.filename)
        pdf_path = os.path.join(UPLOAD_FOLDER, filename)
        pdf_file.save(pdf_path)
        
        # Process customer information
        customer = form_data['customerInfo']
        email = customer['email']
        name = f"{customer['firstName']} {customer['lastName']}"
        
        # TODO: Add your business logic here
        # - Save to database
        # - Send confirmation email
        # - Create work order
        # - etc.
        
        print(f"New service intake from: {name} ({email})")
        print(f"PDF saved to: {pdf_path}")
        
        return jsonify({
            'success': True,
            'message': 'Service intake received successfully',
            'intake_id': 'SOME_ID'  # Return a unique ID if needed
        })
        
    except Exception as e:
        print(f"Error processing intake: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Server error processing intake'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'service-intake-api'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### Data Structure Received

The JSON data contains:

```json
{
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "555-1234",
    "email": "john@example.com",
    "address": "123 Main St, City, State",
    "requestedService": "Battery diagnostic and repair"
  },
  "disclosures": {
    "submerged": false,
    "thermal": true,
    "impact": false
  },
  "initials": {
    "sectionA": "JD",
    "sectionB": "JD",
    "sectionC": "JD"
  },
  "signature": {
    "printedName": "John Doe",
    "date": "02/09/2026",
    "signatureData": "data:image/png;base64,..."
  },
  "submittedAt": "2026-02-09T12:34:56.789Z"
}
```

## CORS Configuration

If your frontend and backend are on different domains, you'll need to enable CORS on your Python server:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
```

Install flask-cors:
```bash
pip install flask-cors
```

## Customization

### Styling
Edit the `<style>` section in **form.html** to match your branding.

### Form Fields
Modify the form fields in **form.html** and corresponding data model in **app.js**.

### PDF Layout
Adjust the `generatePDF()` method in **app.js** to customize the PDF output.

### Validation
Add custom validation rules in the `submitForm()` method in **app.js**.

## Browser Compatibility

Tested and working on:
- Chrome/Edge (recommended)
- Safari
- Firefox
- Mobile Safari (iPad)

## Dependencies

All dependencies are loaded from CDN:
- Vue.js 3
- jsPDF (PDF generation)
- Signature Pad (digital signatures)

No local installation required!

## Security Notes

1. **HTTPS**: Use HTTPS in production to protect customer data
2. **Validation**: Always validate data server-side
3. **File Upload**: Implement file size limits and type checking
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Input Sanitization**: Sanitize all inputs before database storage

## Support

For questions about integration, refer to your Python server documentation or contact your development team.

---

**Form Version:** 2026-02-04 (v16)
**Created for:** Charged Cycle Works
