/**
 * Dynamic hero canvas lighting - reacts to mouse position
 */

function initLighting() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0.5, mouseY = 0.5;
  let targetX = 0.5, targetY = 0.5;
  let raf;

  function resize() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  }

  window.addEventListener('resize', resize);
  resize();

  // Mouse tracking (normalized 0-1)
  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX / window.innerWidth;
    targetY = e.clientY / window.innerHeight;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── Cloud layer setup ───────────────────────────────────────────────────────
  const CLOUD_COUNT = 11;
  const clouds = [];

  function spawnCloud(forceX) {
    const rx = width  * (0.14 + Math.random() * 0.22);
    const ry = rx * (0.35 + Math.random() * 0.3);
    return {
      x:      forceX !== undefined ? forceX : Math.random() * width * 1.3 - width * 0.15,
      y:      height * (0.05 + Math.random() * 0.44),
      rx, ry,
      vx:     (Math.random() - 0.5) * 0.22,
      vy:     (Math.random() - 0.5) * 0.05,
      base:   0.022 + Math.random() * 0.04,  // base opacity
      lit:    0,                               // illumination 0..1
      hue:    215 + Math.random() * 55,
      sat:    45  + Math.random() * 25,
    };
  }

  for (let i = 0; i < CLOUD_COUNT; i++) {
    clouds.push(spawnCloud((i / CLOUD_COUNT) * width * 1.3 - width * 0.15));
  }

  function drawCloud(c) {
    const lit   = c.lit;
    const alpha = Math.min(1, c.base + lit * 0.28);
    const lum   = 18 + lit * 52;
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.rx);
    g.addColorStop(0,   `hsla(${c.hue}, ${c.sat}%, ${lum}%, ${alpha})`);
    g.addColorStop(0.45,`hsla(${c.hue}, ${c.sat - 10}%, ${lum * 0.55}%, ${alpha * 0.55})`);
    g.addColorStop(1,   'transparent');
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  // ── Hero lightning state ─────────────────────────────────────────────────────
  let hLightTimer  = 2000;  // start first strike sooner
  let hLightNext   = 3500 + Math.random() * 5000;
  let hLightActive = false;
  let hBoltSegs    = [];
  let hBoltAlpha   = 0;
  let hLightX      = 0.5;
  let hLightPhase  = 0;   // 1=flash 2=flicker-out
  let hBloomAlpha  = 0;
  let hLightIntens = 1;

  function genHeroBolt(ox, oy) {
    const segs = [{ x: ox, y: oy }];
    let cx2 = ox, cy2 = oy;
    const steps = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < steps; i++) {
      cx2 += (Math.random() - 0.48) * 0.07;
      cy2 += 0.07 + Math.random() * 0.07;
    segs.push({ x: cx2, y: Math.min(cy2, 0.98) });
      if (cy2 >= 0.95) break;
    }
    return segs;
  }

  function fireHeroLightning() {
    hLightActive = true;
    hLightPhase  = 1;
    hLightTimer  = 0;
    hLightX      = 0.25 + Math.random() * 0.5;
    hLightIntens = 0.7 + Math.random() * 0.3;
    hBoltAlpha   = 1;
    hBloomAlpha  = 1;
    // find nearest cloud to originate bolt from
    let bestY = 0.15;
    let bestDist = 99;
    clouds.forEach(c => {
      const dist = Math.abs(c.x / width - hLightX);
      if (dist < bestDist) { bestDist = dist; bestY = c.y / height; }
    });
    hBoltSegs = genHeroBolt(hLightX, Math.max(0.02, bestY - 0.04));
    // illuminate nearby clouds
    clouds.forEach(c => {
      const dist = Math.abs(c.x / width - hLightX);
      if (dist < 0.45) c.lit = Math.max(c.lit, (0.45 - dist) / 0.45 * hLightIntens * 1.8);
    });
    hLightNext = 4000 + Math.random() * 7000;
  }

  function drawHeroBolt(segs, alpha) {
    if (!segs.length || alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    // Glow pass
    ctx.strokeStyle = 'rgba(180, 160, 255, 1)';
    ctx.lineWidth   = 3;
    ctx.shadowColor = 'rgba(160, 130, 255, 0.9)';
    ctx.shadowBlur  = 28;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(segs[0].x * width, segs[0].y * height);
    for (let i = 1; i < segs.length; i++) ctx.lineTo(segs[i].x * width, segs[i].y * height);
    ctx.stroke();
    // Core bright
    ctx.strokeStyle = 'rgba(240, 235, 255, 0.95)';
    ctx.lineWidth   = 1;
    ctx.shadowBlur  = 8;
    ctx.stroke();
    ctx.restore();
  }

  let _lastTs = 0;

  function draw(ts) {
    const dt = Math.min(ts - _lastTs, 50) || 16;
    _lastTs = ts;

    mouseX = lerp(mouseX, targetX, 0.038);
    mouseY = lerp(mouseY, targetY, 0.038);

    ctx.clearRect(0, 0, width, height);

    // ── Update + draw clouds ──
    clouds.forEach(c => {
      c.x += c.vx;
      c.y += c.vy;
      if (c.x > width  * 1.35) c.x = -c.rx * 2;
      if (c.x < -c.rx  * 2)    c.x = width * 1.35;
      if (c.y > height * 0.55)  c.y = 0;
      if (c.y < -c.ry)          c.y = height * 0.5;
      c.lit = Math.max(0, c.lit - 0.018);
      drawCloud(c);
    });

    // ── Mouse light ──
    const cx = mouseX * width;
    const cy = mouseY * height;
    const gMouse = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.6);
    gMouse.addColorStop(0,    'rgba(85, 65, 175, 0.11)');
    gMouse.addColorStop(0.45, 'rgba(45, 85, 195, 0.042)');
    gMouse.addColorStop(1,    'transparent');
    ctx.fillStyle = gMouse;
    ctx.fillRect(0, 0, width, height);

    // ── Warm counter-light ──
    const wx = (1 - mouseX) * width * 0.72;
    const wy = (1 - mouseY) * height * 0.72;
    const gWarm = ctx.createRadialGradient(wx, wy, 0, wx, wy, width * 0.42);
    gWarm.addColorStop(0, 'rgba(255, 105, 45, 0.032)');
    gWarm.addColorStop(1, 'transparent');
    ctx.fillStyle = gWarm;
    ctx.fillRect(0, 0, width, height);

    // ── Hero lightning ──
    hLightTimer += dt;
    if (!hLightActive && hLightTimer > hLightNext) fireHeroLightning();

    if (hLightActive) {
      // Bloom
      if (hBloomAlpha > 0) {
        const gBloom = ctx.createRadialGradient(
          hLightX * width, height * 0.18, 0,
          hLightX * width, height * 0.18, width * 0.52
        );
        const bi = hBloomAlpha * hLightIntens;
        gBloom.addColorStop(0,   `rgba(195, 178, 255, ${bi * 0.38})`);
        gBloom.addColorStop(0.35,`rgba(120, 95,  255, ${bi * 0.16})`);
        gBloom.addColorStop(1,   'transparent');
        ctx.fillStyle = gBloom;
        ctx.fillRect(0, 0, width, height);
        hBloomAlpha -= 0.045;
      }

      drawHeroBolt(hBoltSegs, hBoltAlpha);

      if (hLightPhase === 1) {
        hBoltAlpha -= 0.055;
        if (hBoltAlpha <= 0) {
          // Second flicker
          hBoltAlpha  = 0.55;
          hBloomAlpha = 0.45;
          hLightPhase = 2;
        }
      } else {
        hBoltAlpha -= 0.075;
        if (hBoltAlpha <= 0) {
          hLightActive = false;
          hLightTimer  = 0;
        }
      }
    }

    // ── Vignettes ──
    const gBot = ctx.createLinearGradient(0, height * 0.42, 0, height);
    gBot.addColorStop(0, 'transparent');
    gBot.addColorStop(1, 'rgba(3,5,8,0.85)');
    ctx.fillStyle = gBot;
    ctx.fillRect(0, 0, width, height);

    const gTop = ctx.createLinearGradient(0, 0, 0, height * 0.27);
    gTop.addColorStop(0, 'rgba(3,5,8,0.88)');
    gTop.addColorStop(1, 'transparent');
    ctx.fillStyle = gTop;
    ctx.fillRect(0, 0, width, height);

    raf = requestAnimationFrame(draw);
  }

  raf = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}

/**
 * Ambient parallax lights that move subtly with mouse
 */
function initAmbientLights() {
  const lights = document.querySelectorAll('.ambient-light');
  if (!lights.length) return;

  let tx = 0, ty = 0;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 40;
    ty = (e.clientY / window.innerHeight - 0.5) * 40;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    cx = lerp(cx, tx, 0.05);
    cy = lerp(cy, ty, 0.05);
    lights.forEach((light, i) => {
      const factor = (i + 1) * 0.4;
      const inv = i % 2 === 0 ? 1 : -1;
      light.style.transform = `translate(${cx * factor * inv}px, ${cy * factor}px)`;
    });
    requestAnimationFrame(tick);
  }

  tick();
}
