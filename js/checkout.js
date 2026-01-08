document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in first!');
    window.location.href = 'login.html';
    return;
  }

  // ====== FILL USER INFO ======
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const checkoutAddress = document.getElementById('checkoutAddress');

  if (nameInput) nameInput.value = currentUser.name;
  if (emailInput) emailInput.value = currentUser.email;

  // ====== LOAD ADDRESSES ======
  const addressList = JSON.parse(localStorage.getItem('addresses')) || [];
  const userAddresses = addressList.filter(a => a.userEmail === currentUser.email);

  if (checkoutAddress) {
    checkoutAddress.innerHTML = userAddresses.length
      ? userAddresses.map(a => `<option value="${a.line1}|${a.line2}|${a.city}|${a.postal}">${a.label} - ${a.line1}, ${a.city}</option>`).join('')
      : '<option disabled>No addresses saved</option>';
  }

  // ====== LOAD CART ======
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const checkoutItems = document.getElementById('checkout-items');
  const subtotalElem = document.getElementById('summary-subtotal');
  const deliveryElem = document.getElementById('summary-delivery');
  const totalElem = document.getElementById('summary-total');

  let subtotal = 0;
  if (checkoutItems) {
    if (cart.length === 0) {
      checkoutItems.innerHTML = '<p>Your cart is empty.</p>';
    } else {
      checkoutItems.innerHTML = cart.map(item => {
        subtotal += item.price * item.quantity;
        return `<div class="checkout-item">
                  <p>${item.name} x ${item.quantity} - R${(item.price * item.quantity).toFixed(2)}</p>
                </div>`;
      }).join('');
    }
  }

  const delivery = subtotal > 0 ? 100 : 0;
  const total = subtotal + delivery;

  if (subtotalElem) subtotalElem.textContent = `R${subtotal.toFixed(2)}`;
  if (deliveryElem) deliveryElem.textContent = `R${delivery.toFixed(2)}`;
  if (totalElem) totalElem.textContent = `R${total.toFixed(2)}`;

  // ====== CHECKOUT SUBMIT ======
  document.getElementById('checkoutForm')?.addEventListener('submit', e => {
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

    // Save order
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const newOrder = {
      id: 'ORD' + Date.now(),
      userEmail: currentUser.email,
      items: cart,
      total,
      date: new Date().toLocaleString(),
      payment
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    localStorage.setItem('cart', JSON.stringify([]));
    alert('Order placed successfully!');
    window.location.href = 'account.html';
  });
});
