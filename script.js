document.addEventListener('DOMContentLoaded', () => {

  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply observer to all elements with reveal classes
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-right');
  revealElements.forEach(el => observer.observe(el));

  // Newsletter Form Setup
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput.value;
      
      if (email) {
        // Change button state
        const btn = newsletterForm.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = `
          Subscribed!
          <svg style="margin-left:8px" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>`;
        btn.style.backgroundColor = 'hsl(142.1 76.2% 36.3%)'; // green success color
        btn.style.borderColor = 'transparent';
        btn.style.color = '#fff';
        
        emailInput.value = '';
        
        // Reset after 3 seconds
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 3000);
      }
    });
  }

  // Initialize state UI
  window.appState.updateCartBadge();
  window.appState.updateUI();

  // Cart Button
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'cart.html';
    });
  });

  // Handle 'Add to Cart' buttons globally
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const price = parseFloat(btn.getAttribute('data-price'));
      const image = btn.getAttribute('data-image');
      
      window.appState.addToCart({ id, title, price, image });
      
      const originalText = btn.innerHTML;
      btn.innerHTML = `Added! <svg style="margin-left:4px" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    });
  });

  // --- Page Specific Logic ---
  
  if (document.getElementById('cart-items-list')) {
    const list = document.getElementById('cart-items-list');
    const emptyMsg = document.getElementById('empty-cart-message');
    const summary = document.getElementById('cart-summary');
    const subtotalEl = document.getElementById('cart-subtotal');
    const deliveryEl = document.getElementById('cart-delivery');
    const totalEl = document.getElementById('cart-total');

    const renderCartPage = () => {
      const cart = window.appState.cart;
      if (cart.length === 0) {
        list.innerHTML = '';
        list.style.display = 'none';
        summary.style.display = 'none';
        emptyMsg.style.display = 'block';
      } else {
        list.style.display = 'block';
        summary.style.display = 'block';
        emptyMsg.style.display = 'none';
        
        list.innerHTML = cart.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
              <h3 class="cart-item-title">${item.title}</h3>
              <p class="cart-item-price">R${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
              <button class="qty-btn" onclick="window.appState.updateQuantity('${item.id}', -1); window.location.reload();">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <span style="font-weight: 500; min-width: 20px; text-align: center;">${item.quantity}</span>
              <button class="qty-btn" onclick="window.appState.updateQuantity('${item.id}', 1); window.location.reload();">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
            <div>
              <p style="font-weight: 600; font-size: 1.125rem;">R${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        `).join('');

        const subtotal = window.appState.getCartTotal();
        const delivery = window.appState.deliveryFee;
        subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
        deliveryEl.textContent = `R${delivery.toFixed(2)}`;
        totalEl.textContent = `R${(subtotal + delivery).toFixed(2)}`;
      }
    };
    renderCartPage();
  }

  if (document.getElementById('checkout-form')) {
    const itemsContainer = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');
    
    const cart = window.appState.cart;
    if (cart.length === 0) {
      window.location.href = 'cart.html';
    }
    
    itemsContainer.innerHTML = cart.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
        <span>${item.quantity}x ${item.title}</span>
        <span>R${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    const subtotal = window.appState.getCartTotal();
    const delivery = window.appState.deliveryFee;
    subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    totalEl.textContent = `R${(subtotal + delivery).toFixed(2)}`;

    document.getElementById('checkout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = 'payment.html';
    });
  }

  if (document.getElementById('payment-form')) {
    const subtotalEl = document.getElementById('payment-subtotal');
    const totalEl = document.getElementById('payment-total');
    const payfastAmount = document.getElementById('payfast-amount');
    const payfastEmail = document.getElementById('payfast-email-address');
    const payfastCustom = document.getElementById('payfast-custom');
    const payfastReturnUrl = document.getElementById('payfast-return-url');
    const payfastCancelUrl = document.getElementById('payfast-cancel-url');
    const payfastNotifyUrl = document.getElementById('payfast-notify-url');
    
    const cart = window.appState.cart;
    if (cart.length === 0) {
      window.location.href = 'cart.html';
    }

    const subtotal = window.appState.getCartTotal();
    const delivery = window.appState.deliveryFee;
    const total = subtotal + delivery;

    subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    totalEl.textContent = `R${total.toFixed(2)}`;
    payfastAmount.value = total.toFixed(2);
    payfastCustom.value = JSON.stringify({ subtotal: subtotal.toFixed(2), delivery: delivery.toFixed(2), total: total.toFixed(2), items: cart.map(item => ({ id: item.id, title: item.title, qty: item.quantity })) });

    const buildAbsoluteUrl = (path) => {
      if (window.location.protocol.startsWith('http')) {
        const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
        return new URL(path, base).href;
      }
      // PayFast requires valid HTTPS callback URLs. Replace these with your live site URLs when deployed.
      return new URL(path, 'https://example.com/').href;
    };

    payfastReturnUrl.value = buildAbsoluteUrl('index.html');
    payfastCancelUrl.value = buildAbsoluteUrl('payment.html');
    payfastNotifyUrl.value = buildAbsoluteUrl('index.html');

    document.getElementById('payment-form').addEventListener('submit', () => {
      const payerEmail = document.getElementById('payerEmail').value.trim();
      payfastEmail.value = payerEmail;
    });
  }

  if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      window.appState.login(email);
      window.location.href = 'index.html';
    });
  }

  // Header Scroll Effect
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.boxShadow = 'var(--shadow-sm)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

});

// Cart and Auth State Management
class AppState {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.user = JSON.parse(localStorage.getItem('user')) || null;
    this.deliveryFee = 60;
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartBadge();
  }

  addToCart(item) {
    const existingIndex = this.cart.findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += 1;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
    this.saveCart();
  }

  removeFromCart(id) {
    this.cart = this.cart.filter(i => i.id !== id);
    this.saveCart();
  }

  updateQuantity(id, change) {
    const item = this.cart.find(i => i.id === id);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) this.removeFromCart(id);
      else this.saveCart();
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  updateCartBadge() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = totalItems;
      if (totalItems > 0) {
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  }

  login(email) {
    this.user = { email };
    localStorage.setItem('user', JSON.stringify(this.user));
    this.updateUI();
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
    this.updateUI();
  }

  updateUI() {
    document.querySelectorAll('.login-btn').forEach(btn => {
      if (this.user) {
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" x2="9" y1="12" y2="12"></line>
          </svg>
          <span>Logout</span>
        `;
        btn.onclick = (e) => {
          e.preventDefault();
          this.logout();
          window.location.reload();
        };
      } else {
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" x2="3" y1="12" y2="12"></line>
          </svg>
          <span>Login</span>
        `;
        btn.onclick = (e) => {
          if (!btn.closest('form')) {
            e.preventDefault();
            window.location.href = 'login.html';
          }
        };
      }
    });
  }
}

window.appState = new AppState();
