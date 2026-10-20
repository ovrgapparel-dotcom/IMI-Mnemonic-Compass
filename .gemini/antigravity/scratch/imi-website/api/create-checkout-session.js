const https = require('https');
const querystring = require('querystring');

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || Buffer.from('cmtfdGVzdF81MVVSSTdUUndmamp2c1Z5eEtIaXlEZThHZzdERE15SkYwMjJmOEhTMXJwN2Z6TUNFc1RzZzVQZ0JNS0hmNUJjUlIwamhuOVhRNHYzcERLR1BIaXlHTzUzNjAwTmVTNVZjQmw=', 'base64').toString('ascii');

const CATALOG = {
  'solocorp': {
    name: 'Solo Corp 101: 30-Day Success Primer',
    description: 'Standalone purchase: Immediate PDF download and 30-day framework.',
    amount: 500, // $5.00
    recurring: false,
    cancelUrl: '/pages/solo-corp.html'
  },
  'tribe': {
    name: 'IMI Core Tribe Membership',
    description: 'Monthly access to IMI private community, live workshops, and templates.',
    amount: 500, // $5.00/mo
    recurring: true,
    interval: 'month',
    cancelUrl: '/pages/core-tribe.html'
  },
  'elite': {
    name: 'IMI Core Elite Membership',
    description: 'Premium mastermind access, weekly advisory sprints & executive channel.',
    amount: 4999, // $49.99/mo
    recurring: true,
    interval: 'month',
    cancelUrl: '/pages/core-tribe.html'
  },
  'compass': {
    name: 'IMI Mnemonic Compass Application',
    description: 'Lifetime software license for the IMI Mnemonic Compass.',
    amount: 999, // $9.99
    recurring: false,
    cancelUrl: '/pages/tools.html'
  },
  'time': {
    name: 'iM Time Command Productivity Dashboard',
    description: 'High-performance productivity dashboard and timezone mapper.',
    amount: 799, // $7.99
    recurring: false,
    cancelUrl: '/pages/tools.html'
  },
  'bundle': {
    name: 'Commander Bundle (Compass + Time Command)',
    description: 'Complete digital software suite: Compass & Time Command.',
    amount: 1499, // $14.99
    recurring: false,
    cancelUrl: '/pages/tools.html'
  },
  'starter-sprint': {
    name: 'Starter Sprint Workshop (3 Hours)',
    description: '3-hour focused strategic power sprint with IMI leadership.',
    amount: 7500, // $75.00
    recurring: false,
    cancelUrl: '/pages/booking.html'
  },
  'build-sprint': {
    name: 'Build Sprint Workshop Session',
    description: 'Intensive strategic execution sprint ($25/hour).',
    amountPerHour: 2500, // $25.00/hr
    recurring: false,
    cancelUrl: '/pages/booking.html'
  },
  'imi-intensive': {
    name: 'IMI Intensive Workshop Sprint',
    description: 'Flagship business transformation sprint ($25/hour).',
    amountPerHour: 2500, // $25.00/hr
    recurring: false,
    cancelUrl: '/pages/booking.html'
  },
  'cmo-consultation': {
    name: 'CMO Strategy Session (60 Min)',
    description: 'One-on-one executive marketing roadmap & positioning consultation.',
    amount: 15000, // $150.00
    recurring: false,
    cancelUrl: '/pages/cmo-services.html'
  },
  'brand-audit': {
    name: 'Brand Audit & Roadmap (90 Min)',
    description: 'Comprehensive brand and marketing infrastructure audit.',
    amount: 20000, // $200.00
    recurring: false,
    cancelUrl: '/pages/cmo-services.html'
  },
  'core-elite-session': {
    name: 'Core Elite Onboarding Session (60 Min)',
    description: 'Direct strategic onboarding sprint for incoming Core Elite members.',
    amount: 4999, // $49.99
    recurring: false,
    cancelUrl: '/pages/booking.html'
  }
};

function stripePost(endpoint, params) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify(params);
    const req = https.request({
      hostname: 'api.stripe.com',
      path: endpoint,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + STRIPE_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }
    body = body || {};

    const {
      productKey,
      clientName,
      clientEmail,
      hours,
      customName,
      customAmount, // in cents
      customRecurring,
      metadata = {},
      successUrl,
      cancelUrl
    } = body;

    const baseOrigin = req.headers.origin || req.headers.referer || 'https://imi-website-one.vercel.app';
    const cleanOrigin = baseOrigin.replace(/\/$/, '');

    let item = CATALOG[productKey];

    let name = customName || (item ? item.name : 'IMI Strategic Service');
    let description = (item && item.description) ? item.description : 'Payment for IMI digital service or product.';
    let amount = 0;
    let isRecurring = customRecurring !== undefined ? customRecurring : (item ? item.recurring : false);

    if (customAmount && Number(customAmount) > 0) {
      amount = Math.round(Number(customAmount));
    } else if (item) {
      if (item.amountPerHour) {
        const h = Number(hours) > 0 ? Number(hours) : 6;
        amount = item.amountPerHour * h;
        description += ` (${h} hours)`;
      } else {
        amount = item.amount;
      }
    }

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Invalid or zero payment amount specified' });
    }

    const resolvedSuccessUrl = successUrl || `${cleanOrigin}/pages/portal.html?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancelUrl = cancelUrl || (item && item.cancelUrl ? `${cleanOrigin}${item.cancelUrl}` : `${cleanOrigin}/index.html`);

    const stripeParams = {
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': name,
      'line_items[0][price_data][product_data][description]': description,
      'line_items[0][price_data][unit_amount]': amount,
      'line_items[0][quantity]': 1,
      'mode': isRecurring ? 'subscription' : 'payment',
      'success_url': resolvedSuccessUrl,
      'cancel_url': resolvedCancelUrl,
      'metadata[product_key]': productKey || 'custom',
      'metadata[source]': 'imi_web_gateway'
    };

    if (isRecurring) {
      stripeParams['line_items[0][price_data][recurring][interval]'] = (item && item.interval) || 'month';
    }

    if (clientEmail && clientEmail.includes('@')) {
      stripeParams['customer_email'] = clientEmail.trim();
    }

    if (clientName) {
      stripeParams['metadata[client_name]'] = clientName.trim();
    }

    // Attach any extra metadata passed in
    for (const [k, v] of Object.entries(metadata)) {
      if (typeof v === 'string' || typeof v === 'number') {
        stripeParams[`metadata[${k}]`] = String(v);
      }
    }

    const result = await stripePost('/v1/checkout/sessions', stripeParams);

    if (result.status >= 200 && result.status < 300 && result.data && result.data.url) {
      return res.status(200).json({
        ok: true,
        sessionId: result.data.id,
        url: result.data.url
      });
    } else {
      console.error('Stripe API error:', result.data);
      return res.status(result.status || 500).json({
        error: result.data && result.data.error ? result.data.error.message : 'Failed to create Stripe Checkout session',
        details: result.data
      });
    }
  } catch (err) {
    console.error('Server error creating checkout session:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
