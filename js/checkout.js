document.addEventListener('DOMContentLoaded', () => {
  // ======= USER CHECK =======
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in first!');
    window.location.href = 'login.html';
    return;
  }

  // ======= ELEMENTS =======
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const checkoutItems = document.getElementById('checkout-items');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDelivery = document.getElementById('summary-delivery');
  const summaryTotal = document.getElementById('summary-total');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutAddress = document.getElementById('checkoutAddress');
  const addNewAddressBtn = document.getElementById('addNewAddressBtn');
  const newAddressForm = document.getElementById('newAddressForm');
  const addressLine1 = document.getElementById('addressLine1');
  const addressLine2 = document.getElementById('addressLine2');
  const city = document.getElementById('city');
  const postalCode = document.getElementById('postalCode');
  const saveAddressBtn = document.getElementById('saveAddressBtn');
  const paymentRadios = document.querySelectorAll('input[name="payment"]');

  // Fill name and email
  if (nameInput) nameInput.value = currentUser.name;
  if (emailInput) emailInput.value = currentUser.email;

  // ======= CART =======
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function calculateTotals() {
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price * item.qty;
    });

    // Delivery fee: free if subtotal >= 5000
    const delivery = subtotal > 0 && subtotal < 5000 ? 100 : 0;
    const total = subtotal + delivery;

    summarySubtotal.textContent = `R${subtotal.toFixed(2)}`;
    summaryDelivery.textContent = `R${delivery.toFixed(2)}`;
    summaryTotal.textContent = `R${total.toFixed(2)}`;

    return { subtotal, delivery, total };
  }

  function renderCart() {
    if (!checkoutItems) return;

    if (cart.length === 0) {
      checkoutItems.innerHTML = '<p>Your cart is empty.</p>';
      summarySubtotal.textContent = 'R0.00';
      summaryDelivery.textContent = 'R0.00';
      summaryTotal.textContent = 'R0.00';
      return;
    }

    checkoutItems.innerHTML = cart.map(item => {
      return `<div class="checkout-item">
                <p>${item.name} — Quantity: ${item.qty} — Price: R${(item.price * item.qty).toFixed(2)}</p>
              </div>`;
    }).join('');

    calculateTotals();
  }

  renderCart();

  // ======= ADDRESSES =======
  function loadAddresses() {
    if (!checkoutAddress) return;

    checkoutAddress.innerHTML = '<option value="" disabled selected>Select an address</option>';
    currentUser.addresses = currentUser.addresses || [];

    currentUser.addresses.forEach((addr, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city} ${addr.postal}`;
      checkoutAddress.appendChild(opt);
    });
  }

  loadAddresses();

  addNewAddressBtn.addEventListener('click', () => {
    newAddressForm.style.display = 'block';
  });

  saveAddressBtn.addEventListener('click', () => {
    const newAddr = {
      line1: addressLine1.value.trim(),
      line2: addressLine2.value.trim(),
      city: city.value.trim(),
      postal: postalCode.value.trim(),
    };

    if (!newAddr.line1 || !newAddr.city || !newAddr.postal) {
      alert('Please fill in all required address fields.');
      return;
    }

    currentUser.addresses.push(newAddr);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Clear form
    addressLine1.value = '';
    addressLine2.value = '';
    city.value = '';
    postalCode.value = '';
    newAddressForm.style.display = 'none';

    loadAddresses();
    alert('Address added!');
  });

  function getSelectedAddress() {
    if (!checkoutAddress) return null;
    const selectedIndex = checkoutAddress.value;
    if (selectedIndex === "" || selectedIndex === null) return null;
    return currentUser.addresses[selectedIndex];
  }

  // ======= PAYMENT =======
  // Keep selection highlighted
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      paymentRadios.forEach(r => r.parentElement.classList.remove('selected'));
      if (radio.checked) radio.parentElement.classList.add('selected');
    });
    // Maintain previous selection on reload
    if (radio.value === localStorage.getItem('lastPayment')) {
      radio.checked = true;
      radio.parentElement.classList.add('selected');
    }
  });

  // ======= SUBMIT ORDER =======
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!cart.length) {
      alert('Your cart is empty!');
      return;
    }

    const payment = document.querySelector('input[name="payment"]:checked')?.value;
    if (!payment) {
      alert('Please select a payment method');
      return;
    }

    const address = getSelectedAddress();
    if (!address) {
      alert('Please select a delivery address');
      return;
    }

    const totals = calculateTotals();

    // Save order
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const newOrder = {
      id: 'ORD' + Date.now(),
      userEmail: currentUser.email,
      items: cart,
      total: totals.total,
      delivery: totals.delivery,
      subtotal: totals.subtotal,
      address,
      date: new Date().toLocaleString(),
      payment,
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Save last payment
    localStorage.setItem('lastPayment', payment);

    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Order placed successfully!');
    window.location.href = 'account.html';
  });
});
