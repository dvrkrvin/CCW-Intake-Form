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
            // Tracks which fields have been touched (blurred at least once)
            touched: {},
            // Tracks fields that failed on submit-attempt (shows errors even if not touched)
            submitAttempted: false,
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
            errorMessage: '',
            _dropdownTouchStartY: 0,
            _dropdownDidScroll: false
        };
    },

    computed: {
        fullName() {
            const first = this.formData.firstName.trim();
            const last = this.formData.lastName.trim();
            return (first && last) ? `${first} ${last}` : '';
        },

        filteredStates() {
            const q = this.formData.state.toUpperCase();
            if (!q) return this.allStates;
            return this.allStates.filter(s =>
                s.abbr.startsWith(q) || s.name.toUpperCase().startsWith(q)
            );
        },

        // ── Field-level error messages ──────────────────────────────────────
        errors() {
            const f = this.formData;
            const e = {};

            // First Name
            if (!f.firstName.trim()) {
                e.firstName = 'First name is required.';
            } else if (!/^[A-Za-z\s'\-\.]+$/.test(f.firstName.trim())) {
                e.firstName = 'First name can only contain letters, spaces, hyphens, or apostrophes.';
            }

            // Last Name
            if (!f.lastName.trim()) {
                e.lastName = 'Last name is required.';
            } else if (!/^[A-Za-z\s'\-\.]+$/.test(f.lastName.trim())) {
                e.lastName = 'Last name can only contain letters, spaces, hyphens, or apostrophes.';
            }

            // Phone — must be a valid 10-digit US number (formatting allowed)
            const rawPhone = f.phone.replace(/\D/g, '');
            if (!f.phone.trim()) {
                e.phone = 'Phone number is required.';
            } else if (rawPhone.length !== 10) {
                e.phone = 'Enter a valid 10-digit phone number.';
            }

            // Email
            if (!f.email.trim()) {
                e.email = 'Email address is required.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
                e.email = 'Enter a valid email address.';
            }

            // Address 1
            if (!f.address1.trim()) {
                e.address1 = 'Street address is required.';
            }

            // City
            if (!f.city.trim()) {
                e.city = 'City is required.';
            } else if (!/^[A-Za-z\s'\-\.]+$/.test(f.city.trim())) {
                e.city = 'City name can only contain letters and spaces.';
            }

            // State
            const validAbbrs = this.allStates.map(s => s.abbr);
            if (!f.state.trim()) {
                e.state = 'State is required.';
            } else if (!validAbbrs.includes(f.state.toUpperCase())) {
                e.state = 'Enter a valid 2-letter US state abbreviation.';
            }

            // ZIP
            if (!f.zip.trim()) {
                e.zip = 'ZIP code is required.';
            } else if (!/^\d{5}(-\d{4})?$/.test(f.zip.trim())) {
                e.zip = 'Enter a valid ZIP code (e.g. 84101 or 84101-1234).';
            }

            // Requested service
            if (!f.requestedService.trim()) {
                e.requestedService = 'Please describe the service you need.';
            } else if (f.requestedService.trim().length < 10) {
                e.requestedService = 'Please provide a bit more detail (at least 10 characters).';
            }

            // Initials — letters only, 1–3 chars
            if (!f.initialsA.trim()) {
                e.initialsA = 'Initials are required for section A.';
            } else if (!/^[A-Za-z]{1,3}$/.test(f.initialsA.trim())) {
                e.initialsA = 'Initials must be 1–3 letters.';
            }

            if (!f.initialsB.trim()) {
                e.initialsB = 'Initials are required for section B.';
            } else if (!/^[A-Za-z]{1,3}$/.test(f.initialsB.trim())) {
                e.initialsB = 'Initials must be 1–3 letters.';
            }

            if (!f.initialsC.trim()) {
                e.initialsC = 'Initials are required for section C.';
            } else if (!/^[A-Za-z]{1,3}$/.test(f.initialsC.trim())) {
                e.initialsC = 'Initials must be 1–3 letters.';
            }

            // Printed name — must match the derived full name
            if (!f.printedName.trim()) {
                e.printedName = 'Printed name is required.';
            } else if (
                this.fullName &&
                f.printedName.trim().toLowerCase() !== this.fullName.toLowerCase()
            ) {
                e.printedName = 'Printed name must match the first and last name entered above.';
            }

            // Signature date — MM/DD/YYYY
            if (!f.signatureDate.trim()) {
                e.signatureDate = 'Date is required.';
            } else if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(f.signatureDate.trim())) {
                e.signatureDate = 'Enter date as MM/DD/YYYY.';
            }

            return e;
        },

        isFormValid() {
            return Object.keys(this.errors).length === 0;
        }
    },

    watch: {},

    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },

    mounted() {
        this.initSignaturePad();
        document.addEventListener('click', this.handleClickOutside);
    },

    methods: {
        // ── Helpers ────────────────────────────────────────────────────────
        getTodayDate() {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day   = String(today.getDate()).padStart(2, '0');
            const year  = today.getFullYear();
            return `${month}/${day}/${year}`;
        },

        // Mark a field as touched so its error becomes visible
        touch(field) {
            this.touched = { ...this.touched, [field]: true };
        },

        // Returns the error string for a field, but only when it should be shown
        fieldError(field) {
            if (this.submitAttempted || this.touched[field]) {
                return this.errors[field] || '';
            }
            return '';
        },

        // Returns true when the field should be styled as invalid
        isInvalid(field) {
            return !!this.fieldError(field);
        },

        // ── Input guardrails ────────────────────────────────────────────────

        // Strip non-alpha characters from name fields (allow spaces, hyphens, apostrophes, dots)
        onNameInput(field) {
            this.formData[field] = this.formData[field].replace(/[^A-Za-z\s'\-\.]/g, '');
        },

        // Update printed name only when a name field fully loses focus
        onNameBlur(field) {
            this.touch(field);
            const first = this.formData.firstName.trim();
            const last  = this.formData.lastName.trim();
            if (first && last) {
                this.formData.printedName = `${first} ${last}`;
            }
        },

        // Auto-format phone number as (###) ###-#### while typing
        onPhoneInput() {
            let digits = this.formData.phone.replace(/\D/g, '').slice(0, 10);
            if (digits.length === 0) {
                this.formData.phone = '';
            } else if (digits.length <= 3) {
                this.formData.phone = `(${digits}`;
            } else if (digits.length <= 6) {
                this.formData.phone = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
            } else {
                this.formData.phone = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
            }
        },

        // Restrict ZIP to digits and one optional hyphen group
        onZipInput() {
            let val = this.formData.zip.replace(/[^\d-]/g, '');
            // Prevent more than one hyphen or a hyphen before position 5
            const parts = val.split('-');
            if (parts[0].length > 5) parts[0] = parts[0].slice(0, 5);
            if (parts.length > 2) parts.splice(2);
            if (parts[1] !== undefined && parts[1].length > 4) parts[1] = parts[1].slice(0, 4);
            this.formData.zip = parts.join('-');
        },

        // Initials: letters only, auto-uppercase
        onInitialsInput(field) {
            this.formData[field] = this.formData[field].replace(/[^A-Za-z]/g, '').toUpperCase();
        },

        onDropdownTouchStart(e) {
            this._dropdownTouchStartY = e.touches[0].clientY;
            this._dropdownDidScroll  = false;
        },

        onDropdownTouchMove(e) {
            if (Math.abs(e.touches[0].clientY - this._dropdownTouchStartY) > 6) {
                this._dropdownDidScroll = true;
            }
        },

        onDropdownItemTouchEnd(s, e) {
            e.preventDefault();
            if (!this._dropdownDidScroll) {
                this.selectState(s);
            }
        },

        // State input
        onStateInput() {
            this.formData.state = this.formData.state.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
            this.showStateSuggestions = true;
        },

        onStateBlur() {
            this.touch('state');
            setTimeout(() => { this.showStateSuggestions = false; }, 150);
        },

        selectState(s) {
            this.formData.state = s.abbr;
            this.showStateSuggestions = false;
        },

        handleClickOutside(event) {
            const field = this.$refs.stateField;
            if (!field) return;
            if (!field.contains(event.target)) {
                this.showStateSuggestions = false;
            }
        },

        // ── Signature ───────────────────────────────────────────────────────
        initSignaturePad() {
            const canvas    = this.$refs.signatureCanvas;
            const container = canvas.parentElement;
            canvas.width    = container.offsetWidth;
            canvas.height   = 150;

            this.signaturePad = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor:        'rgb(0, 0, 0)'
            });

            window.addEventListener('resize', () => {
                const data   = this.signaturePad.toData();
                canvas.width = container.offsetWidth;
                canvas.height = 150;
                this.signaturePad.fromData(data);
            });
        },

        clearSignature() {
            this.signaturePad.clear();
        },

        // ── Modal ───────────────────────────────────────────────────────────
        dismissModal() {
            this.showSuccessModal = false;
            this.resetForm();
        },

        // ── PDF generation ──────────────────────────────────────────────────
        async generatePDF() {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            let yPos = 20;
            const margin    = 20;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const maxWidth  = pageWidth - (margin * 2);

            const addSpace      = (n) => { yPos += n; };
            const checkPageBreak = (needed = 40) => {
                if (yPos > 270 - needed) { pdf.addPage(); yPos = 20; }
            };

            pdf.setFontSize(18); pdf.setFont(undefined, 'bold');
            pdf.text('E-MOTO SERVICE INTAKE', margin, yPos); addSpace(8);

            pdf.setFontSize(10); pdf.setFont(undefined, 'normal');
            pdf.text('Charged Cycle Works', margin, yPos); addSpace(5);
            pdf.setFontSize(8);
            pdf.text(`Submitted: ${new Date().toLocaleString()} | Form v16`, margin, yPos); addSpace(12);

            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('CUSTOMER INFORMATION', margin, yPos); addSpace(6);

            pdf.setFontSize(10); pdf.setFont(undefined, 'normal');
            pdf.text(`${this.formData.firstName} ${this.formData.lastName}`, margin, yPos); addSpace(5);
            pdf.text(this.formData.phone, margin, yPos); addSpace(5);
            pdf.text(this.formData.email, margin, yPos); addSpace(5);
            pdf.text(this.formData.address1, margin, yPos); addSpace(5);
            if (this.formData.address2) { pdf.text(this.formData.address2, margin, yPos); addSpace(5); }
            pdf.text(`${this.formData.city}, ${this.formData.state} ${this.formData.zip}`, margin, yPos); addSpace(8);

            pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
            pdf.text('Requested Service:', margin, yPos); addSpace(5);
            pdf.setFont(undefined, 'normal');
            pdf.splitTextToSize(this.formData.requestedService, maxWidth).forEach(line => {
                checkPageBreak(); pdf.text(line, margin, yPos); addSpace(4);
            });
            addSpace(8);

            checkPageBreak(60);
            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('A. SAFETY AND BATTERY DISCLOSURES', margin, yPos); addSpace(6);
            pdf.setFontSize(9); pdf.setFont(undefined, 'normal');
            pdf.text(`[${this.formData.disclosures.submerged ? 'X' : ' '}] Submerged or heavy water exposure`, margin + 3, yPos); addSpace(5);
            pdf.text(`[${this.formData.disclosures.thermal  ? 'X' : ' '}] Smoke, sparks, overheating, burning smell, swelling, or fire`, margin + 3, yPos); addSpace(5);
            pdf.text(`[${this.formData.disclosures.impact   ? 'X' : ' '}] Impact to battery, charge port, or wiring harness`, margin + 3, yPos); addSpace(6);
            pdf.setFontSize(8); pdf.setTextColor(80);
            pdf.splitTextToSize('Customer confirms all known history has been disclosed. Shop may refuse service or isolate/remove the battery for safety.', maxWidth - 6).forEach(line => {
                pdf.text(line, margin + 3, yPos); addSpace(4);
            });
            pdf.setTextColor(0); addSpace(4);
            pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
            pdf.text(`Initials: ${this.formData.initialsA}`, margin, yPos); addSpace(10);

            checkPageBreak(70);
            pdf.setFontSize(11); pdf.text('B. AUTHORIZATION, TESTING, AND PAYMENT', margin, yPos); addSpace(6);
            pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
            [
                'Diagnostic minimum: $99 (charged even if repairs are declined). Labor: $159/hr unless a written flat-rate quote is provided.',
                'If additional time is required beyond a flat-rate quote due to hidden damage, we will attempt to contact you for approval. Additional time is billed at $159/hr if approved.',
                'No work beyond the authorized estimate without written approval (signature, email, or text/SMS from the number on file).',
                'Testing authorized (bench and short test ride when safe). Payment due before release. Storage after 7 days: $20/day.',
                'Shop is not responsible for personal items or loose accessories left with the bike.'
            ].forEach(text => {
                checkPageBreak();
                pdf.splitTextToSize(text, maxWidth - 6).forEach(line => { pdf.text(line, margin + 3, yPos); addSpace(4); });
                addSpace(2);
            });
            addSpace(2);
            pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
            pdf.text(`Initials: ${this.formData.initialsB}`, margin, yPos); addSpace(10);

            checkPageBreak(60);
            pdf.setFontSize(11); pdf.text('C. QUALITY CONTROL AND OPERATIONAL ACCESS', margin, yPos); addSpace(6);
            pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
            [
                'Customer agrees to leave all keys, batteries, information, and critical operating components (e.g. fobs or chargers) required to operate the bike.',
                'If the customer fails to leave the means to test-ride the bike, Charged Cycle Works is not liable for any issues that could only have been identified through a functional test ride.',
                'Any subsequent return visits to address issues that would have been identified during a test ride will be treated as a new service request and billed at the standard $159/hr rate.'
            ].forEach(text => {
                checkPageBreak();
                pdf.splitTextToSize(text, maxWidth - 6).forEach(line => { pdf.text(line, margin + 3, yPos); addSpace(4); });
                addSpace(2);
            });
            addSpace(2);
            pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
            pdf.text(`Initials: ${this.formData.initialsC}`, margin, yPos); addSpace(10);

            pdf.addPage(); yPos = 20;
            pdf.setFontSize(11); pdf.text('TERMS AND CONDITIONS', margin, yPos); addSpace(6);
            pdf.setFontSize(9); pdf.setFont(undefined, 'normal');
            pdf.text('Customer has read and agreed to all Terms and Conditions as presented in the intake form.', margin, yPos); addSpace(5);
            pdf.setFontSize(8);
            pdf.text('Full terms available at time of submission and on file with service order.', margin, yPos); addSpace(12);

            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('SIGNATURE', margin, yPos); addSpace(6);
            pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
            pdf.splitTextToSize('By signing below, customer confirms they are the owner or authorized agent and agrees to all terms above, authorizing Charged Cycle Works to perform diagnostic and repair services as approved.', maxWidth).forEach(line => {
                pdf.text(line, margin, yPos); addSpace(4);
            });
            addSpace(6);

            if (!this.signaturePad.isEmpty()) {
                pdf.addImage(this.signaturePad.toDataURL(), 'PNG', margin, yPos, 80, 24);
                addSpace(28);
            } else {
                pdf.text('(No signature provided)', margin, yPos); addSpace(10);
            }

            pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
            pdf.text(`Name: ${this.formData.printedName}`, margin, yPos); addSpace(6);
            pdf.text(`Date: ${this.formData.signatureDate}`, margin, yPos);

            return pdf;
        },

        // ── Submit ──────────────────────────────────────────────────────────
        async submitForm() {
            this.errorMessage   = '';
            this.submitAttempted = true;

            // Check signature first (not covered by computed errors)
            if (this.signaturePad.isEmpty()) {
                this.errorMessage = 'Please provide your signature before submitting.';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // Run all field validations
            if (!this.isFormValid) {
                const count = Object.keys(this.errors).length;
                this.errorMessage = `Please fix ${count} error${count > 1 ? 's' : ''} before submitting.`;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            this.isSubmitting = true;

            try {
                const pdf     = await this.generatePDF();
                const pdfBlob = pdf.output('blob');

                const submissionData = {
                    customerInfo: {
                        firstName:       this.formData.firstName,
                        lastName:        this.formData.lastName,
                        phone:           this.formData.phone,
                        email:           this.formData.email,
                        address1:        this.formData.address1,
                        address2:        this.formData.address2,
                        city:            this.formData.city,
                        state:           this.formData.state,
                        zip:             this.formData.zip,
                        requestedService: this.formData.requestedService
                    },
                    disclosures: this.formData.disclosures,
                    initials: {
                        sectionA: this.formData.initialsA,
                        sectionB: this.formData.initialsB,
                        sectionC: this.formData.initialsC
                    },
                    signature: {
                        printedName:   this.formData.printedName,
                        date:          this.formData.signatureDate,
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

        // ── Reset ───────────────────────────────────────────────────────────
        resetForm() {
            this.formData = {
                firstName: '', lastName: '', phone: '', email: '',
                address1: '', address2: '', city: '', state: '', zip: '',
                requestedService: '',
                disclosures: { submerged: false, thermal: false, impact: false },
                initialsA: '', initialsB: '', initialsC: '',
                printedName: '',
                signatureDate: this.getTodayDate()
            };
            this.touched         = {};
            this.submitAttempted = false;
            this.signaturePad.clear();
            this.errorMessage = '';
        }
    }
}).mount('#app');
