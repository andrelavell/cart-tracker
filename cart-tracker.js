// Cart Event Tracker
class CartEventTracker {
  constructor() {
    console.log('[Cart Tracker] Initializing...');
    this.endpoint = '/api/metrics/cart-events';
    this.init();
  }

  init() {
    console.log('[Cart Tracker] Starting initialization...');
    // Track add to cart button clicks
    this.trackAddToCartClicks();
    // Track successful cart additions
    this.trackSuccessfulCartAdds();
    console.log('[Cart Tracker] Initialization complete');
  }

  trackAddToCartClicks() {
    const addToCartButtons = document.querySelectorAll('button[name="add"], button.additional-btn');
    console.log('[Cart Tracker] Found add to cart buttons:', addToCartButtons.length);
    addToCartButtons.forEach(button => {
      button.addEventListener('click', () => {
        console.log('[Cart Tracker] Add to cart button clicked');
        this.reportEvent('add_to_cart_click');
      });
    });
  }

  trackSuccessfulCartAdds() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      // Only intercept cart/add.js calls
      if (typeof url === 'string' && url.includes('/cart/add.js')) {
        console.log('[Cart Tracker] Intercepted cart/add.js call');
        try {
          const response = await originalFetch(...args);
          const data = await response.clone().json();
          
          // Report successful add to cart
          console.log('[Cart Tracker] Cart add successful:', data);
          this.reportEvent('add_to_cart_success', {
            product_id: data.id,
            variant_id: data.variant_id,
            quantity: data.quantity
          });
          
          return response;
        } catch (error) {
          console.error('[Cart Tracker] Error tracking cart add:', error);
          return originalFetch(...args);
        }
      }
      
      return originalFetch(...args);
    };
  }

  async reportEvent(eventType, details = {}) {
    try {
      console.log('[Cart Tracker] Reporting event:', eventType, details);
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          ...details
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('[Cart Tracker] Event reported successfully');
    } catch (error) {
      console.error('[Cart Tracker] Error reporting cart event:', error);
    }
  }
}

// Initialize tracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Cart Tracker] DOM loaded, creating tracker...');
  window.cartTracker = new CartEventTracker();
});
