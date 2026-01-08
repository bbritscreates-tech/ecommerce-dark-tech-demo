// ================= MENU / SUBMENU =================
const menuBtn = document.getElementById('menu-btn');
const dropdown = document.getElementById('dropdown-menu');
const overlay = document.getElementById('overlay');
const menuItems = document.querySelectorAll('.menu-item');
const submenus = document.querySelectorAll('.submenu');
const submenuContainer = document.querySelector('.submenu-container');
const icon = menuBtn.querySelector('i');

let hideTimer = null;
const HIDE_DELAY = 200;
const GAP_FROM_EDGE = 20;

function clampWidth(w) {
  const maxAllowed = Math.max(200, window.innerWidth - GAP_FROM_EDGE * 2);
  return Math.min(Math.ceil(w), maxAllowed);
}

function measureIntrinsicWidth(el) {
  const clone = el.cloneNode(true);
  const style = clone.style;
  style.position = 'absolute';
  style.left = '-99999px';
  style.top = '-99999px';
  style.width = 'auto';
  style.maxWidth = 'none';
  style.visibility = 'hidden';
  style.display = 'block';
  const gridChildren = clone.querySelectorAll('.submenu-grid, .submenu-card');
  gridChildren.forEach(n => n.style.width = 'auto');
  document.body.appendChild(clone);
  const measured = clone.getBoundingClientRect().width;
  document.body.removeChild(clone);
  return measured;
}

function openMainMenu() {
  dropdown.classList.add('active');
  overlay.style.display = 'block';
  icon.classList.remove('fa-bars');
  icon.classList.add('fa-xmark');
}

function closeAll() {
  dropdown.classList.remove('active');
  submenuContainer.classList.remove('active');
  submenus.forEach(s => s.classList.remove('active'));
  overlay.style.display = 'none';
  submenuContainer.style.width = '';
  icon.classList.remove('fa-xmark');
  icon.classList.add('fa-bars');
}

menuBtn.addEventListener('click', () => {
  if (dropdown.classList.contains('active')) closeAll();
  else openMainMenu();
});

overlay.addEventListener('click', closeAll);

menuItems.forEach(item => {
  item.addEventListener('pointerenter', () => {
    clearTimeout(hideTimer);
    const targetId = item.dataset.sub;
    const target = document.getElementById(targetId);
    if (!target) return;

    submenus.forEach(s => s.classList.remove('active'));
    target.classList.add('active');
    submenuContainer.classList.add('active');

    requestAnimationFrame(() => {
      let measuredWidth = measureIntrinsicWidth(target);
      const comp = window.getComputedStyle(submenuContainer);
      measuredWidth += (parseFloat(comp.paddingLeft) || 0) + (parseFloat(comp.paddingRight) || 0);
      submenuContainer.style.width = clampWidth(measuredWidth) + 'px';
    });
  });
});

[dropdown, submenuContainer].forEach(el => el.addEventListener('pointerenter', () => clearTimeout(hideTimer)));

document.addEventListener('pointermove', e => {
  const insideDropdown = !!e.target.closest && e.target.closest('#dropdown-menu');
  const insideSubmenu = !!e.target.closest && e.target.closest('.submenu-container');
  if (insideDropdown || insideSubmenu) return;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    submenuContainer.classList.remove('active');
    submenus.forEach(s => s.classList.remove('active'));
    submenuContainer.style.width = '';
  }, HIDE_DELAY);
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

window.addEventListener('resize', () => {
  const active = document.querySelector('.submenu.active');
  if (!active) return;
  requestAnimationFrame(() => {
    let w = measureIntrinsicWidth(active);
    const comp = window.getComputedStyle(submenuContainer);
    w += (parseFloat(comp.paddingLeft) || 0) + (parseFloat(comp.paddingRight) || 0);
    submenuContainer.style.width = clampWidth(w) + 'px';
  });
});

// ================= ACCOUNT / DASHBOARD / TABS =================
document.addEventListener('DOMContentLoaded', () => {
  const accountLink = document.getElementById('accountLink');
  const cartCountEl = document.getElementById('cartCount');

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  // Account link behavior
  if (accountLink) {
    accountLink.addEventListener('click', e => {
      e.preventDefault();
      if (loggedInUser) window.location.href = 'account.html';
      else window.location.href = 'login.html';
    });
    if (loggedInUser) accountLink.title = `Logged in as ${loggedInUser.firstName}`;
  }

  // Update cart count
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartCountEl) cartCountEl.textContent = cart.length;
  }
  updateCartCount();

  // Wishlist rendering
  function renderWishlist() {
    const wishlistContainer = document.getElementById("wishlistContainer");
    if (!wishlistContainer) return;
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    if (wishlist.length === 0) {
      wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
      return;
    }
    wishlistContainer.innerHTML = wishlist.map(item => `
      <div class="wishlist-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="wishlist-info">
          <h4>${item.name}</h4>
          <p>R${item.price}</p>
          <button class="remove-wishlist" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `).join("");
    document.querySelectorAll(".remove-wishlist").forEach(btn => {
      btn.addEventListener("click", () => {
        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        wishlist = wishlist.filter(i => i.id !== btn.dataset.id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        renderWishlist();
      });
    });
  }
  renderWishlist();
  window.addEventListener("wishlistUpdated", renderWishlist);

  // Dashboard tabs
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loggedInUser) {
    const dashboardBox = document.getElementById('dashboardBox');
    const userNameSpan = document.getElementById('userName');
    if (dashboardBox) dashboardBox.classList.remove('hidden');
    if (userNameSpan) userNameSpan.textContent = `${loggedInUser.firstName} ${loggedInUser.lastName}`;

    // Orders
    const ordersList = document.getElementById('ordersList');
    if (ordersList) {
      if (!loggedInUser.orders || loggedInUser.orders.length === 0) {
        ordersList.innerHTML = '<li>No orders yet.</li>';
      } else {
        ordersList.innerHTML = '';
        loggedInUser.orders.forEach(order => {
          const li = document.createElement('li');
          li.textContent = `${order.date} — ${order.items} (R${order.total})`;
          ordersList.appendChild(li);
        });
      }
    }

    // Addresses
    const addressList = document.getElementById('addressList');
    if (addressList) {
      if (!loggedInUser.addresses || loggedInUser.addresses.length === 0) {
        addressList.innerHTML = '<li>No saved addresses yet.</li>';
      } else {
        addressList.innerHTML = '';
        loggedInUser.addresses.forEach(a => {
          const li = document.createElement('li');
          li.textContent = a;
          addressList.appendChild(li);
        });
      }
    }
  }

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabContents.forEach(c => c.classList.add('hidden'));
      const content = document.getElementById(`${tab.dataset.tab}Tab`);
      if (content) content.classList.remove('hidden');
    });
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('loggedInUser');
      alert('Logged out successfully');
      window.location.href = 'login.html';
    });
  }
});
