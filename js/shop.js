// shop.js - single self-contained file with defensive checks + logs
(function () {
  try {
    console.log("shop.js starting...");

    // Wait for DOM ready
    document.addEventListener("DOMContentLoaded", () => {
      console.log("DOM ready - initializing shop.js");

      // Basic guards
      const products = Array.from(document.querySelectorAll(".product-card"));
      if (!products.length) console.warn("No .product-card elements found.");

      /* -------------------- CART -------------------- */
      try {
        if (!localStorage.getItem("cart")) localStorage.setItem("cart", JSON.stringify([]));
        products.forEach(product => {
          const addBtn = product.querySelector(".btn-add");
          if (!addBtn) return;
          addBtn.addEventListener("click", () => {
            try {
              const id = product.querySelector("a")?.getAttribute("href") || product.dataset.id || product.querySelector("h3")?.textContent;
              const name = product.querySelector("h3")?.textContent || "Unnamed";
              const priceText = product.querySelector("p")?.textContent || "R0";
              const price = parseFloat(priceText.replace(/[^0-9.-]+/g, "")) || 0;
              const image = product.querySelector("img")?.src || "";

              let cart = JSON.parse(localStorage.getItem("cart") || "[]");
              const existing = cart.find(item => item.id === id);
              if (existing) existing.qty += 1;
              else cart.push({ id, name, price, qty: 1, image });

              localStorage.setItem("cart", JSON.stringify(cart));
              console.log("Added to cart:", name, "Cart now:", cart);
              // avoid alert spam in dev; uncomment if you want:
              // alert(`${name} added to cart!`);
            } catch (err) {
              console.error("Error adding to cart:", err);
            }
          });
        });
      } catch (err) {
        console.error("Cart init error:", err);
      }

      /* -------------------- CATEGORY + DROPDOWN (NEW CLEAN VERSION) -------------------- */
      /* ====== Sidebar filtering (delegation) ====== */
(function () {
  try {
    const sidebar = document.querySelector('.sidebar');
    const productGrid = document.querySelector('.product-grid');
    const productCards = Array.from(document.querySelectorAll('.product-card'));

    if (!sidebar) throw new Error('Sidebar element not found.');
    if (!productGrid) throw new Error('Product grid not found.');

    // Utility: show/hide cards by category string or array
    function filterProducts(category) {
      productCards.forEach(card => {
        const cardCat = card.dataset.category || '';
        if (category === 'all') {
          card.style.display = '';
        } else if (Array.isArray(category)) {
          card.style.display = category.includes(cardCat) ? '' : 'none';
        } else {
          card.style.display = (cardCat === category) ? '' : 'none';
        }
      });
    }

    function clearActive() {
      sidebar.querySelectorAll('li').forEach(li => li.classList.remove('active'));
    }

    function closeOtherDropdowns(keep = null) {
      sidebar.querySelectorAll('.has-dropdown').forEach(d => {
        if (d !== keep) d.classList.remove('open');
      });
    }

    // Helper: return array of child category names for a parent li.has-dropdown
    function getChildCategories(parentLi) {
      return Array.from(parentLi.querySelectorAll('.dropdown li[data-category]'))
        .map(li => li.dataset.category)
        .filter(Boolean);
    }

    // Delegated click listener
    sidebar.addEventListener('click', function (e) {
      const clickedLi = e.target.closest('li[data-category]');
      if (!clickedLi) return; // clicked outside category items

      e.stopPropagation();

      // Is the clicked li a subcategory inside a dropdown?
      const insideDropdown = !!clickedLi.closest('.dropdown');

      if (insideDropdown) {
        // Subcategory clicked (e.g. gaming-laptops)
        const cat = clickedLi.dataset.category;
        clearActive();
        clickedLi.classList.add('active');

        const parent = clickedLi.closest('.has-dropdown');
        if (parent) {
          parent.classList.add('open');       // ensure parent dropdown is open
          parent.classList.add('active');     // show context
          closeOtherDropdowns(parent);
        } else {
          closeOtherDropdowns(null);
        }

        filterProducts(cat);
        return;
      }

      // Not inside a dropdown -> could be parent has-dropdown OR top-level item like "All" or "Monitors"
      if (clickedLi.classList.contains('has-dropdown')) {
        // Parent label/caret clicked (e.g. Laptops, Chairs, Accessories)
        const parent = clickedLi;
        const childCats = getChildCategories(parent);

        // Toggle open state for this parent and close others
        const isOpen = parent.classList.toggle('open');
        clearActive();
        parent.classList.add('active');
        closeOtherDropdowns(parent);

        // When parent clicked, show ALL its child categories (if any)
        if (childCats.length) {
          filterProducts(childCats);
        } else {
          // fallback: if parent has no children, filter by parent's own category
          filterProducts(parent.dataset.category || 'all');
        }
        return;
      }

      // Otherwise it's a plain top-level category item (e.g. All, Monitors)
      const cat = clickedLi.dataset.category;
      clearActive();
      clickedLi.classList.add('active');
      closeOtherDropdowns(null);

      if (cat === 'all') {
        filterProducts('all');
      } else {
        // top-level category (monitors etc.)
        filterProducts(cat);
      }
    });

    // INITIAL: respect .active if present, otherwise show all
    const initial = sidebar.querySelector('li.active')?.dataset?.category || 'all';

    if (initial === 'all') filterProducts('all');
    else {
      // If initial selection is a parent that has children, show children
      const initialLi = sidebar.querySelector(`li[data-category="${initial}"]`);
      if (initialLi?.classList.contains('has-dropdown')) {
        const childCats = getChildCategories(initialLi);
        if (childCats.length) filterProducts(childCats);
        else filterProducts(initial);
      } else {
        filterProducts(initial);
      }
    }

  } catch (err) {
    console.error('Sidebar filter error:', err);
  }
})();





      /* -------------------- WISHLIST -------------------- */
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
            const productName = card.querySelector("h3")?.textContent || "Unnamed";
            const productPrice = card.querySelector("p")?.textContent || "R0";
            const productImage = card.querySelector("img")?.src || "";

            wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
            const exists = wishlist.some(item => item.id === productId);
            if (exists) {
              wishlist = wishlist.filter(item => item.id !== productId);
              icon.classList.remove("active");
            } else {
              wishlist.push({ id: productId, name: productName, price: productPrice, image: productImage });
              icon.classList.add("active");
            }
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
            window.dispatchEvent(new Event("wishlistUpdated"));
            console.log("Wishlist now:", wishlist);
          });
        });
      } catch (err) {
        console.error("Wishlist error:", err);
      }

      /* -------------------- RECENTLY VIEWED -------------------- */
      try {
        const links = Array.from(document.querySelectorAll(".product-card a"));
        links.forEach(link => {
          link.addEventListener("click", () => {
            const productName = link.querySelector("h3")?.textContent || "Unknown Product";
            let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
            viewed = viewed.filter(item => item !== productName);
            viewed.unshift(productName);
            if (viewed.length > 5) viewed.pop();
            localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
          });
        });
      } catch (err) {
        console.error("RecentlyViewed error:", err);
      }

      console.log("shop.js initialisation complete.");
    });
  } catch (err) {
    console.error("shop.js top-level error:", err);
  }
})();
