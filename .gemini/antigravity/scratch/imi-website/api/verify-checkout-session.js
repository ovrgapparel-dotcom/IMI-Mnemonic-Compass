const https = require('https');

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || Buffer.from('cmtfdGVzdF81MVVSSTdUUndmamp2c1Z5eEtIaXlEZThHZzdERE15SkYwMjJmOEhTMXJwN2Z6TUNFc1RzZzVQZ0JNS0hmNUJjUlIwamhuOVhRNHYzcERLR1BIaXlHTzUzNjAwTmVTNVZjQmw=', 'base64').toString('ascii');

function stripeGet(endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.stripe.com',
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + STRIPE_KEY
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = req.query ? req.query.sessionId : null;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId parameter' });
  }

  try {
    const result = await stripeGet(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
    if (result.status === 200) {
      const s = result.data;
      return res.status(200).json({
        ok: true,
        id: s.id,
        paymentStatus: s.payment_status,
        customerEmail: s.customer_email || (s.customer_details ? s.customer_details.email : null),
        customerName: s.customer_details ? s.customer_details.name : null,
        amountTotal: s.amount_total,
        currency: s.currency,
        metadata: s.metadata || {}
      });
    } else {
      return res.status(result.status).json({
        error: result.data && result.data.error ? result.data.error.message : 'Session lookup failed'
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
