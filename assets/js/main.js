(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var ACCENT = '177, 108, 255';   /* --accent  */
  var ACCENT2 = '232, 121, 249';  /* --accent-2 */

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Nav: scrolled state + active section + mobile toggle
     --------------------------------------------------------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelectorAll('.nav-links a');

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
        var link = navMap[entry.target.id];
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
     Scroll-driven chrome: progress bar, nav state, back-to-top,
     hero parallax — all in one rAF-throttled handler
     --------------------------------------------------------- */
  var progress = document.getElementById('scrollProgress');
  var toTop = document.getElementById('toTop');
  var heroInner = document.querySelector('.hero-inner');
  var ticking = false;

  function applyScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    nav.classList.toggle('scrolled', y > 12);

    if (progress) {
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }

    if (toTop) toTop.classList.toggle('show', y > window.innerHeight * 0.7);

    if (heroInner && !reduceMotion && y < window.innerHeight) {
      heroInner.style.transform = 'translateY(' + (y * 0.14) + 'px)';
      heroInner.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(applyScroll);
    }
  }

  applyScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    /* stagger index resets per grid so each grid cascades from 0 */
    document.querySelectorAll('.skills-grid, .projects-grid, .contact-links').forEach(function (grid) {
      grid.querySelectorAll('.reveal').forEach(function (el, i) {
        el.style.setProperty('--i', i);
      });
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

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
          setTimeout(tick, deleting ? 35 : 65);
        }
        tick();
      })();
    }
  }

  /* ---------------------------------------------------------
     Text scramble — runs once on load, replays on hover
     --------------------------------------------------------- */
  if (!reduceMotion) {
    var GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

    document.querySelectorAll('[data-scramble]').forEach(function (el) {
      var target = el.textContent;
      var frame = 0;
      var queue = [];
      var raf = null;

      function run() {
        cancelAnimationFrame(raf);
        queue = [];
        for (var i = 0; i < target.length; i++) {
          var start = Math.floor(Math.random() * 18);
          queue.push({ ch: target[i], start: start, end: start + Math.floor(Math.random() * 22) });
        }
        frame = 0;
        step();
      }

      function step() {
        var out = '';
        var done = 0;
        for (var i = 0; i < queue.length; i++) {
          var q = queue[i];
          if (frame >= q.end) {
            done++;
            out += q.ch;
          } else if (frame >= q.start) {
            out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          } else {
            out += q.ch === ' ' ? ' ' : '';
          }
        }
        el.textContent = out;
        if (done === queue.length) {
          el.textContent = target;
          return;
        }
        frame++;
        raf = requestAnimationFrame(step);
      }

      el.addEventListener('mouseenter', run);
      setTimeout(run, 320);
    });
  }

  /* ---------------------------------------------------------
     Magnetic buttons
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) * 0.22;
        var my = (e.clientY - r.top - r.height / 2) * 0.32;
        el.style.transform = 'translate(' + mx + 'px, ' + (my - 3) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     Cursor glow — lerped toward the pointer
     --------------------------------------------------------- */
  var glow = document.getElementById('cursorGlow');
  var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  if (glow && finePointer && !reduceMotion) {
    var gx = pointer.x;
    var gy = pointer.y;

    window.addEventListener('mousemove', function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      glow.classList.add('on');
    }, { passive: true });

    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });

    (function glowLoop() {
      gx += (pointer.x - gx) * 0.12;
      gy += (pointer.y - gy) * 0.12;
      glow.style.transform = 'translate3d(' + gx + 'px, ' + gy + 'px, 0)';
      requestAnimationFrame(glowLoop);
    })();
  }

  /* ---------------------------------------------------------
     Project card spotlight / tilt
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');

        var rx = ((y / rect.height) - 0.5) * -7;
        var ry = ((x / rect.width) - 0.5) * 7;
        card.style.transform =
          'perspective(760px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px) scale(1.012)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = '';
        setTimeout(function () { card.style.transition = ''; }, 600);
      });
    });
  }

  /* ---------------------------------------------------------
     Marquee — duplicate the track so the -50% loop is seamless
     --------------------------------------------------------- */
  var track = document.getElementById('marqueeTrack');
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* ---------------------------------------------------------
     Particle constellation background
     --------------------------------------------------------- */
  var canvas = document.getElementById('particles');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var count = window.innerWidth < 720 ? 30 : 68;
    var LINK_DIST = 130;
    var w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() { this.reset(); }
    Particle.prototype.reset = function () {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.28;
      this.vy = (Math.random() - 0.5) * 0.28;
      this.r = Math.random() * 1.5 + 0.4;
      this.alpha = Math.random() * 0.5 + 0.18;
      this.warm = Math.random() > 0.72;
    };
    Particle.prototype.step = function () {
      this.x += this.vx;
      this.y += this.vy;

      /* gentle push away from the cursor */
      if (finePointer) {
        var dx = this.x - pointer.x;
        var dy = this.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 14400 && d2 > 0.01) {
          var f = (1 - d2 / 14400) * 0.6;
          var d = Math.sqrt(d2);
          this.x += (dx / d) * f;
          this.y += (dy / d) * f;
        }
      }

      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
      this.x = Math.max(0, Math.min(w, this.x));
      this.y = Math.max(0, Math.min(h, this.y));
    };

    for (var i = 0; i < count; i++) particles.push(new Particle());

    function loop() {
      ctx.clearRect(0, 0, w, h);

      /* links first, so dots sit on top */
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = 'rgba(' + ACCENT + ',' + (0.16 * (1 - dist / LINK_DIST)) + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(function (p) {
        p.step();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = 'rgb(' + (p.warm ? ACCENT2 : ACCENT) + ')';
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
