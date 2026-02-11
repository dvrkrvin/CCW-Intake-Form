from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Allow requests from your form

@app.route('/api/service-intake', methods=['POST'])
def service_intake():
    # Get the data
    data_string = request.form.get('data')
    form_data = json.loads(data_string)
    
    # Get the PDF
    pdf_file = request.files.get('pdf')
    
    # Print to console so you can see it
    print("\n=== SERVICE INTAKE RECEIVED ===")
    print(f"Customer: {form_data['customerInfo']['firstName']} {form_data['customerInfo']['lastName']}")
    print(f"Email: {form_data['customerInfo']['email']}")
    print(f"Phone: {form_data['customerInfo']['phone']}")
    print(f"PDF received: {pdf_file.filename}")
    print("================================\n")
    
    # Save PDF to see it
    if pdf_file:
        pdf_file.save(f"uploads/{pdf_file.filename}")
        print(f"PDF saved to uploads/{pdf_file.filename}")
    
    # Send success response
    return jsonify({
        'success': True,
        'message': 'Test submission received!'
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    import os
    os.makedirs('uploads', exist_ok=True)
    app.run(debug=True, port=5000)