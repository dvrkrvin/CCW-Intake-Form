// API module - MOCK VERSION (no server needed)
// const mock_api = {
//     async submitServiceIntake(formData, pdfBlob) {
//         console.log('=== FORM SUBMITTED ===');
//         console.log('Customer:', formData.customerInfo);
//         console.log('PDF Size:', (pdfBlob.size / 1024).toFixed(2) + ' KB');
        
//         // Download the PDF
//         const url = URL.createObjectURL(pdfBlob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `intake_${formData.customerInfo.lastName}.pdf`;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
        
//         // Wait 1 second
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         // Return success
//         return {
//             success: true,
//             message: 'Form submitted successfully!'
//         };
//     }
// };