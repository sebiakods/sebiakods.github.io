/* =====================================================
   sebiakods.dev — Global Script
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── CUSTOM CURSOR ── */
  const cd = document.getElementById('cursor-dot');
  const cr = document.getElementById('cursor-ring');
  if (cd && cr) {
    let mx=0, my=0, rx=0, ry=0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      cd.style.left = mx + 'px'; cd.style.top = my + 'px';
      rx += (mx - rx) * .13; ry += (my - ry) * .13;
      cr.style.left = rx + 'px'; cr.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .card, .pc, .sg, .ec, .skill-group').forEach(el => {
      el.addEventListener('mouseenter', () => cr.classList.add('hov'));
      el.addEventListener('mouseleave', () => cr.classList.remove('hov'));
    });
  }

  /* ── MOBILE NAV TOGGLE ── */
  const burger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ── ACTIVE NAV LINK ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObs.observe(el));

  /* ── NEURAL NETWORK CANVAS (hero only) ── */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [];
    const N = 65;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); initNodes(); });

    function initNodes() {
      nodes = Array.from({ length: N }, () => ({
        x:  Math.random() * W, y:  Math.random() * H,
        vx: (Math.random() - .5) * .3,
        vy: (Math.random() - .5) * .3,
        r:  Math.random() * 1.8 + .8,
        p:  Math.random() * Math.PI * 2
      }));
    }
    initNodes();

    let mX = W / 2, mY = H / 2;
    canvas.parentElement.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mX = e.clientX - r.left; mY = e.clientY - r.top;
    });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // Mouse glow
      const bg = ctx.createRadialGradient(mX, mY, 0, mX, mY, Math.max(W, H) * .55);
      bg.addColorStop(0, 'rgba(124,58,237,.06)'); bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // Update nodes
      nodes.forEach(n => {
        n.p += .018;
        const dx = mX - n.x, dy = mY - n.y, d = Math.hypot(dx, dy);
        if (d < 160) { n.vx += dx / d * .01; n.vy += dy / d * .01; }
        n.vx *= .985; n.vy *= .985;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
      });
      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < 115) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124,58,237,${(1 - d / 115) * .28})`;
            ctx.lineWidth = .6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      // Nodes
      nodes.forEach(n => {
        const p = .55 + .45 * Math.sin(n.p);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * p, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,181,253,${.42 * p})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── CONTACT FORM ── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      const name    = form.querySelector('#name').value.trim();
      const email   = form.querySelector('#email').value.trim();
      const subject = form.querySelector('#subject').value.trim();
      const message = form.querySelector('#message').value.trim();

      // Open Gmail compose with prefilled fields
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=sebiakods@gmail.com`
        + `&su=${encodeURIComponent(subject || 'Portfolio Inquiry from ' + name)}`
        + `&body=${encodeURIComponent(`Hi Sebia,\n\n${message}\n\nBest,\n${name}\n${email}`)}`;

      window.open(gmailUrl, '_blank');

      btn.textContent = 'Opening Gmail…';
      btn.style.opacity = '.7';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.opacity = '1';
      }, 2500);
    });
  }

  /* ── PROJECT FILTER (projects page) ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.pc[data-category]');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        projectCards.forEach(card => {
          const show = cat === 'all' || card.dataset.category === cat;
          card.style.opacity    = show ? '1' : '0';
          card.style.transform  = show ? 'scale(1)'   : 'scale(.95)';
          card.style.pointerEvents = show ? 'auto' : 'none';
          card.style.position   = show ? 'relative' : 'absolute';
        });
      });
    });
  }

});