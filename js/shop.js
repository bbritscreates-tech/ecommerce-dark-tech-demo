// shop.js - rewritte/clean version matched to your sidebar structure
(function () {
  "use strict";

  function safeLog(...args) { console.log("[shop.js]", ...args); }
  function safeWarn(...args) { console.warn("[shop.js]", ...args); }
  function safeErr(...args) { console.error("[shop.js]", ...args); }

  document.addEventListener("DOMContentLoaded", () => {
    safeLog("DOM ready - initializing shop.js");

    /* -------------------- ELEMENTS -------------------- */
    const productCards = Array.from(document.querySelectorAll(".product-card"));
    const sidebar = document.querySelector(".sidebar");
    const productGrid = document.querySelector(".product-grid");

    if (!productGrid) safeWarn("No .product-grid found on page.");
    if (!sidebar) safeWarn("No .sidebar found on page.");
    if (!productCards.length) safeWarn("No .product-card elements found.");

    /* -------------------- CART (localStorage) -------------------- */
    try {
      if (!localStorage.getItem("cart")) localStorage.setItem("cart", JSON.stringify([]));
      productCards.forEach(card => {
        const addBtn = card.querySelector(".btn-add");
        if (!addBtn) return;
        addBtn.addEventListener("click", (ev) => {
          try {
            const id = card.dataset.id || card.querySelector("a")?.getAttribute("href") || card.querySelector("h3")?.textContent || `prod-${Date.now()}`;
            const name = card.querySelector("h3")?.textContent || "Unnamed";
            const price = parseFloat((card.dataset.price || "0").toString().replace(/[^0-9.-]+/g, "")) || 0;
            const image = card.querySelector("img")?.src || "";

            let cart = JSON.parse(localStorage.getItem("cart") || "[]");
            const existing = cart.find(i => i.id === id);
            if (existing) existing.qty += 1;
            else cart.push({ id, name, price, qty: 1, image });

            localStorage.setItem("cart", JSON.stringify(cart));
            safeLog("Added to cart:", name, cart);
            // you could update cart UI here if you have one
          } catch (err) {
            safeErr("Error adding to cart:", err);
          }
        });
      });
    } catch (err) {
      safeErr("Cart init error:", err);
    }

    /* -------------------- WISHLIST (localStorage) -------------------- */
    try {
      const wishlistIcons = Array.from(document.querySelectorAll(".wishlist-icon"));
      let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

      wishlistIcons.forEach(icon => {
        const card = icon.closest(".product-card");
        if (!card) return;
        const productId = card.dataset.id;
        if (wishlist.some(item => item.id === productId)) icon.classList.add("active");

        icon.addEventListener("click", (ev) => {
          ev.stopPropagation();
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
      });
    } catch (err) {
      safeErr("Wishlist error:", err);
    }

    /* -------------------- RECENTLY VIEWED -------------------- */
    try {
      const links = Array.from(document.querySelectorAll(".product-card a"));
      links.forEach(link => {
        link.addEventListener("click", () => {
          try {
            const name = link.querySelector("h3")?.textContent || "Unknown Product";
            let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
            viewed = viewed.filter(item => item !== name);
            viewed.unshift(name);
            if (viewed.length > 5) viewed.pop();
            localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
          } catch (err) {
            safeErr("RecentlyViewed handler error:", err);
          }
        });
      });
    } catch (err) {
      safeErr("RecentlyViewed error:", err);
    }

    /* -------------------- SIDEBAR FILTERING (delegated) -------------------- */
    (function setupSidebarFiltering() {
      if (!sidebar) return;

      const allCards = Array.from(document.querySelectorAll(".product-card"));

      function showAll() {
        allCards.forEach(c => (c.style.display = ""));
      }

      function filterByCategory(catOrArray) {
        if (!allCards.length) return;
        if (catOrArray === "all") {
          showAll();
          return;
        }
        if (Array.isArray(catOrArray)) {
          const allowance = catOrArray.map(s => (s || "").toLowerCase());
          allCards.forEach(card => {
            const c = (card.dataset.category || "").toLowerCase();
            card.style.display = allowance.includes(c) ? "" : "none";
          });
          return;
        }
        const wanted = (catOrArray || "").toLowerCase();
        allCards.forEach(card => {
          const c = (card.dataset.category || "").toLowerCase();
          card.style.display = c === wanted ? "" : "none";
        });
      }

      function clearActive() {
        sidebar.querySelectorAll("li").forEach(li => li.classList.remove("active"));
      }

      function closeOtherDropdowns(keep = null) {
        sidebar.querySelectorAll(".has-dropdown").forEach(d => {
          if (d !== keep) d.classList.remove("open");
        });
      }

      function getChildCategories(parentLi) {
        if (!parentLi) return [];
        return Array.from(parentLi.querySelectorAll(".dropdown li[data-category]"))
          .map(li => li.dataset.category)
          .filter(Boolean);
      }

      // Delegated click handler
      sidebar.addEventListener("click", function (e) {
        const clicked = e.target.closest("li[data-category]");
        if (!clicked) return;

        const insideDropdown = !!clicked.closest(".dropdown");

        if (insideDropdown) {
          // subcategory clicked
          const cat = clicked.dataset.category;
          clearActive();
          clicked.classList.add("active");

          const parent = clicked.closest(".has-dropdown");
          if (parent) {
            parent.classList.add("open", "active");
            closeOtherDropdowns(parent);
          } else {
            closeOtherDropdowns(null);
          }
          filterByCategory(cat);
          return;
        }

        // parent or top-level clicked
        if (clicked.classList.contains("has-dropdown")) {
          const parent = clicked;
          const childCats = getChildCategories(parent);

          const isNowOpen = parent.classList.toggle("open");
          clearActive();
          parent.classList.add("active");
          closeOtherDropdowns(parent);

          if (childCats.length) {
            filterByCategory(childCats);
          } else {
            filterByCategory(parent.dataset.category || "all");
          }
          return;
        }

        // plain top-level (e.g. All, Monitors)
        const cat = clicked.dataset.category;
        clearActive();
        clicked.classList.add("active");
        closeOtherDropdowns(null);

        if (cat === "all") filterByCategory("all");
        else filterByCategory(cat);
      });

      // INITIAL: respect .active if present
      const initial = sidebar.querySelector("li.active")?.dataset?.category || "all";
      if (initial === "all") filterByCategory("all");
      else {
        const initialLi = sidebar.querySelector(`li[data-category="${initial}"]`);
        if (initialLi?.classList.contains("has-dropdown")) {
          const children = getChildCategories(initialLi);
          if (children.length) filterByCategory(children);
          else filterByCategory(initial);
        } else filterByCategory(initial);
      }

      safeLog("Sidebar filtering initialized.");
    })();

    /* -------------------- FILTER PANEL TOGGLE + APPLY FILTERS -------------------- */
    (function setupFilterPanelAndFilters() {
      const filterToggle = document.getElementById("filterToggle");
      const filterPanel = document.getElementById("filterPanel");
      const applyBtn = document.getElementById("applyFilters");
      const minPriceInput = document.getElementById("minPrice");
      const maxPriceInput = document.getElementById("maxPrice");
      const brandFilter = document.getElementById("brandFilter");
      const screenFilter = document.getElementById("screenFilter");

      // safe fallback selectors
      const allCards = Array.from(document.querySelectorAll(".product-card"));

      // Toggle panel
      try {
        if (filterToggle && filterPanel) {
          filterToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            // toggle display (use block to show)
            filterPanel.style.display = (filterPanel.style.display === "block") ? "none" : "block";
          });

          // click outside closes
          document.addEventListener("click", (e) => {
            if (filterPanel.style.display === "block" && !filterPanel.contains(e.target) && e.target !== filterToggle) {
              filterPanel.style.display = "none";
            }
          });
        }
      } catch (err) {
        safeErr("Filter panel toggle error:", err);
      }

      // Apply filter function
      function applyFilters() {
        try {
          const min = parseFloat(minPriceInput?.value) || 0;
          const max = parseFloat(maxPriceInput?.value);
          const maxVal = (isNaN(max) || max === 0) ? Infinity : max;
          const brand = (brandFilter?.value || "").trim();
          const screen = (screenFilter?.value || "").trim();

          allCards.forEach(card => {
            const price = parseFloat(card.dataset.price || "0") || 0;
            const cardBrand = (card.dataset.brand || "").trim();
            const cardScreen = (card.dataset.screen || "").trim();

            let show = true;
            if (price < min || price > maxVal) show = false;
            if (brand && brand !== "" && brand !== cardBrand) show = false;
            if (screen && screen !== "" && screen !== cardScreen) show = false;

            card.style.display = show ? "" : "none";
          });

          safeLog("Filters applied", { min, maxVal, brand, screen });
        } catch (err) {
          safeErr("applyFilters error:", err);
        }
      }

      // hook up apply button
      if (applyBtn) applyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        applyFilters();
      });

      safeLog("Filter panel and controls initialized.");
    })();

    /* -------------------- URL category support (robust) -------------------- */
    (function applyCategoryFromURL() {
      try {
        const params = new URLSearchParams(window.location.search);
        const requested = params.get("category");
        if (!requested) {
          safeLog("No category query param present.");
          return;
        }
        safeLog("Category param detected:", requested);

        // 1) try to find exact data-category match
        let target = document.querySelector(`.sidebar li[data-category="${requested}"]`);

        // 2) try to find case-insensitive or text match fallback
        if (!target) {
          const lower = requested.toLowerCase();
          const candidates = Array.from(document.querySelectorAll(".sidebar li[data-category]"));
          target = candidates.find(li => {
            const cat = ((li.dataset.category || "") + "").toLowerCase();
            const txt = (li.textContent || "").toLowerCase();
            return cat === lower || txt.includes(lower) || cat.includes(lower);
          });
        }

        if (target) {
          safeLog("Found sidebar item for URL category, simulating click:", target.dataset.category || target.textContent.trim());
          // Ensure parent dropdown is visible if it's a nested child
          const parent = target.closest(".has-dropdown");
          if (parent) parent.classList.add("open", "active");

          // trigger the delegated handler by dispatching a click
          target.click();
          return;
        }

        // 3) fallback: direct filter the product cards by dataset.category (loose match)
        safeWarn("No matching sidebar item for category param. Falling back to direct product filtering.");
        const allCards = Array.from(document.querySelectorAll(".product-card"));
        const wanted = requested.toLowerCase();

        // also try to detect children of a parent sidebar (e.g. ?category=laptops should show normal & gaming)
        let childCats = [];
        const parentLi = document.querySelector(`.sidebar li.has-dropdown[data-category="${requested}"]`);
        if (parentLi) {
          childCats = Array.from(parentLi.querySelectorAll(".dropdown li[data-category]")).map(li => (li.dataset.category || "").toLowerCase());
        }

        allCards.forEach(card => {
          const cardCat = (card.dataset.category || "").toLowerCase();
          const show = cardCat === wanted || cardCat.includes(wanted) || childCats.includes(cardCat);
          card.style.display = show ? "" : "none";
        });

        safeLog("Direct fallback applied for category:", requested, "childCats:", childCats);
      } catch (err) {
        safeErr("applyCategoryFromURL error:", err);
      }
    })();

    safeLog("shop.js initialization complete.");
  });
})();
