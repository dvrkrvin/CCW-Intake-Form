const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const api = require(path.resolve(__dirname, '..', 'api.js'));

class FakeFormData {
  constructor() {
    this.values = [];
  }

  append(...args) {
    this.values.push(args);
  }
}

test('submitServiceIntake posts JSON and the signed PDF', async () => {
  const originalFetch = global.fetch;
  const originalFormData = global.FormData;
  const calls = [];
  global.FormData = FakeFormData;
  global.fetch = async (...args) => {
    calls.push(args);
    return { ok: true, json: async () => ({ success: true, order_ids: ['1'] }) };
  };
  try {
    const payload = { customerInfo: { lastName: 'Rider' }, formType: 'express' };
    const result = await api.submitServiceIntake(payload, { fake: 'pdf' });
    assert.equal(result.success, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'https://ai-service-writer.fly.dev/run-task');
    assert.equal(calls[0][1].method, 'POST');
    const form = calls[0][1].body;
    assert.equal(form.values[0][0], 'data');
    assert.equal(JSON.parse(form.values[0][1]).formType, 'express');
    assert.equal(form.values[1][0], 'pdf');
    assert.match(form.values[1][2], /^service_intake_Rider_\d+\.pdf$/);
  } finally {
    global.fetch = originalFetch;
    global.FormData = originalFormData;
  }
});

test('submitServiceIntake rejects non-success HTTP responses', async () => {
  const originalFetch = global.fetch;
  const originalFormData = global.FormData;
  const originalError = console.error;
  global.FormData = FakeFormData;
  global.fetch = async () => ({ ok: false, status: 503 });
  console.error = () => {};
  try {
    await assert.rejects(
      api.submitServiceIntake({ customerInfo: { lastName: 'Rider' } }, {}),
      /HTTP error! status: 503/
    );
  } finally {
    console.error = originalError;
    global.fetch = originalFetch;
    global.FormData = originalFormData;
  }
});

test('submission errors retain server details but show safe customer explanations', async () => {
  const originalFetch = global.fetch;
  const originalFormData = global.FormData;
  const originalError = console.error;
  global.FormData = FakeFormData;
  console.error = () => {};
  try {
    const cases = [
      { status: 400, body: { message: 'Express Visit services cannot exceed 30 minutes' }, expected: /exceed the 30-minute limit/ },
      { status: 400, body: { message: 'Shopmonkey Create Error: 429 - private upstream details' }, expected: /too many requests/ },
      { status: 400, body: { message: 'Shopmonkey Create Error: 503 - private upstream details' }, expected: /temporarily unavailable/ },
      { status: 400, body: { message: 'Shopmonkey Create Error: 400 - private upstream details' }, expected: /could not accept some/ },
      { status: 400, body: { message: 'Failed', order_ids: ['created-order'] }, expected: /An order was created/ },
      { status: 403, body: {}, expected: /could not access/ },
      { status: 413, body: {}, expected: /document was too large/ },
      { status: 502, body: null, expected: /temporarily unavailable/ },
      { status: 200, body: null, expected: /could not confirm/ },
      { status: 200, body: { success: false, message: 'private upstream details' }, expected: /could not confirm/ }
    ];
    for (const item of cases) {
      global.fetch = async () => ({
        ok: item.status === 200, status: item.status,
        json: async () => { if (!item.body) throw new SyntaxError('HTML response'); return item.body; }
      });
      await assert.rejects(api.submitServiceIntake({ customerInfo: { lastName: 'Rider' } }, {}), error => {
        assert.equal(error.status, item.status);
        assert.equal(error.serverMessage, item.body?.message || '');
        assert.match(error.customerMessage, item.expected);
        assert.match(error.customerMessage, /entries and signature have been kept/);
        assert.doesNotMatch(error.customerMessage, /private upstream|HTML|Shopmonkey|created-order/);
        return true;
      });
    }
    global.fetch = async () => { throw new TypeError('Failed to fetch'); };
    await assert.rejects(api.submitServiceIntake({ customerInfo: { lastName: 'Rider' } }, {}), error => {
      assert.equal(error.networkFailure, true);
      assert.match(error.customerMessage, /could not reach/);
      assert.match(error.customerMessage, /check for an existing order/);
      return true;
    });
  } finally {
    global.fetch = originalFetch;
    global.FormData = originalFormData;
    console.error = originalError;
  }
});

test('healthCheck uses the configured health endpoint', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (...args) => {
    calls.push(args);
    return { ok: true, json: async () => ({ status: 'ok' }) };
  };
  try {
    const result = await api.healthCheck();
    assert.equal(result.status, 'ok');
    assert.equal(calls[0][0], 'https://ai-service-writer.fly.dev/api/health');
    assert.equal(calls[0][1].method, 'GET');
  } finally {
    global.fetch = originalFetch;
  }
});
