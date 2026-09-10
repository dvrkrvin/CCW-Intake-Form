const { createApp } = Vue;

createApp({
    data() {
        return {
            formType: 'standard', // 'express', 'standard', or dormant 'battery'
            // Battery intake is preserved for possible future reuse, but CCW does not service batteries at this time.
            batteryServiceEnabled: false,
            batteryServiceUnavailableMessage: 'Battery Only Service is currently unavailable because we do not service batteries at this time.',
            maxBikes: 10,
            bikeCatalog: {
                '79Bike': ['Falcon Series'],
                'Altis': ['Sigma'],
                'Arctic Leopard': ['EX 700', 'EX 800', 'EXE 800', 'EXE 880', 'XE Pro', 'XE Pro R', 'XE Pro S', 'XF Pro'],
                'Bakcou': ['Puma X22 SD'],
                'Bonnell': ['775 AM', '775 AM Touring', '775 MX', '805', '902'],
                'E Ride Pro': ['Mini', 'S', 'SR', 'SS 2.0', 'SS 3.0', 'SS 4.0'],
                'Electric Motion': ['Epure Sport', 'Escape XR'],
                'Electro & Co': ['ETM RTR', 'ETM RTR Alpha', 'ETM RTR Lite', 'ETM RTR Sport'],
                'Rawrr': ['Mantis', 'Mantis Mini', 'Mantis X', 'Mantis X Pro'],
                'ReRode': ['R1', 'R1+'],
                'RFN': ['SX-E5', 'SX-E8', 'SX-E15', 'SX-E15 Plus', 'SX-E500'],
                'Segway': ['X160', 'X260'],
                'Stark': ['Varg', 'Varg EX', 'Varg MX', 'Varg SM'],
                'Super73': ['A Series', 'R Series', 'S Series', 'Z Series'],
                'Surron': ['Hyper Bee', 'Light Bee', 'Light Bee 2', 'Light Bee S', 'Light Bee X', 'Storm Bee', 'Ultra Bee'],
                'Talaria': ['XXX', 'Komodo', 'MX3', 'Sting MX4', 'Sting MX5 Pro'],
                'Tork': ['Pro-Sport'],
                'UBCO': ['2x2 Work Bike'],
                'Ventus': ['V1', 'V1+', 'V1+ Evo'],
                'YVolt': ['Surge V'],
                'Yozma': [],
                'Zero': ['XB', 'XE'],
                'Zooz': ['Ultra Ripster', 'Ultra Urban', 'Zooper']
            },
            serviceCatalog: [
                { key: 'diagnostic_electrical', category: 'Diagnostics', name: 'Electrical Diagnostic', examples: 'Examples: no power, error codes, intermittent cutout or wiring issues' },
                { key: 'diagnostic_mechanical', category: 'Diagnostics', name: 'Mechanical Diagnostic', examples: 'Examples: unusual noises, vibration, braking, steering or drivetrain issues' },

                { key: 'chain_service', category: 'Chain, Belt & Drivetrain', name: 'Chain Service — Clean, Lubricate and Set Tension' },
                { key: 'secondary_chain', category: 'Chain, Belt & Drivetrain', name: 'Install / Replace Secondary Chain' },
                { key: 'primary_chain', category: 'Chain, Belt & Drivetrain', name: 'Install / Replace Primary Chain' },
                { key: 'primary_belt', category: 'Chain, Belt & Drivetrain', name: 'Install / Replace Primary Belt' },
                { key: 'chain_conversion', category: 'Chain, Belt & Drivetrain', name: 'Install Chain Conversion Kit' },
                { key: 'rear_sprocket', category: 'Chain, Belt & Drivetrain', name: 'Install / Replace Rear Sprocket' },
                { key: 'talaria_oil', category: 'Chain, Belt & Drivetrain', name: 'Talaria Oil Change' },

                { key: 'brake_pads_front', category: 'Brakes', name: 'Replace Front Brake Pads' },
                { key: 'brake_pads_rear', category: 'Brakes', name: 'Replace Rear Brake Pads' },
                { key: 'brake_bleed_front', category: 'Brakes', name: 'Bleed Front Brake' },
                { key: 'brake_bleed_rear', category: 'Brakes', name: 'Bleed Rear Brake' },
                { key: 'brake_assembly_front', category: 'Brakes', name: 'Install / Replace Front Brake Assembly' },
                { key: 'brake_assembly_rear', category: 'Brakes', name: 'Install / Replace Rear Brake Assembly' },
                { key: 'brake_assemblies_both', category: 'Brakes', name: 'Install / Replace Front and Rear Brake Assemblies' },
                { key: 'brake_hose_front', category: 'Brakes', name: 'Install / Replace Front Brake Hose and Bleed' },
                { key: 'brake_hose_rear', category: 'Brakes', name: 'Install / Replace Rear Brake Hose and Bleed' },
                { key: 'brake_lever', category: 'Brakes', name: 'Install / Replace Brake Lever' },
                { key: 'brake_rotor_front', category: 'Brakes', name: 'Install / Replace Front Brake Rotor' },
                { key: 'brake_rotor_rear', category: 'Brakes', name: 'Install / Replace Rear Brake Rotor' },

                { key: 'tire_front', category: 'Tires & Wheels', name: 'Replace Front Tire' },
                { key: 'tire_rear', category: 'Tires & Wheels', name: 'Replace Rear Tire' },
                { key: 'tire_rear_street', category: 'Tires & Wheels', name: 'Replace Rear Street Tire' },
                { key: 'tire_off_bike', category: 'Tires & Wheels', name: 'Replace Tire — Wheel Off Bike' },
                { key: 'wheel_dish_rear', category: 'Tires & Wheels', name: 'Dish Rear Wheel' },
                { key: 'wheel_spokes', category: 'Tires & Wheels', name: 'Tension Wheel Spokes' },
                { key: 'rim_lock', category: 'Tires & Wheels', name: 'Install Rim Lock' },
                { key: 'mousse_front', category: 'Tires & Wheels', name: 'Install Front Mousse Bib' },
                { key: 'mousse_rear', category: 'Tires & Wheels', name: 'Install Rear Mousse Bib' },
                { key: 'mousse_off_bike', category: 'Tires & Wheels', name: 'Install Mousse Bib — Wheel Off Bike' },

                { key: 'motor', category: 'Motor', name: 'Install / Replace Motor' },
                { key: 'motor_hall_sensor', category: 'Motor', name: 'Repair Motor Hall Sensor' },

                { key: 'battery_repair_warranty', category: 'Battery & Electrical', name: 'Battery Repair (Warranty Only)', examples: 'Available only for qualifying warranty claims; eligibility must be verified' },
                { key: 'battery_lid', category: 'Battery & Electrical', name: 'Install / Replace Battery Lid' },
                { key: 'battery_tray_front', category: 'Battery & Electrical', name: 'Install / Replace Front Battery Tray' },
                { key: 'dc_converter', category: 'Battery & Electrical', name: 'Install / Replace DC/DC Converter' },
                { key: 'main_wire_harness', category: 'Battery & Electrical', name: 'Install / Replace Main Wiring Harness' },

                { key: 'fork_service', category: 'Fork, Suspension & Steering', name: 'Specialist Fork Service' },
                { key: 'headset_tighten', category: 'Fork, Suspension & Steering', name: 'Tighten Headset' },
                { key: 'fork', category: 'Fork, Suspension & Steering', name: 'Install / Replace Fork' },
                { key: 'fork_height', category: 'Fork, Suspension & Steering', name: 'Match Fork Tube Height' },
                { key: 'rear_shock', category: 'Fork, Suspension & Steering', name: 'Install / Replace Rear Shock' },
                { key: 'progression_linkage', category: 'Fork, Suspension & Steering', name: 'Install / Replace Progression Linkage' },
                { key: 'headset_bearings', category: 'Fork, Suspension & Steering', name: 'Replace Headset Bearings' },
                { key: 'storm_bee_coolant', category: 'Fork, Suspension & Steering', name: 'Change Coolant — Surron Storm Bee' },

                { key: 'handlebar', category: 'Handlebars & Controls', name: 'Install / Replace Handlebar' },
                { key: 'direct_mount_stem', category: 'Handlebars & Controls', name: 'Install Direct-Mount Stem' },
                { key: 'grips', category: 'Handlebars & Controls', name: 'Install / Replace Grips' },
                { key: 'throttle', category: 'Handlebars & Controls', name: 'Install / Replace Throttle' },
                { key: 'eggrider_display', category: 'Handlebars & Controls', name: 'Install / Replace Eggrider Display' },
                { key: 'hand_guards', category: 'Handlebars & Controls', name: 'Install Full-Wrap Hand Guards' },

                { key: 'seat', category: 'Frame & Body', name: 'Install / Replace Seat' },
                { key: 'skid_plate', category: 'Frame & Body', name: 'Install / Replace Skid Plate' },
                { key: 'seat_cover', category: 'Frame & Body', name: 'Install / Replace Seat Cover' },
                { key: 'number_plate', category: 'Frame & Body', name: 'Install / Replace Number Plate' },
                { key: 'rear_fender', category: 'Frame & Body', name: 'Install / Replace Rear Fender' },
                { key: 'front_fender', category: 'Frame & Body', name: 'Install / Replace Front Fender' },
                { key: 'rear_mud_guard', category: 'Frame & Body', name: 'Install / Replace Rear Mud Guard' },
                { key: 'kickstand', category: 'Frame & Body', name: 'Install / Replace Kickstand' },

                { key: 'foot_pegs', category: 'Foot Pegs', name: 'Install / Replace Foot Pegs' },
                { key: 'peg_springs', category: 'Foot Pegs', name: 'Replace Peg Springs' },
                { key: 'peg_bracket_right', category: 'Foot Pegs', name: 'Install / Replace Right Peg Bracket' },
                { key: 'peg_bracket_left', category: 'Foot Pegs', name: 'Install / Replace Left Peg/Kickstand Bracket' },

                { key: 'headlight', category: 'Lighting & Appearance', name: 'Install / Replace Headlight' },
                { key: 'headlight_bracket', category: 'Lighting & Appearance', name: 'Install / Replace Headlight Bracket' },
                { key: 'graphics_install', category: 'Lighting & Appearance', name: 'Install Graphics Kit' },

                { key: 'other', category: 'Other', name: 'Other Service / Not Sure' }
            ],
            expressMinuteLimit: 30,
            nextBikeId: 2,
            standardStep: 1,
            expandedBikeId: 1,
            stepErrorMessage: '',
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
                        makeSelection: '',
                        modelSelection: '',
                        makeMenuOpen: false,
                        modelMenuOpen: false,
                        activeMakeOptionIndex: -1,
                        activeModelOptionIndex: -1,
                        selectedServiceKeys: [],
                        serviceSearch: '',
                        serviceMenuOpen: false,
                        activeServiceOptionIndex: -1,
                        serviceNotes: '',
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
                    serviceAuthorizationAcknowledged: false,
                    sectionAAck: false,
                    sectionBAck: false,
                    sectionCAck: false,
                    fullTermsOpened: false,
                    fullTermsAcknowledged: false,
                    termsVersion: '2026-09-02'
                },
                printedName: '',
                signatureDate: this.getTodayDate()
            },
            signaturePad: null,
            showStateSuggestions: false,
            stateQuery: '',
            stateSelection: '',
            activeStateOptionIndex: -1,
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
        bikeMakes() {
            return Object.keys(this.bikeCatalog);
        },

        expressBike() {
            return this.formData.bikes[0];
        },

        filteredStates() {
            const selectedValueIsShowing = this.stateSelection && this.stateQuery === this.stateSelection;
            const q = selectedValueIsShowing ? '' : this.stateQuery.trim().toUpperCase();
            if (!q) return this.allStates;
            const exactAbbreviation = this.allStates.find(s => s.abbr === q);
            if (exactAbbreviation) return [exactAbbreviation];
            return this.allStates.filter(s =>
                s.abbr.startsWith(q) || s.name.toUpperCase().includes(q)
            );
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

        expressSelectedCount() {
            return this.expressSelectedServices.reduce((total, service) => total + service.quantity, 0);
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
            this.stepErrorMessage = '';
            if (type === 'standard' && ![1, 2, 3].includes(this.standardStep)) this.standardStep = 1;
            this.$nextTick?.(() => {
                if (type === 'express' || this.standardStep === 3) this.resizeSignaturePad();
            });
        },

        scrollToWorkflowTop() {
            const target = document.querySelector('.workflow-progress') || document.querySelector('.toggle-container');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        validateStandardStep(step) {
            if (step === 1) {
                const required = [
                    [this.formData.firstName.trim(), 'first name'],
                    [this.formData.lastName.trim(), 'last name'],
                    [this.formData.phone.trim(), 'phone number'],
                    [this.formData.email.trim(), 'email address'],
                    [this.formData.address1.trim(), 'address'],
                    [this.formData.city.trim(), 'city'],
                    [this.formData.state.trim(), 'state'],
                    [this.formData.zip.trim(), 'ZIP code'],
                    [this.formData.smsConsent, 'text-message consent']
                ];
                const missing = required.filter(([value]) => !value).map(([, label]) => label);
                if (missing.length) {
                    this.stepErrorMessage = `Please complete: ${missing.join(', ')}.`;
                    this.revealStepError();
                    return false;
                }
            }

            if (step === 2) {
                const missing = [];
                this.formData.bikes.forEach((bike, index) => {
                    const name = this.formData.bikes.length === 1 ? 'Bike' : `Bike ${index + 1}`;
                    if (!bike.make.trim()) missing.push(`${name} make`);
                    if (!bike.model.trim()) missing.push(`${name} model`);
                    if (
                        bike.make.trim()
                        && bike.makeSelection !== '__other__'
                        && bike.makeSelection !== bike.make
                        && !Object.hasOwn(this.bikeCatalog, bike.make)
                    ) {
                        missing.push(`${name} make selection (choose a result or “not listed”)`);
                    }
                    if (
                        bike.model.trim()
                        && bike.makeSelection !== '__other__'
                        && this.getBikeModels(bike).length
                        && bike.modelSelection !== '__other__'
                        && bike.modelSelection !== bike.model
                        && !this.getBikeModels(bike).includes(bike.model)
                    ) {
                        missing.push(`${name} model selection (choose a result or “not listed”)`);
                    }
                    if (!bike.requestedService.trim()) missing.push(`${name} services requested`);
                    if (!bike.warrantyPurchaseSource) missing.push(`${name} purchase answer`);
                    if (!bike.safetyHistory) missing.push(`${name} safety-history answer`);
                    if (bike.safetyHistory === 'reported' && !this.bikeSafetySelectionCount(bike)) missing.push(`${name} safety condition`);
                    if (this.bikeSafetySelectionCount(bike) >= 2 && !bike.safetyMultipleConfirmed) missing.push(`${name} safety confirmation`);
                });
                if (missing.length) {
                    this.stepErrorMessage = `Please complete: ${missing.join(', ')}.`;
                    this.revealStepError();
                    return false;
                }
            }

            this.stepErrorMessage = '';
            return true;
        },

        revealStepError() {
            this.$nextTick?.(() => {
                document.querySelector('.step-error-message')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            });
        },

        goToStandardStep(targetStep) {
            if (targetStep > this.standardStep && !this.validateStandardStep(this.standardStep)) return;
            this.standardStep = Math.max(1, Math.min(3, targetStep));
            this.errorMessage = '';
            this.stepErrorMessage = '';
            this.$nextTick?.(() => {
                this.scrollToWorkflowTop();
                if (this.standardStep === 3) this.resizeSignaturePad();
            });
            if (!this.$nextTick) this.scrollToWorkflowTop();
        },

        toggleBike(bike) {
            this.expandedBikeId = this.expandedBikeId === bike.id ? null : bike.id;
        },

        bikeSummary(bike) {
            const identity = [bike.make, bike.model].filter(Boolean).join(' ') || 'Bike details not completed';
            const service = bike.requestedService.trim() || 'No service description yet';
            const flags = [];
            if (bike.warrantyRequest) flags.push('Warranty review');
            if (bike.rushLaborRequested) flags.push('Rush requested');
            return `${identity} · ${service}${flags.length ? ` · ${flags.join(' · ')}` : ''}`;
        },

        getBikeModels(bike) {
            return this.bikeCatalog[bike.makeSelection] || [];
        },

        filteredBikeMakes(bike) {
            const selectedValueIsShowing = bike.makeSelection && bike.makeSelection === bike.make;
            const query = selectedValueIsShowing ? '' : this.normalizeSearchValue(bike.make);
            if (!query) return this.bikeMakes;
            return this.bikeMakes.filter(make => this.normalizeSearchValue(make).includes(query));
        },

        filteredBikeModels(bike) {
            const models = this.getBikeModels(bike);
            const selectedValueIsShowing = bike.modelSelection && bike.modelSelection === bike.model;
            const query = selectedValueIsShowing ? '' : this.normalizeSearchValue(bike.model);
            if (!query) return models;
            return models.filter(model => this.normalizeSearchValue(model).includes(query));
        },

        normalizeSearchValue(value) {
            return String(value || '').toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
        },

        bikeModelPlaceholder(bike) {
            if (!bike.makeSelection) return 'Choose a make first';
            if (bike.modelSelection === '__other__' || !this.getBikeModels(bike).length) return 'Type bike model';
            return 'Search or select a model';
        },

        openBikeMakeMenu(bike) {
            if (bike.makeSelection === '__other__') return;
            bike.makeMenuOpen = true;
            bike.activeMakeOptionIndex = -1;
        },

        openBikeModelMenu(bike) {
            if (!bike.makeSelection || bike.modelSelection === '__other__' || !this.getBikeModels(bike).length) return;
            bike.modelMenuOpen = true;
            bike.activeModelOptionIndex = -1;
        },

        onBikeMakeInput(bike) {
            if (bike.makeSelection === '__other__') {
                this.reconcileBikeServiceEligibility(bike);
                return;
            }
            if (bike.makeSelection !== bike.make) {
                bike.makeSelection = '';
                bike.modelSelection = '';
                bike.model = '';
                bike.modelMenuOpen = false;
            }
            bike.makeMenuOpen = true;
            bike.activeMakeOptionIndex = -1;
            this.reconcileBikeServiceEligibility(bike);
        },

        onBikeModelInput(bike) {
            if (bike.modelSelection === '__other__') {
                this.reconcileBikeServiceEligibility(bike);
                return;
            }
            if (bike.modelSelection !== bike.model) bike.modelSelection = '';
            bike.modelMenuOpen = true;
            bike.activeModelOptionIndex = -1;
            this.reconcileBikeServiceEligibility(bike);
        },

        selectBikeMake(bike, make) {
            bike.make = make;
            bike.makeSelection = make;
            bike.makeMenuOpen = false;
            bike.activeMakeOptionIndex = -1;
            bike.model = '';
            bike.modelSelection = this.bikeCatalog[make].length ? '' : '__other__';
            bike.modelMenuOpen = false;
            bike.activeModelOptionIndex = -1;
            this.reconcileBikeServiceEligibility(bike);
            this.$nextTick?.(() => document.getElementById?.(`bike-${bike.id}-model`)?.focus());
        },

        selectBikeModel(bike, model) {
            bike.model = model;
            bike.modelSelection = model;
            bike.modelMenuOpen = false;
            bike.activeModelOptionIndex = -1;
            this.reconcileBikeServiceEligibility(bike);
        },

        useCustomBikeMake(bike) {
            bike.make = '';
            bike.makeSelection = '__other__';
            bike.makeMenuOpen = false;
            bike.activeMakeOptionIndex = -1;
            bike.model = '';
            bike.modelSelection = '__other__';
            bike.modelMenuOpen = false;
            bike.activeModelOptionIndex = -1;
            this.reconcileBikeServiceEligibility(bike);
            this.$nextTick?.(() => document.getElementById?.(`bike-${bike.id}-make`)?.focus());
        },

        useCustomBikeModel(bike) {
            bike.model = '';
            bike.modelSelection = '__other__';
            bike.modelMenuOpen = false;
            bike.activeModelOptionIndex = -1;
            this.reconcileBikeServiceEligibility(bike);
            this.$nextTick?.(() => document.getElementById?.(`bike-${bike.id}-model`)?.focus());
        },

        returnToBikeMakeList(bike) {
            bike.make = '';
            bike.makeSelection = '';
            bike.model = '';
            bike.modelSelection = '';
            bike.makeMenuOpen = true;
            bike.activeMakeOptionIndex = -1;
            this.reconcileBikeServiceEligibility(bike);
            this.$nextTick?.(() => document.getElementById?.(`bike-${bike.id}-make`)?.focus());
        },

        returnToBikeModelList(bike) {
            bike.model = '';
            bike.modelSelection = '';
            bike.modelMenuOpen = true;
            bike.activeModelOptionIndex = -1;
            this.reconcileBikeServiceEligibility(bike);
            this.$nextTick?.(() => document.getElementById?.(`bike-${bike.id}-model`)?.focus());
        },

        moveBikeMakeActive(bike, direction) {
            if (bike.makeSelection === '__other__') return;
            bike.makeMenuOpen = true;
            const optionCount = this.filteredBikeMakes(bike).length + 1;
            bike.activeMakeOptionIndex = (bike.activeMakeOptionIndex + direction + optionCount) % optionCount;
        },

        moveBikeModelActive(bike, direction) {
            if (bike.modelSelection === '__other__' || !this.getBikeModels(bike).length) return;
            bike.modelMenuOpen = true;
            const optionCount = this.filteredBikeModels(bike).length + 1;
            bike.activeModelOptionIndex = (bike.activeModelOptionIndex + direction + optionCount) % optionCount;
        },

        chooseActiveBikeMake(bike) {
            const makes = this.filteredBikeMakes(bike);
            if (bike.activeMakeOptionIndex === makes.length) return this.useCustomBikeMake(bike);
            const make = makes[bike.activeMakeOptionIndex] || (makes.length === 1 ? makes[0] : null);
            if (make) this.selectBikeMake(bike, make);
        },

        chooseActiveBikeModel(bike) {
            const models = this.filteredBikeModels(bike);
            if (bike.activeModelOptionIndex === models.length) return this.useCustomBikeModel(bike);
            const model = models[bike.activeModelOptionIndex] || (models.length === 1 ? models[0] : null);
            if (model) this.selectBikeModel(bike, model);
        },

        onBikeComboboxFocusOut(bike, menuKey, event) {
            if (!event.currentTarget.contains(event.relatedTarget)) bike[menuKey] = false;
        },

        selectedBikeServices(bike) {
            const selected = new Set(bike.selectedServiceKeys || []);
            return this.serviceCatalog.filter(service => selected.has(service.key));
        },

        availableBikeServices(bike) {
            const warrantyEligible = bike.warrantyPurchaseSource === 'ccw' && bike.warrantyRequest;
            return this.serviceCatalog.filter(service => (
                service.key !== 'battery_repair_warranty' || warrantyEligible
            ));
        },

        isElectricalDiagnosticApproved(bike) {
            const make = this.normalizeSearchValue(bike.makeSelection || bike.make);
            const model = this.normalizeSearchValue(bike.modelSelection || bike.model);
            if (['stark', 'eridepro', 'talaria', 'zero', 'segway'].includes(make)) return true;
            return make === 'surron' && (model.startsWith('lightbee') || model === 'ultrabee');
        },

        isBikeServiceSelectable(bike, service) {
            return service.key !== 'diagnostic_electrical' || this.isElectricalDiagnosticApproved(bike);
        },

        bikeServiceRestrictionMessage(bike, service) {
            if (service.key !== 'diagnostic_electrical' || this.isElectricalDiagnosticApproved(bike)) return '';
            const make = this.normalizeSearchValue(bike.makeSelection || bike.make);
            const model = this.normalizeSearchValue(bike.modelSelection || bike.model);
            if (!make || (make === 'surron' && !model)) return 'Select the bike make and model to check availability.';
            return 'Available only for Stark; Surron Light Bee or Ultra Bee; E Ride Pro; Talaria; Zero; and Segway bikes.';
        },

        reconcileBikeServiceEligibility(bike) {
            if (!this.isElectricalDiagnosticApproved(bike)) {
                this.removeBikeService(bike, 'diagnostic_electrical');
            }
        },

        filteredBikeServices(bike) {
            const query = this.normalizeSearchValue(bike.serviceSearch);
            const availableServices = this.availableBikeServices(bike);
            if (!query) return availableServices;
            return availableServices.filter(service => this.normalizeSearchValue([
                service.name,
                service.category,
                service.examples || ''
            ].join(' ')).includes(query));
        },

        isBikeServiceSelected(bike, serviceKey) {
            return (bike.selectedServiceKeys || []).includes(serviceKey);
        },

        openBikeServiceMenu(bike) {
            bike.serviceMenuOpen = true;
            bike.activeServiceOptionIndex = -1;
        },

        onBikeServiceSearchInput(bike) {
            bike.serviceMenuOpen = true;
            bike.activeServiceOptionIndex = -1;
        },

        toggleBikeService(bike, serviceKey) {
            if (!Array.isArray(bike.selectedServiceKeys)) bike.selectedServiceKeys = [];
            const service = this.serviceCatalog.find(item => item.key === serviceKey);
            if (!service || !this.isBikeServiceSelectable(bike, service)) return;
            const existingIndex = bike.selectedServiceKeys.indexOf(serviceKey);
            if (existingIndex >= 0) {
                bike.selectedServiceKeys.splice(existingIndex, 1);
            } else {
                bike.selectedServiceKeys.push(serviceKey);
            }
            this.syncBikeRequestedService(bike);
        },

        removeBikeService(bike, serviceKey) {
            if (!Array.isArray(bike.selectedServiceKeys)) return;
            const existingIndex = bike.selectedServiceKeys.indexOf(serviceKey);
            if (existingIndex >= 0) bike.selectedServiceKeys.splice(existingIndex, 1);
            this.syncBikeRequestedService(bike);
        },

        moveBikeServiceActive(bike, direction) {
            bike.serviceMenuOpen = true;
            const optionCount = this.filteredBikeServices(bike).length;
            if (!optionCount) return;
            bike.activeServiceOptionIndex = (
                bike.activeServiceOptionIndex + direction + optionCount
            ) % optionCount;
        },

        chooseActiveBikeService(bike) {
            const services = this.filteredBikeServices(bike);
            const service = services[bike.activeServiceOptionIndex]
                || (services.length === 1 ? services[0] : null);
            if (service) this.toggleBikeService(bike, service.key);
        },

        syncBikeRequestedService(bike) {
            const lines = this.selectedBikeServices(bike).map(service => `- ${service.name}`);
            const notes = String(bike.serviceNotes || '').trim();
            if (notes) lines.push(`Additional Details: ${notes}`);
            bike.requestedService = lines.join('\n');
        },

        onBikeMakeSelectionChange(bike) {
            if (bike.makeSelection === '__other__') return this.useCustomBikeMake(bike);
            this.selectBikeMake(bike, bike.makeSelection);
        },

        onBikeModelSelectionChange(bike) {
            if (bike.modelSelection === '__other__') return this.useCustomBikeModel(bike);
            this.selectBikeModel(bike, bike.modelSelection);
        },

        prepareBikeCatalogSelections(bike) {
            if (Object.hasOwn(this.bikeCatalog, bike.make)) {
                bike.makeSelection = bike.make;
                bike.modelSelection = this.bikeCatalog[bike.make].includes(bike.model) ? bike.model : '__other__';
            } else {
                bike.makeSelection = '__other__';
                bike.modelSelection = '__other__';
            }
            bike.makeMenuOpen = false;
            bike.modelMenuOpen = false;
            bike.activeMakeOptionIndex = -1;
            bike.activeModelOptionIndex = -1;
        },

        clearExpressServices() {
            this.formData.expressSelectedServiceIds = [];
            this.formData.expressServiceQuantities = {};
        },

        syncStandardAuthorizations() {
            const acknowledged = this.formData.disclosures.serviceAuthorizationAcknowledged;
            // Preserve the legacy A/B/C fields expected by the existing backend while presenting one clear authorization to the customer.
            this.formData.disclosures.sectionAAck = acknowledged;
            this.formData.disclosures.sectionBAck = acknowledged;
            this.formData.disclosures.sectionCAck = acknowledged;
        },

        addBike() {
            if (this.formData.bikes.length >= this.maxBikes) {
                return;
            }
            const newBikeId = this.nextBikeId++;
            this.formData.bikes.push({
                id: newBikeId,
                makeSelection: '',
                modelSelection: '',
                makeMenuOpen: false,
                modelMenuOpen: false,
                activeMakeOptionIndex: -1,
                activeModelOptionIndex: -1,
                selectedServiceKeys: [],
                serviceSearch: '',
                serviceMenuOpen: false,
                activeServiceOptionIndex: -1,
                serviceNotes: '',
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
            this.expandedBikeId = newBikeId;
        },

        removeBike(index) {
            if (this.formData.bikes.length > 1) {
                const [removed] = this.formData.bikes.splice(index, 1);
                if (removed?.id === this.expandedBikeId) this.expandedBikeId = this.formData.bikes[0]?.id || null;
            }
        },

        warrantyPurchaseSourceLabel(source) {
            return ({ ccw: 'Yes', other: 'No', unsure: 'Unsure' })[source] || 'Not answered';
        },

        onBikeWarrantyChange(bike) {
            if (!bike.warrantyRequest) {
                bike.warrantyPurchaseDate = '';
                this.removeBikeService(bike, 'battery_repair_warranty');
            }
        },

        onBikeWarrantySourceChange(bike) {
            if (bike.warrantyPurchaseSource !== 'ccw') {
                bike.warrantyRequest = false;
                bike.warrantyPurchaseDate = '';
                this.removeBikeService(bike, 'battery_repair_warranty');
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
                    `Purchased from Charged Cycle Works: ${this.warrantyPurchaseSourceLabel(bike.warrantyPurchaseSource)}`,
                    `Warranty Eligibility Review: ${bike.warrantyRequest ? 'Requested — Not Yet Verified' : 'Not Requested'}`,
                    `Safety History: ${this.safetyHistoryText(bike)}`,
                    `Rush Labor Request: ${bike.rushLaborRequested ? 'Yes — $238.50/hr (1.5x standard rate)' : 'No'}`
                ];
                if (bike.warrantyRequest) {
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
            bike.selectedServiceKeys = [];
            bike.serviceNotes = this.expressSelectedServices
                .map(service => this.expressServiceSelectionLabel(service))
                .join('\n');
            this.syncBikeRequestedService(bike);
            this.prepareBikeCatalogSelections(bike);
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
        openStateMenu() {
            this.showStateSuggestions = true;
            this.activeStateOptionIndex = -1;
        },

        onStateInput() {
            if (this.stateQuery !== this.stateSelection) {
                this.stateSelection = '';
                this.formData.state = '';
            }
            this.showStateSuggestions = true;
            this.activeStateOptionIndex = -1;
        },

        moveStateActive(direction) {
            this.showStateSuggestions = true;
            if (!this.filteredStates.length) return;
            this.activeStateOptionIndex = (
                this.activeStateOptionIndex + direction + this.filteredStates.length
            ) % this.filteredStates.length;
        },

        chooseActiveState() {
            const state = this.filteredStates[this.activeStateOptionIndex]
                || (this.filteredStates.length === 1 ? this.filteredStates[0] : null);
            if (state) this.selectState(state);
        },

        selectState(s) {
            this.formData.state = s.abbr;
            this.stateSelection = s.abbr;
            this.stateQuery = s.abbr;
            this.showStateSuggestions = false;
            this.activeStateOptionIndex = -1;
        },

        onStateComboboxFocusOut(event) {
            if (!event.currentTarget.contains(event.relatedTarget)) this.showStateSuggestions = false;
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

        resizeSignaturePad() {
            const canvas = this.$refs.signatureCanvas;
            if (!canvas || !this.signaturePad || !canvas.parentElement?.offsetWidth) return;
            const data = this.signaturePad.toData ? this.signaturePad.toData() : [];
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = 150;
            if (data?.length && this.signaturePad.fromData) this.signaturePad.fromData(data);
            else if (this.signaturePad.clear) this.signaturePad.clear();
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

            // The signed PDF always prints the same full 13 terms shown in the UI,
            // regardless of whether the accordion is open when the PDF is generated.
            pdf.addPage(); yPos = 20;
            pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
            pdf.text('TERMS AND CONDITIONS (FULL 13 ARTICLES) - VERSION 2026-09-02', margin, yPos); addSpace(6);
            pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
            
            // Pull from the rendered agreement so the retained PDF cannot drift from
            // the exact customer-facing terms when wording is amended later.
            const allTerms = Array.from(document.querySelectorAll('.terms-accordion .accordion-body h4, .terms-accordion .accordion-body p'))
                .map(element => element.textContent.trim())
                .filter(Boolean);

            allTerms.forEach(term => {
                checkPageBreak(30);
                pdf.splitTextToSize(term, maxWidth).forEach(line => { pdf.text(line, margin, yPos); addSpace(4); });
                addSpace(4);
            });
            addSpace(8);

            pdf.setFont(undefined, 'bold');
            pdf.text(`[${this.formData.disclosures.fullTermsAcknowledged ? 'X' : ' '}] Customer opened and acknowledged all 13 Terms and Conditions (version ${this.formData.disclosures.termsVersion}).`, margin, yPos); addSpace(10);
            renderSignature('By signing below, customer confirms they are at least 18 years old and are the owner or authorized agent; authorizes approved diagnostic and repair services; agrees to conduct this transaction electronically; and acknowledges the complete terms above. For a custom build or substantial modification, customer also acknowledges the documented configuration, changes, risks, limitations, and delivery condition.');

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
                        [bike.warrantyPurchaseSource, `Bike ${index + 1} Charged Cycle Works purchase`],
                        [bike.safetyHistory, `Bike ${index + 1} safety history`]
                    );
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
                if (!f.disclosures.serviceAuthorizationAcknowledged) {
                    this.errorMessage = 'Please confirm the service and testing authorization before submitting.';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                if (!f.disclosures.fullTermsOpened || !f.disclosures.fullTermsAcknowledged) {
                    this.errorMessage = 'Please open and acknowledge the full Terms and Conditions before submitting.';
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
                            warrantyPurchaseSource: bike.warrantyPurchaseSource,
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
                        makeSelection: '',
                        modelSelection: '',
                        makeMenuOpen: false,
                        modelMenuOpen: false,
                        activeMakeOptionIndex: -1,
                        activeModelOptionIndex: -1,
                        selectedServiceKeys: [],
                        serviceSearch: '',
                        serviceMenuOpen: false,
                        activeServiceOptionIndex: -1,
                        serviceNotes: '',
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
                    serviceAuthorizationAcknowledged: false,
                    sectionAAck: false,
                    sectionBAck: false,
                    sectionCAck: false,
                    fullTermsOpened: false,
                    fullTermsAcknowledged: false,
                    termsVersion: '2026-09-02'
                },
                printedName: '',
                signatureDate: this.getTodayDate()
            };
            this.nextBikeId = 2;
            this.stateQuery = '';
            this.stateSelection = '';
            this.activeStateOptionIndex = -1;
            this.showStateSuggestions = false;
            this.standardStep = 1;
            this.expandedBikeId = 1;
            this.stepErrorMessage = '';
            this.signaturePad.clear();
            this.errorMessage = '';
        }
    }
}).mount('#app');
