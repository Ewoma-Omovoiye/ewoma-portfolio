const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:0.1});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // NAV THEME — switches light/dark nav (and logo) to contrast with whatever section is behind it
  const navEl = document.querySelector('nav');
  const logoImg = document.querySelector('.logo-img');
  const themedSections = document.querySelectorAll('[data-theme]');
  if(navEl && themedSections.length){
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const isOnDark = entry.target.getAttribute('data-theme') === 'light';
          navEl.classList.toggle('on-dark', isOnDark);
          if(logoImg){
            logoImg.src = isOnDark ? logoImg.dataset.light : logoImg.dataset.dark;
          }
        }
      });
    }, {rootMargin: '-90px 0px -85% 0px', threshold: 0});
    themedSections.forEach(s => navObserver.observe(s));
  }

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.navlinks');
  const scrim = document.querySelector('.nav-scrim');
  if(toggle && links){
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded','false');
      links.classList.remove('open');
      if(scrim) scrim.classList.remove('open');
    };
    const openMenu = () => {
      toggle.setAttribute('aria-expanded','true');
      links.classList.add('open');
      if(scrim) scrim.classList.add('open');
    };
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    if(scrim) scrim.addEventListener('click', closeMenu);
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeMenu(); });
  }
});
