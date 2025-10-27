document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-900-menu-btn');
  const mobileDropdown = document.getElementById('mobile-900-dropdown-menu');
  const mobileIcon = mobileMenuBtn?.querySelector('i');
  if (!mobileMenuBtn || !mobileDropdown) return;

  const mobileMenuItems = mobileDropdown.querySelectorAll('.mobile-900-menu-item');

  // Toggle entire dropdown
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = mobileDropdown.classList.toggle('active');
    if (mobileIcon) {
      mobileIcon.classList.toggle('fa-bars', !isActive);
      mobileIcon.classList.toggle('fa-xmark', isActive);
    }
  });

  // Accordion submenu toggle
  mobileMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Ignore link clicks so links still work
      if (e.target.tagName === 'A') return;

      const submenu = item.querySelector('.mobile-900-submenu');
      if (!submenu) return;

      const isActive = submenu.classList.contains('active');

      // Close all others first
      mobileMenuItems.forEach(i => {
        i.classList.remove('open');
        const s = i.querySelector('.mobile-900-submenu');
        if (s) s.classList.remove('active');
      });

      // Toggle this one
      if (!isActive) {
        item.classList.add('open');
        submenu.classList.add('active');
      }
    });
  });

  // Optional: close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.mobile-900-menu')) {
      mobileDropdown.classList.remove('active');
      if (mobileIcon) {
        mobileIcon.classList.add('fa-bars');
        mobileIcon.classList.remove('fa-xmark');
      }
    }
  });
});
