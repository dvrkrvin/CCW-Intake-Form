const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '..', 'styles.css'), 'utf8');

test('shows the two available tabs and conditionally hides Battery Only', () => {
  assert.match(html, />\s*Express Visit\s*</);
  assert.match(html, />\s*Service Check-in\s*</);
  assert.match(html, />\s*Battery Only Service\s*</);
  assert.match(html, /v-if="batteryServiceEnabled"/);
  assert.match(html, /'battery-service-disabled': !batteryServiceEnabled/);
  assert.match(css, /\.toggle-slider\.battery-service-disabled \.toggle-indicator\s*\{[\s\S]*?\/ 2\)/);
  assert.match(html, /:class="\['toggle-btn', \{ active: formType === 'standard' \}\]"/);
});

test('contains one complete six-part Express terms acknowledgment', () => {
  for (let section = 1; section <= 6; section += 1) {
    assert.match(html, new RegExp(`<h5>${section}\\.`));
  }
  assert.match(html, /v-model="formData\.disclosures\.expressTermsAcknowledged"/);
  assert.match(html, /all six Express Visit terms and conditions/);
});

test('requires deliberate in-page review of full standard terms and exposes key provisions', () => {
  assert.match(html, /KEY SERVICE TERMS AT A GLANCE/);
  assert.match(html, /class="terms-accordion"/);
  assert.match(html, /View Full Terms and Conditions \(13 Articles\)/);
  assert.match(html, /fullTermsOpened = formData\.disclosures\.fullTermsOpened \|\| \$event\.target\.open/);
  assert.match(html, /class="terms-text accordion-body"/);
  assert.match(html, /full-terms-acknowledgment/);
  assert.match(html, /:disabled="!formData\.disclosures\.fullTermsOpened"/);
  assert.match(html, /service minimum and labor rate, authorized testing, operational access/);
  assert.doesNotMatch(html, /id="standard-service-authorization"/);
  assert.match(css, /\.terms-accordion\s*\{/);
  assert.match(css, /\.accordion-body\s*\{/);
});

test('keeps the original drop-off choices and progressively reveals optional address details', () => {
  assert.match(html, /class="dropoff-type-selector"/);
  assert.match(html, /class="dropoff-type-options"/);
  assert.match(html, /What are you dropping off\?/);
  assert.doesNotMatch(html, /class="dropoff-mode-bar"/);
  assert.match(html, /id="customer-address-2"/);
  assert.match(html, /v-if="showAddressLine2 \|\| formData\.address2"/);
  assert.match(html, /Add apartment, suite, or unit/);
  assert.match(css, /\.add-address-line-button\s*\{/);
});

test('keeps all form modes at the same width and uses gap-free Express columns', () => {
  assert.match(css, /\.container\s*\{[\s\S]*?max-width:\s*900px/);
  assert.doesNotMatch(css, /max-width:\s*1120px/);
  assert.match(css, /\.express-service-menu\s*\{[\s\S]*?column-count:\s*2/);
  assert.match(css, /\.express-service-category\s*\{[\s\S]*?break-inside:\s*avoid/);
});

test('defines distinct accessible accents for Express and Battery modes', () => {
  assert.match(css, /\.container\.express-layout\s*\{[\s\S]*?--accent:\s*#087cff/);
  assert.match(css, /\.container\.battery-layout\s*\{[\s\S]*?--accent:\s*#39e75f/);
  assert.match(css, /\.container\.battery-layout\s*\{[\s\S]*?--accent-ink:\s*#082b12/);
});

test('uses conditional warranty eligibility questions instead of claiming coverage', () => {
  assert.match(html, /Request a warranty eligibility review for this bike/);
  assert.match(html, /This does not confirm coverage/);
  assert.match(html, /Was this bike purchased from Charged Cycle Works/);
  assert.match(html, /Reception must verify eligibility/);
  assert.match(html, /v-model="bike\.warrantyPurchaseSource"/);
  assert.match(html, /v-if="bike\.warrantyPurchaseSource === 'ccw'"/);
  assert.match(html, /@change="onBikeWarrantySourceChange\(bike\)"/);
});

test('uses searchable accessible make and model comboboxes with clean manual-entry fallbacks', () => {
  assert.match(html, /Start typing to search/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-autocomplete="list"/);
  assert.match(html, /role="listbox"/);
  assert.match(html, /@input="onBikeMakeInput\(bike\)"/);
  assert.match(html, /@input="onBikeModelInput\(bike\)"/);
  assert.match(html, /My bike’s make isn’t listed/);
  assert.match(html, /My bike’s model isn’t listed/);
  assert.match(html, />Browse list</);
  assert.match(css, /\.bike-combobox-menu\s*\{/);
  assert.match(css, /\.bike-combobox-option\s*\{[\s\S]*?min-height:\s*48px/);
  assert.match(css, /input\[type="text"\],[\s\S]*?min-height:\s*52px/);
  assert.match(css, /font-size:\s*16px/);
  assert.match(css, /@media \(min-width: 641px\) and \(max-width: 768px\)/);
});

test('uses the same searchable combobox pattern for the required State field', () => {
  assert.match(html, /v-model="stateQuery"/);
  assert.match(html, /aria-controls="state-listbox"/);
  assert.match(html, /@keydown\.down\.prevent="moveStateActive\(1\)"/);
  assert.match(html, /role="option"/);
  assert.doesNotMatch(html, /state isn’t listed/i);
  assert.match(css, /\.state-dropdown\s*\{[\s\S]*?max-height:\s*326px/);
  assert.match(css, /\.state-option\s*\{[\s\S]*?min-height:\s*48px/);
});

test('uses a searchable multi-select Requested Services picker with optional notes', () => {
  assert.match(html, /v-model="bike\.serviceSearch"/);
  assert.match(html, /aria-multiselectable="true"/);
  assert.match(html, /filteredBikeServices\(bike\)/);
  assert.match(html, /selectedBikeServices\(bike\)/);
  assert.match(html, /v-model="bike\.serviceNotes"/);
  assert.match(html, /Additional Details/);
  assert.match(css, /\.service-picker-menu\s*\{/);
  assert.match(css, /\.service-picker-option\s*\{[\s\S]*?min-height:\s*54px/);
});

test('uses an explicit safety-history decision before revealing hazard choices', () => {
  assert.match(html, /value="none"[^>]*>[\s\S]*?No\s*<\/label>/);
  assert.match(html, /value="reported"[^>]*>[\s\S]*?Yes\s*<\/label>/);
  assert.doesNotMatch(html, /none of these have occurred|show the applicable conditions/i);
  assert.match(html, /These are not acknowledgment boxes/);
  assert.match(html, /v-if="bike\.safetyHistory === 'reported'"/);
  assert.match(html, /v-model="bike\.safetySubmerged"/);
  assert.doesNotMatch(html, /v-if="bikeSafetySelectionCount\(bike\) >= 2"/);
});

test('uses touch-friendly quantity controls only for off-bike replacements', () => {
  assert.match(html, /v-if="service\.allowsQuantity"/);
  assert.match(html, /@click="decrementExpressService\(service\)"/);
  assert.match(html, /@click="incrementExpressService\(service\)"/);
  assert.match(html, /~\{\{ service\.minutes \}\} min each/);
  assert.match(css, /\.express-quantity-stepper\s*\{/);
  assert.match(css, /\.express-quantity-button\s*\{[\s\S]*?min-height:\s*44px/);
});
