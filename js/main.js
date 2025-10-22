const menuBtn = document.getElementById('menu-btn');
const dropdown = document.getElementById('dropdown-menu');
const overlay = document.getElementById('overlay');
const menuItems = document.querySelectorAll('.menu-item');
const submenus = document.querySelectorAll('.submenu');
const submenuContainer = document.querySelector('.submenu-container');
const icon = menuBtn.querySelector('i');

let hideTimer = null;
const HIDE_DELAY = 200;
const GAP_FROM_EDGE = 20; // px gap from viewport edge

function clampWidth(w) {
  const maxAllowed = Math.max(200, window.innerWidth - GAP_FROM_EDGE * 2);
  return Math.min(Math.ceil(w), maxAllowed);
}

function measureIntrinsicWidth(el) {
  // Create an off-screen clone to measure intrinsic width without layout constraints.
  const clone = el.cloneNode(true);
  const style = clone.style;
  style.position = 'absolute';
  style.left = '-99999px';
  style.top = '-99999px';
  style.width = 'auto';
  style.maxWidth = 'none';
  style.visibility = 'hidden';
  style.display = 'block';
  // ensure grid keeps its internal sizing
  const gridChildren = clone.querySelectorAll('.submenu-grid, .submenu-card');
  gridChildren.forEach(n => {
    // remove any 1fr style that could rely on container by ensuring width auto
    n.style.width = 'auto';
  });

  document.body.appendChild(clone);
  // force layout
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
  if (dropdown.classList.contains('active')) {
    closeAll();
  } else {
    openMainMenu();
  }
});


overlay.addEventListener('click', closeAll);

// Show submenu on hover (or pointerenter)
menuItems.forEach(item => {
  item.addEventListener('pointerenter', () => {
    clearTimeout(hideTimer);
    const targetId = item.dataset.sub;
    const target = document.getElementById(targetId);
    if (!target) return;

    // remove active from others first
    submenus.forEach(s => s.classList.remove('active'));
    // activate target submenu and container (so visual state changes immediately)
    target.classList.add('active');
    submenuContainer.classList.add('active');

    // Use RAF to let the class apply (not strictly necessary due to clone, but keeps smoothness)
    requestAnimationFrame(() => {
      // measure intrinsic width via clone (unaffected by current container size)
      let measuredWidth = measureIntrinsicWidth(target);

      // add submenuContainer horizontal paddings to measured width
      const comp = window.getComputedStyle(submenuContainer);
      const padLeft = parseFloat(comp.paddingLeft) || 0;
      const padRight = parseFloat(comp.paddingRight) || 0;
      measuredWidth += padLeft + padRight;

      // clamp to viewport and set
      measuredWidth = clampWidth(measuredWidth);
      submenuContainer.style.width = measuredWidth + 'px';
    });
  });
});

// Keep submenu open while hovering either panel
[dropdown, submenuContainer].forEach(el => {
  el.addEventListener('pointerenter', () => clearTimeout(hideTimer));
});

// Hide when pointer leaves both panels (with delay)
document.addEventListener('pointermove', e => {
  // if pointer inside dropdown or submenu-container, ignore
  const insideDropdown = !!e.target.closest && e.target.closest('#dropdown-menu');
  const insideSubmenu = !!e.target.closest && e.target.closest('.submenu-container');
  if (insideDropdown || insideSubmenu) {
    clearTimeout(hideTimer);
    return;
  }
  // otherwise schedule hide
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    submenuContainer.classList.remove('active');
    submenus.forEach(s => s.classList.remove('active'));
    submenuContainer.style.width = '';
  }, HIDE_DELAY);
});

// Close with Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAll();
});

// Recompute on resize (keeps width sensible if user resizes window while open)
window.addEventListener('resize', () => {
  const active = document.querySelector('.submenu.active');
  if (!active) return;
  // measure again
  requestAnimationFrame(() => {
    let w = measureIntrinsicWidth(active);
    const comp = window.getComputedStyle(submenuContainer);
    w += (parseFloat(comp.paddingLeft) || 0) + (parseFloat(comp.paddingRight) || 0);
    submenuContainer.style.width = clampWidth(w) + 'px';
  });
});
