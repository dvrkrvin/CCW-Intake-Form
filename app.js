// const api = require("./api");

const { createApp } = Vue;

createApp({
    data() {
        return {
            formData: {
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                zip: '',
                requestedService: '',
                disclosures: {
                    submerged: false,
                    thermal: false,
                    impact: false
                },
                initialsA: '',
                initialsB: '',
                initialsC: '',
                printedName: '',
                signatureDate: this.getTodayDate()
            },
            signaturePad: null,
            showStateSuggestions: false,
            showSuccessModal: false,
            allStates: [
                {abbr:'AL',name:'Alabama'},{abbr:'AK',name:'Alaska'},{abbr:'AZ',name:'Arizona'},
                {abbr:'AR',name:'Arkansas'},{abbr:'CA',name:'California'},{abbr:'CO',name:'Colorado'},
                {abbr:'CT',name:'Connecticut'},{abbr:'DE',name:'Delaware'},{abbr:'FL',name:'Florida'},
                {abbr:'GA',name:'Georgia'},{abbr:'HI',name:'Hawaii'},{abbr:'ID',name:'Idaho'},
                {abbr:'IL',name:'Illinois'},{abbr:'IN',name:'Indiana'},{abbr:'IA',name:'Iowa'},
                {abbr:'KS',name:'Kansas'},{abbr:'KY',name:'Kentucky'},{abbr:'LA',name:'Louisiana'},
                {abbr:'ME',name:'Maine'},{abbr:'MD',name:'Maryland'},{abbr:'MA',name:'Massachusetts'},
                {abbr:'MI',name:'Michigan'},{abbr:'MN',name:'Minnesota'},{abbr:'MS',name:'Mississippi'},
                {abbr:'MO',name:'Missouri'},{abbr:'MT',name:'Montana'},{abbr:'NE',name:'Nebraska'},
                {abbr:'NV',name:'Nevada'},{abbr:'NH',name:'New Hampshire'},{abbr:'NJ',name:'New Jersey'},
                {abbr:'NM',name:'New Mexico'},{abbr:'NY',name:'New York'},{abbr:'NC',name:'North Carolina'},
                {abbr:'ND',name:'North Dakota'},{abbr:'OH',name:'Ohio'},{abbr:'OK',name:'Oklahoma'},
                {abbr:'OR',name:'Oregon'},{abbr:'PA',name:'Pennsylvania'},{abbr:'RI',name:'Rhode Island'},
                {abbr:'SC',name:'South Carolina'},{abbr:'SD',name:'South Dakota'},{abbr:'TN',name:'Tennessee'},
                {abbr:'TX',name:'Texas'},{abbr:'UT',name:'Utah'},{abbr:'VT',name:'Vermont'},
                {abbr:'VA',name:'Virginia'},{abbr:'WA',name:'Washington'},{abbr:'WV',name:'West Virginia'},
                {abbr:'WI',name:'Wisconsin'},{abbr:'WY',name:'Wyoming'}
            ],
            isSubmitting: false,
            errorMessage: ''
        };
    },
    computed: {
        fullName() {
            const first = this.formData.firstName.trim();
            const last = this.formData.lastName.trim();
            if (first && last) {
                return `${first} ${last}`;
            }
            return '';
        },
        filteredStates() {
            const q = this.formData.state.toUpperCase();
            if (!q) return this.allStates;
            return this.allStates.filter(s =>
                s.abbr.startsWith(q) || s.name.toUpperCase().startsWith(q)
            );
        },
    },
    watch: {
        fullName(newName) {
            if (newName) {
                this.formData.printedName = newName;
            }
        }
    },
    
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },

    mounted() {
        this.initSignaturePad();
        document.addEventListener('click', this.handleClickOutside);
    },
    methods: {
        getTodayDate() {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const year = today.getFullYear();
            return `${month}/${day}/${year}`;
        },

        handleClickOutside(event) {
            const field = this.$refs.stateField;
            if (!field) return;
            if (!field.contains(event.target)) {
                this.showStateSuggestions = false;
            }
        },

        initSignaturePad() {
            const canvas = this.$refs.signatureCanvas;
            const container = canvas.parentElement;
            canvas.width = container.offsetWidth;
            canvas.height = 150;
            
            this.signaturePad = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });

            window.addEventListener('resize', () => {
                const data = this.signaturePad.toData();
                canvas.width = container.offsetWidth;
                canvas.height = 150;
                this.signaturePad.fromData(data);
            });
        },
        
        clearSignature() {
            this.signaturePad.clear();
        },

        onStateInput() {
            this.formData.state = this.formData.state.toUpperCase();
            this.showStateSuggestions = true;
        },

        onStateBlur() {
            setTimeout(() => {
                this.showStateSuggestions = false;
            }, 150);
        },
        
        selectState(s) {
            this.formData.state = s.abbr;
            this.showStateSuggestions = false;
        },

        hideStateSuggestions() {
            setTimeout(() => { this.showStateSuggestions = false; }, 150);
        },

        dismissModal() {
            this.showSuccessModal = false;
            this.resetForm();
        },
        
        async generatePDF() {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            let yPos = 20;
            const margin = 20;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const maxWidth = pageWidth - (margin * 2);
            
            const addSpace = (amount) => { yPos += amount; };
            const checkPageBreak = (needed = 40) => {
                if (yPos > 270 - needed) {
                    pdf.addPage();
                    yPos = 20;
                }
            };
            
            pdf.setFontSize(18);
            pdf.setFont(undefined, 'bold');
            pdf.text('E-MOTO SERVICE INTAKE', margin, yPos);
            addSpace(8);
            
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.text('Charged Cycle Works', margin, yPos);
            addSpace(5);
            pdf.setFontSize(8);
            pdf.text(`Submitted: ${new Date().toLocaleString()} | Form v16`, margin, yPos);
            addSpace(12);
            
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'bold');
            pdf.text('CUSTOMER INFORMATION', margin, yPos);
            addSpace(6);
            
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.text(`${this.formData.firstName} ${this.formData.lastName}`, margin, yPos);
            addSpace(5);
            pdf.text(this.formData.phone, margin, yPos);
            addSpace(5);
            pdf.text(this.formData.email, margin, yPos);
            addSpace(5);
            pdf.text(this.formData.address1, margin, yPos);
            addSpace(5);
            if (this.formData.address2) {
                pdf.text(this.formData.address2, margin, yPos);
                addSpace(5);
            }
            pdf.text(`${this.formData.city}, ${this.formData.state} ${this.formData.zip}`, margin, yPos);
            addSpace(8);
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'bold');
            pdf.text('Requested Service:', margin, yPos);
            addSpace(5);
            pdf.setFont(undefined, 'normal');
            const serviceLines = pdf.splitTextToSize(this.formData.requestedService, maxWidth);
            serviceLines.forEach(line => {
                checkPageBreak();
                pdf.text(line, margin, yPos);
                addSpace(4);
            });
            addSpace(8);
            
            checkPageBreak(60);
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'bold');
            pdf.text('A. SAFETY AND BATTERY DISCLOSURES', margin, yPos);
            addSpace(6);
            
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            pdf.text(`[${this.formData.disclosures.submerged ? 'X' : ' '}] Submerged or heavy water exposure`, margin + 3, yPos);
            addSpace(5);
            pdf.text(`[${this.formData.disclosures.thermal ? 'X' : ' '}] Smoke, sparks, overheating, burning smell, swelling, or fire`, margin + 3, yPos);
            addSpace(5);
            pdf.text(`[${this.formData.disclosures.impact ? 'X' : ' '}] Impact to battery, charge port, or wiring harness`, margin + 3, yPos);
            addSpace(6);
            
            pdf.setFontSize(8);
            pdf.setTextColor(80);
            const disclaimerA = pdf.splitTextToSize('Customer confirms all known history has been disclosed. Shop may refuse service or isolate/remove the battery for safety.', maxWidth - 6);
            disclaimerA.forEach(line => {
                pdf.text(line, margin + 3, yPos);
                addSpace(4);
            });
            pdf.setTextColor(0);
            addSpace(4);
            
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Initials: ${this.formData.initialsA}`, margin, yPos);
            addSpace(10);
            
            checkPageBreak(70);
            pdf.setFontSize(11);
            pdf.text('B. AUTHORIZATION, TESTING, AND PAYMENT', margin, yPos);
            addSpace(6);
            
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'normal');
            const sectionB = [
                'Diagnostic minimum: $99 (charged even if repairs are declined). Labor: $159/hr unless a written flat-rate quote is provided.',
                'If additional time is required beyond a flat-rate quote due to hidden damage, we will attempt to contact you for approval. Additional time is billed at $159/hr if approved.',
                'No work beyond the authorized estimate without written approval (signature, email, or text/SMS from the number on file).',
                'Testing authorized (bench and short test ride when safe). Payment due before release. Storage after 7 days: $20/day.',
                'Shop is not responsible for personal items or loose accessories left with the bike.'
            ];
            
            sectionB.forEach(text => {
                checkPageBreak();
                const lines = pdf.splitTextToSize(text, maxWidth - 6);
                lines.forEach(line => {
                    pdf.text(line, margin + 3, yPos);
                    addSpace(4);
                });
                addSpace(2);
            });
            addSpace(2);
            
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Initials: ${this.formData.initialsB}`, margin, yPos);
            addSpace(10);
            
            checkPageBreak(60);
            pdf.setFontSize(11);
            pdf.text('C. QUALITY CONTROL AND OPERATIONAL ACCESS', margin, yPos);
            addSpace(6);
            
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'normal');
            const sectionC = [
                'Customer agrees to leave all keys, batteries, information, and critical operating components (e.g. fobs or chargers) required to operate the bike.',
                'If the customer fails to leave the means to test-ride the bike, Charged Cycle Works is not liable for any issues that could only have been identified through a functional test ride.',
                'Any subsequent return visits to address issues that would have been identified during a test ride will be treated as a new service request and billed at the standard $159/hr rate.'
            ];
            
            sectionC.forEach(text => {
                checkPageBreak();
                const lines = pdf.splitTextToSize(text, maxWidth - 6);
                lines.forEach(line => {
                    pdf.text(line, margin + 3, yPos);
                    addSpace(4);
                });
                addSpace(2);
            });
            addSpace(2);
            
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Initials: ${this.formData.initialsC}`, margin, yPos);
            addSpace(10);
            
            pdf.addPage();
            yPos = 20;
            
            pdf.setFontSize(11);
            pdf.text('TERMS AND CONDITIONS', margin, yPos);
            addSpace(6);
            
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            pdf.text('Customer has read and agreed to all Terms and Conditions as presented in the intake form.', margin, yPos);
            addSpace(5);
            pdf.setFontSize(8);
            pdf.text('Full terms available at time of submission and on file with service order.', margin, yPos);
            addSpace(12);
            
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'bold');
            pdf.text('SIGNATURE', margin, yPos);
            addSpace(6);
            
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'normal');
            const sigText = pdf.splitTextToSize('By signing below, customer confirms they are the owner or authorized agent and agrees to all terms above, authorizing Charged Cycle Works to perform diagnostic and repair services as approved.', maxWidth);
            sigText.forEach(line => {
                pdf.text(line, margin, yPos);
                addSpace(4);
            });
            addSpace(6);
            
            if (!this.signaturePad.isEmpty()) {
                const signatureImage = this.signaturePad.toDataURL();
                pdf.addImage(signatureImage, 'PNG', margin, yPos, 80, 24);
                addSpace(28);
            } else {
                pdf.text('(No signature provided)', margin, yPos);
                addSpace(10);
            }
            
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Name: ${this.formData.printedName}`, margin, yPos);
            addSpace(6);
            pdf.text(`Date: ${this.formData.signatureDate}`, margin, yPos);
            
            return pdf;
        },
        
        async submitForm() {
            this.errorMessage = '';
            
            if (this.signaturePad.isEmpty()) {
                this.errorMessage = 'Please provide your signature before submitting.';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            if (!this.formData.initialsA || !this.formData.initialsB || !this.formData.initialsC) {
                this.errorMessage = 'Please provide your initials in all required sections (A, B, and C).';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            this.isSubmitting = true;
            
            try {
                const pdf = await this.generatePDF();
                const pdfBlob = pdf.output('blob');
                
                const submissionData = {
                    customerInfo: {
                        firstName: this.formData.firstName,
                        lastName: this.formData.lastName,
                        phone: this.formData.phone,
                        email: this.formData.email,
                        address1: this.formData.address1,
                        address2: this.formData.address2,
                        city: this.formData.city,
                        state: this.formData.state,
                        zip: this.formData.zip,
                        requestedService: this.formData.requestedService
                    },
                    disclosures: this.formData.disclosures,
                    initials: {
                        sectionA: this.formData.initialsA,
                        sectionB: this.formData.initialsB,
                        sectionC: this.formData.initialsC
                    },
                    signature: {
                        printedName: this.formData.printedName,
                        date: this.formData.signatureDate,
                        signatureData: this.signaturePad.toDataURL()
                    },
                    submittedAt: new Date().toISOString()
                };
                
                const response = await api.submitServiceIntake(submissionData, pdfBlob);
                
                if (response.success) {
                    this.showSuccessModal = true;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    this.errorMessage = response.message || 'An error occurred while submitting the form. Please try again.';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                
            } catch (error) {
                console.error('Submission error:', error);
                this.errorMessage = 'Unable to submit form. Please check your connection and try again.';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } finally {
                this.isSubmitting = false;
            }
        },
        
        resetForm() {
            this.formData = {
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                zip: '',
                requestedService: '',
                disclosures: {
                    submerged: false,
                    thermal: false,
                    impact: false
                },
                initialsA: '',
                initialsB: '',
                initialsC: '',
                printedName: '',
                signatureDate: this.getTodayDate()
            };
            this.signaturePad.clear();
            this.errorMessage = '';
        }
    }
}).mount('#app');
