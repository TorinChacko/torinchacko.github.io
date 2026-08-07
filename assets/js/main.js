(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Nav: scrolled state + active section + mobile toggle
     --------------------------------------------------------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelectorAll('.nav-links a');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  navToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  var sections = Array.prototype.slice.call(document.querySelectorAll('main .section, .hero'));
  var navMap = {};
  navLinks.forEach(function (l) { navMap[l.getAttribute('data-nav')] = l; });

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        var link = navMap[id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    revealEls.forEach(function (el, i) {
      el.style.setProperty('--i', i % 8);
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------
     Hero typed text
     --------------------------------------------------------- */
  var typedEl = document.getElementById('typed');
  var phrases = [
    'backend developer',
    'systems engineer',
    'C / C++ / Python',
    'building an x86-64 emulator'
  ];

  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = phrases[0];
    } else {
      (function typeLoop() {
        var phraseIndex = 0;
        var charIndex = 0;
        var deleting = false;

        function tick() {
          var current = phrases[phraseIndex];
          if (!deleting) {
            charIndex++;
            typedEl.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
              deleting = true;
              return setTimeout(tick, 1600);
            }
          } else {
            charIndex--;
            typedEl.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
              deleting = false;
              phraseIndex = (phraseIndex + 1) % phrases.length;
            }
          }
          var speed = deleting ? 35 : 65;
          setTimeout(tick, speed);
        }
        tick();
      })();
    }
  }

  /* ---------------------------------------------------------
     Project card spotlight / tilt
     --------------------------------------------------------- */
  if (!reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');

        var rx = ((y / rect.height) - 0.5) * -6;
        var ry = ((x / rect.width) - 0.5) * 6;
        card.style.transform = 'perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     Particle background (hero)
     --------------------------------------------------------- */
  var canvas = document.getElementById('particles');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var count = window.innerWidth < 720 ? 34 : 70;
    var w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function () {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
      this.r = Math.random() * 1.4 + 0.4;
      this.alpha = Math.random() * 0.5 + 0.15;
    };
    Particle.prototype.step = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    };

    for (var i = 0; i < count; i++) particles.push(new Particle());

    function loop() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#00ff9d';
      particles.forEach(function (p) {
        p.step();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }
    loop();
  }
})();
