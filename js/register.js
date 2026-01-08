document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm || registerForm.dataset.bound === "true") return;

  registerForm.dataset.bound = "true"; // 👈 prevents double binding

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("registerName")?.value.trim();
    const email = document.getElementById("registerEmail")?.value.trim();
    const password = document.getElementById("registerPassword")?.value.trim();

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some(u => u.email === email)) {
      alert("This email is already registered.");
      return;
    }

    const newUser = {
      name,
      email,
      password,
      addresses: [],
      orders: []
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    alert("Account created successfully!");
    window.location.href = "account.html";
  });
});
