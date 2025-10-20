// Only handles mobile submenu click toggling
document.addEventListener("DOMContentLoaded", () => {
  const submenus = Array.from(document.querySelectorAll(".has-submenu"));

  submenus.forEach(item => {
    const link = item.querySelector(":scope > a");
    if (!link) return;

    link.addEventListener("click", e => {
      if (window.innerWidth <= 768) {
        e.preventDefault(); // prevent navigating

        // Toggle only this submenu
        item.classList.toggle("open");

        // Optional: close other submenus if you want only one open at a time
        submenus.forEach(s => {
          if (s !== item) s.classList.remove("open");
        });
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const submenus = Array.from(document.querySelectorAll(".has-submenu"));

  submenus.forEach(item => {
    const link = item.querySelector(":scope > a");
    if (!link) return;

    link.addEventListener("click", e => {
      if (window.innerWidth <= 768) {
        e.preventDefault(); // prevent link navigation

        // Toggle this submenu
        const isOpen = item.classList.toggle("open");

        // Close other submenus if desired (optional)
        submenus.forEach(s => {
          if (s !== item) s.classList.remove("open");
        });

        // Ensure submenu display is handled via CSS
        const submenu = item.querySelector(":scope > .submenu");
        if (submenu) {
          submenu.style.display = isOpen ? "flex" : "none";
        }
      }
    });
  });
});
