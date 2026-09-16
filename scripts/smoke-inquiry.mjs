const baseUrl = process.env.SITE_SMOKE_URL || 'http://127.0.0.1:4321';

async function post(payload) {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { status: response.status, body: await response.json() };
}

const noContact = await post({ name: 'Smoke test', product: 'PE foam tape' });
if (noContact.status !== 422) throw new Error(`no-contact expected 422, got ${noContact.status}`);

const honeypot = await post({ name: 'Smoke test', email: 'qa@example.com', website: 'filled' });
if (honeypot.status !== 422) throw new Error(`honeypot expected 422, got ${honeypot.status}`);

const phoneOnly = await post({
  name: 'Smoke test',
  company: 'Local QA',
  whatsapp: '+8613800000000',
  product: 'PE foam tape',
  message: 'Local validation only',
});
if (phoneOnly.status !== 200 || !phoneOnly.body.ok) {
  throw new Error(`phone-only expected accepted response, got ${phoneOnly.status}`);
}

console.log(`inquiry smoke: PASS (${baseUrl})`);
