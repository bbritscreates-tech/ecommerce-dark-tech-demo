document.addEventListener("DOMContentLoaded", () => {
  console.log("checkout.js loaded");

  // ===== AUTH CHECK =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Please log in first!");
    window.location.href = "login.html";
    return;
  }

  // ===== CONSTANTS =====
  const DELIVERY_FEE = 100;
  const FREE_DELIVERY_THRESHOLD = 2000;

  // ===== ELEMENTS =====
  const checkoutItems = document.getElementById("checkout-items");
  const subtotalEl = document.getElementById("summary-subtotal");
  const deliveryEl = document.getElementById("summary-delivery");
  const totalEl = document.getElementById("summary-total");
  const deliveryNotice = document.getElementById("delivery-notice");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  const checkoutAddress = document.getElementById("checkoutAddress");
  const addNewAddressBtn = document.getElementById("addNewAddressBtn");
  const newAddressForm = document.getElementById("newAddressForm");
  const saveAddressBtn = document.getElementById("saveAddressBtn");

  const addressLine1 = document.getElementById("addressLine1");
  const addressLine2 = document.getElementById("addressLine2");
  const city = document.getElementById("city");
  const postalCode = document.getElementById("postalCode");

  const checkoutForm = document.getElementById("checkoutForm");

  // ===== PREFILL USER INFO =====
  if (nameInput) nameInput.value = currentUser.name || "";
  if (emailInput) emailInput.value = currentUser.email || "";

  // ===== LOAD CART =====
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  function getQuantity(item) {
    return Number(item.quantity ?? item.qty ?? item.count ?? 1);
  }

  function getPrice(item) {
    if (typeof item.price === "string") {
      return Number(item.price.replace("R", ""));
    }
    return Number(item.price ?? item.cost ?? 0);
  }

  function renderCartItems() {
    if (!checkoutItems) return;

    if (cart.length === 0) {
      checkoutItems.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    checkoutItems.innerHTML = "";
    cart.forEach(item => {
      const qty = getQuantity(item);
      const price = getPrice(item);
      const total = price * qty;

      checkoutItems.innerHTML += `
        <div class="checkout-item">
          <p><strong>${item.name}</strong></p>
          <p>Quantity: ${qty}</p>
          <p>Price: R${total.toFixed(2)}</p>
        </div>
      `;
    });
  }

  // ===== TOTALS =====
  function calculateTotals() {
    let subtotal = 0;

    cart.forEach(item => {
      subtotal += getPrice(item) * getQuantity(item);
    });

    const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + delivery;

    subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    deliveryEl.textContent = delivery === 0 ? "FREE" : `R${delivery.toFixed(2)}`;
    totalEl.textContent = `R${total.toFixed(2)}`;

    deliveryNotice.textContent =
      delivery === 0
        ? "🎉 You qualify for FREE delivery!"
        : `Spend R${(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(
            2
          )} more for FREE delivery`;
  }

  // ===== ADDRESSES =====
  function loadAddresses() {
    checkoutAddress.innerHTML = "";

    const addresses = currentUser.addresses || [];
    if (addresses.length === 0) {
      checkoutAddress.innerHTML =
        '<option disabled selected>No saved addresses</option>';
      return;
    }

    addresses.forEach(addr => {
      const opt = document.createElement("option");
      opt.value = addr;
      opt.textContent = addr;
      checkoutAddress.appendChild(opt);
    });
  }

  addNewAddressBtn.addEventListener("click", () => {
    newAddressForm.style.display =
      newAddressForm.style.display === "none" ? "block" : "none";
  });

  saveAddressBtn.addEventListener("click", () => {
    if (!addressLine1.value || !city.value || !postalCode.value) {
      alert("Please fill in required address fields.");
      return;
    }

    const fullAddress = `${addressLine1.value}, ${
      addressLine2.value ? addressLine2.value + ", " : ""
    }${city.value}, ${postalCode.value}`;

    currentUser.addresses = currentUser.addresses || [];
    currentUser.addresses.push(fullAddress);

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    loadAddresses();
    newAddressForm.style.display = "none";

    addressLine1.value = "";
    addressLine2.value = "";
    city.value = "";
    postalCode.value = "";

    alert("Address added successfully!");
  });

  // ===== PAYMENT HIGHLIGHT =====
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener("change", () => {
      document
        .querySelectorAll(".payment-options label")
        .forEach(l => l.classList.remove("active"));
      radio.parentElement.classList.add("active");
    });
  });

  // ===== SUBMIT ORDER =====
  checkoutForm.addEventListener("submit", e => {
    e.preventDefault();

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    const payment = document.querySelector(
      'input[name="payment"]:checked'
    )?.value;

    if (!payment) {
      alert("Please select a payment method.");
      return;
    }

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    const order = {
      id: "ORD" + Date.now(),
      email: currentUser.email,
      items: cart,
      total: totalEl.textContent,
      date: new Date().toLocaleString(),
      payment,
      address: checkoutAddress.value
    };

    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    currentUser.orders = currentUser.orders || [];
    currentUser.orders.push(order);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    localStorage.setItem("cart", JSON.stringify([]));

    alert("Order placed successfully!");
    window.location.href = "account.html";
  });

  // ===== INIT =====
  renderCartItems();
  calculateTotals();
  loadAddresses();
});
