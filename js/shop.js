(function () {
  "use strict";

  const safeLog = (...args) => console.log("[shop.js]", ...args);
  const safeWarn = (...args) => console.warn("[shop.js]", ...args);
  const safeErr = (...args) => console.error("[shop.js]", ...args);

  document.addEventListener("DOMContentLoaded", () => {
    safeLog("DOM ready - initializing shop.js");

    /* -------------------- CART (localStorage) -------------------- */
    try {
      if (!localStorage.getItem("cart")) localStorage.setItem("cart", JSON.stringify([]));

      const cartKey = "cart";

      // Get cart from storage
      function getCart() {
        return JSON.parse(localStorage.getItem(cartKey) || "[]");
      }

      // Save cart and trigger event
      function setCart(cart) {
        localStorage.setItem(cartKey, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cart } }));
      }

      // Add item to cart
      function addToCart(product) {
        const cart = getCart();
        const existing = cart.find(item => item.id === product.id);
        if (existing) existing.qty += 1;
        else cart.push({ ...product, qty: 1 });
        setCart(cart);
        safeLog("Added to cart:", product.name, cart);
      }

      // Remove item from cart
      window.removeFromCart = function (id) {
        const cart = getCart().filter(item => item.id !== id);
        setCart(cart);
        safeLog("Removed from cart:", id, cart);
      };

      // Clear cart (checkout)
      window.clearCart = function () {
        setCart([]);
        safeLog("Cart cleared.");
      };

      // Extract product info from button
      function extractProductInfo(btn) {
        const card = btn.closest(".product-card") || btn.closest(".product-page") || btn.closest(".product-detail") || document;
        const pickText = (selectors) => {
          for (const sel of selectors) {
            const el = card.querySelector ? card.querySelector(sel) : null;
            if (el) return el.tagName === "IMG" ? el.alt || el.src || "" : (el.textContent || "").trim();
          }
          return "";
        };
        const id = btn.dataset.id || card.dataset.id || card.querySelector("a")?.getAttribute("href") || pickText(["h1", "h2", "h3", ".product-title"]) || `prod-${Date.now()}`;
        const name = btn.dataset.name || pickText(["h1", ".product-title", "h2", "h3"]) || "Unnamed";
        const rawPrice = btn.dataset.price || card.dataset.price || card.querySelector(".price")?.textContent || card.querySelector(".product-price")?.textContent || "0";
        const price = parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) || 0;
        const image = btn.dataset.image || card.querySelector("img")?.src || card.querySelector(".main-media img")?.src || "";
        return { id: String(id), name: String(name), price, image };
      }

      // Handle add-to-cart clicks (delegated)
      document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-add");
        if (!btn) return;
        try {
          const product = extractProductInfo(btn);
          addToCart(product);
        } catch (err) {
          safeErr("Add to cart error:", err);
        }
      });

      /* -------------------- NAVBAR CART COUNT -------------------- */
      const cartCountEl = document.getElementById("cartCount");
      function updateCartCount() {
        if (!cartCountEl) return;
        const total = getCart().reduce((sum, item) => sum + item.qty, 0);
        cartCountEl.textContent = total;
        cartCountEl.classList.add("cart-updated");
        setTimeout(() => cartCountEl.classList.remove("cart-updated"), 300);
      }

      // Initial count
      updateCartCount();

      // Update on cart changes
      window.addEventListener("cartUpdated", updateCartCount);

      // Update if cart changes in another tab
      window.addEventListener("storage", (e) => {
        if (e.key === cartKey) updateCartCount();
      });

    } catch (err) {
      safeErr("Cart initialization error:", err);
    }

    /* -------------------- WISHLIST -------------------- */
    try {
      let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

      document.addEventListener("click", (e) => {
        const icon = e.target.closest(".wishlist-icon");
        if (!icon) return;
        const card = icon.closest(".product-card");
        if (!card) return;
        const productId = card.dataset.id;

        wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const exists = wishlist.some(item => item.id === productId);

        if (exists) {
          wishlist = wishlist.filter(item => item.id !== productId);
          icon.classList.remove("active");
        } else {
          const name = card.querySelector("h3")?.textContent || "Unnamed";
          const price = card.querySelector("p")?.textContent || "";
          const image = card.querySelector("img")?.src || "";
          wishlist.push({ id: productId, name, price, image });
          icon.classList.add("active");
        }

        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        window.dispatchEvent(new Event("wishlistUpdated"));
        safeLog("Wishlist updated", wishlist);
      });

      // mark active icons on load
      document.querySelectorAll(".product-card").forEach(card => {
        const id = card.dataset.id;
        if (wishlist.some(item => item.id === id)) card.querySelector(".wishlist-icon")?.classList.add("active");
      });
    } catch (err) {
      safeErr("Wishlist error:", err);
    }

    /* -------------------- RECENTLY VIEWED -------------------- */
    try {
      document.querySelectorAll(".product-card a").forEach(link => {
        link.addEventListener("click", () => {
          const name = link.querySelector("h3")?.textContent || "Unknown Product";
          let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
          viewed = viewed.filter(item => item !== name);
          viewed.unshift(name);
          if (viewed.length > 5) viewed.pop();
          localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
        });
      });
    } catch (err) {
      safeErr("RecentlyViewed error:", err);
    }

    /* -------------------- CHECKOUT FORM -------------------- */
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (typeof clearCart === "function") clearCart();
        alert("Order placed! Thank you for your purchase.");
        // Optional redirect: window.location.href = "thank-you.html";
      });
    }

    safeLog("shop.js fully initialized.");
  });
})();
