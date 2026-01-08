document.addEventListener('DOMContentLoaded', () => {
  // --- Elements ---
  const userNameSpan = document.getElementById('userName');

  // Profile
  const profileFirst = document.getElementById('profileFirst');
  const profileLast = document.getElementById('profileLast');
  const profileEmail = document.getElementById('profileEmail');
  const profileForm = document.getElementById('profileForm');

  // Orders
  const ordersList = document.getElementById('ordersList');

  // Addresses
  const addressForm = document.getElementById('addressForm');
  const savedAddresses = document.getElementById('savedAddresses');
  const addrName = document.getElementById('addrName');
  const addrStreet = document.getElementById('addrStreet');
  const addrCity = document.getElementById('addrCity');
  const addrPostal = document.getElementById('addrPostal');
  const addrProvince = document.getElementById('addrProvince');

  // Wishlist
  const wishlistContainer = document.getElementById('wishlistContainer');

  // Settings
  const passwordForm = document.getElementById('passwordForm');
  const currentPassword = document.getElementById('currentPassword');
  const newPassword = document.getElementById('newPassword');
  const confirmNewPassword = document.getElementById('confirmNewPassword');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');

  // --- Load logged in user ---
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  if (!loggedInUser) {
    window.location.href = 'login.html';
    return;
  }

  // Display username
  userNameSpan.textContent = loggedInUser.firstName || loggedInUser.name || 'User';

  // --- Populate Profile ---
  profileFirst.value = loggedInUser.firstName || '';
  profileLast.value = loggedInUser.lastName || '';
  profileEmail.value = loggedInUser.email || '';

  // --- Orders ---
  function loadOrders() {
    const orders = loggedInUser.orders || [];
    if (!orders.length) {
      ordersList.innerHTML = '<p>No orders yet.</p>';
      return;
    }
    ordersList.innerHTML = '';
    orders.forEach(o => {
      const div = document.createElement('div');
      div.classList.add('order-item');
      div.innerHTML = `
        <p><strong>Order #${o.id}</strong> — ${o.date}</p>
        <p>Items: ${o.items}</p>
        <p>Total: R${o.total}</p>
      `;
      ordersList.appendChild(div);
    });
  }
  loadOrders();

  // --- Addresses ---
  function loadAddresses() {
    savedAddresses.innerHTML = '';
    const addresses = loggedInUser.addresses || [];
    if (!addresses.length) {
      savedAddresses.innerHTML = '<p>No saved addresses.</p>';
      return;
    }
    addresses.forEach((a, i) => {
      const div = document.createElement('div');
      div.classList.add('address-item');
      div.innerHTML = `
        <p><strong>${a.name}</strong></p>
        <p>${a.street}, ${a.city}, ${a.province}, ${a.postal}</p>
        <button class="remove-address" data-index="${i}">Remove</button>
      `;
      savedAddresses.appendChild(div);
    });

    // Remove address handler
    document.querySelectorAll('.remove-address').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.index;
        loggedInUser.addresses.splice(idx, 1);
        updateUser();
        loadAddresses();
      });
    });
  }
  loadAddresses();

  // --- Wishlist ---
  function loadWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (!wishlist.length) {
      wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
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
    `).join('');

    document.querySelectorAll('.remove-wishlist').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlist = wishlist.filter(item => item.id !== id);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        loadWishlist();
      });
    });
  }
  loadWishlist();

  // --- Profile Update ---
  profileForm?.addEventListener('submit', e => {
    e.preventDefault();
    loggedInUser.firstName = profileFirst.value.trim();
    loggedInUser.lastName = profileLast.value.trim();
    updateUser();
    alert('Profile updated!');
    userNameSpan.textContent = loggedInUser.firstName;
  });

  // --- Add Address ---
  addressForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (!addrName.value || !addrStreet.value || !addrCity.value || !addrPostal.value || !addrProvince.value) {
      alert('Please fill in all address fields.');
      return;
    }
    loggedInUser.addresses = loggedInUser.addresses || [];
    loggedInUser.addresses.push({
      name: addrName.value,
      street: addrStreet.value,
      city: addrCity.value,
      postal: addrPostal.value,
      province: addrProvince.value
    });
    updateUser();
    loadAddresses();
    addressForm.reset();
    alert('Address saved!');
  });

  // --- Change Password ---
  passwordForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (!currentPassword.value || !newPassword.value || !confirmNewPassword.value) return alert('Fill all fields');
    if (currentPassword.value !== loggedInUser.password) return alert('Current password is incorrect');
    if (newPassword.value !== confirmNewPassword.value) return alert('New passwords do not match');

    loggedInUser.password = newPassword.value;
    updateUser();
    passwordForm.reset();
    alert('Password updated!');
  });

  // --- Delete Account ---
  deleteAccountBtn?.addEventListener('click', () => {
    if (!confirm('Are you sure you want to delete your account?')) return;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => u.email !== loggedInUser.email);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('loggedInUser');
    window.location.href = 'register.html';
  });

  // --- Utility: Update localStorage ---
  function updateUser() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const idx = users.findIndex(u => u.email === loggedInUser.email);
    if (idx >= 0) users[idx] = loggedInUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  }

});
