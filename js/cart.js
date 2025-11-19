document.addEventListener('DOMContentLoaded', () => {
  const cartTableBody = document.getElementById('cartItems');
  const totalAmountEl = document.getElementById('totalAmount');

  // Make sure elements exist
  if (!cartTableBody || !totalAmountEl) return;

  function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartTableBody.innerHTML = '';

    if(cart.length === 0){
      cartTableBody.innerHTML = `<tr><td colspan="5">Your cart is empty</td></tr>`;
      totalAmountEl.textContent = 'R0.00';
      return;
    }

    cart.forEach((item, index) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.qty) || 0;
      const subtotal = price * qty;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>R${price.toFixed(2)}</td>
        <td><input type="number" class="quantity" value="${qty}" min="1"></td>
        <td class="subtotal">R${subtotal.toFixed(2)}</td>
        <td><button class="remove-btn">X</button></td>
      `;
      cartTableBody.appendChild(row);
    });

    updateTotals();
    attachEvents();
  }

  function updateTotals() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let subtotal = 0;
  cart.forEach(item => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.qty) || 0;
    subtotal += price * qty;
  });

  // Delivery fee logic — R83, free for orders ≥ R6000
  let deliveryFee = subtotal >= 6000 ? 0 : 83;
  let total = subtotal + deliveryFee;

  // Update totals display
  const totalAmountEl = document.getElementById('totalAmount');
  if (totalAmountEl) {
    totalAmountEl.innerHTML = `
      <div>Subtotal: R${subtotal.toFixed(2)}</div>
      <div>Delivery: ${deliveryFee === 0 ? '<span style="color:green;">Free</span>' : 'R' + deliveryFee.toFixed(2)}</div>
      <hr>
      <strong>Total: R${total.toFixed(2)}</strong>
    `;
  }

  // Store delivery fee for checkout
  localStorage.setItem('deliveryFee', deliveryFee);
}


  function attachEvents() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Quantity change
    document.querySelectorAll('.quantity').forEach((input,index)=>{
      input.addEventListener('change', ()=>{
        if(input.value<1) input.value=1;
        cart[index].qty = parseInt(input.value);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
      });
    });

    // Remove button
    document.querySelectorAll('.remove-btn').forEach((btn,index)=>{
      btn.addEventListener('click', ()=>{
        cart.splice(index,1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
      });
    });
  }

  renderCart();
});
