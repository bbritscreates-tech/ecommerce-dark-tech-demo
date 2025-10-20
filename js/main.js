document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const icon = menuToggle.querySelector("i"); // the icon inside

  // Toggle menu on click
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent immediate closing
    navLinks.classList.toggle("active");

     // Swap icon
    if (navLinks.classList.contains("active")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-xmark"); // X icon
    } else {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars"); // Hamburger icon
    }
  });

  // Close menu if clicked outside
  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      navLinks.classList.remove("active");
    }
  });

  // Optional: Close menu on resize
  window.addEventListener("resize", () => {
    navLinks.classList.remove("active");
  });
});
