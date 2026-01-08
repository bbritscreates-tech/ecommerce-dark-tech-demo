// shop.js - full version with cart + wishlist integration
(function () {
  try {
    console.log("shop.js starting...");

    document.addEventListener("DOMContentLoaded", () => {
      console.log("DOM ready - initializing shop.js");

      /* ==================== CART HELPERS ==================== */
      const cartKey = "cart";
      const wishlistKey = "wishlist";

      function getCart() {
        try {
          return JSON.parse(localStorage.getItem(cartKey)) || [];
        } catch {
          return [];
        }
      }

      function saveCart(cart) {
        localStorage.setItem(cartKey, JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
      }

      function getWishlist() {
        try {
          return JSON.parse(localStorage.getItem(wishlistKey)) || [];
        } catch {
          return [];
        }
      }

      function saveWishlist(list) {
        localStorage.setItem(wishlistKey, JSON.stringify(list));
        window.dispatchEvent(new Event("wishlistUpdated"));
      }

      if (!localStorage.getItem(cartKey)) localStorage.setItem(cartKey, "[]");
      if (!localStorage.getItem(wishlistKey)) localStorage.setItem(wishlistKey, "[]");

      /* ==================== PRODUCTS ==================== */
      const productCards = Array.from(document.querySelectorAll(".product-card"));
      productCards.forEach(card => {
        card.dataset.catVisible = "true";
        card.dataset.filterVisible = "true";
      });

      function updateVisibility(card) {
        const catOk = card.dataset.catVisible !== "false";
        const filterOk = card.dataset.filterVisible !== "false";
        card.style.display = catOk && filterOk ? "" : "none";
      }

      /* ==================== ADD TO CART ==================== */
      productCards.forEach(product => {
        const btn = product.querySelector(".btn-add");
        if (!btn) return;

        btn.addEventListener("click", () => {
          try {
            const id = product.dataset.id || product.querySelector("h3")?.textContent || "unknown";
            const name = product.querySelector("h3")?.textContent || "Unnamed";
            const price = parseFloat((product.dataset.price || "0").replace(/[^0-9.-]+/g, "")) || 0;
            const image = product.querySelector("img")?.src || "";

            const cart = getCart();
            const existing = cart.find(i => i.id === id);
            if (existing) existing.qty += 1;
            else cart.push({ id, name, price, qty: 1, image });

            saveCart(cart);
            console.log("Added to cart:", name);
          } catch (err) {
            console.error("Add to cart error:", err);
          }
        });
      });

      /* ==================== ADD TO WISHLIST ==================== */
      productCards.forEach(product => {
        // Convert existing heart icons to buttons
        let heart = product.querySelector(".wishlist-icon");
        if (heart) {
          const wishlistBtn = document.createElement("button");
          wishlistBtn.className = "btn-wishlist";
          wishlistBtn.innerHTML = "♡ Wishlist";
          heart.replaceWith(wishlistBtn);

          wishlistBtn.addEventListener("click", () => {
            const id = product.dataset.id || product.querySelector("h3")?.textContent || "unknown";
            const name = product.querySelector("h3")?.textContent || "Unnamed";
            const price = parseFloat((product.dataset.price || "0").replace(/[^0-9.-]+/g, "")) || 0;
            const image = product.querySelector("img")?.src || "";

            const wishlist = getWishlist();
            const existing = wishlist.find(i => i.id === id);

            if (existing) {
              // remove if already in wishlist
              const newList = wishlist.filter(i => i.id !== id);
              saveWishlist(newList);
              wishlistBtn.innerHTML = "♡ Wishlist";
              wishlistBtn.classList.remove("added");
            } else {
              wishlist.push({ id, name, price, image });
              saveWishlist(wishlist);
              wishlistBtn.innerHTML = "♥ Wishlisted";
              wishlistBtn.classList.add("added");
            }
          });
        }
      });

      /* ==================== SIDEBAR CATEGORY FILTER ==================== */
      (function () {
        try {
          const sidebar = document.querySelector(".sidebar");
          if (!sidebar) return;

          function filterProducts(category) {
            productCards.forEach(card => {
              const cardCat = card.dataset.category || "";
              if (category === "all") card.dataset.catVisible = "true";
              else if (Array.isArray(category)) card.dataset.catVisible = category.includes(cardCat) ? "true" : "false";
              else card.dataset.catVisible = cardCat === category ? "true" : "false";
              updateVisibility(card);
            });
          }

          function clearActive() {
            sidebar.querySelectorAll("li").forEach(li => li.classList.remove("active"));
          }

          function closeOthers(keep) {
            sidebar.querySelectorAll(".has-dropdown").forEach(li => {
              if (li !== keep) li.classList.remove("open");
            });
          }

          function getChildCats(parent) {
            return Array.from(parent.querySelectorAll(".dropdown li[data-category]"))
              .map(li => li.dataset.category)
              .filter(Boolean);
          }

          sidebar.addEventListener("click", e => {
            const li = e.target.closest("li[data-category]");
            if (!li) return;

            const insideDropdown = !!li.closest(".dropdown");

            if (insideDropdown) {
              clearActive();
              li.classList.add("active");
              const parent = li.closest(".has-dropdown");
              parent?.classList.add("open", "active");
              closeOthers(parent);
              filterProducts(li.dataset.category);
              return;
            }

            if (li.classList.contains("has-dropdown")) {
              li.classList.toggle("open");
              clearActive();
              li.classList.add("active");
              closeOthers(li);
              const children = getChildCats(li);
              filterProducts(children.length ? children : li.dataset.category);
              return;
            }

            clearActive();
            li.classList.add("active");
            closeOthers(null);
            filterProducts(li.dataset.category || "all");
          });

          filterProducts("all");

        } catch (err) {
          console.error("Sidebar filter error:", err);
        }
      })();

      /* ==================== PRICE / BRAND / SCREEN FILTERS ==================== */
      try {
        const applyBtn = document.getElementById("applyFilters");
        const minPrice = document.getElementById("minPrice");
        const maxPrice = document.getElementById("maxPrice");
        const brandFilter = document.getElementById("brandFilter");
        const screenFilter = document.getElementById("screenFilter");

        function applyFilters() {
          const min = parseFloat(minPrice?.value) || 0;
          const max = parseFloat(maxPrice?.value) || Infinity;
          const brand = brandFilter?.value || "";
          const screen = screenFilter?.value || "";

          productCards.forEach(card => {
            const price = parseFloat(card.dataset.price) || 0;
            const cardBrand = card.dataset.brand || "";
            const cardScreen = card.dataset.screen || "";

            let show = true;
            if (price < min || price > max) show = false;
            if (brand && brand !== cardBrand) show = false;
            if (screen && screen !== cardScreen) show = false;

            card.dataset.filterVisible = show ? "true" : "false";
            updateVisibility(card);
          });
        }

        applyBtn?.addEventListener("click", applyFilters);
      } catch (err) {
        console.error("Filter error:", err);
      }

      /* ==================== FILTER PANEL TOGGLE ==================== */
      try {
        const toggle = document.getElementById("filterToggle");
        const panel = document.getElementById("filterPanel");

        if (toggle && panel) {
          toggle.addEventListener("click", e => {
            e.stopPropagation();
            panel.style.display = panel.style.display === "block" ? "none" : "block";
          });

          document.addEventListener("click", e => {
            if (!panel.contains(e.target) && e.target !== toggle) {
              panel.style.display = "none";
            }
          });
        }
      } catch (err) {
        console.error("Filter panel toggle error:", err);
      }

      /* ==================== NAVBAR CART COUNT ==================== */
      try {
        const cartCountEl = document.getElementById("cartCount");

        function updateCartCount() {
          if (!cartCountEl) return;
          const total = getCart().reduce((s, i) => s + (i.qty || 0), 0);
          cartCountEl.textContent = total;
          cartCountEl.classList.add("cart-updated");
          setTimeout(() => cartCountEl.classList.remove("cart-updated"), 300);
        }

        updateCartCount();
        window.addEventListener("cartUpdated", updateCartCount);
        window.addEventListener("storage", e => {
          if (e.key === cartKey) updateCartCount();
        });

      } catch (err) {
        console.error("Navbar cart error:", err);
      }

      console.log("shop.js initialisation complete.");
    });

  } catch (err) {
    console.error("shop.js top-level error:", err);
  }
})();

