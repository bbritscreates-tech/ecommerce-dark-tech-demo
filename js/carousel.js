const carousel = document.querySelector('.carousel');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');

next.onclick = () => carousel.scrollBy({ left: 300, behavior: 'smooth' });
prev.onclick = () => carousel.scrollBy({ left: -300, behavior: 'smooth' });
