const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileDropdown = document.getElementById('mobile-dropdown-menu');
const mobileMenuItems = mobileDropdown.querySelectorAll('.mobile-menu-item');
const mobileIcon = mobileMenuBtn.querySelector('i'); // get the <i> inside your button

// Toggle mobile menu
mobileMenuBtn.addEventListener('click', () => {
  const isActive = mobileDropdown.classList.toggle('active');

  if (isActive) {
    // menu opened → show X
    mobileIcon.classList.remove('fa-bars');
    mobileIcon.classList.add('fa-xmark');
  } else {
    // menu closed → show hamburger
    mobileIcon.classList.remove('fa-xmark');
    mobileIcon.classList.add('fa-bars');
  }
});

// Accordion behavior for submenus
mobileMenuItems.forEach(item => {
  item.addEventListener('click', () => {
    const submenu = item.querySelector('.mobile-submenu');
    if (!submenu) return;

    // Collapse other submenus
    mobileMenuItems.forEach(i => {
      const otherSub = i.querySelector('.mobile-submenu');
      if (otherSub && otherSub !== submenu) {
        otherSub.classList.remove('active');
      }
    });

    // Toggle clicked submenu
    submenu.classList.toggle('active');
  });
});
