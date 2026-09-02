const { createApp } = Vue;

createApp({
    data() {
        return {
            formType: 'standard', // 'express', 'standard', or dormant 'battery'
            // Battery intake is preserved for possible future reuse, but CCW does not service batteries at this time.
            batteryServiceEnabled: false,
            batteryServiceUnavailableMessage: 'Battery Only Service is currently unavailable because we do not service batteries at this time.',
            maxBikes: 10,
            expressMinuteLimit: 30,
            nextBikeId: 2,
            mountainTimeTick: Date.now(),
            timeCheckInterval: null,
            expressServices: [
                { id: 'emoto_off_bike_tire', category: 'Tires & Tubes — E-Moto', name: 'Off-Bike Tire Replacement', minutes: 15, allowsQuantity: true },
                { id: 'emoto_off_bike_tube', category: 'Tires & Tubes — E-Moto', name: 'Off-Bike Tube Replacement', minutes: 15, allowsQuantity: true },
                { id: 'emoto_front_tire', category: 'Tires & Tubes — E-Moto', name: 'On-Bike Front Tire or Tube Replacement', minutes: 20 },
                { id: 'emoto_rear_tire', category: 'Tires & Tubes — E-Moto', name: 'On-Bike Rear Tire or Tube Replacement', minutes: 30 },
                { id: 'ebike_off_bike_tire', category: 'Tires & Tubes — E-Bicycle', name: 'Off-Bike Tire Replacement', minutes: 15, allowsQuantity: true },
                { id: 'ebike_off_bike_tube', category: 'Tires & Tubes — E-Bicycle', name: 'Off-Bike Tube Replacement', minutes: 15, allowsQuantity: true },
                { id: 'ebike_front_tire', category: 'Tires & Tubes — E-Bicycle', name: 'On-Bike Front Tire or Tube Replacement', minutes: 15 },
                { id: 'ebike_rear_tire', category: 'Tires & Tubes — E-Bicycle', name: 'On-Bike Rear Tire or Tube Replacement', minutes: 20 },
                { id: 'tire_pressure', category: 'General Tires & Wheels', name: 'Tire Pressure Check & Adjustment', minutes: 5 },
                { id: 'wheel_truing_on_bike', category: 'General Tires & Wheels', name: 'On-Bike Spoke Tensioning & Basic Wheel Truing', minutes: 30 },
                { id: 'wheel_truing_off_bike', category: 'General Tires & Wheels', name: 'Off-Bike Spoke Tensioning & Basic Wheel Truing', minutes: 15, allowsQuantity: true },
                { id: 'brake_lever_left', category: 'Brakes, Steering & Controls', name: 'Brake Lever Replacement (Left)', minutes: 14 },
                { id: 'brake_lever_right', category: 'Brakes, Steering & Controls', name: 'Brake Lever Replacement (Right)', minutes: 14 },
                { id: 'footpegs', category: 'Brakes, Steering & Controls', name: 'Footpeg Replacement (Pair)', minutes: 15 },
                { id: 'headset_tightening', category: 'Brakes, Steering & Controls', name: 'Headset / Steering Stem Tightening', minutes: 15 },
                { id: 'brake_pads_front', category: 'Brakes, Steering & Controls', name: 'Front Brake Pad Replacement', minutes: 15 },
                { id: 'brake_pads_rear', category: 'Brakes, Steering & Controls', name: 'Rear Brake Pad Replacement', minutes: 15 },
                { id: 'chain_service', category: 'Drivetrain', name: 'Chain Service (Cleaning, Lubricating, and Checking/Setting Tension)', minutes: 15 },
                { id: 'belt_tension', category: 'Drivetrain', name: 'Primary Belt Tension Adjustment', minutes: 10 },
                { id: 'safety_inspection', category: 'Inspections', name: 'Safety Inspection & Full-Frame Torque-Spec Bolt Check', minutes: 20 }
            ],
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
                smsConsent: false,
                requestedService: '',
                expressSelectedServiceIds: [],
                expressServiceQuantities: {},
                bikes: [
                    {
                        id: 1,
                        make: '',
                        model: '',
                        requestedService: '',
                        warrantyRequest: false,
                        warrantyPurchaseSource: '',
                        warrantyPurchaseDate: '',
                        safetyHistory: '',
                        safetySubmerged: false,
                        safetyThermal: false,
                        safetyImpact: false,
                        safetyMultipleConfirmed: false,
                        rushLaborRequested: false,
                        requestedReturnDate: ''
                    }
                ],
                disclosures: {
                    diagFeeAcknowledged: false,
                    batteryFeeAcknowledged: false,
                    batteryPickupTerms: false,
                    submerged: false,
                    thermal: false,
                    impact: false,
                    warrantyRequest: false,
                    warrantyPurchaseSource: '',
                    warrantyPurchaseDate: '',
                    safetyHistory: '',
                    safetyMultipleConfirmed: false,
                    expressTermsAcknowledged: false,
                    sectionAAck: false,
                    sectionBAck: false,
                    sectionCAck: false
                },
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
        filteredStates() {
            const q = this.formData.state.toUpperCase();
            if (!q) return this.allStates.slice(0, 6);
            return this.allStates.filter(s =>
                s.abbr.startsWith(q) || s.name.toUpperCase().startsWith(q)
            ).slice(0, 6);
        },

        expressServiceCategories() {
            return [...new Set(this.expressServices.map(service => service.category))];
        },

        expressSelectedServices() {
            const selected = new Set(this.formData.expressSelectedServiceIds);
            return this.expressServices.flatMap(service => {
                const quantity = service.allowsQuantity
                    ? this.getExpressServiceQuantity(service)
                    : (selected.has(service.id) ? 1 : 0);
                return quantity > 0 ? [{ ...service, quantity }] : [];
            });
        },

        expressSelectedMinutes() {
            return this.expressSelectedServices.reduce(
                (total, service) => total + (service.minutes * service.quantity),
                0
            );
        },

        expressRemainingMinutes() {
            return Math.max(0, this.expressMinuteLimit - this.expressSelectedMinutes);
        },

        expressHasNoFittingServices() {
            if (!this.expressSelectedServices.length) return false;
            const selected = new Set(this.formData.expressSelectedServiceIds);
            return this.expressServices.every(service => {
                if (service.allowsQuantity) {
                    return service.minutes > this.expressRemainingMinutes;
                }
                return selected.has(service.id) || service.minutes > this.expressRemainingMinutes;
            });
        },

        expressProgressPercent() {
            if (this.expressHasNoFittingServices) return 100;
            return Math.min(100, (this.expressSelectedMinutes / this.expressMinuteLimit) * 100);
        },

        isAfterExpressCutoff() {
            void this.mountainTimeTick;
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Denver',
                hour: '2-digit',
                hourCycle: 'h23'
            }).formatToParts(new Date());
            const hour = Number(parts.find(part => part.type === 'hour')?.value || 0);
            return hour >= 17;
        },

        submitFormLabel() {
            if (this.formType === 'express') return 'Submit Express Visit';
            if (this.formType === 'battery') return 'Submit Battery Diagnostic Form';
            return 'Submit Service Intake Form';
        }
    },

    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        if (this.timeCheckInterval) clearInterval(this.timeCheckInterval);
    },

    mounted() {
        this.initSignaturePad();
        document.addEventListener('click', this.handleClickOutside);
        this.timeCheckInterval = setInterval(() => {
            this.mountainTimeTick = Date.now();
        }, 60000);
    },

    methods: {
        switchFormType(type) {
            if (type === 'battery' && !this.batteryServiceEnabled) {
                this.errorMessage = this.batteryServiceUnavailableMessage;
                return;
            }
            this.formType = type;
            this.errorMessage = '';
        },

        addBike() {
            if (this.formData.bikes.length >= this.maxBikes) {
                return;
            }
            this.formData.bikes.push({
                id: this.nextBikeId++,
                make: '',
                model: '',
                requestedService: '',
                warrantyRequest: false,
                warrantyPurchaseSource: '',
                warrantyPurchaseDate: '',
                safetyHistory: '',
                safetySubmerged: false,
                safetyThermal: false,
                safetyImpact: false,
                safetyMultipleConfirmed: false,
                rushLaborRequested: false,
                requestedReturnDate: ''
            });
        },

        removeBike(index) {
            if (this.formData.bikes.length > 1) {
                this.formData.bikes.splice(index, 1);
            }
        },

        warrantyPurchaseSourceLabel(source) {
            return ({ ccw: 'Yes', other: 'No', unsure: 'Unsure' })[source] || 'Not answered';
        },

        onBikeWarrantyChange(bike) {
            if (!bike.warrantyRequest) {
                bike.warrantyPurchaseSource = '';
                bike.warrantyPurchaseDate = '';
            }
        },

        onBatteryWarrantyChange() {
            if (!this.formData.disclosures.warrantyRequest) {
                this.formData.disclosures.warrantyPurchaseSource = '';
                this.formData.disclosures.warrantyPurchaseDate = '';
            }
        },

        bikeSafetySelectionCount(bike) {
            return [bike.safetySubmerged, bike.safetyThermal, bike.safetyImpact]
                .filter(Boolean).length;
        },

        batterySafetySelectionCount() {
            const d = this.formData.disclosures;
            return [d.submerged, d.thermal, d.impact].filter(Boolean).length;
        },

        onBikeSafetyHistoryChange(bike) {
            if (bike.safetyHistory !== 'reported') {
                bike.safetySubmerged = false;
                bike.safetyThermal = false;
                bike.safetyImpact = false;
                bike.safetyMultipleConfirmed = false;
            }
        },

        onBatterySafetyHistoryChange() {
            const d = this.formData.disclosures;
            if (d.safetyHistory !== 'reported') {
                d.submerged = false;
                d.thermal = false;
                d.impact = false;
                d.safetyMultipleConfirmed = false;
            }
        },

        safetyHistoryText(record, isBattery = false) {
            if (record.safetyHistory === 'none') return 'None of the listed safety events reported';
            if (record.safetyHistory !== 'reported') return 'Not answered';
            const flags = isBattery
                ? [
                    [record.submerged, 'Submerged or heavy water exposure'],
                    [record.thermal, 'Smoke, sparks, overheating, burning smell, swelling, or fire/thermal event'],
                    [record.impact, 'Impact to battery, charge port, or wiring harness']
                ]
                : [
                    [record.safetySubmerged, 'Submerged or heavy water exposure'],
                    [record.safetyThermal, 'Smoke, sparks, overheating, burning smell, swelling, or fire/thermal event'],
                    [record.safetyImpact, 'Impact to battery, charge port, or wiring harness']
                ];
            const selected = flags.filter(([checked]) => checked).map(([, label]) => label);
            return selected.length ? selected.join('; ') : 'Safety event indicated, but no condition selected';
        },

        formatBikeRequests() {
            return this.formData.bikes.map((bike, index) => {
                const lines = [
                    `Bike ${index + 1}: ${bike.make.trim()} ${bike.model.trim()}`,
                    `Services Requested: ${bike.requestedService.trim()}`,
                    `Warranty Eligibility Review: ${bike.warrantyRequest ? 'Requested — Not Yet Verified' : 'Not Requested'}`,
                    `Safety History: ${this.safetyHistoryText(bike)}`,
                    `Rush Labor Request: ${bike.rushLaborRequested ? 'Yes — $238.50/hr (1.5x standard rate)' : 'No'}`
                ];
                if (bike.warrantyRequest) {
                    lines.push(`Purchased from Charged Cycle Works: ${this.warrantyPurchaseSourceLabel(bike.warrantyPurchaseSource)}`);
                    if (bike.warrantyPurchaseDate) {
                        lines.push(`Approximate Purchase Month: ${bike.warrantyPurchaseDate}`);
                    }
                }
                if (bike.rushLaborRequested && bike.requestedReturnDate) {
                    lines.push(`Requested Return Date: ${bike.requestedReturnDate} (not guaranteed)`);
                }
                return lines.join('\n');
            }).join('\n\n');
        },

        servicesForCategory(category) {
            return this.expressServices.filter(service => service.category === category);
        },

        isExpressServiceSelected(service) {
            if (service.allowsQuantity) return this.getExpressServiceQuantity(service) > 0;
            return this.formData.expressSelectedServiceIds.includes(service.id);
        },

        isExpressServiceDisabled(service) {
            if (service.allowsQuantity) {
                return !this.isExpressServiceSelected(service) && !this.canIncrementExpressService(service);
            }
            if (this.isExpressServiceSelected(service)) return false;
            return this.expressSelectedMinutes + service.minutes > this.expressMinuteLimit;
        },

        getExpressServiceQuantity(service) {
            return Number(this.formData.expressServiceQuantities[service.id]) || 0;
        },

        canIncrementExpressService(service) {
            return this.expressSelectedMinutes + service.minutes <= this.expressMinuteLimit;
        },

        incrementExpressService(service) {
            if (!service.allowsQuantity || !this.canIncrementExpressService(service)) return;
            this.formData.expressServiceQuantities[service.id] = this.getExpressServiceQuantity(service) + 1;
        },

        decrementExpressService(service) {
            if (!service.allowsQuantity) return;
            const nextQuantity = this.getExpressServiceQuantity(service) - 1;
            if (nextQuantity > 0) {
                this.formData.expressServiceQuantities[service.id] = nextQuantity;
            } else {
                delete this.formData.expressServiceQuantities[service.id];
            }
        },

        expressServiceSelectionLabel(service) {
            return service.quantity > 1 ? `${service.quantity} × ${service.name}` : service.name;
        },

        formatExpressServices() {
            const bike = this.formData.bikes[0];
            const serviceLines = this.expressSelectedServices.map(
                service => `- ${this.expressServiceSelectionLabel(service)}`
            );
            return [
                `Bike: ${bike.make.trim()} ${bike.model.trim()}`,
                'Express Services:',
                ...serviceLines
            ].join('\n');
        },

        switchExpressToStandard() {
            const bike = this.formData.bikes[0];
            bike.requestedService = this.expressSelectedServices
                .map(service => this.expressServiceSelectionLabel(service))
                .join('\n');
            this.switchFormType('standard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        getTodayDate() {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day   = String(today.getDate()).padStart(2, '0');
            const year  = today.getFullYear();
            return `${month}/${day}/${year}`;
        },

        getTodayIsoDate() {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${today.getFullYear()}-${month}-${day}`;
        },

        // ── Name fields ──────────────────────────────────────────────────────
        onNameInput(field) {
            this.formData[field] = this.formData[field].replace(/[^A-Za-z\s'\-\.]/g, '');
        },

        onNameBlur() {
            const first = this.formData.firstName.trim();
            const last  = this.formData.lastName.trim();
            if (first && last) {
                this.formData.printedName = `${first} ${last}`;
            }
        },

        // ── Phone ────────────────────────────────────────────────────────────
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

        // ── ZIP ──────────────────────────────────────────────────────────────
        onZipInput() {
            let val = this.formData.zip.replace(/[^\d-]/g, '');
            const parts = val.split('-');
            if (parts[0].length > 5) parts[0] = parts[0].slice(0, 5);
            if (parts.length > 2) parts.splice(2);
            if (parts[1] !== undefined && parts[1].length > 4) parts[1] = parts[1].slice(0, 4);
            this.formData.zip = parts.join('-');
        },

        // ── State dropdown ───────────────────────────────────────────────────
        onStateInput() {
            this.formData.state = this.formData.state.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
            this.showStateSuggestions = true;
        },

        onStateBlur() {
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

        // ── Signature ────────────────────────────────────────────────────────
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
                const data    = this.signaturePad.toData();
                canvas.width  = container.offsetWidth;
                canvas.height = 150;
                this.signaturePad.fromData(data);
            });
        },

        clearSignature() {
            this.signaturePad.clear();
        },

        // ── Modal ─────────────────────────────────────────────────────────────
        dismissModal() {
            this.showSuccessModal = false;
            this.resetForm();
        },

        // ── PDF ───────────────────────────────────────────────────────────────
        async generatePDF() {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            let yPos = 20;
            const margin    = 20;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const maxWidth  = pageWidth - (margin * 2);

            const addSpace       = (n) => { yPos += n; };
            const checkPageBreak = (needed = 40) => {
                if (yPos > 270 - needed) { pdf.addPage(); yPos = 20; }
            };

            const renderSignature = (authorizationText) => {
                checkPageBreak(60);
                pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
                pdf.text('SIGNATURE & DIGITAL AUTHORIZATION', margin, yPos); addSpace(6);
                pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
                pdf.splitTextToSize(authorizationText, maxWidth).forEach(line => {
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
                pdf.text(`Name: ${this.formData.printedName}`, margin, yPos); addSpace(5);
                pdf.text(`Date & Timestamp: ${this.formData.signatureDate} - ${new Date().toLocaleTimeString()}`, margin, yPos); addSpace(5);
                pdf.setFontSize(8); pdf.setFont(undefined, 'italic');
                pdf.text('IP Address and exact digital timestamp recorded automatically upon submission.', margin, yPos);
            };

            pdf.setFontSize(18); pdf.setFont(undefined, 'bold');
            const title = this.formType === 'standard'
                ? 'E-MOTO SERVICE INTAKE'
                : this.formType === 'express'
                    ? 'EXPRESS VISIT INTAKE'
                    : 'BATTERY DIAGNOSTIC INTAKE';
            pdf.text(title, margin, yPos); addSpace(8);

            pdf.setFontSize(10); pdf.setFont(undefined, 'normal');
            pdf.text('Charged Cycle Works', margin, yPos); addSpace(5);
            pdf.setFontSize(8);
            pdf.text(`Submitted: ${new Date().toLocaleString()} | Form v20 (${this.formType.toUpperCase()})`, margin, yPos); addSpace(12);

            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('CUSTOMER INFORMATION', margin, yPos); addSpace(6);

            pdf.setFontSize(10); pdf.setFont(undefined, 'normal');
            pdf.text(`${this.formData.firstName} ${this.formData.lastName}`, margin, yPos); addSpace(5);
            pdf.text(`Phone: ${this.formData.phone} | SMS Consent: ${this.formData.smsConsent ? 'YES' : 'NO'}`, margin, yPos); addSpace(5);
            pdf.text(`Email: ${this.formData.email}`, margin, yPos); addSpace(5);
            if (this.formType !== 'express') {
                pdf.text(this.formData.address1, margin, yPos); addSpace(5);
                if (this.formData.address2) { pdf.text(this.formData.address2, margin, yPos); addSpace(5); }
                pdf.text(`${this.formData.city}, ${this.formData.state} ${this.formData.zip}`, margin, yPos); addSpace(8);
            } else {
                addSpace(3);
            }

            pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
            const serviceHeading = this.formType === 'standard'
                ? 'Bikes & Services Requested:'
                : this.formType === 'express'
                    ? 'Express Bike & Selected Services:'
                    : 'Requested Service / Problem Description:';
            pdf.text(serviceHeading, margin, yPos); addSpace(5);
            pdf.setFont(undefined, 'normal');
            const serviceDescription = this.formType === 'standard'
                ? this.formatBikeRequests()
                : this.formType === 'express'
                    ? this.formatExpressServices()
                    : this.formData.requestedService;
            pdf.splitTextToSize(serviceDescription, maxWidth).forEach(line => {
                checkPageBreak(); pdf.text(line, margin, yPos); addSpace(4);
            });
            addSpace(6);

            if (this.formType === 'express') {
                checkPageBreak(70);
                pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
                pdf.text('EXPRESS VISIT TERMS', margin, yPos); addSpace(6);
                pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
                const expressTerms = [
                    '1. AUTHORIZATION AND ADDED WORK — Customer authorizes the selected services, reasonable operational testing, and a limited test ride when safe. Added repairs, parts, diagnostics, or labor beyond the selected 30-minute Express scope require separate approval and convert the visit to a standard service check-in.',
                    '2. AVAILABILITY, SAFETY, AND SERVICE OUTCOME — Express availability and same-day completion are not guaranteed. After 5:00 PM Mountain Time, availability must be confirmed with the receptionist. The shop may refuse Express service, stop work, isolate electrical power, or recommend standard diagnostics for unsafe, hidden, intermittent, modified, or out-of-scope conditions.',
                    '3. PARTS, MODIFICATIONS, AND WARRANTY — The shop is not responsible for failures caused by customer-supplied or non-OEM parts, tuning, firmware changes, wiring modifications, abuse, water intrusion, or impact damage. Unless otherwise stated on the invoice, workmanship is warranted for 30 days only for the specific service performed.',
                    '4. TESTING ACCESS AND BIKE CONDITION — Customer will provide the keys, battery, fob, charger, or controls needed for testing, and the bike will arrive reasonably clean with at least 30% battery charge. If access is unavailable, the shop is not responsible for conditions that could only have been identified through functional testing.',
                    '5. PAYMENT, PICKUP, AND STORAGE — Payment is due in full before release. The bike must be collected by close of business the same day. Standard overnight storage fees and remedies allowed by applicable law may apply if it is not collected as agreed.',
                    '6. PROPERTY, DOCUMENTATION, AND LIABILITY — Customer will remove personal items and unsecured accessories. The shop may photograph the bike and access diagnostic data for service documentation and quality control. To the extent allowed by law, the shop is not responsible for unsecured property or incidental or consequential loss, including loss of use.'
                ];
                expressTerms.forEach(term => {
                    pdf.splitTextToSize(term, maxWidth - 6).forEach(line => {
                        checkPageBreak(); pdf.text(line, margin + 3, yPos); addSpace(4);
                    });
                    addSpace(2);
                });
                addSpace(3);
                pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
                pdf.text(`[${this.formData.disclosures.expressTermsAcknowledged ? 'X' : ' '}] Customer acknowledged all six Express Visit terms`, margin, yPos);
                addSpace(10);
                renderSignature('By signing below, customer confirms they are the owner or authorized agent, agrees to the Express Visit terms above, and authorizes the selected services.');
                return pdf;
            }

            if (this.formType === 'battery') {
                pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
                const d = this.formData.disclosures;
                const warrantyLines = [
                    `Warranty Eligibility Review: ${d.warrantyRequest ? 'Requested — Not Yet Verified' : 'Not Requested'}`
                ];
                if (d.warrantyRequest) {
                    warrantyLines.push(`Purchased from Charged Cycle Works: ${this.warrantyPurchaseSourceLabel(d.warrantyPurchaseSource)}`);
                    if (d.warrantyPurchaseDate) warrantyLines.push(`Approximate Purchase Month: ${d.warrantyPurchaseDate}`);
                }
                warrantyLines.forEach(line => { pdf.text(line, margin, yPos); addSpace(5); });
                addSpace(5);
            }

            // ── Financial & Fee Acknowledgment ────────────────────────────────
            checkPageBreak(35);
            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('SERVICE TERMS & PRICING AUTHORIZATION', margin, yPos); addSpace(6);
            pdf.setFontSize(9); pdf.setFont(undefined, 'normal');
            
            if (this.formType === 'standard') {
                pdf.splitTextToSize(
                    `[${this.formData.disclosures.diagFeeAcknowledged ? 'X' : ' '}] Customer acknowledged the $99 service minimum (charged even if repairs are declined or diagnostics are inconclusive).`,
                    maxWidth - 6
                ).forEach(line => { pdf.text(line, margin + 3, yPos); addSpace(4); });
            } else {
                pdf.setTextColor(211, 47, 47); // Red highlight in PDF
                pdf.splitTextToSize(
                    `[${this.formData.disclosures.batteryFeeAcknowledged ? 'X' : ' '}] Customer agrees to $400 upfront fee. Acknowledges repair is a LAST-DITCH EFFORT with NO GUARANTEE of success. Entitled to $200 refund ONLY upon picking up dead battery, or $400 credit toward a new battery.`,
                    maxWidth - 6
                ).forEach(line => { pdf.text(line, margin + 3, yPos); addSpace(4); });
                addSpace(3);
                pdf.splitTextToSize(
                    `[${this.formData.disclosures.batteryPickupTerms ? 'X' : ' '}] TOTAL FORFEITURE NOTICE: Customer agrees to pick up battery within 10 business days of notice or completely forfeits ownership AND forfeits the entire $400 payment spent to attempt repair.`,
                    maxWidth - 6
                ).forEach(line => { pdf.text(line, margin + 3, yPos); addSpace(4); });
                pdf.setTextColor(0);
            }
            addSpace(6);

            checkPageBreak(60);
            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('A. SAFETY AND BATTERY DISCLOSURES', margin, yPos); addSpace(6);
            pdf.setFontSize(9); pdf.setFont(undefined, 'normal');
            if (this.formType === 'standard') {
                pdf.splitTextToSize('Safety history is recorded separately with each bike above.', maxWidth - 6).forEach(line => {
                    pdf.text(line, margin + 3, yPos); addSpace(4);
                });
                addSpace(3);
                pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
                pdf.text(`[${this.formData.disclosures.sectionAAck ? 'X' : ' '}] Customer confirmed accurate safety history for every bike`, margin, yPos); addSpace(10);
            } else {
                pdf.splitTextToSize(`Safety History: ${this.safetyHistoryText(this.formData.disclosures, true)}`, maxWidth - 6).forEach(line => {
                    pdf.text(line, margin + 3, yPos); addSpace(4);
                });
                addSpace(6);
            }

            checkPageBreak(70);
            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('B. OPERATIONAL AUTHORIZATION & TESTING', margin, yPos); addSpace(6);
            pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
            
            const bTerms = this.formType === 'standard' ? [
                'Customer authorizes the $99 service minimum (authorizing the first hour of diagnostic work) and standard bench/road testing when safe. Labor beyond flat-rate quotes or the initial diagnostic hour is billed at our standard rate of $159/hr.',
                'No work beyond authorized estimates or quotes will proceed without documented approval (signature, email, or text/SMS from the number on file). Storage after 7 days: $20/day.',
                'Shop is not responsible for personal items or loose accessories left with the bike. All terms and minimum fees acknowledged above apply in full.'
            ] : [
                'Customer authorizes Charged Cycle Works to perform bench testing, charge/discharge cycling, and high-current load testing as required for diagnosis.',
                'No labor or parts beyond the pre-authorized limits established above will be added without documented approval (email or text/SMS from the number on file). Additional approved labor is billed at the standard rate of $159/hr.',
                'Shop is not responsible for straps, bags, or loose accessories left with the equipment. All financial credits, refunds, and 10-day forfeiture terms acknowledged above apply in full.'
            ];

            bTerms.forEach(text => {
                checkPageBreak();
                pdf.splitTextToSize(text, maxWidth - 6).forEach(line => { pdf.text(line, margin + 3, yPos); addSpace(4); });
                addSpace(2);
            });
            addSpace(2);
            if (this.formType === 'standard') {
                pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
                pdf.text(`[${this.formData.disclosures.sectionBAck ? 'X' : ' '}] Customer confirmed Section B Authorization & Rates`, margin, yPos); addSpace(10);
            } else {
                addSpace(6);
            }

            checkPageBreak(60);
            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('C. QUALITY CONTROL AND OPERATIONAL ACCESS', margin, yPos); addSpace(6);
            pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
            
            const cTerms = this.formType === 'standard' ? [
                'Customer agrees to leave all keys, batteries, information, and critical operating components required to operate the bike.',
                'If the customer fails to leave the means to test-ride the bike, Charged Cycle Works is not liable for any issues that could only have been identified through a functional test ride.',
                'Any subsequent return visits to address issues that would have been identified during a test ride will be treated as a new service request and billed at the standard $159/hr rate.'
            ] : [
                'Customer agrees to leave any specialized adapters, proprietary chargers, or keys required to power on, charge, and test the battery system.',
                'If the customer fails to leave the necessary equipment to charge or load-test the battery, Charged Cycle Works is not liable for any performance issues or faults that could only have been identified through full functional load testing.',
                'Any subsequent return visits to address issues that could not be verified due to missing charging/testing accessories will be treated as a new diagnostic request.'
            ];

            cTerms.forEach(text => {
                checkPageBreak();
                pdf.splitTextToSize(text, maxWidth - 6).forEach(line => { pdf.text(line, margin + 3, yPos); addSpace(4); });
                addSpace(2);
            });
            addSpace(2);
            if (this.formType === 'standard') {
                pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
                pdf.text(`[${this.formData.disclosures.sectionCAck ? 'X' : ' '}] Customer confirmed Section C Operational Access`, margin, yPos); addSpace(10);
            } else {
                addSpace(6);
            }

            // PDF always prints full 9 terms regardless of accordion state in UI
            pdf.addPage(); yPos = 20;
            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('TERMS AND CONDITIONS (FULL 9 ARTICLES)', margin, yPos); addSpace(6);
            pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
            
            const allTerms = [
                '1. Estimates and authorization: Estimates are provided when feasible. Repairs are performed only as authorized. Additional repairs or parts that change the total must be approved in writing (signature, email, or text/SMS from the number on file). Authorization records are kept with the repair order.',
                '2. Service minimum and disassembly: The standard $99 service minimum applies to general visits. For standalone battery repair drop-offs, a $400 upfront payment applies ($200 refundable upon physical pickup if unrecoverable, or $400 credited toward a new battery purchase). Customer explicitly acknowledges that battery repair is a last-ditch effort with zero guarantee of success. Some faults require disassembly to confirm. Parts or cells removed for inspection may not be reinstalled until authorized.',
                '3. High-voltage and lithium battery safety & Total Abandonment Forfeiture: Lithium systems can fail without warning. If the shop determines a battery, wiring, or high-voltage component is unsafe, service may be refused and the equipment may be released unrepaired. Customer authorizes the shop to isolate power, remove the battery when necessary, and store it in a safe area. Hidden damage from water, impact, corrosion, or previous overheating may not be discoverable until disassembly. For standalone battery drop-offs, any battery not picked up within 10 business days of notice of completion is deemed legally abandoned and forfeited; the customer explicitly agrees to forfeit all ownership rights to the battery AND forfeit the entire $400 upfront payment. Charged Cycle Works reserves the full right to recycle, salvage, or dispose of forfeited batteries without customer recourse or reimbursement.',
                '4. Aftermarket and customer-supplied parts: Aftermarket electrical modifications and customer-supplied parts can create compatibility and safety issues. The shop is not responsible for failures caused by non-OEM parts, tuning, firmware changes, or wiring modifications. Additional diagnostics may be required to identify modification-related faults.',
                '5. Testing and intermittent conditions: Customer authorizes bench testing, load testing, and limited test riding when safe and necessary to verify repairs. Intermittent symptoms may not reproduce. The shop cannot guarantee diagnosis or correction of a condition that cannot be duplicated under test conditions.',
                '6. Warranty: Unless otherwise stated on the invoice, workmanship is warranted for 30 days from completion for the specific repair performed. Warranty does not cover abuse, competition use, water intrusion, impact damage, altered firmware or tuning after service, customer modifications, or unrelated failures. Manufacturer parts warranty is handled per manufacturer policy when applicable.',
                '7. Storage, fees, and release: Equipment is released only after payment in full. For general bikes, the first 7 calendar days after completion notice are free, then storage is $20 per day. For standalone battery intakes, failure to pick up within 10 business days results in immediate and total forfeiture of both the physical battery and the entire $400 repair attempt payment. If equipment is not picked up, the shop may pursue remedies allowed by applicable state law, including lien processes or recycling disposal.',
                '8. Property, photos, and data: Remove personal items and removable accessories before service. The shop is not responsible for loss or damage to personal property or unsecured accessories. The shop may take photos for documentation and quality control. Promotional use requires separate consent. Customer authorizes access to diagnostic data (logs, firmware versions, app-based diagnostics) as needed for service.',
                '9. Right to refuse service and limitation of liability: The shop may refuse service for safety concerns, undisclosed hazards, abusive behavior, or if the repair is not economically or technically feasible. To the extent allowed by law, the shop is not responsible for incidental or consequential damages, including loss of use. Service work may reveal additional issues during disassembly and testing, especially on modified or water-exposed equipment.'
            ];

            allTerms.forEach(term => {
                checkPageBreak(30);
                pdf.splitTextToSize(term, maxWidth).forEach(line => { pdf.text(line, margin, yPos); addSpace(4); });
                addSpace(4);
            });
            addSpace(8);

            renderSignature('By signing below, customer confirms they are the owner or authorized agent and agrees to all terms above, authorizing Charged Cycle Works to perform diagnostic and repair services as approved.');

            return pdf;
        },

        // ── Submit ────────────────────────────────────────────────────────────
        async submitForm() {
            this.errorMessage = '';

            // Defense in depth: prevent a battery submission even if formType is changed outside the disabled tab.
            if (this.formType === 'battery' && !this.batteryServiceEnabled) {
                this.errorMessage = this.batteryServiceUnavailableMessage;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const f = this.formData;
            const requiredFields = [
                [f.firstName.trim(),        'First name'],
                [f.lastName.trim(),         'Last name'],
                [f.phone.trim(),            'Phone number'],
                [f.email.trim(),            'Email address'],
                [f.printedName.trim(),      'Printed name'],
            ];

            if (this.formType !== 'express') {
                requiredFields.push(
                    [f.address1.trim(), 'Street address'],
                    [f.city.trim(), 'City'],
                    [f.state.trim(), 'State'],
                    [f.zip.trim(), 'ZIP code']
                );
            }

            if (this.formType === 'standard') {
                if (f.bikes.length > this.maxBikes) {
                    this.errorMessage = `A maximum of ${this.maxBikes} bikes may be submitted at one time.`;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                f.bikes.forEach((bike, index) => {
                    requiredFields.push(
                        [bike.make.trim(), `Bike ${index + 1} make`],
                        [bike.model.trim(), `Bike ${index + 1} model`],
                        [bike.requestedService.trim(), `Bike ${index + 1} services requested`],
                        [bike.safetyHistory, `Bike ${index + 1} safety history`]
                    );
                    if (bike.warrantyRequest) {
                        requiredFields.push([
                            bike.warrantyPurchaseSource,
                            `Bike ${index + 1} warranty purchase source`
                        ]);
                    }
                    if (bike.safetyHistory === 'reported') {
                        const safetyCount = this.bikeSafetySelectionCount(bike);
                        requiredFields.push([
                            safetyCount ? 'selected' : '',
                            `Bike ${index + 1} applicable safety condition`
                        ]);
                        if (safetyCount >= 2) {
                            requiredFields.push([
                                bike.safetyMultipleConfirmed ? 'confirmed' : '',
                                `Bike ${index + 1} multiple safety-event confirmation`
                            ]);
                        }
                    }
                });
            } else if (this.formType === 'express') {
                const expressBike = f.bikes[0];
                requiredFields.push(
                    [expressBike.make.trim(), 'Bike make'],
                    [expressBike.model.trim(), 'Bike model'],
                    [this.expressSelectedServices.length ? 'selected' : '', 'At least one express service']
                );
            } else {
                requiredFields.push([f.requestedService.trim(), 'Requested service']);
                requiredFields.push([f.disclosures.safetyHistory, 'Safety history']);
                if (f.disclosures.warrantyRequest) {
                    requiredFields.push([
                        f.disclosures.warrantyPurchaseSource,
                        'Warranty purchase source'
                    ]);
                }
                if (f.disclosures.safetyHistory === 'reported') {
                    const safetyCount = this.batterySafetySelectionCount();
                    requiredFields.push([
                        safetyCount ? 'selected' : '',
                        'At least one applicable safety condition'
                    ]);
                    if (safetyCount >= 2) {
                        requiredFields.push([
                            f.disclosures.safetyMultipleConfirmed ? 'confirmed' : '',
                            'Multiple safety-event confirmation'
                        ]);
                    }
                }
            }

            const missing = requiredFields
                .filter(([val]) => !val)
                .map(([, label]) => label);

            if (missing.length) {
                this.errorMessage = `Please complete the following before submitting: ${missing.join(', ')}.`;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // SMS Consent validation
            if (!f.smsConsent) {
                this.errorMessage = 'Please check the SMS/Text communication consent box so our team can send you diagnostic updates and quotes.';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            if (this.formType === 'express') {
                if (this.expressSelectedMinutes > this.expressMinuteLimit) {
                    this.errorMessage = `Express Visit services cannot exceed ${this.expressMinuteLimit} minutes.`;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                if (!f.disclosures.expressTermsAcknowledged) {
                    this.errorMessage = 'Please acknowledge the Express Visit terms before submitting.';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            }

            // Standard Service fee and section validation
            if (this.formType === 'standard') {
                if (!f.disclosures.diagFeeAcknowledged) {
                    this.errorMessage = 'Please acknowledge the $99 service minimum before submitting.';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                if (!f.disclosures.sectionAAck || !f.disclosures.sectionBAck || !f.disclosures.sectionCAck) {
                    this.errorMessage = 'Please check the acknowledgment boxes for Sections A, B, and C before submitting.';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            }

            // Battery Diagnostics fee and forfeiture validation
            if (this.formType === 'battery') {
                if (!f.disclosures.batteryFeeAcknowledged || !f.disclosures.batteryPickupTerms) {
                    this.errorMessage = 'Please check and agree to both Battery Diagnostic fee and forfeiture terms before submitting.';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            }

            if (this.signaturePad.isEmpty()) {
                this.errorMessage = 'Please provide your signature before submitting.';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            this.isSubmitting = true;

            try {
                const pdf     = await this.generatePDF();
                const pdfBlob = pdf.output('blob');

                const submissionData = {
                    formType: this.formType,
                    bikes: this.formType === 'standard'
                        ? f.bikes.map(bike => ({
                            make: bike.make.trim(),
                            model: bike.model.trim(),
                            requestedService: bike.requestedService.trim(),
                            warrantyRequest: bike.warrantyRequest === true,
                            warrantyPurchaseSource: bike.warrantyRequest ? bike.warrantyPurchaseSource : '',
                            warrantyPurchaseDate: bike.warrantyRequest ? bike.warrantyPurchaseDate : '',
                            safetyHistory: bike.safetyHistory,
                            safetySubmerged: bike.safetyHistory === 'reported' && bike.safetySubmerged === true,
                            safetyThermal: bike.safetyHistory === 'reported' && bike.safetyThermal === true,
                            safetyImpact: bike.safetyHistory === 'reported' && bike.safetyImpact === true,
                            rushLaborRequested: bike.rushLaborRequested === true,
                            requestedReturnDate: bike.rushLaborRequested ? bike.requestedReturnDate : ''
                        }))
                        : this.formType === 'express'
                            ? [{
                                make: f.bikes[0].make.trim(),
                                model: f.bikes[0].model.trim(),
                                requestedService: this.formatExpressServices(),
                                warrantyRequest: false,
                                warrantyPurchaseSource: '',
                                warrantyPurchaseDate: '',
                                safetyHistory: '',
                                safetySubmerged: false,
                                safetyThermal: false,
                                safetyImpact: false,
                                rushLaborRequested: false,
                                requestedReturnDate: ''
                            }]
                            : [],
                    expressServices: this.formType === 'express'
                        ? this.expressSelectedServices.map(service => ({
                            id: service.id,
                            name: service.name,
                            minutes: service.minutes,
                            quantity: service.quantity
                        }))
                        : [],
                    customerInfo: {
                        firstName:        f.firstName,
                        lastName:         f.lastName,
                        phone:            f.phone,
                        email:            f.email,
                        address1:         this.formType === 'express' ? '' : f.address1,
                        address2:         this.formType === 'express' ? '' : f.address2,
                        city:             this.formType === 'express' ? '' : f.city,
                        state:            this.formType === 'express' ? '' : f.state,
                        zip:              this.formType === 'express' ? '' : f.zip,
                        smsConsent:       f.smsConsent,
                        requestedService: this.formType === 'standard'
                            ? this.formatBikeRequests()
                            : this.formType === 'express'
                                ? this.formatExpressServices()
                                : f.requestedService,
                    },
                    disclosures: f.disclosures,
                    // Safe backend string mapping for checkboxes:
                    initials: this.formType === 'standard' ? {
                        sectionA: f.disclosures.sectionAAck ? 'Acknowledged (Checkbox)' : 'Not Checked',
                        sectionB: f.disclosures.sectionBAck ? 'Acknowledged (Checkbox)' : 'Not Checked',
                        sectionC: f.disclosures.sectionCAck ? 'Acknowledged (Checkbox)' : 'Not Checked'
                    } : { sectionA: 'N/A', sectionB: 'N/A', sectionC: 'N/A' },
                    signature: {
                        printedName:   f.printedName,
                        date:          f.signatureDate,
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

        // ── Reset ─────────────────────────────────────────────────────────────
        resetForm() {
            this.formData = {
                firstName: '', lastName: '', phone: '', email: '',
                address1: '', address2: '', city: '', state: '', zip: '',
                smsConsent: false,
                requestedService: '',
                expressSelectedServiceIds: [],
                expressServiceQuantities: {},
                bikes: [
                    {
                        id: 1,
                        make: '',
                        model: '',
                        requestedService: '',
                        warrantyRequest: false,
                        warrantyPurchaseSource: '',
                        warrantyPurchaseDate: '',
                        safetyHistory: '',
                        safetySubmerged: false,
                        safetyThermal: false,
                        safetyImpact: false,
                        safetyMultipleConfirmed: false,
                        rushLaborRequested: false,
                        requestedReturnDate: ''
                    }
                ],
                disclosures: { 
                    diagFeeAcknowledged: false, 
                    batteryFeeAcknowledged: false, 
                    batteryPickupTerms: false, 
                    submerged: false, 
                    thermal: false, 
                    impact: false, 
                    warrantyRequest: false,
                    warrantyPurchaseSource: '',
                    warrantyPurchaseDate: '',
                    safetyHistory: '',
                    safetyMultipleConfirmed: false,
                    expressTermsAcknowledged: false,
                    sectionAAck: false,
                    sectionBAck: false,
                    sectionCAck: false
                },
                printedName: '',
                signatureDate: this.getTodayDate()
            };
            this.nextBikeId = 2;
            this.signaturePad.clear();
            this.errorMessage = '';
        }
    }
}).mount('#app');
