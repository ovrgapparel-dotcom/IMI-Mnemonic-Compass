/**
 * IMI STRIPE INTEGRATED CHECKOUT GATEWAY
 * Provides secure, seamless Stripe Checkout integration across all IMI products and services.
 */

(function () {
  'use strict';

  const IMI_STRIPE = {
    // Current user context
    getUserEmail: function () {
      try {
        if (typeof IMI_AUTH !== 'undefined' && IMI_AUTH.getUser) {
          const u = IMI_AUTH.getUser();
          if (u && u.email) return u.email;
        }
        const cached = localStorage.getItem('imi_auth_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email) return parsed.email;
        }
      } catch (_) {}
      return '';
    },

    getUserName: function () {
      try {
        if (typeof IMI_AUTH !== 'undefined' && IMI_AUTH.getUser) {
          const u = IMI_AUTH.getUser();
          if (u && (u.full_name || u.name)) return u.full_name || u.name;
        }
        const cached = localStorage.getItem('imi_auth_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.full_name || parsed.name)) return parsed.full_name || parsed.name;
        }
      } catch (_) {}
      return '';
    },

    // UI Loading Overlay
    showLoading: function (message) {
      let overlay = document.getElementById('imi-stripe-loading-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'imi-stripe-loading-overlay';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease;
          font-family: 'Syne', -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        overlay.innerHTML = `
          <div style="background: #111114; border: 1px solid rgba(201, 162, 39, 0.35); border-radius: 14px; padding: 32px 36px; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(201,162,39,0.15);">
            <div style="width: 56px; height: 56px; margin: 0 auto 20px; border: 3px solid rgba(201,162,39,0.2); border-top-color: #c9a227; border-radius: 50%; animation: imi-spin 0.8s linear infinite;"></div>
            <h3 style="color: #ffffff; font-size: 1.15rem; margin: 0 0 10px; font-weight: 700; letter-spacing: -0.01em;">Connecting to Stripe Gateway</h3>
            <p id="imi-stripe-loading-text" style="color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; line-height: 1.5; margin: 0 0 16px;">Preparing your secure checkout session...</p>
            <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #c9a227; background: rgba(201,162,39,0.08); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(201,162,39,0.2);">
              <i class="fa-solid fa-lock"></i> 256-bit Encrypted &bull; Stripe Verified
            </div>
          </div>
          <style>
            @keyframes imi-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
        document.body.appendChild(overlay);
      }
      if (message) {
        const textEl = document.getElementById('imi-stripe-loading-text');
        if (textEl) textEl.textContent = message;
      }
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });
    },

    hideLoading: function () {
      const overlay = document.getElementById('imi-stripe-loading-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 250);
      }
    },

    // Main checkout trigger
    startCheckout: async function (options) {
      if (!options) options = {};
      const productKey = typeof options === 'string' ? options : options.productKey;
      const clientEmail = options.clientEmail || this.getUserEmail();
      const clientName = options.clientName || this.getUserName();

      this.showLoading(options.message || 'Connecting to Stripe secure checkout...');

      try {
        const payload = {
          productKey: productKey,
          clientEmail: clientEmail,
          clientName: clientName,
          hours: options.hours,
          customName: options.customName,
          customAmount: options.customAmount,
          customRecurring: options.customRecurring,
          metadata: options.metadata || {},
          successUrl: options.successUrl,
          cancelUrl: options.cancelUrl
        };

        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.url) {
          // Track intent in localStorage for post-return confirmation
          try {
            localStorage.setItem('imi_last_checkout', JSON.stringify({
              productKey: productKey,
              sessionId: data.sessionId,
              timestamp: Date.now()
            }));
          } catch (_) {}

          // Redirect to Stripe Checkout page
          window.location.href = data.url;
        } else {
          this.hideLoading();
          const msg = data.error || 'Unable to initialize Stripe checkout. Please try again or contact support.';
          alert('Checkout Notice: ' + msg);
        }
      } catch (err) {
        this.hideLoading();
        console.error('Stripe Checkout Error:', err);
        alert('Payment Gateway Error: ' + (err.message || 'Network connection failed.'));
      }
    },

    // Quick helper for buttons
    checkoutProduct: function (productKey, extra) {
      return this.startCheckout(Object.assign({ productKey: productKey }, extra));
    },

    // Auto-bind buttons with data-stripe-product
    initQuickCheckoutButtons: function () {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-stripe-product]');
        if (btn) {
          e.preventDefault();
          const productKey = btn.dataset.stripeProduct;
          const hours = btn.dataset.stripeHours;
          const name = btn.dataset.stripeName;
          const amount = btn.dataset.stripeAmount;
          this.startCheckout({
            productKey: productKey,
            hours: hours ? parseInt(hours) : undefined,
            customName: name,
            customAmount: amount ? parseFloat(amount) * 100 : undefined
          });
        }
      });
    },

    // Verify session if returning from Stripe
    checkSessionReturn: async function () {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      const isSuccess = urlParams.get('payment') === 'success' || sessionId;

      if (sessionId && isSuccess) {
        try {
          const res = await fetch(`/api/verify-checkout-session?sessionId=${encodeURIComponent(sessionId)}`);
          const data = await res.json();
          if (data.ok && (data.paymentStatus === 'paid' || data.paymentStatus === 'no_payment_required')) {
            console.log('Stripe checkout verified successfully:', data);
            
            // Clean up URL so refresh doesn't re-trigger
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);

            // Return verification details
            return data;
          }
        } catch (e) {
          console.warn('Session verification error:', e);
        }
      }
      return null;
    }
  };

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IMI_STRIPE.initQuickCheckoutButtons());
  } else {
    IMI_STRIPE.initQuickCheckoutButtons();
  }

  window.IMI_STRIPE = IMI_STRIPE;
})();
