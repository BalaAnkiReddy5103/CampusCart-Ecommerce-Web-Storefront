/**
 * CampusCart - Checkout Module (Indian Campus Edition)
 * Handles checkout simulation, strict client-side form validation (Indian 10-digit mobile, 6-digit PIN),
 * UPI & Cash on Campus Delivery simulation, unique order ID generation, and INR receipts.
 */

window.CampusCart = window.CampusCart || {};

CampusCart.Checkout = (function () {
  'use strict';

  const ORDERS_STORAGE_KEY = 'campuscart_orders_history_v1';

  // Validation regular expressions tailored for Indian phone numbers & 6-digit PIN codes
  const PATTERNS = {
    name: /^[a-zA-Z\s'.]{3,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    // Indian 10-digit mobile numbers starting with 6, 7, 8, or 9 (with optional +91 or leading 0)
    phone: /^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/,
    // Indian 6-digit postal PIN code
    pincode: /^[1-9][0-9]{5}$/
  };

  /**
   * Currency formatter helper
   */
  const formatINR = (amt) => {
    const val = Number(amt) || 0;
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  /**
   * Field validation rules
   */
  const validateField = (fieldName, value) => {
    const val = String(value || '').trim();

    switch (fieldName) {
      case 'name':
        if (!val) return 'Full Name is required.';
        if (val.length < 3) return 'Name must be at least 3 characters.';
        if (!PATTERNS.name.test(val)) return 'Please enter a valid full name (letters only).';
        return null;

      case 'email':
        if (!val) return 'College/University email is required.';
        if (!PATTERNS.email.test(val)) return 'Please enter a valid student email address.';
        return null;

      case 'phone':
        if (!val) return '10-digit mobile number is required.';
        const cleanPhone = val.replace(/[\s\-\+]/g, '');
        // Check for 10-digit Indian mobile
        if (!PATTERNS.phone.test(val) && !(cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone))) {
          return 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
        }
        return null;

      case 'address':
        if (!val) return 'Hostel name & Room / Delivery address is required.';
        if (val.length < 5) return 'Please mention Hostel Block, Room No., or Department.';
        return null;

      case 'city':
        if (!val) return 'City / Campus location is required.';
        return null;

      case 'state':
        if (!val) return 'State is required (e.g., Telangana, Karnataka, Maharashtra).';
        return null;

      case 'pincode':
        if (!val) return '6-digit PIN code is required.';
        if (!PATTERNS.pincode.test(val)) return 'Please enter a valid 6-digit Indian PIN code (e.g. 500081).';
        return null;

      default:
        return null;
    }
  };

  /**
   * Update visual field validation UI state
   */
  const updateFieldUI = (inputEl, errorEl, errorMessage) => {
    if (!inputEl) return;

    if (errorMessage) {
      inputEl.classList.add('is-invalid');
      inputEl.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = errorMessage;
    } else {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      if (errorEl) errorEl.textContent = '';
    }
  };

  /**
   * Initialize checkout listeners
   */
  const initCheckout = () => {
    const checkoutForm = document.getElementById('checkout-form');
    const openCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    const checkoutBackdrop = document.getElementById('checkout-backdrop');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const copyIdBtn = document.getElementById('copy-order-id-btn');
    const printReceiptBtn = document.getElementById('print-receipt-btn');

    // Proceed to Checkout button in cart drawer
    if (openCheckoutBtn) {
      openCheckoutBtn.addEventListener('click', openCheckout);
    }

    // Close checkout modal button
    if (closeCheckoutBtn) {
      closeCheckoutBtn.addEventListener('click', closeCheckout);
    }

    // Close on backdrop click
    if (checkoutBackdrop) {
      checkoutBackdrop.addEventListener('click', (e) => {
        if (e.target === checkoutBackdrop) {
          closeCheckout();
        }
      });
    }

    // Live input validation on blur & input
    const fieldsToValidate = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    fieldsToValidate.forEach((field) => {
      const inputEl = document.getElementById(`checkout-${field}`);
      const errorEl = document.getElementById(`checkout-${field}-error`);

      if (inputEl) {
        inputEl.addEventListener('blur', () => {
          const error = validateField(field, inputEl.value);
          updateFieldUI(inputEl, errorEl, error);
        });

        inputEl.addEventListener('input', () => {
          if (inputEl.classList.contains('is-invalid')) {
            const error = validateField(field, inputEl.value);
            updateFieldUI(inputEl, errorEl, error);
          }
        });
      }
    });

    // Form submission
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', handleOrderSubmit);
    }

    // Order confirmation actions
    if (continueShoppingBtn) {
      continueShoppingBtn.addEventListener('click', () => {
        closeConfirmationModal();
        window.location.hash = '#products';
      });
    }

    if (copyIdBtn) {
      copyIdBtn.addEventListener('click', copyOrderIdToClipboard);
    }

    if (printReceiptBtn) {
      printReceiptBtn.addEventListener('click', () => window.print());
    }

    // Payment method radio visual toggle
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.payment-option').forEach((opt) => opt.classList.remove('selected'));
        const parentLabel = radio.closest('.payment-option');
        if (parentLabel) parentLabel.classList.add('selected');
      });
    });
  };

  /**
   * Open checkout modal and render order review
   */
  const openCheckout = () => {
    const items = CampusCart.Cart.getCartItems();
    if (!items || items.length === 0) {
      CampusCart.UI.showToast('Your campus cart is empty! Add books or essentials first.', 'warning');
      return;
    }

    // Close cart drawer
    CampusCart.UI.closeCartDrawer();

    // Render review items
    renderCheckoutSummary();

    // Show modal
    const modal = document.getElementById('checkout-backdrop');
    if (modal) {
      modal.hidden = false;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const nameInput = document.getElementById('checkout-name');
        if (nameInput) nameInput.focus();
      }, 100);
    }
  };

  /**
   * Close checkout modal
   */
  const closeCheckout = () => {
    const modal = document.getElementById('checkout-backdrop');
    if (modal) {
      modal.classList.remove('open');
      modal.hidden = true;
      document.body.style.overflow = '';
    }
  };

  /**
   * Render order review sidebar in checkout dialog
   */
  const renderCheckoutSummary = () => {
    const items = CampusCart.Cart.getCartItems();
    const totals = CampusCart.Cart.getCartTotals();
    const container = document.getElementById('checkout-items-preview');

    if (container) {
      container.innerHTML = items.map((item) => `
        <div class="checkout-preview-item">
          <span class="checkout-preview-title" title="${CampusCart.Products.escapeHTML(item.title)}">
            ${CampusCart.Products.escapeHTML(item.title)}
          </span>
          <span class="checkout-preview-qty">x${item.quantity}</span>
          <span class="checkout-preview-subtotal">${formatINR(item.price * item.quantity)}</span>
        </div>
      `).join('');
    }

    // Financial lines in INR
    const subtotalEl = document.getElementById('checkout-subtotal-val');
    const deliveryEl = document.getElementById('checkout-delivery-val');
    const discountRowEl = document.getElementById('checkout-discount-row');
    const discountValEl = document.getElementById('checkout-discount-val');
    const totalEl = document.getElementById('checkout-total-val');
    const submitBtnAmountEl = document.getElementById('submit-total-btn-amount');

    if (subtotalEl) subtotalEl.textContent = formatINR(totals.subtotal);
    if (deliveryEl) deliveryEl.textContent = totals.deliveryFee === 0 ? 'FREE' : formatINR(totals.deliveryFee);

    if (discountRowEl && discountValEl) {
      if (totals.discount > 0) {
        discountRowEl.hidden = false;
        discountValEl.textContent = `-${formatINR(totals.discount)}`;
      } else {
        discountRowEl.hidden = true;
      }
    }

    if (totalEl) totalEl.textContent = formatINR(totals.total);
    if (submitBtnAmountEl) submitBtnAmountEl.textContent = totals.total.toLocaleString('en-IN');
  };

  /**
   * Handle order submission with validation and simulation
   */
  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    const fields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    let hasError = false;
    let firstInvalidInput = null;

    const formData = {};

    fields.forEach((field) => {
      const inputEl = document.getElementById(`checkout-${field}`);
      const errorEl = document.getElementById(`checkout-${field}-error`);
      const value = inputEl ? inputEl.value : '';
      formData[field] = value.trim();

      const error = validateField(field, value);
      updateFieldUI(inputEl, errorEl, error);

      if (error) {
        hasError = true;
        if (!firstInvalidInput && inputEl) {
          firstInvalidInput = inputEl;
        }
      }
    });

    if (hasError) {
      if (firstInvalidInput) firstInvalidInput.focus();
      CampusCart.UI.showToast('Please correct the highlighted form errors.', 'error', 'Form Incomplete');
      return;
    }

    // Get selected payment method
    const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethodValue = paymentRadio ? paymentRadio.value : 'campus-upi';
    const instructions = (document.getElementById('checkout-instructions')?.value || '').trim();

    const paymentLabels = {
      'campus-upi': 'UPI (Google Pay / PhonePe / Paytm / BHIM)',
      'campus-cod': 'Cash on Campus Delivery (Hostel Gate / Reception)',
      'campus-card': 'College Student ID Card / Canteen Smart Card'
    };

    // Verify cart still has items
    const items = CampusCart.Cart.getCartItems();
    if (!items || items.length === 0) {
      CampusCart.UI.showToast('Your cart is empty!', 'error');
      closeCheckout();
      return;
    }

    const totals = CampusCart.Cart.getCartTotals();

    // Display loading state on button
    const submitBtn = document.getElementById('place-order-submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnSpinner = submitBtn?.querySelector('.btn-spinner');

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.opacity = '0.3';
    if (btnSpinner) btnSpinner.hidden = false;

    // Simulate 800ms server order routing
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate unique Indian Campus Order ID: CC-IN-XXXXXX
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `CC-IN-${randomSuffix}`;

    const orderRecord = {
      orderId,
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      customer: formData,
      deliveryInstructions: instructions || 'Deliver to Hostel Reception / Security Gate',
      paymentMethod: paymentLabels[paymentMethodValue] || paymentLabels['campus-upi'],
      items: [...items],
      totals: { ...totals }
    };

    // Save order record to LocalStorage
    saveOrderToHistory(orderRecord);

    // Reset button state
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.style.opacity = '1';
    if (btnSpinner) btnSpinner.hidden = true;

    // Clear cart and LocalStorage state
    CampusCart.Cart.clearCart();

    // Close checkout modal
    closeCheckout();

    // Reset checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.reset();
      fields.forEach((field) => {
        const inputEl = document.getElementById(`checkout-${field}`);
        if (inputEl) {
          inputEl.classList.remove('is-valid');
          inputEl.classList.remove('is-invalid');
        }
      });
    }

    // Display Order Confirmation Modal
    displayOrderConfirmation(orderRecord);

    CampusCart.UI.showToast(`Order #${orderId} confirmed! Delivering to hostel in 90 mins.`, 'success', 'Order Confirmed');
  };

  /**
   * Display confirmation modal and receipt
   */
  const displayOrderConfirmation = (order) => {
    const backdrop = document.getElementById('confirmation-backdrop');
    const orderIdEl = document.getElementById('confirmed-order-id');
    const receiptContainer = document.getElementById('confirmed-order-receipt');

    if (orderIdEl) orderIdEl.textContent = order.orderId;

    if (receiptContainer) {
      receiptContainer.innerHTML = `
        <div class="receipt-row">
          <span>Student Name:</span>
          <strong>${CampusCart.Products.escapeHTML(order.customer.name)}</strong>
        </div>
        <div class="receipt-row">
          <span>Hostel / Delivery Address:</span>
          <strong>${CampusCart.Products.escapeHTML(order.customer.address)}, ${CampusCart.Products.escapeHTML(order.customer.city)}, ${CampusCart.Products.escapeHTML(order.customer.state)} - ${CampusCart.Products.escapeHTML(order.customer.pincode)}</strong>
        </div>
        <div class="receipt-row">
          <span>Contact Mobile & Email:</span>
          <strong>+91 ${CampusCart.Products.escapeHTML(order.customer.phone)} &bull; ${CampusCart.Products.escapeHTML(order.customer.email)}</strong>
        </div>
        <div class="receipt-row">
          <span>Payment Mode:</span>
          <strong style="color: var(--color-accent-teal);">${CampusCart.Products.escapeHTML(order.paymentMethod)}</strong>
        </div>
        <div class="receipt-row">
          <span>Hostel Dispatch ETA:</span>
          <strong style="color: var(--color-success);">Within 90 Minutes (Hostel Gate / Security Counter)</strong>
        </div>
        <div class="receipt-row">
          <span>Total Items:</span>
          <strong>${order.totals.itemCount} items</strong>
        </div>
        <div class="receipt-row">
          <span>Total Amount:</span>
          <strong style="font-size: 1.125rem; color: var(--color-primary-900);">${formatINR(order.totals.total)}</strong>
        </div>
      `;
    }

    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  /**
   * Close confirmation modal
   */
  const closeConfirmationModal = () => {
    const backdrop = document.getElementById('confirmation-backdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.hidden = true;
      document.body.style.overflow = '';
    }
  };

  /**
   * Save order to LocalStorage history
   */
  const saveOrderToHistory = (orderRecord) => {
    try {
      const history = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
      history.unshift(orderRecord);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
    } catch (e) {
      console.error('CampusCart: Failed to save order history', e);
    }
  };

  /**
   * Copy Order ID to clipboard
   */
  const copyOrderIdToClipboard = () => {
    const orderIdEl = document.getElementById('confirmed-order-id');
    const copyBtnText = document.getElementById('copy-btn-text');

    if (!orderIdEl) return;

    const id = orderIdEl.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(id).then(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copied!';
        CampusCart.UI.showToast(`Order ID "${id}" copied to clipboard.`, 'info');
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy ID';
        }, 2000);
      });
    }
  };

  return {
    initCheckout,
    openCheckout,
    closeCheckout,
    closeConfirmationModal
  };
})();
