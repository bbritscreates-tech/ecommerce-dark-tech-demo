(function () {
    "use strict";

    const safeLog = (...args) => console.log("[cart.js]", ...args);
    const safeErr = (...args) => console.error("[cart.js]", ...args);

    document.addEventListener("DOMContentLoaded", () => {
        safeLog("DOM ready - initializing cart.js");

        /* -------------------- CART FUNCTIONS -------------------- */

        function getCart() {
            return JSON.parse(localStorage.getItem("cart") || "[]");
        }

        function saveCart(cart) {
            localStorage.setItem("cart", JSON.stringify(cart));
            window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cart } }));
        }

        function addToCart(product) {
            const cart = getCart();
            const existing = cart.find(item => item.id === product.id);
            if (existing) existing.qty += 1;
            else cart.push({ ...product, qty: 1 });
            saveCart(cart);
            safeLog("Added to cart:", product.name);
        }

        function removeFromCart(id) {
            let cart = getCart();
            cart = cart.filter(item => item.id !== id);
            saveCart(cart);
            safeLog("Removed from cart:", id);
        }

        function clearCart() {
            saveCart([]);
            safeLog("Cart cleared");
        }

        /* -------------------- NAVBAR CART COUNT -------------------- */
        const cartCountEl = document.getElementById("cartCount");
        function updateCartCount() {
            const cart = getCart();
            const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
            if (cartCountEl) cartCountEl.textContent = totalQty;
        }

        window.addEventListener("cartUpdated", updateCartCount);
        window.addEventListener("storage", e => { if (e.key === "cart") updateCartCount(); });
        updateCartCount(); // initial

        /* -------------------- CART PAGE RENDER -------------------- */
        const cartItemsEl = document.getElementById("cartItems");
        const totalAmountEl = document.getElementById("totalAmount");

        function renderCartPage() {
            if (!cartItemsEl || !totalAmountEl) return;

            const cart = getCart();
            cartItemsEl.innerHTML = ""; // clear table

            let total = 0;
            cart.forEach(item => {
                const subtotal = item.price * item.qty;
                total += subtotal;

                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>
                        <img src="${item.image}" alt="${item.name}" style="width:50px; margin-right:10px;">
                        ${item.name}
                    </td>
                    <td>R${item.price.toFixed(2)}</td>
                    <td>
                        <input type="number" min="1" value="${item.qty}" style="width:60px;">
                    </td>
                    <td>R${subtotal.toFixed(2)}</td>
                    <td><button class="btn-remove" title="Remove item">&times;</button></td>
                `;

                // handle qty change
                const qtyInput = tr.querySelector("input[type='number']");
                qtyInput.addEventListener("change", (e) => {
                    let newQty = parseInt(e.target.value);
                    if (isNaN(newQty) || newQty < 1) newQty = 1;
                    item.qty = newQty;
                    saveCart(cart);
                    renderCartPage();
                });

                // handle remove button
                const removeBtn = tr.querySelector(".btn-remove");
                removeBtn.addEventListener("click", () => {
                    removeFromCart(item.id);
                    renderCartPage();
                });

                cartItemsEl.appendChild(tr);
            });

            totalAmountEl.textContent = `R${total.toFixed(2)}`;
        }

        window.addEventListener("cartUpdated", renderCartPage);
        renderCartPage(); // initial
    });
})();
