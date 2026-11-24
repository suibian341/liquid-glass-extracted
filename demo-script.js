
    const root = document.documentElement;
    const app = document.querySelector('#app');
    const blur = document.querySelector('#blur');
    const alpha = document.querySelector('#alpha');
    const blurValue = document.querySelector('#blurValue');
    const alphaValue = document.querySelector('#alphaValue');
    const chromatic = document.querySelector('#chromatic');
    blur.addEventListener('input', () => { root.style.setProperty('--blur', blur.value + 'px'); blurValue.value = blur.value + 'px'; blurValue.textContent = blurValue.value; });
    alpha.addEventListener('input', () => { root.style.setProperty('--glass-alpha', (+alpha.value / 100).toFixed(2)); alphaValue.value = alpha.value + '%'; alphaValue.textContent = alphaValue.value; });
    chromatic.addEventListener('click', () => { chromatic.classList.toggle('on'); app.classList.toggle('chromatic'); });
    addEventListener('pointermove', (event) => { root.style.setProperty('--mx', (event.clientX / innerWidth * 100).toFixed(1) + '%'); root.style.setProperty('--my', (event.clientY / innerHeight * 100).toFixed(1) + '%'); });

    // Interruptible page transition: direct manipulation + velocity handoff.
    const page = document.querySelector('#pageTwo');
    const source = document.querySelector('#app .layout');
    const lens = document.querySelector('#lens');
    const next = document.querySelector('#nextPage');
    const prev = document.querySelector('#prevPage');
    const hint = document.querySelector('#hint');
    const dots = [...document.querySelectorAll('.dots i')];
    let pageProgress = 0, pageTarget = 0, pageVelocity = 0, raf = 0, dragging = false, startX = 0, lastX = 0, lastT = 0, gestureVelocity = 0;
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const project = (x, v) => x + (v / 1000) * .998 / (1 - .998);
    const rubber = (x) => x < 0 ? -(Math.abs(x) * .55 * innerWidth) / (innerWidth + .55 * Math.abs(x)) : (x * .55 * innerWidth) / (innerWidth + .55 * x);
    function renderProgress(p) {
      const w = innerWidth;
      const x = p * w;
      const sourceX = -x;
      const incomingX = (1 - p) * w;
      const scale = 1 - Math.min(.045, Math.abs(p) * .045);
      source.style.transform = `translate3d(${sourceX}px,0,0) scale(${scale})`;
      source.style.filter = `blur(${Math.abs(p) * 1.8}px) saturate(${1 + Math.abs(p) * .35})`;
      page.style.transform = `translate3d(${incomingX}px,0,0) scale(${1 - Math.min(.04, (1 - Math.abs(p)) * .04)})`;
      page.style.opacity = String(clamp(p * 1.35, 0, 1));
      page.style.pointerEvents = p > .02 ? 'auto' : 'none';
      page.style.filter = `blur(${Math.max(0, 5 - p * 5)}px) saturate(${.78 + p * .22})`;
      const lensX = x + w * .5;
      const stretch = 1 + Math.min(.22, Math.abs(gestureVelocity) / 2600);
      lens.style.left = `${lensX}px`;
      lens.style.opacity = String(clamp(Math.abs(p) * 2.1, 0, .9));
      lens.style.transform = `translate(-50%,-50%) scale(${.7 + Math.abs(p) * .4 * stretch},${.7 + Math.abs(p) * .3})`;
      lens.style.borderRadius = `${50 - p * 14}% ${50 + p * 14}% ${50 + p * 12}% ${50 - p * 12}% / 50% 44% 56% 50%`;
      dots[0].classList.toggle('active', p < .5); dots[1].classList.toggle('active', p >= .5);
    }
    function stopAnimation() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    function animateTo(target, velocity = 0) {
      stopAnimation(); pageTarget = clamp(target, 0, 1); pageVelocity = velocity;
      const step = () => {
        const dt = 1 / 60, stiffness = 240, damping = 27;
        pageVelocity += (pageTarget - pageProgress) * stiffness * dt;
        pageVelocity *= Math.exp(-damping * dt);
        pageProgress += pageVelocity * dt;
        if (Math.abs(pageTarget - pageProgress) < .001 && Math.abs(pageVelocity) < .01) { pageProgress = pageTarget; renderProgress(pageProgress); raf = 0; syncPage(); return; }
        renderProgress(pageProgress); raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    function syncPage() { const open = pageProgress > .5; document.body.classList.toggle('page-open', open); page.setAttribute('aria-hidden', String(!open)); hint.textContent = open ? '返回第一页' : '拖动页面'; }
    function begin(e) { if (e.target.closest('input,button')) return; dragging = true; document.body.classList.add('is-dragging'); stopAnimation(); startX = e.clientX; lastX = e.clientX; lastT = performance.now(); gestureVelocity = 0; e.currentTarget.setPointerCapture?.(e.pointerId); }
    function move(e) { if (!dragging) return; const now = performance.now(); const dx = e.clientX - lastX; const dt = Math.max(8, now - lastT); gestureVelocity = dx / dt * 1000; lastX = e.clientX; lastT = now; const raw = pageProgress + dx / innerWidth; pageProgress = clamp(raw, 0, 1); if (raw < 0 || raw > 1) pageProgress = clamp(pageProgress + rubber(raw - clamp(raw, 0, 1)) / innerWidth, 0, 1); renderProgress(pageProgress); }
    function end() { if (!dragging) return; dragging = false; document.body.classList.remove('is-dragging'); const projected = project(pageProgress * innerWidth, gestureVelocity) / innerWidth; const target = projected > .35 || gestureVelocity > 520 ? 1 : 0; animateTo(target, gestureVelocity / innerWidth); }
    app.addEventListener('pointerdown', begin); app.addEventListener('pointermove', move); app.addEventListener('pointerup', end); app.addEventListener('pointercancel', end);
    page.addEventListener('pointerdown', (e) => { if (pageProgress < .5) return; begin(e); }); page.addEventListener('pointermove', move); page.addEventListener('pointerup', end); page.addEventListener('pointercancel', end);
    next.addEventListener('click', () => animateTo(1, 0)); prev.addEventListener('click', () => animateTo(0, 0));
    renderProgress(0);
  
