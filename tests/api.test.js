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
