class AppState {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('kgodiso_cart') || '[]');
    this.user = JSON.parse(localStorage.getItem('kgodiso_user') || 'null');
    this.users = JSON.parse(localStorage.getItem('kgodiso_users') || '[]');
  }

  getDeliveryFee() {
    return this.cart.length > 0 ? 60 : 0;
  }

  saveCart() {
    localStorage.setItem('kgodiso_cart', JSON.stringify(this.cart));
    this.updateCartBadge();
  }

  addToCart(item) {
    const existing = this.cart.find(cartItem => cartItem.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
    this.saveCart();
  }

  updateQuantity(id, change) {
    const item = this.cart.find(cartItem => cartItem.id === id);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(cartItem => cartItem.id !== id);
    }
    this.saveCart();
  }

  getCartTotal() {
    return this.cart.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0);
  }

  updateCartBadge() {
    const count = this.cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  saveUsers() {
    localStorage.setItem('kgodiso_users', JSON.stringify(this.users));
  }

  findUser(email) {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  login(email, password) {
    if (!email || !password) {
      return 'Please enter both email and password.';
    }
    const user = this.findUser(email);
    if (!user) {
      return 'No account found for that email.';
    }
    if (user.password !== password) {
      return 'Incorrect email or password.';
    }
    this.user = { email: user.email };
    localStorage.setItem('kgodiso_user', JSON.stringify(this.user));
    return null;
  }

  signup(email, password) {
    if (!email || !password) {
      return 'Please enter both email and password.';
    }
    if (this.findUser(email)) {
      return 'An account already exists with that email.';
    }
    this.users.push({ email, password });
    this.saveUsers();
    return null;
  }

  logout() {
    this.user = null;
    localStorage.removeItem('kgodiso_user');
  }

  updateAuthButtons() {
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

  updateUI() {
    this.updateCartBadge();
    this.updateAuthButtons();
  }
}

window.appState = new AppState();

function showFormMessage(container, message, type = 'error') {
  if (!container) return;
  let msgElement = container.querySelector('.form-message');
  if (!msgElement) {
    msgElement = document.createElement('p');
    msgElement.className = 'form-message';
    msgElement.style.marginTop = '1rem';
    msgElement.style.fontSize = '0.95rem';
    container.appendChild(msgElement);
  }
  msgElement.textContent = message;
  msgElement.style.color = type === 'error' ? 'hsl(1 68% 48%)' : 'hsl(142 76% 36%)';
}

document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => observer.observe(el));

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput.value;
      if (email) {
        const btn = newsletterForm.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = `\n          Subscribed!\n          <svg style="margin-left:8px" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n            <polyline points="20 6 9 17 4 12"></polyline>\n          </svg>`;
        btn.style.backgroundColor = 'hsl(142.1 76.2% 36.3%)';
        btn.style.borderColor = 'transparent';
        btn.style.color = '#fff';
        emailInput.value = '';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 3000);
      }
    });
  }

  window.appState.updateUI();

  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'cart.html';
    });
  });

  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const desktopNav = document.querySelector('.desktop-nav');
  if (mobileMenuBtn && desktopNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = desktopNav.classList.toggle('mobile-open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    desktopNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (desktopNav.classList.contains('mobile-open')) {
          desktopNav.classList.remove('mobile-open');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

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
      setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    });
  });

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
        const delivery = window.appState.getDeliveryFee();
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
    const deliveryEl = document.getElementById('checkout-delivery');
    const deliveryPriceEl = document.getElementById('delivery-price');
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
    const delivery = window.appState.getDeliveryFee();
    subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    deliveryEl.textContent = `R${delivery.toFixed(2)}`;
    deliveryPriceEl.textContent = `R${delivery.toFixed(2)}`;
    totalEl.textContent = `R${(subtotal + delivery).toFixed(2)}`;
    document.getElementById('checkout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zip: document.getElementById('zip').value
      };
      localStorage.setItem('checkoutData', JSON.stringify(formData));
      window.location.href = 'payment.html';
    });
  }

  if (document.getElementById('payment-form')) {
    const subtotalEl = document.getElementById('payment-subtotal');
    const deliveryEl = document.getElementById('payment-delivery');
    const totalEl = document.getElementById('payment-total');
    const payfastAmount = document.getElementById('payfast-amount');
    const payfastEmail = document.getElementById('payfast-email-address');
    const payfastCell = document.getElementById('payfast-cell-number');
    const payfastNameFirst = document.getElementById('payfast-name-first');
    const payfastNameLast = document.getElementById('payfast-name-last');
    const payfastCustom = document.getElementById('payfast-custom');
    const payfastReturnUrl = document.getElementById('payfast-return-url');
    const payfastCancelUrl = document.getElementById('payfast-cancel-url');
    const payfastNotifyUrl = document.getElementById('payfast-notify-url');
    const cart = window.appState.cart;
    if (cart.length === 0) {
      window.location.href = 'cart.html';
    }
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData') || '{}');
    if (checkoutData.fullName) document.getElementById('payerName').value = checkoutData.fullName;
    if (checkoutData.phone) document.getElementById('payerPhone').value = checkoutData.phone;
    if (checkoutData.email) document.getElementById('payerEmail').value = checkoutData.email;
    const subtotal = window.appState.getCartTotal();
    const delivery = window.appState.getDeliveryFee();
    const total = subtotal + delivery;
    subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    deliveryEl.textContent = `R${delivery.toFixed(2)}`;
    totalEl.textContent = `R${total.toFixed(2)}`;
    payfastAmount.value = total.toFixed(2);
    payfastCustom.value = `count=${cart.length};total=R${total.toFixed(2)}`;
    if (payfastCell) {
      payfastCell.value = checkoutData.phone || document.getElementById('payerPhone')?.value || '';
    }
    const payfastFormName = checkoutData.fullName || document.getElementById('payerName')?.value || '';
    const nameParts = payfastFormName.trim().split(/\s+/).filter(Boolean);
    if (payfastNameFirst) payfastNameFirst.value = nameParts[0] || '';
    if (payfastNameLast) payfastNameLast.value = nameParts.slice(1).join(' ') || nameParts[0] || '';
    if (payfastEmail) {
      payfastEmail.value = checkoutData.email || document.getElementById('payerEmail')?.value || '';
    }
    const buildAbsoluteUrl = (path) => {
      if (window.location.protocol.startsWith('http')) {
        const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
        return new URL(path, base).href;
      }
      return new URL(path, 'https://example.com/').href;
    };
    payfastReturnUrl.value = buildAbsoluteUrl('index.html');
    payfastCancelUrl.value = buildAbsoluteUrl('payment.html');
    payfastNotifyUrl.value = buildAbsoluteUrl('index.html');
    document.getElementById('payment-form').addEventListener('submit', () => {
      const payerEmail = document.getElementById('payerEmail').value.trim();
      const payerPhone = document.getElementById('payerPhone').value.trim();
      const payerName = document.getElementById('payerName').value.trim();
      if (payfastEmail) payfastEmail.value = payerEmail;
      if (payfastCell) payfastCell.value = payerPhone;
      const namePartsSubmit = payerName.split(/\s+/).filter(Boolean);
      if (payfastNameFirst) payfastNameFirst.value = namePartsSubmit[0] || '';
      if (payfastNameLast) payfastNameLast.value = namePartsSubmit.slice(1).join(' ') || namePartsSubmit[0] || '';
      payfastAmount.value = total.toFixed(2);
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const error = window.appState.login(email, password);
      if (error) {
        showFormMessage(loginForm, error, 'error');
      } else {
        window.location.href = 'index.html';
      }
    });
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const error = window.appState.signup(email, password);
      if (error) {
        showFormMessage(signupForm, error, 'error');
      } else {
        showFormMessage(signupForm, 'Account created successfully. Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
      }
    });
  }

  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20 ? 'var(--shadow-sm)' : 'none';
    });
  }
});
