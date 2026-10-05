const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vmModule = require('node:vm');

const APP_PATH = path.resolve(__dirname, '..', 'app.js');

function fixedDateClass(iso) {
  const RealDate = Date;
  return class FixedDate extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [iso]));
    }

    static now() {
      return new RealDate(iso).getTime();
    }
  };
}

function createHarness({ now = '2026-01-01T19:00:00Z', apiResponse = { success: true } } = {}) {
  let options;
  const scrollCalls = [];
  const apiCalls = [];
  const sandbox = {
    console,
    Blob,
    Date: fixedDateClass(now),
    Intl,
    setTimeout,
    clearTimeout,
    setInterval: () => 1,
    clearInterval: () => {},
    window: {
      scrollTo(value) { scrollCalls.push(value); },
      addEventListener() {}
    },
    document: {
      addEventListener() {},
      removeEventListener() {},
      querySelector() { return null; },
      querySelectorAll() { return []; }
    },
    SignaturePad: function SignaturePad() {},
    api: {
      async submitServiceIntake(data, pdfBlob) {
        apiCalls.push({ data, pdfBlob });
        return apiResponse;
      }
    },
    Vue: {
      createApp(value) {
        options = value;
        return { mount() {} };
      }
    }
  };

  vmModule.runInNewContext(fs.readFileSync(APP_PATH, 'utf8'), sandbox, { filename: APP_PATH });

  const component = options.data.call({ getTodayDate: options.methods.getTodayDate });
  Object.assign(component, options.methods);
  component.$refs = {};
  for (const [name, getter] of Object.entries(options.computed)) {
    Object.defineProperty(component, name, {
      configurable: true,
      get: () => getter.call(component)
    });
  }

  return { component, options, scrollCalls, apiCalls };
}

function fillCommon(component, { includeAddress = true } = {}) {
  Object.assign(component.formData, {
    firstName: 'Avery',
    lastName: 'Rider',
    phone: '(801) 555-0100',
    email: 'avery@example.com',
    printedName: 'Avery Rider',
    smsConsent: true
  });
  if (includeAddress) {
    Object.assign(component.formData, {
      address1: '123 Main St',
      city: 'Salt Lake City',
      state: 'UT',
      zip: '84101'
    });
  }
  if (component.formData.bikes[0]) {
    component.formData.bikes[0].warrantyPurchaseSource = '';
    component.formData.bikes[0].requiredPartsStatus = 'provided';
  }
}

function enableSuccessfulSubmission(component) {
  component.signaturePad = {
    isEmpty: () => false,
    toDataURL: () => 'data:image/png;base64,test',
    clear() {}
  };
  component.generatePDF = async () => ({
    output: () => new Blob(['pdf'], { type: 'application/pdf' })
  });
}

test('starts on Service Check-in with one complete bike and a ten-bike limit', () => {
  const { component } = createHarness();
  assert.equal(component.formType, 'standard');
  assert.equal(component.formData.bikes.length, 1);
  assert.equal(component.maxBikes, 10);
  assert.equal(component.batteryServiceEnabled, false);
  assert.equal(component.formData.bikes[0].safetyHistory, '');
  assert.equal(component.formData.bikes[0].warrantyPurchaseSource, '');
  assert.equal(component.formData.bikes[0].dropoffType, 'complete_bike');
  assert.equal(component.formData.bikes[0].year, '');
  assert.equal(component.submitFormLabel, 'Submit Service Intake Form');
});

test('does not run the kiosk inactivity reset for a blank untouched form', () => {
  const { component } = createHarness();
  component.signaturePad = {
    clearCalled: false,
    isEmpty: () => true,
    clear() { this.clearCalled = true; }
  };

  assert.equal(component.hasInProgressIntake(), false);
  component.startInactivityTimers();
  assert.equal(component.inactivityWarningTimer, null);
  assert.equal(component.inactivityResetTimer, null);

  component.showInactivityWarning();
  component.resetForInactivity();
  assert.equal(component.inactivityWarningVisible, false);
  assert.equal(component.inactivityResetNotice, '');
  assert.equal(component.signaturePad.clearCalled, false);
});

test('activates inactivity protection after customer data is entered', () => {
  const { component } = createHarness();
  component.formData.firstName = 'Avery';

  assert.equal(component.hasInProgressIntake(), true);
  component.startInactivityTimers();
  assert.notEqual(component.inactivityWarningTimer, null);
  assert.notEqual(component.inactivityResetTimer, null);
  component.clearInactivityTimers();
});

test('warns before inactivity reset and clears customer data for kiosk privacy', () => {
  const { component } = createHarness();
  component.signaturePad = { clearCalled: false, clear() { this.clearCalled = true; } };
  component.startInactivityTimers = () => {};
  component.formType = 'express';
  component.formData.firstName = 'Avery';
  component.formData.phone = '(801) 555-0100';
  component.formData.bikes[0].make = 'E Ride Pro';

  component.showInactivityWarning();
  assert.equal(component.inactivityWarningVisible, true);
  assert.equal(component.inactivitySecondsRemaining, 30);

  component.resetForInactivity();
  assert.equal(component.formType, 'standard');
  assert.equal(component.standardStep, 1);
  assert.equal(component.formData.firstName, '');
  assert.equal(component.formData.phone, '');
  assert.equal(component.formData.bikes[0].make, '');
  assert.match(component.inactivityResetNotice, /cleared after five minutes/i);
  assert.equal(component.signaturePad.clearCalled, true);
});

test('guided Service Check-in flow validates each step before advancing', () => {
  const { component } = createHarness();
  component.goToStandardStep(2);
  assert.equal(component.standardStep, 1);
  assert.match(component.stepErrorMessage, /first name/);

  fillCommon(component);
  component.goToStandardStep(2);
  assert.equal(component.standardStep, 2);

  component.goToStandardStep(3);
  assert.equal(component.standardStep, 2);
  assert.match(component.stepErrorMessage, /bike make/i);

  Object.assign(component.formData.bikes[0], {
    make: 'E Ride Pro',
    model: 'SS 4.0',
    requestedService: 'Brake service',
    safetyHistory: 'none'
  });
  component.goToStandardStep(3);
  assert.equal(component.standardStep, 3);
});

test('bike cards provide concise summaries and controlled expansion', () => {
  const { component } = createHarness();
  const bike = component.formData.bikes[0];
  Object.assign(bike, {
    make: 'E Ride Pro',
    model: 'SS 4.0',
    requestedService: 'Rear tire',
    rushLaborRequested: true
  });
  assert.match(component.bikeSummary(bike), /E Ride Pro SS 4.0/);
  assert.match(component.bikeSummary(bike), /Rush requested/);
  component.toggleBike(bike);
  assert.equal(component.expandedBikeId, null);
  component.toggleBike(bike);
  assert.equal(component.expandedBikeId, bike.id);
});

test('clear Express services resets checkbox and stepper selections', () => {
  const { component } = createHarness();
  component.formData.expressSelectedServiceIds = ['tire_pressure'];
  component.formData.expressServiceQuantities.emoto_off_bike_tire = 2;
  component.clearExpressServices();
  assert.equal(component.formData.expressSelectedServiceIds.length, 0);
  assert.equal(Object.keys(component.formData.expressServiceQuantities).length, 0);
});

test('single service authorization keeps legacy backend acknowledgments in sync', () => {
  const { component } = createHarness();
  component.openStandardTermsReview();
  assert.equal(component.formData.disclosures.fullTermsOpened, true);
  assert.equal(component.showStandardTermsModal, true);
  component.acceptStandardTerms();
  assert.equal(component.formData.disclosures.fullTermsAcknowledged, true);
  assert.equal(component.showStandardTermsModal, false);
  assert.equal(component.formData.disclosures.diagFeeAcknowledged, true);
  assert.equal(component.formData.disclosures.serviceAuthorizationAcknowledged, true);
  assert.equal(component.formData.disclosures.sectionAAck, true);
  assert.equal(component.formData.disclosures.sectionBAck, true);
  assert.equal(component.formData.disclosures.sectionCAck, true);
});

test('switches between available form types and blocks Battery Only', () => {
  const { component } = createHarness();
  component.errorMessage = 'old error';
  component.switchFormType('express');
  assert.equal(component.formType, 'express');
  assert.equal(component.errorMessage, '');
  assert.equal(component.submitFormLabel, 'Submit Express Visit');
  component.switchFormType('battery');
  assert.equal(component.formType, 'express');
  assert.equal(component.errorMessage, component.batteryServiceUnavailableMessage);
});

test('adds unique bikes up to ten and never removes the last bike', () => {
  const { component } = createHarness();
  for (let index = 0; index < 12; index += 1) component.addBike();
  assert.equal(component.formData.bikes.length, 10);
  assert.equal(new Set(component.formData.bikes.map(bike => bike.id)).size, 10);
  while (component.formData.bikes.length > 1) component.removeBike(0);
  component.removeBike(0);
  assert.equal(component.formData.bikes.length, 1);
});

test('provides the approved bike catalog and excludes declined models', () => {
  const { component } = createHarness();

  assert.equal(component.bikeCatalog.ReRode.join('|'), 'R1|R1+');
  assert.ok(component.bikeCatalog['E Ride Pro'].includes('SS 4.0'));
  assert.ok(!component.bikeCatalog['E Ride Pro'].includes('CCW Edition Ultimate SR'));
  assert.ok(component.bikeCatalog.Talaria.includes('XXX'));
  assert.ok(!component.bikeCatalog.Talaria.includes('X3'));
  assert.equal(component.bikeCatalog.Super73.join('|'), 'A Series|R Series|S Series|Z Series');
  assert.equal(component.bikeCatalog.Segway.join('|'), 'X160|X260');
  assert.ok(!Object.values(component.bikeCatalog).flat().includes('eWatt 2.0'));
});

test('catalog selections populate backend make and model values and allow custom entries', () => {
  const { component } = createHarness();
  const bike = component.formData.bikes[0];

  bike.makeSelection = 'Talaria';
  component.onBikeMakeSelectionChange(bike);
  bike.modelSelection = 'XXX';
  component.onBikeModelSelectionChange(bike);
  assert.equal(bike.make, 'Talaria');
  assert.equal(bike.model, 'XXX');

  bike.makeSelection = '__other__';
  component.onBikeMakeSelectionChange(bike);
  assert.equal(bike.make, '');
  assert.equal(bike.modelSelection, '__other__');
});

test('Express Visit uses the shared searchable bike catalog', () => {
  const { component } = createHarness();
  component.switchFormType('express');
  assert.equal(component.expressBike, component.formData.bikes[0]);

  component.selectBikeMake(component.expressBike, 'Segway');
  component.selectBikeModel(component.expressBike, 'X260');
  assert.equal(component.expressBike.make, 'Segway');
  assert.equal(component.expressBike.model, 'X260');
});

test('searches make and model options and supports returning from manual entry', () => {
  const { component } = createHarness();
  const bike = component.formData.bikes[0];

  bike.make = 'ride';
  component.onBikeMakeInput(bike);
  assert.equal(component.filteredBikeMakes(bike).join('|'), 'E Ride Pro');

  component.selectBikeMake(bike, 'Super73');
  bike.model = 'series';
  component.onBikeModelInput(bike);
  assert.equal(component.filteredBikeModels(bike).join('|'), 'A Series|R Series|S Series|Z Series');

  component.useCustomBikeMake(bike);
  bike.make = 'Custom Make';
  bike.model = 'Custom Model';
  assert.equal(bike.makeSelection, '__other__');
  assert.equal(bike.modelSelection, '__other__');

  component.returnToBikeMakeList(bike);
  assert.equal(bike.make, '');
  assert.equal(bike.model, '');
  assert.equal(bike.makeMenuOpen, true);
});

test('contains the approved Express service matrix and exact minute values', () => {
  const { component } = createHarness();
  const services = Object.fromEntries(component.expressServices.map(service => [service.id, service]));
  assert.equal(component.expressServices.length, 20);
  assert.equal(services.emoto_off_bike_tire.minutes, 15);
  assert.equal(services.emoto_off_bike_tube.minutes, 15);
  assert.equal(services.ebike_off_bike_tire.minutes, 15);
  assert.equal(services.ebike_off_bike_tube.minutes, 15);
  assert.equal(services.emoto_off_bike_tire.allowsQuantity, true);
  assert.equal(services.ebike_off_bike_tube.allowsQuantity, true);
  assert.equal(services.brake_lever_left.minutes, 14);
  assert.equal(services.brake_lever_right.minutes, 14);
  assert.equal(services.brake_pads_front.name, 'Front Brake Pad Replacement');
  assert.equal(services.brake_pads_front.minutes, 15);
  assert.equal(services.brake_pads_rear.name, 'Rear Brake Pad Replacement');
  assert.equal(services.brake_pads_rear.minutes, 15);
  assert.equal(services.wheel_truing_on_bike.name, 'On-Bike Spoke Tensioning & Basic Wheel Truing');
  assert.equal(services.wheel_truing_on_bike.minutes, 30);
  assert.equal(services.wheel_truing_off_bike.name, 'Off-Bike Spoke Tensioning & Basic Wheel Truing');
  assert.equal(services.wheel_truing_off_bike.minutes, 15);
  assert.equal(services.wheel_truing_off_bike.allowsQuantity, true);
  assert.equal(services.belt_tension.minutes, 10);
  assert.equal(
    services.chain_service.name,
    'Chain Service (Cleaning, Lubricating, and Checking/Setting Tension)'
  );
  assert.equal(component.expressServices.some(service => 'timeLabel' in service), false);
});

test('computes Express totals, remaining time, and disabled services', () => {
  const { component } = createHarness();
  component.formData.expressServiceQuantities.emoto_off_bike_tire = 1;
  component.formData.expressSelectedServiceIds = ['belt_tension'];
  assert.equal(component.expressSelectedMinutes, 25);
  assert.equal(component.expressRemainingMinutes, 5);
  const pressure = component.expressServices.find(service => service.id === 'tire_pressure');
  const frontTire = component.expressServices.find(service => service.id === 'emoto_front_tire');
  assert.equal(component.isExpressServiceDisabled(pressure), false);
  assert.equal(component.isExpressServiceDisabled(frontTire), true);
});

test('fills the progress bar when no remaining service can fit', () => {
  const { component } = createHarness();
  component.formData.expressSelectedServiceIds = ['brake_lever_left', 'brake_lever_right'];
  assert.equal(component.expressSelectedMinutes, 28);
  assert.equal(component.expressRemainingMinutes, 2);
  assert.equal(component.expressHasNoFittingServices, true);
  assert.equal(component.expressProgressPercent, 100);
});

test('formats Express service comments without time notes or totals', () => {
  const { component } = createHarness();
  component.formData.bikes[0].make = 'E Ride Pro';
  component.formData.bikes[0].model = 'SS 4.0';
  component.formData.expressServiceQuantities.emoto_off_bike_tire = 2;
  const text = component.formatExpressServices();
  assert.match(text, /2 × Off-Bike Tire Replacement/);
  assert.doesNotMatch(text, /\bmin\b/i);
  assert.doesNotMatch(text, /total/i);
});

test('quantity steppers enforce the Express labor cap and support decrementing', () => {
  const { component } = createHarness();
  const tire = component.expressServices.find(service => service.id === 'emoto_off_bike_tire');
  const tube = component.expressServices.find(service => service.id === 'emoto_off_bike_tube');
  component.incrementExpressService(tire);
  component.incrementExpressService(tire);
  component.incrementExpressService(tire);
  assert.equal(component.getExpressServiceQuantity(tire), 2);
  assert.equal(component.expressSelectedMinutes, 30);
  assert.equal(component.canIncrementExpressService(tube), false);
  component.decrementExpressService(tire);
  assert.equal(component.getExpressServiceQuantity(tire), 1);
  assert.equal(component.canIncrementExpressService(tube), true);
  component.decrementExpressService(tire);
  assert.equal(component.getExpressServiceQuantity(tire), 0);
});

test('transfers Express bike and service information to Service Check-in', () => {
  const { component, scrollCalls } = createHarness();
  component.switchFormType('express');
  component.formData.bikes[0].make = 'E Ride Pro';
  component.formData.bikes[0].model = 'SS 4.0';
  component.formData.expressSelectedServiceIds = ['tire_pressure', 'belt_tension'];
  component.switchExpressToStandard();
  assert.equal(component.formType, 'standard');
  assert.match(component.formData.bikes[0].requestedService, /Tire Pressure/);
  assert.match(component.formData.bikes[0].requestedService, /Primary Belt/);
  assert.equal(scrollCalls.length, 1);
});

test('formats per-bike warranty and rush requests independently', () => {
  const { component } = createHarness();
  component.formData.bikes = [
    {
      id: 1,
      make: 'E Ride Pro',
      model: 'SS 4.0',
      requestedService: 'Brake service',
      warrantyRequest: true,
      warrantyPurchaseSource: 'ccw',
      warrantyPurchaseDate: '2025-08',
      safetyHistory: 'none',
      requiredPartsStatus: 'provided',
      limitedInspectionWaiverAccepted: false,
      rushLaborRequested: true,
      requestedReturnDate: '2026-09-15'
    },
    {
      id: 2,
      make: 'Sur-Ron',
      model: 'Light Bee',
      requestedService: 'Tire service',
      warrantyRequest: false,
      warrantyPurchaseSource: '',
      warrantyPurchaseDate: '',
      safetyHistory: 'none',
      requiredPartsStatus: 'not_provided',
      limitedInspectionWaiverAccepted: true,
      rushLaborRequested: false,
      requestedReturnDate: '2026-09-16'
    }
  ];
  const text = component.formatBikeRequests();
  assert.match(text, /Bike 1: E Ride Pro SS 4\.0/);
  assert.match(text, /Warranty Eligibility Review: Requested — Not Yet Verified/);
  assert.match(text, /Purchased from Charged Cycle Works: Yes/);
  assert.match(text, /Approximate Purchase Month: 2025-08/);
  assert.match(text, /Safety History: None of the listed safety events reported/);
  assert.match(text, /Rush Labor Request: Yes — \$238\.50\/hr/);
  assert.match(text, /Requested Return Date: 2026-09-15/);
  assert.doesNotMatch(text, /Requested Return Date: 2026-09-16/);
});

test('clears the optional warranty date but preserves the purchase answer when review is deselected', () => {
  const { component } = createHarness();
  const currentBike = component.formData.bikes[0];
  Object.assign(currentBike, {
    warrantyRequest: false,
    warrantyPurchaseSource: 'ccw',
    warrantyPurchaseDate: '2025-08'
  });
  component.onBikeWarrantyChange(currentBike);
  assert.equal(currentBike.warrantyPurchaseSource, 'ccw');
  assert.equal(currentBike.warrantyPurchaseDate, '');

  Object.assign(component.formData.disclosures, {
    warrantyRequest: false,
    warrantyPurchaseSource: 'unsure',
    warrantyPurchaseDate: '2024-02'
  });
  component.onBatteryWarrantyChange();
  assert.equal(component.formData.disclosures.warrantyPurchaseSource, '');
  assert.equal(component.formData.disclosures.warrantyPurchaseDate, '');
});

test('hides and clears warranty unless the bike was confirmed purchased from CCW', () => {
  const { component } = createHarness();
  const bike = component.formData.bikes[0];
  Object.assign(bike, {
    warrantyPurchaseSource: 'ccw',
    warrantyRequest: true,
    warrantyPurchaseDate: '2025-08'
  });

  bike.warrantyPurchaseSource = 'other';
  component.onBikeWarrantySourceChange(bike);
  assert.equal(bike.warrantyRequest, false);
  assert.equal(bike.warrantyPurchaseDate, '');

  Object.assign(bike, {
    warrantyPurchaseSource: 'unsure',
    warrantyRequest: true,
    warrantyPurchaseDate: '2025-08'
  });
  component.onBikeWarrantySourceChange(bike);
  assert.equal(bike.warrantyRequest, false);
  assert.equal(bike.warrantyPurchaseDate, '');
});

test('makes None exclusive and clears stale multiple-safety state', () => {
  const { component } = createHarness();
  const currentBike = component.formData.bikes[0];
  Object.assign(currentBike, {
    safetyHistory: 'reported',
    safetySubmerged: true,
    safetyThermal: true,
    safetyImpact: false,
    safetyMultipleConfirmed: false
  });
  assert.equal(component.bikeSafetySelectionCount(currentBike), 2);
  currentBike.safetyHistory = 'none';
  component.onBikeSafetyHistoryChange(currentBike);
  assert.equal(component.bikeSafetySelectionCount(currentBike), 0);
  assert.equal(currentBike.safetyMultipleConfirmed, false);
});

test('requires a functional-parts answer and waiver when required items will not be provided', () => {
  const { component } = createHarness();
  fillCommon(component);
  const bike = component.formData.bikes[0];
  Object.assign(bike, {
    make: 'E Ride Pro',
    model: 'SS 4.0',
    requestedService: 'Brake service',
    safetyHistory: 'none',
    requiredPartsStatus: ''
  });

  assert.equal(component.validateStandardStep(2), false);
  assert.match(component.stepErrorMessage, /functional parts/);

  bike.requiredPartsStatus = 'not_provided';
  assert.equal(component.validateStandardStep(2), false);
  assert.match(component.stepErrorMessage, /limited inspection acknowledgment/);

  bike.limitedInspectionWaiverAccepted = true;
  assert.equal(component.validateStandardStep(2), true);
  assert.match(component.formatBikeRequests(), /Required Functional Parts: Customer cannot provide all required parts/);
  assert.match(component.formatBikeRequests(), /Limited Inspection Waiver: Accepted/);

  bike.requiredPartsStatus = 'provided';
  component.onRequiredPartsStatusChange(bike);
  assert.equal(bike.limitedInspectionWaiverAccepted, false);
});

test('guards warranty requests behind confirmed CCW purchase and does not require a redundant multiple-safety confirmation', () => {
  const { component } = createHarness();
  fillCommon(component);
  const bike = component.formData.bikes[0];
  Object.assign(bike, {
    make: 'E Ride Pro',
    model: 'SS 4.0',
    requestedService: 'Brake service',
    safetyHistory: 'reported',
    safetySubmerged: true,
    safetyThermal: true,
    safetyMultipleConfirmed: false,
    warrantyPurchaseSource: 'ccw',
    warrantyRequest: true
  });
  assert.equal(bike.warrantyRequest, true);
  assert.equal(bike.warrantyPurchaseSource, 'ccw');
  assert.equal(component.validateStandardStep(2), true);

  bike.warrantyPurchaseSource = 'other';
  component.onBikeWarrantySourceChange(bike);
  assert.equal(bike.warrantyRequest, false);
  assert.equal(bike.warrantyPurchaseSource, 'other');
});

test('sanitizes and formats customer input fields', () => {
  const { component } = createHarness();
  component.formData.firstName = 'Av3ry!';
  component.onNameInput('firstName');
  assert.equal(component.formData.firstName, 'Avry');
  component.formData.phone = '8015550100extra';
  component.onPhoneInput();
  assert.equal(component.formData.phone, '(801) 555-0100');
  component.formData.zip = '841019999x';
  component.onZipInput();
  assert.equal(component.formData.zip, '84101');
});

test('filters state suggestions by abbreviation or state name', () => {
  const { component } = createHarness();
  component.stateQuery = 'ut';
  assert.equal(component.filteredStates.map(state => state.abbr).join(','), 'UT');
  component.stateQuery = 'new';
  assert.match(component.filteredStates.map(state => state.name).join(','), /New/);
  component.selectState({ abbr: 'UT', name: 'Utah' });
  assert.equal(component.formData.state, 'UT');
  assert.equal(component.stateQuery, 'UT');
  assert.equal(component.showStateSuggestions, false);
});

test('bike catalog search ignores spacing punctuation and capitalization', () => {
  const { component } = createHarness();
  const bike = component.formData.bikes[0];

  bike.make = 'eride';
  component.onBikeMakeInput(bike);
  assert.equal(component.filteredBikeMakes(bike).join('|'), 'E Ride Pro');

  component.selectBikeMake(bike, 'E Ride Pro');
  bike.model = 'ss40';
  component.onBikeModelInput(bike);
  assert.equal(component.filteredBikeModels(bike).join('|'), 'SS 4.0');
});

test('provides the approved customer-facing service catalog without internal or product-specific work', () => {
  const { component } = createHarness();
  const names = component.serviceCatalog.map(service => service.name);

  assert.ok(names.includes('Electrical Diagnostic'));
  assert.ok(names.includes('Mechanical Diagnostic'));
  assert.ok(names.includes('Battery Repair (Warranty Only)'));
  assert.ok(names.includes('Install / Replace Motor'));
  assert.ok(names.includes('Install / Replace and Tune Controller (Mid-Size Bike)'));
  assert.ok(names.includes('Match Fork Tube Height'));
  assert.ok(names.includes('Replace Rear Tire'));
  assert.ok(names.includes('Replace Rear Street Tire'));
  assert.ok(!names.some(name => /inspection/i.test(name)));
  assert.ok(!names.some(name => /repackage/i.test(name)));
  assert.ok(!names.includes('Remove Motor'));
  assert.ok(!names.includes('Remove Graphics'));
  assert.ok(!names.includes('Remove Kickstand Sensor'));
  assert.ok(!names.some(name => /Stark Varg Battery|VTB Battery|Ultra Bee Fork|E Ride Pro Display|Baja S2 Pro|Warp 9 Headlight Switch/i.test(name)));
});

test('shows warranty-only battery repair only during an eligible warranty request', () => {
  const { component } = createHarness();
  const bike = component.formData.bikes[0];

  bike.serviceSearch = 'battery repair';
  assert.equal(component.filteredBikeServices(bike).length, 0);

  bike.warrantyPurchaseSource = 'ccw';
  bike.warrantyRequest = true;
  assert.equal(component.filteredBikeServices(bike)[0].name, 'Battery Repair (Warranty Only)');

  component.toggleBikeService(bike, 'battery_repair_warranty');
  bike.warrantyRequest = false;
  component.onBikeWarrantyChange(bike);
  assert.ok(!bike.selectedServiceKeys.includes('battery_repair_warranty'));
  assert.equal(bike.requestedService, '');
});

test('blocks electrical diagnostics unless the bike is an approved make and model', () => {
  const { component } = createHarness();
  const bike = component.formData.bikes[0];
  const electrical = component.serviceCatalog.find(service => service.key === 'diagnostic_electrical');

  assert.equal(component.isBikeServiceSelectable(bike, electrical), false);
  component.toggleBikeService(bike, 'diagnostic_electrical');
  assert.equal(bike.selectedServiceKeys.length, 0);

  for (const make of ['Stark', 'E Ride Pro', 'Talaria', 'Zero', 'Ventus']) {
    for (const model of component.bikeCatalog[make]) {
      bike.make = make;
      bike.makeSelection = make;
      bike.model = model;
      bike.modelSelection = model;
      assert.equal(component.isElectricalDiagnosticApproved(bike), true, `${make} ${model} should be approved`);
    }

    bike.model = 'Unlisted Model';
    bike.modelSelection = 'Unlisted Model';
    assert.equal(component.isElectricalDiagnosticApproved(bike), false, `Unlisted ${make} models should be blocked`);
  }

  for (const model of ['X160', 'X260']) {
    bike.make = 'Segway';
    bike.makeSelection = 'Segway';
    bike.model = model;
    bike.modelSelection = model;
    assert.equal(component.isElectricalDiagnosticApproved(bike), true, `Segway ${model} should be approved`);
  }

  bike.model = 'X300';
  bike.modelSelection = 'X300';
  assert.equal(component.isElectricalDiagnosticApproved(bike), false, 'Other Segway models should be blocked');

  for (const model of ['805', '902']) {
    bike.make = 'Bonnell';
    bike.makeSelection = 'Bonnell';
    bike.model = model;
    bike.modelSelection = model;
    assert.equal(component.isElectricalDiagnosticApproved(bike), true, `Bonnell ${model} should be approved`);
  }

  for (const model of ['775 AM', '775 AM Touring', '775 MX']) {
    bike.model = model;
    bike.modelSelection = model;
    assert.equal(component.isElectricalDiagnosticApproved(bike), false, `Bonnell ${model} should be blocked`);
  }

  bike.make = 'Altis';
  bike.makeSelection = 'Altis';
  bike.model = 'Sigma';
  bike.modelSelection = 'Sigma';
  assert.equal(component.isElectricalDiagnosticApproved(bike), true, 'Altis Sigma should be approved');

  bike.model = 'Other';
  bike.modelSelection = 'Other';
  assert.equal(component.isElectricalDiagnosticApproved(bike), false, 'Other Altis models should be blocked');

  bike.make = 'Arctic Leopard';
  bike.makeSelection = 'Arctic Leopard';
  for (const model of ['XE Pro R', 'XE Pro S', 'XF Pro']) {
    bike.model = model;
    bike.modelSelection = model;
    assert.equal(component.isElectricalDiagnosticApproved(bike), true, `Arctic Leopard ${model} should be approved`);
  }

  for (const model of ['XE Pro', 'EX 700', 'EX 800', 'EXE 800', 'EXE 880']) {
    bike.model = model;
    bike.modelSelection = model;
    assert.equal(component.isElectricalDiagnosticApproved(bike), false, `Arctic Leopard ${model} should be blocked`);
  }
  assert.ok(!component.bikeCatalog['Arctic Leopard'].includes('XE Pro'));

  bike.make = 'Surron';
  bike.makeSelection = 'Surron';
  for (const model of ['Light Bee', 'Light Bee 2', 'Light Bee S', 'Light Bee X', 'Ultra Bee']) {
    bike.model = model;
    bike.modelSelection = model;
    assert.equal(component.isElectricalDiagnosticApproved(bike), true, `Surron ${model} should be approved`);
  }

  for (const model of ['Hyper Bee', 'Storm Bee']) {
    bike.model = model;
    bike.modelSelection = model;
    assert.equal(component.isElectricalDiagnosticApproved(bike), false, `Surron ${model} should be blocked`);
  }

  bike.model = 'Light Bee Future';
  bike.modelSelection = 'Light Bee Future';
  assert.equal(component.isElectricalDiagnosticApproved(bike), false, 'Unlisted Light Bee models should be blocked');

  bike.make = 'E Ride Pro';
  bike.makeSelection = 'E Ride Pro';
  bike.model = 'SS 4.0';
  bike.modelSelection = 'SS 4.0';
  component.toggleBikeService(bike, 'diagnostic_electrical');
  assert.ok(bike.selectedServiceKeys.includes('diagnostic_electrical'));

  bike.make = 'Super73';
  bike.makeSelection = 'Super73';
  component.reconcileBikeServiceEligibility(bike);
  assert.ok(!bike.selectedServiceKeys.includes('diagnostic_electrical'));
  assert.equal(bike.requestedService, '');
});

test('shows the limited-support disclaimer only for selected electrical diagnostics on affected bikes', () => {
  const { component } = createHarness();
  const bike = component.formData.bikes[0];

  for (const [make, model] of [
    ['Altis', 'Sigma'],
    ['Ventus', 'V1+ Evo'],
    ['Arctic Leopard', 'XE Pro S']
  ]) {
    Object.assign(bike, {
      make,
      makeSelection: make,
      model,
      modelSelection: model,
      selectedServiceKeys: []
    });
    assert.equal(component.showLimitedElectricalDiagnosticNotice(bike), false);
    component.toggleBikeService(bike, 'diagnostic_electrical');
    assert.equal(component.showLimitedElectricalDiagnosticNotice(bike), true, `${make} ${model} should show the disclaimer`);
  }

  Object.assign(bike, {
    make: 'E Ride Pro',
    makeSelection: 'E Ride Pro',
    model: 'SS 4.0',
    modelSelection: 'SS 4.0',
    selectedServiceKeys: ['diagnostic_electrical']
  });
  assert.equal(component.showLimitedElectricalDiagnosticNotice(bike), false);
});

test('searches and selects multiple requested services while preserving backend text', () => {
  const { component } = createHarness();
  const bike = component.formData.bikes[0];

  bike.make = 'E Ride Pro';
  bike.makeSelection = 'E Ride Pro';
  bike.model = 'SS 4.0';
  bike.modelSelection = 'SS 4.0';

  bike.serviceSearch = 'diagnostic';
  assert.equal(
    component.filteredBikeServices(bike).map(service => service.name).join('|'),
    'Electrical Diagnostic|Mechanical Diagnostic'
  );

  component.toggleBikeService(bike, 'diagnostic_electrical');
  component.toggleBikeService(bike, 'brake_pads_front');
  bike.serviceNotes = 'Error appears under load.';
  component.syncBikeRequestedService(bike);

  assert.match(bike.requestedService, /Electrical Diagnostic/);
  assert.match(bike.requestedService, /Replace Front Brake Pads/);
  assert.match(bike.requestedService, /Additional Details: Error appears under load/);

  component.removeBikeService(bike, 'diagnostic_electrical');
  assert.doesNotMatch(bike.requestedService, /Electrical Diagnostic/);
});

test('shows the Express cutoff at 5 PM Mountain Time', () => {
  const before = createHarness({ now: '2026-01-01T23:59:00Z' }).component;
  const after = createHarness({ now: '2026-01-02T00:00:00Z' }).component;
  assert.equal(before.isAfterExpressCutoff, false);
  assert.equal(after.isAfterExpressCutoff, true);
});

test('reports missing standard customer, address, and bike fields', async () => {
  const { component } = createHarness();
  await component.submitForm();
  assert.match(component.errorMessage, /first name/i);
  assert.match(component.errorMessage, /street address/i);
  assert.match(component.errorMessage, /bike make/i);
  assert.equal(component.standardStep, 1);
});

test('requires Express terms but does not require an address', async () => {
  const { component } = createHarness();
  component.switchFormType('express');
  fillCommon(component, { includeAddress: false });
  component.formData.bikes[0].make = 'E Ride Pro';
  component.formData.bikes[0].model = 'SS 4.0';
  component.formData.expressSelectedServiceIds = ['tire_pressure'];
  await component.submitForm();
  assert.match(component.errorMessage, /Accept the Express Visit terms/i);
});

test('requires the single consolidated service authorization', async () => {
  const { component } = createHarness();
  fillCommon(component);
  Object.assign(component.formData.bikes[0], {
    make: 'E Ride Pro',
    model: 'SS 4.0',
    requestedService: 'Brake service',
    safetyHistory: 'none'
  });
  await component.submitForm();
  assert.match(component.errorMessage, /Open and accept the full Terms and Conditions/i);
});

test('battery-only mode requires an issue description and builds a fixed warranty request', () => {
  const { component } = createHarness();
  fillCommon(component);
  const bike = component.formData.bikes[0];
  Object.assign(bike, {
    make: 'E Ride Pro',
    model: 'SS 4.0',
    dropoffType: 'battery_only',
    safetyHistory: 'none'
  });
  component.onBikeDropoffTypeChange(bike);

  assert.equal(component.validateStandardStep(2), false);
  assert.match(component.stepErrorMessage, /battery issue/i);

  Object.assign(bike, {
    batteryIssueDescription: 'Stops charging at 70 percent'
  });
  component.syncBikeRequestedService(bike);
  assert.equal(component.validateStandardStep(2), true);
  assert.match(bike.requestedService, /Battery Warranty Evaluation/);
  assert.match(bike.requestedService, /Stops charging at 70 percent/);
});

test('submits battery-only drop-off metadata and suppresses rush labor', async () => {
  const { component, apiCalls } = createHarness();
  fillCommon(component);
  const bike = component.formData.bikes[0];
  Object.assign(bike, {
    make: 'E Ride Pro',
    model: 'SS 4.0',
    dropoffType: 'battery_only',
    batteryIssueDescription: 'Will not power on',
    batteryOrderNumber: 'CCW-1234',
    warrantyPurchaseDate: '2026-02',
    safetyHistory: 'none',
    rushLaborRequested: true,
    requestedReturnDate: '2026-09-20'
  });
  component.syncBikeRequestedService(bike);
  Object.assign(component.formData.disclosures, {
    diagFeeAcknowledged: true,
    serviceAuthorizationAcknowledged: true,
    fullTermsOpened: true,
    fullTermsAcknowledged: true
  });
  enableSuccessfulSubmission(component);

  await component.submitForm();

  assert.equal(apiCalls.length, 1);
  const submitted = apiCalls[0].data.bikes[0];
  assert.equal(submitted.dropoffType, 'battery_only');
  assert.equal(Object.hasOwn(submitted, 'batteryReceptionVerified'), false);
  assert.equal(Object.hasOwn(submitted, 'batteryReceptionInitials'), false);
  assert.equal(submitted.batteryOrderNumber, 'CCW-1234');
  assert.equal(submitted.warrantyRequest, true);
  assert.equal(submitted.warrantyPurchaseSource, 'ccw');
  assert.equal(submitted.rushLaborRequested, false);
  assert.equal(submitted.requestedReturnDate, '');
});

test('requires opening and acknowledging the full standard terms', async () => {
  const { component, apiCalls } = createHarness();
  fillCommon(component);
  Object.assign(component.formData.bikes[0], {
    make: 'E Ride Pro',
    model: 'SS 4.0',
    requestedService: 'Inspect brakes',
    safetyHistory: 'none'
  });
  enableSuccessfulSubmission(component);

  await component.submitForm();
  assert.match(component.errorMessage, /Open and accept the full Terms and Conditions/i);
  assert.equal(apiCalls.length, 0);

  component.formData.disclosures.fullTermsOpened = true;
  component.formData.disclosures.fullTermsAcknowledged = true;
  await component.submitForm();
  assert.equal(apiCalls.length, 1);
  assert.equal(apiCalls[0].data.disclosures.diagFeeAcknowledged, true);
  assert.equal(apiCalls[0].data.disclosures.serviceAuthorizationAcknowledged, true);
  assert.equal(apiCalls[0].data.disclosures.termsVersion, '2026-09-02');
  assert.equal(apiCalls[0].data.disclosures.fullTermsAcknowledged, true);
});

test('blocks a direct Battery Only submission before legacy validation', async () => {
  const { component, apiCalls } = createHarness();
  component.formType = 'battery';
  fillCommon(component);
  component.formData.requestedService = 'Battery loses charge';
  component.formData.disclosures.safetyHistory = 'none';
  await component.submitForm();
  assert.equal(component.errorMessage, component.batteryServiceUnavailableMessage);
  assert.equal(apiCalls.length, 0);
});

test('submits one Express bike with structured services and no address', async () => {
  const { component, apiCalls } = createHarness();
  component.switchFormType('express');
  fillCommon(component, { includeAddress: false });
  Object.assign(component.formData.bikes[0], { make: 'E Ride Pro', model: 'SS 4.0', year: '2025' });
  component.formData.expressServiceQuantities.emoto_off_bike_tube = 2;
  component.formData.disclosures.expressTermsAcknowledged = true;
  enableSuccessfulSubmission(component);
  await component.submitForm();
  assert.equal(apiCalls.length, 1);
  const payload = apiCalls[0].data;
  assert.equal(payload.formType, 'express');
  assert.equal(payload.bikes.length, 1);
  assert.equal(payload.bikes[0].year, '2025');
  assert.equal(payload.expressServices.length, 1);
  assert.equal(payload.expressServices[0].id, 'emoto_off_bike_tube');
  assert.equal(payload.expressServices[0].quantity, 2);
  assert.equal(payload.customerInfo.address1, '');
  assert.equal(payload.bikes[0].warrantyRequest, false);
  assert.equal(component.showSuccessModal, true);
});

test('does not submit a complete dormant Battery Only form', async () => {
  const { component, apiCalls } = createHarness();
  component.formType = 'battery';
  fillCommon(component);
  component.formData.requestedService = 'Battery loses charge';
  Object.assign(component.formData.disclosures, {
    warrantyRequest: true,
    warrantyPurchaseSource: 'unsure',
    warrantyPurchaseDate: '2024-03',
    safetyHistory: 'reported',
    submerged: false,
    thermal: true,
    impact: false,
    safetyMultipleConfirmed: false,
    batteryFeeAcknowledged: true,
    batteryPickupTerms: true
  });
  enableSuccessfulSubmission(component);
  await component.submitForm();
  assert.equal(component.errorMessage, component.batteryServiceUnavailableMessage);
  assert.equal(apiCalls.length, 0);
});

test('submits multiple standard bikes with per-bike rush metadata', async () => {
  const { component, apiCalls } = createHarness();
  fillCommon(component);
  component.formData.bikes = [
    {
      id: 1,
      make: 'E Ride Pro',
      model: 'SS 4.0',
      year: '2024',
      requestedService: 'Brake service',
      warrantyRequest: true,
      warrantyPurchaseSource: 'ccw',
      warrantyPurchaseDate: '2025-08',
      safetyHistory: 'none',
      safetySubmerged: false,
      safetyThermal: false,
      safetyImpact: false,
      requiredPartsStatus: 'provided',
      limitedInspectionWaiverAccepted: false,
      rushLaborRequested: true,
      requestedReturnDate: '2026-09-15'
    },
    {
      id: 2,
      make: 'Sur-Ron',
      model: 'Light Bee',
      requestedService: 'Tire service',
      warrantyRequest: false,
      warrantyPurchaseSource: 'other',
      warrantyPurchaseDate: '',
      safetyHistory: 'none',
      safetySubmerged: false,
      safetyThermal: false,
      safetyImpact: false,
      requiredPartsStatus: 'not_provided',
      limitedInspectionWaiverAccepted: true,
      rushLaborRequested: false,
      requestedReturnDate: '2026-09-16'
    }
  ];
  Object.assign(component.formData.disclosures, {
    diagFeeAcknowledged: true,
    serviceAuthorizationAcknowledged: true,
    sectionAAck: true,
    sectionBAck: true,
    sectionCAck: true,
    fullTermsOpened: true,
    fullTermsAcknowledged: true
  });
  enableSuccessfulSubmission(component);
  await component.submitForm();
  const payload = apiCalls[0].data;
  assert.equal(payload.bikes.length, 2);
  assert.equal(payload.bikes[0].year, '2024');
  assert.equal(payload.bikes[1].year, '');
  assert.equal(payload.bikes[0].requestedReturnDate, '2026-09-15');
  assert.equal(payload.bikes[0].warrantyPurchaseSource, 'ccw');
  assert.equal(payload.bikes[0].safetyHistory, 'none');
  assert.equal(payload.bikes[0].requiredPartsStatus, 'provided');
  assert.equal(payload.bikes[0].limitedInspectionWaiverAccepted, false);
  assert.equal(payload.bikes[1].requestedReturnDate, '');
  assert.equal(payload.bikes[1].requiredPartsStatus, 'not_provided');
  assert.equal(payload.bikes[1].limitedInspectionWaiverAccepted, true);
  assert.equal(payload.expressServices.length, 0);
});

test('reset restores a clean one-bike form', () => {
  const { component } = createHarness();
  component.formData.firstName = 'Avery';
  component.addBike();
  component.errorMessage = 'error';
  component.signaturePad = { clearCalled: false, clear() { this.clearCalled = true; } };
  const pad = component.signaturePad;
  component.resetForm();
  assert.equal(component.formData.firstName, '');
  assert.equal(component.formData.bikes.length, 1);
  assert.equal(component.formData.bikes[0].year, '');
  assert.equal(Object.keys(component.formData.expressServiceQuantities).length, 0);
  assert.equal(component.nextBikeId, 2);
  assert.equal(component.errorMessage, '');
  assert.equal(pad.clearCalled, true);
});
