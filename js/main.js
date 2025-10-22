/* menu.js — combined, with dynamic left-column locking + icon swap */

/* Elements */
const menuBtn = document.getElementById('menu-btn');
const dropdown = document.getElementById('dropdown-menu');
const overlay = document.getElementById('overlay');
const menuItems = document.querySelectorAll('.menu-item');
const submenus = document.querySelectorAll('.submenu');
const mainMenu = document.querySelector('.main-menu');           // left column
const submenuContainer = document.querySelector('.submenu-container'); // right area

// icon inside the button (assumes <button id="menu-btn"><i class="fa ..."></i> Menu</button>)
const icon = menuBtn.querySelector('i');

let hideTimer = null;
const HIDE_DELAY = 200; // ms

/* Helper: lock main-menu height to its natural content height */
function lockMainMenuHeight() {
  if (!mainMenu) return;
  // measure natural full height (including items)
  const natural = mainMenu.scrollHeight;
  // clamp to viewport height if needed
  const viewportAvailable = Math.max(window.innerHeight - 120, 120); // 120px safety for top offset
  const finalHeight = Math.min(natural, viewportAvailable);
  mainMenu.style.height = finalHeight + 'px';
  mainMenu.style.overflow = 'hidden';
  // re-enable scrolling after the open animation completes
  setTimeout(() => {
    // keep overflow auto only if content is taller than available (so scrollbar shows)
    if (natural > viewportAvailable) mainMenu.style.overflow = 'auto';
    else mainMenu.style.overflow = '';
  }, 350); // match your CSS transition duration (approx)
}

/* Helper: reset main-menu height */
function resetMainMenuHeight() {
  if (!mainMenu) return;
  mainMenu.style.height = '';
  mainMenu.style.overflow = '';
}

/* Toggle dropdown open/close and swap icon */
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isActive = dropdown.classList.toggle('active');

  // show/hide overlay
  overlay.style.display = isActive ? 'block' : 'none';

  // icon swap
  if (icon) {
    if (isActive) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
      // lock left column height now that menu is open
      lockMainMenuHeight();
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
      // cleanup
      resetMainMenuHeight();
      dropdown.classList.remove('expanded');
      submenus.forEach(s => s.classList.remove('active'));
      dropdown.style.height = '';
    }
  } else {
    // fallback: still lock height if no icon found
    if (isActive) lockMainMenuHeight();
  }
});

/* Close when clicking outside */
overlay.addEventListener('click', () => {
  dropdown.classList.remove('active', 'expanded');
  overlay.style.display = 'none';
  submenus.forEach(s => s.classList.remove('active'));
  dropdown.style.height = '';

  // reset icon and left column
  if (icon) {
    icon.classList.remove('fa-xmark');
    icon.classList.add('fa-bars');
  }
  resetMainMenuHeight();
});

/* Show submenu on hover (pointerenter) */
menuItems.forEach(item => {
  item.addEventListener('pointerenter', () => {
    // if menu isn't open, ignore (keeps the dropdown hidden until opened)
    if (!dropdown.classList.contains('active')) return;

    // cancel hide timer
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }

    const targetId = item.dataset.sub;
    if (!targetId) return;

    // expand main dropdown horizontally
    dropdown.classList.add('expanded');

    // show matching submenu and set dropdown height to match submenu content
    submenus.forEach(s => {
      if (s.id === targetId) {
        s.classList.add('active');
        // measure and set container height on next frame for accurate layout
        requestAnimationFrame(() => {
          const h = s.scrollHeight;
          
        });
      } else {
        s.classList.remove('active');
      }
    });
  });
});

/* Keep submenu open while hovering either column */
[mainMenu, submenuContainer].forEach(el => {
  if (!el) return;
  el.addEventListener('pointerenter', () => {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  });
});

/* When pointer leaves the whole dropdown, collapse the submenu after a delay */
dropdown.addEventListener('pointerleave', () => {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    dropdown.classList.remove('expanded');
    submenus.forEach(s => s.classList.remove('active'));
    dropdown.style.height = '';
    hideTimer = null;
  }, HIDE_DELAY);
});

/* Close on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    dropdown.classList.remove('active', 'expanded');
    overlay.style.display = 'none';
    submenus.forEach(s => s.classList.remove('active'));
    dropdown.style.height = '';
    if (icon) {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
    resetMainMenuHeight();
  }
});

/* Resize handling: if viewport resizes while menu is open, re-lock main-menu height */
window.addEventListener('resize', () => {
  if (dropdown.classList.contains('active')) {
    lockMainMenuHeight();
  } else {
    resetMainMenuHeight();
  }
});
