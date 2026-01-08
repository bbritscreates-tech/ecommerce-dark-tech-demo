document.addEventListener("DOMContentLoaded", () => {
  // Tabs
  const tabButtons = document.querySelectorAll(".account-tab-btn");
  const tabContents = document.querySelectorAll(".account-tab-content");

  function showTab(tabId) {
    tabContents.forEach((content) => {
      content.classList.remove("active");
      content.style.display = "none";
    });
    tabButtons.forEach((btn) => btn.classList.remove("active"));

    const activeContent = document.getElementById(tabId);
    if (activeContent) {
      activeContent.classList.add("active");
      activeContent.style.display = "block";
    }

    const activeBtn = Array.from(tabButtons).find(
      (btn) => btn.dataset.tab === tabId
    );
    if (activeBtn) activeBtn.classList.add("active");
  }

  // Default to Profile tab
  showTab("profileTab");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      showTab(btn.dataset.tab);
    });
  });

  // ===== User Data =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  const accountName = document.getElementById("accountName");
  const accountEmail = document.getElementById("accountEmail");

  if (currentUser) {
    if (accountName) accountName.value = currentUser.name || "";
    if (accountEmail) accountEmail.value = currentUser.email || "";
  } else {
    // No user logged in
    alert("Please log in first!");
    window.location.href = "login.html";
  }

  // ===== Update Profile =====
  const updateAccountBtn = document.getElementById("updateAccountBtn");
  if (updateAccountBtn) {
    updateAccountBtn.addEventListener("click", () => {
      if (!currentUser) return;
      const newName = accountName.value.trim();
      const newEmail = accountEmail.value.trim();

      if (!newName || !newEmail) {
        alert("Name and Email cannot be empty.");
        return;
      }

      currentUser.name = newName;
      currentUser.email = newEmail;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      alert("Profile updated successfully!");
    });
  }

  // ===== Change Password =====
  const oldPassword = document.getElementById("oldPassword");
  const newPassword = document.getElementById("newPassword");
  const changePasswordBtn = document.getElementById("changePasswordBtn");

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      if (!currentUser) return;

      if (!oldPassword.value || !newPassword.value) {
        alert("Please fill in both password fields.");
        return;
      }

      if (oldPassword.value !== currentUser.password) {
        alert("Old password is incorrect.");
        return;
      }

      currentUser.password = newPassword.value;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      alert("Password changed successfully!");
      oldPassword.value = "";
      newPassword.value = "";
    });
  }

  // ===== Logout =====
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      alert("Logged out successfully!");
      window.location.href = "login.html";
    });
  }

  // ===== Delete Account =====
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", () => {
      if (!currentUser) return;

      if (confirm("Are you sure you want to delete your account?")) {
        // Remove user from users list
        let users = JSON.parse(localStorage.getItem("users")) || [];
        users = users.filter((u) => u.email !== currentUser.email);
        localStorage.setItem("users", JSON.stringify(users));

        // Remove current user
        localStorage.removeItem("currentUser");
        alert("Account deleted successfully!");
        window.location.href = "register.html";
      }
    });
  }

  // ===== Addresses =====
  const addressSelect = document.getElementById("addressSelect");
  const newAddress = document.getElementById("newAddress");
  const addAddressBtn = document.getElementById("addAddressBtn");

  function loadAddresses() {
    if (!currentUser || !addressSelect) return;
    addressSelect.innerHTML =
      '<option value="" disabled selected>Select an address</option>';

    const addresses = currentUser.addresses || [];
    addresses.forEach((addr, index) => {
      const opt = document.createElement("option");
      opt.value = addr;
      opt.textContent = addr;
      addressSelect.appendChild(opt);
    });
  }

  if (addAddressBtn) {
    addAddressBtn.addEventListener("click", () => {
      if (!currentUser || !newAddress.value.trim()) return;
      currentUser.addresses = currentUser.addresses || [];
      currentUser.addresses.push(newAddress.value.trim());
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      newAddress.value = "";
      loadAddresses();
      alert("Address added!");
    });
  }

  loadAddresses();
});
