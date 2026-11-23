/**
 * CampusCart - Cart Module (Indian Campus Edition)
 * Manages shopping cart state, LocalStorage persistence, item increment/decrement,
 * stock limit validation, INR financial calculations (₹499 Free Delivery Threshold),
 * and drawer UI rendering.
 */

window.CampusCart = window.CampusCart || {};
var CampusCart = window.CampusCart;

CampusCart.Cart = (function () {
  'use strict';

  const STORAGE_KEY = 'campuscart_cart_v1';
  const FREE_DELIVERY_THRESHOLD = 499.00; // ₹499 for free hostel delivery
  const STANDARD_DELIVERY_FEE = 49.00;    // Standard delivery ₹49

  // Active cart items in memory: [{ id, title, price, originalPrice, category, image, quantity, stock }]
  let cartItems = [];

  // Promo code discounts
  let activePromo = null; // { code: 'CAMPUS2026', discountPercent: 10 }

  /**
   * Currency formatter helper
   */
  const formatINR = (amt) => {
    const val = Number(amt) || 0;
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  /**
   * Safe parser for LocalStorage
   */
  const loadCartFromStorage = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          cartItems = parsed.filter(item => item && item.id && item.quantity > 0);
        }
      }
    } catch (e) {
      console.error('CampusCart: Failed to load cart from LocalStorage', e);
      cartItems = [];
    }
  };

  /**
   * Persist cart items to LocalStorage
   */
  const saveCartToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('CampusCart: Failed to save cart to LocalStorage', e);
    }
  };

  /**
   * Initialize cart on application boot
   */
  const initCart = () => {
    loadCartFromStorage();
    renderCartDrawer();
    updateCartBadges();
  };

  /**
   * Get immutable copy of cart items
   */
  const getCartItems = () => [...cartItems];

  /**
   * Add a product to the cart
   */
  const addItem = (productId, qtyToAdd = 1) => {
    const product = CampusCart.Products.getProductById(productId);
    if (!product) {
      CampusCart.UI.showToast('Product not found in campus depot.', 'error');
      return false;
    }

    if (product.stock <= 0) {
      CampusCart.UI.showToast(`Sorry, "${product.title}" is currently out of stock.`, 'warning');
      return false;
    }

    const existingIndex = cartItems.findIndex(item => String(item.id) === String(productId));

    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].quantity;
      const targetQty = currentQty + qtyToAdd;

      if (targetQty > product.stock) {
        CampusCart.UI.showToast(
          `Only ${product.stock} units available in campus store. Cannot add more.`,
          'warning',
          'Stock Limit Reached'
        );
        return false;
      }

      cartItems[existingIndex].quantity = targetQty;
      cartItems[existingIndex].stock = product.stock;
      cartItems[existingIndex].price = product.price;
    } else {
      if (qtyToAdd > product.stock) {
        CampusCart.UI.showToast(
          `Only ${product.stock} units available in stock.`,
          'warning'
        );
        return false;
      }

      cartItems.push({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        originalPrice: Number(product.originalPrice || product.price),
        category: product.category,
        image: product.image,
        quantity: qtyToAdd,
        stock: product.stock
      });
    }

    saveCartToStorage();
    renderCartDrawer();
    updateCartBadges();

    // Trigger visual badge animation
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.classList.remove('bounce');
      void badge.offsetWidth;
      badge.classList.add('bounce');
    }

    CampusCart.UI.showToast(
      `Added "${product.title.length > 28 ? product.title.slice(0, 28) + '...' : product.title}" to cart.`,
      'success',
      'Added to Cart'
    );

    return true;
  };

  /**
   * Update item quantity directly
   */
  const updateQuantity = (productId, newQty) => {
    const existingIndex = cartItems.findIndex(item => String(item.id) === String(productId));
    if (existingIndex === -1) return;

    if (newQty <= 0) {
      removeItem(productId);
      return;
    }

    const item = cartItems[existingIndex];
    const product = CampusCart.Products.getProductById(productId);
    const maxStock = product ? product.stock : item.stock;

    if (newQty > maxStock) {
      CampusCart.UI.showToast(
        `Cannot exceed available stock of ${maxStock} units.`,
        'warning',
        'Stock Limit'
      );
      item.quantity = maxStock;
    } else {
      item.quantity = newQty;
    }

    saveCartToStorage();
    renderCartDrawer();
    updateCartBadges();
  };

  /**
   * Increment item quantity by 1
   */
  const incrementQuantity = (productId) => {
    const item = cartItems.find(i => String(i.id) === String(productId));
    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }
  };

  /**
   * Decrement item quantity by 1
   */
  const decrementQuantity = (productId) => {
    const item = cartItems.find(i => String(i.id) === String(productId));
    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  /**
   * Remove item from cart
   */
  const removeItem = (productId) => {
    const itemToRemove = cartItems.find(i => String(i.id) === String(productId));
    cartItems = cartItems.filter(i => String(i.id) !== String(productId));

    saveCartToStorage();
    renderCartDrawer();
    updateCartBadges();

    if (itemToRemove) {
      CampusCart.UI.showToast(`Removed "${itemToRemove.title.slice(0, 25)}..." from cart.`, 'info');
    }
  };

  /**
   * Clear the entire cart
   */
  const clearCart = () => {
    if (cartItems.length === 0) return;
    cartItems = [];
    activePromo = null;
    saveCartToStorage();
    renderCartDrawer();
    updateCartBadges();
    CampusCart.UI.showToast('Your campus cart has been cleared.', 'info');
  };

  /**
   * Calculate financial totals in INR
   */
  const getCartTotals = () => {
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    let deliveryFee = 0;
    let amountForFreeDelivery = 0;

    if (subtotal > 0) {
      if (subtotal >= FREE_DELIVERY_THRESHOLD) {
        deliveryFee = 0.00;
        amountForFreeDelivery = 0;
      } else {
        deliveryFee = STANDARD_DELIVERY_FEE;
        amountForFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal;
      }
    }

    let discount = 0;
    if (activePromo && activePromo.discountPercent) {
      discount = Math.round((subtotal * activePromo.discountPercent) / 100);
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);

    return {
      itemCount,
      subtotal: Math.round(subtotal),
      deliveryFee: Math.round(deliveryFee),
      discount: Math.round(discount),
      discountPercent: activePromo ? activePromo.discountPercent : 0,
      promoCode: activePromo ? activePromo.code : null,
      total: Math.round(total),
      amountForFreeDelivery: Math.max(0, Math.round(amountForFreeDelivery)),
      isFreeDelivery: subtotal >= FREE_DELIVERY_THRESHOLD
    };
  };

  /**
   * Apply promotional student coupon code (Indian Campus Codes)
   */
  const applyPromoCode = (code) => {
    const trimmed = String(code || '').trim().toUpperCase();
    const statusMsgEl = document.getElementById('promo-status-msg');

    if (!trimmed) {
      if (statusMsgEl) {
        statusMsgEl.textContent = 'Please enter a coupon code.';
        statusMsgEl.className = 'promo-status-msg error';
      }
      return false;
    }

    if (trimmed === 'CAMPUS2026' || trimmed === 'STUDENT10') {
      activePromo = { code: trimmed, discountPercent: 10 };
      if (statusMsgEl) {
        statusMsgEl.textContent = `Promo "${trimmed}" applied! 10% student discount.`;
        statusMsgEl.className = 'promo-status-msg success';
      }
      CampusCart.UI.showToast('10% Campus Welcome discount applied!', 'success');
      renderCartDrawer();
      return true;
    }

    if (trimmed === 'FRESHER15') {
      activePromo = { code: trimmed, discountPercent: 15 };
      if (statusMsgEl) {
        statusMsgEl.textContent = `Promo "${trimmed}" applied! 15% Fresher discount.`;
        statusMsgEl.className = 'promo-status-msg success';
      }
      CampusCart.UI.showToast('15% Fresher Welcome discount applied!', 'success');
      renderCartDrawer();
      return true;
    }

    if (trimmed === 'STUDENT20') {
      activePromo = { code: trimmed, discountPercent: 20 };
      if (statusMsgEl) {
        statusMsgEl.textContent = `Promo "${trimmed}" applied! 20% College discount.`;
        statusMsgEl.className = 'promo-status-msg success';
      }
      CampusCart.UI.showToast('20% College Student discount applied!', 'success');
      renderCartDrawer();
      return true;
    }

    if (statusMsgEl) {
      statusMsgEl.textContent = `Invalid code "${trimmed}". Try CAMPUS2026 or FRESHER15.`;
      statusMsgEl.className = 'promo-status-msg error';
    }
    return false;
  };

  /**
   * Update header badges & quick cart preview
   */
  const updateCartBadges = () => {
    const totals = getCartTotals();
    const badgeEl = document.getElementById('cart-badge');
    const previewEl = document.getElementById('cart-total-preview');
    const drawerCountEl = document.getElementById('drawer-item-count');

    if (badgeEl) badgeEl.textContent = totals.itemCount;
    if (previewEl) previewEl.textContent = formatINR(totals.total);
    if (drawerCountEl) {
      drawerCountEl.textContent = totals.itemCount === 1 ? '1 item' : `${totals.itemCount} items`;
    }
  };

  /**
   * Render cart drawer contents
   */
  const renderCartDrawer = () => {
    const container = document.getElementById('cart-items-container');
    const emptyView = document.getElementById('cart-empty-view');
    const footerView = document.getElementById('cart-drawer-footer');
    const totals = getCartTotals();

    // Delivery progress bar elements
    const progressTextEl = document.getElementById('delivery-progress-text');
    const progressFillEl = document.getElementById('delivery-progress-fill');
    const progressBannerEl = document.getElementById('delivery-progress-banner');

    if (totals.itemCount === 0) {
      if (emptyView) emptyView.hidden = false;
      if (container) container.innerHTML = '';
      if (footerView) footerView.hidden = true;
      if (progressBannerEl) progressBannerEl.hidden = true;
      return;
    }

    if (emptyView) emptyView.hidden = true;
    if (footerView) footerView.hidden = false;
    if (progressBannerEl) progressBannerEl.hidden = false;

    // Update free delivery meter
    if (progressTextEl && progressFillEl) {
      if (totals.isFreeDelivery) {
        progressTextEl.innerHTML = '🎉 <strong>Badhai Ho!</strong> You have unlocked <strong>FREE Campus Hostel Delivery!</strong>';
        progressFillEl.style.width = '100%';
        progressFillEl.style.backgroundColor = 'var(--color-success)';
      } else {
        const percent = Math.min(100, Math.round((totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100));
        progressTextEl.innerHTML = `Add <strong>${formatINR(totals.amountForFreeDelivery)}</strong> more to unlock <strong>FREE Hostel Delivery!</strong>`;
        progressFillEl.style.width = `${percent}%`;
        progressFillEl.style.backgroundColor = 'var(--color-accent-teal)';
      }
    }

    // Render items list
    if (container) {
      container.innerHTML = cartItems.map((item) => {
        const itemSubtotal = item.price * item.quantity;
        const safeTitle = CampusCart.Products.escapeHTML(item.title);
        const safeCategory = CampusCart.Products.escapeHTML(item.category);
        const safeImage = CampusCart.Products.escapeHTML(item.image);
        const safeFallbackSvg = CampusCart.Products.getFallbackSvg(item.title, item.category);

        return `
          <div class="cart-item-card" data-product-id="${item.id}">
            <div class="cart-item-thumb">
              <img 
                src="${safeImage}" 
                alt="${safeTitle}" 
                onerror="CampusCart.Products.handleImageError(this, '${safeCategory}');"
              >
            </div>

            <div class="cart-item-info">
              <span class="cart-item-category">${safeCategory}</span>
              <h4 class="cart-item-title" title="${safeTitle}">${safeTitle}</h4>
              <span class="cart-item-unit-price">${formatINR(item.price)} each</span>

              <div class="cart-qty-controls">
                <button 
                  type="button" 
                  class="qty-btn" 
                  onclick="CampusCart.Cart.decrementQuantity('${item.id}')"
                  aria-label="Decrease quantity"
                >-</button>
                <span class="qty-display" aria-label="Current quantity">${item.quantity}</span>
                <button 
                  type="button" 
                  class="qty-btn" 
                  onclick="CampusCart.Cart.incrementQuantity('${item.id}')"
                  ${item.quantity >= item.stock ? 'disabled' : ''}
                  aria-label="Increase quantity"
                  title="${item.quantity >= item.stock ? 'Stock limit reached' : 'Add one more'}"
                >+</button>
              </div>
            </div>

            <div class="cart-item-actions">
              <span class="cart-item-subtotal">${formatINR(itemSubtotal)}</span>
              <button 
                type="button" 
                class="cart-item-remove-btn" 
                onclick="CampusCart.Cart.removeItem('${item.id}')"
                aria-label="Remove ${safeTitle} from cart"
                title="Remove item"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Remove</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Update financial breakdown values
    const subtotalEl = document.getElementById('drawer-subtotal-val');
    const deliveryEl = document.getElementById('drawer-delivery-val');
    const deliveryNoteEl = document.getElementById('delivery-status-note');
    const discountRowEl = document.getElementById('discount-summary-row');
    const discountValEl = document.getElementById('drawer-discount-val');
    const totalEl = document.getElementById('drawer-total-val');

    if (subtotalEl) subtotalEl.textContent = formatINR(totals.subtotal);
    if (deliveryEl) {
      deliveryEl.textContent = totals.deliveryFee === 0 ? 'FREE' : formatINR(totals.deliveryFee);
      if (totals.deliveryFee === 0) deliveryEl.style.color = 'var(--color-success)';
      else deliveryEl.style.color = 'inherit';
    }
    if (deliveryNoteEl) {
      deliveryNoteEl.textContent = totals.isFreeDelivery ? '(Hostel Drop Unlocked)' : '(Free over ₹499)';
    }

    if (discountRowEl && discountValEl) {
      if (totals.discount > 0) {
        discountRowEl.hidden = false;
        discountValEl.textContent = `-${formatINR(totals.discount)} (${totals.discountPercent}%)`;
      } else {
        discountRowEl.hidden = true;
      }
    }

    if (totalEl) totalEl.textContent = formatINR(totals.total);
  };

  return {
    initCart,
    addItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    clearCart,
    getCartItems,
    getCartTotals,
    applyPromoCode,
    renderCartDrawer,
    updateCartBadges,
    formatINR
  };
})();
