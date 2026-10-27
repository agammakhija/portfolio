/**
 * Spider-Man Character Controller
 * 
 * Features:
 * 1. Exact upside-down hanging pose matching reference artwork on high-tensile web line
 * 2. Slides down smoothly on scroll with physical pendulum sway & silk friction particles
 * 3. REVAMPED CINEMATIC TRANSITION:
 *    - Shoots a web directly onto the screen (camera lens web splat)
 *    - Leaps forward and SLOWLY TURNS around in 3D mid-air
 *    - As his back turns to the viewer, an expanding VIBRANT RED BACKGROUND reveals the new page!
 *    - Snappy landing back onto his hanging web line on the new page
 */

class SpiderManController {
  constructor() {
    this.container = null;
    this.crawlerEl = null;
    this.webCanvas = null;
    this.webCtx = null;
    this.transitionOverlay = null;

    this.currentScroll = 0;
    this.targetScroll = 0;
    this.scrollProgress = 0;
    this.isTransitioning = false;
    this.currentSectionId = 'home';

    // Physics & Sway
    this.slideVelocity = 0;
    this.lastScroll = 0;
    this.particles = [];

    // Dimensions: 175px width x ~204px height. Web line anchor at x=82px.
    this.spideyWidth = 175;
    this.spideyHeight = Math.round(175 * (562 / 482));
    this.webAnchorOffsetX = Math.round(this.spideyWidth * (227 / 482));

    this.spideyX = 0;
    this.spideyY = 40;

    this.init();
  }

  init() {
    this.setupDOM();
    this.setupWebCanvas();
    this.bindEvents();
    this.updatePosition(true);
    this.animate();
  }

  setupDOM() {
    // 1. Hanging Spider-Man Crawler (Matching reference image)
    const wrapper = document.createElement('div');
    wrapper.id = 'spidey-container';
    wrapper.innerHTML = `
      <canvas id="spidey-web-canvas"></canvas>
      <div id="spidey-crawler" class="spidey-crawler spidey-hanging-upside-down" title="Click me to interact!">
        <div class="spidey-speech-bubble" id="spidey-bubble">
          <span>Hanging around! Scroll to slide down!</span>
        </div>
        <div class="spidey-body-wrapper" id="spidey-body-wrapper">
          <img 
            src="spiderman-hanging.png" 
            alt="Spider-Man Hanging Upside Down" 
            id="spidey-hang-img"
            class="spidey-hang-img"
            draggable="false"
          />
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    this.container = wrapper;
    this.crawlerEl = document.getElementById('spidey-crawler');
    this.webCanvas = document.getElementById('spidey-web-canvas');
    this.webCtx = this.webCanvas.getContext('2d');
    this.speechBubble = document.getElementById('spidey-bubble');

    // 2. Fullscreen Cinematic Screen-Web-Shot & Slow-Turn Red Reveal Stage
    const transitionOverlay = document.createElement('div');
    transitionOverlay.id = 'spidey-transition-stage';
    transitionOverlay.className = 'spidey-transition-stage hidden';
    transitionOverlay.innerHTML = `
      <!-- Action Speed Lines -->
      <div class="speed-lines-container" id="speed-lines"></div>

      <!-- WEB SHOT DIRECTLY ONTO THE SCREEN (Camera glass web splat) -->
      <div class="camera-web-splat" id="camera-web-splat">
        <svg viewBox="0 0 400 400" class="web-splat-svg">
          <defs>
            <filter id="web-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.8"/>
            </filter>
          </defs>
          <g filter="url(#web-glow)" stroke="#FFFFFF" stroke-linecap="round" fill="none">
            <!-- Center Impact Splat -->
            <ellipse cx="200" cy="200" rx="14" ry="14" fill="#FFFFFF" stroke="#111" stroke-width="3"/>
            
            <!-- Radial Web Spokes shooting outward -->
            <path d="M 200,200 L 40,60 M 200,200 L 200,20 M 200,200 L 360,60" stroke-width="4.5"/>
            <path d="M 200,200 L 380,200 M 200,200 L 360,340 M 200,200 L 200,380" stroke-width="4.5"/>
            <path d="M 200,200 L 40,340 M 200,200 L 20,200" stroke-width="4.5"/>
            <path d="M 200,200 L 110,30 M 200,200 L 290,30 M 200,200 L 370,120" stroke-width="3.5"/>
            <path d="M 200,200 L 370,280 M 200,200 L 290,370 M 200,200 L 110,370" stroke-width="3.5"/>
            <path d="M 200,200 L 30,280 M 200,200 L 30,120" stroke-width="3.5"/>

            <!-- Concentric Web Rings expanding outward -->
            <!-- Inner ring -->
            <path d="M 160,165 Q 200,150 240,165 Q 250,200 240,235 Q 200,250 160,235 Q 150,200 160,165 Z" stroke-width="3"/>
            <!-- Mid ring -->
            <path d="M 110,120 Q 200,90 290,120 Q 310,200 290,280 Q 200,310 110,280 Q 90,200 110,120 Z" stroke-width="3.5"/>
            <!-- Outer massive ring -->
            <path d="M 50,70 Q 200,30 350,70 Q 380,200 350,330 Q 200,370 50,330 Q 20,200 50,70 Z" stroke-width="4"/>

            <!-- Silk drips & web strands -->
            <path d="M 200,214 Q 202,260 196,310 Q 194,330 198,350" stroke-width="2.5" stroke-dasharray="8 4"/>
            <path d="M 210,208 Q 230,250 240,290" stroke-width="2"/>
          </g>
        </svg>
      </div>

      <!-- Comic Sound Effect Badge -->
      <div class="comic-sound-fx" id="transition-sfx">THWIP!</div>

      <!-- 3D Turning Spider-Man Character -->
      <div class="jumping-spidey" id="jumping-spidey">
        <div class="jumping-spidey-inner" id="jumping-spidey-inner">
          
          <!-- FRONT VIEW: Shooting Web Directly at Screen -->
          <div class="spidey-leap-front">
            <svg viewBox="0 0 240 280" width="100%" height="100%">
              <defs>
                <filter id="leap-shadow" x="-20%" y="-20%" width="150%" height="150%">
                  <feDropShadow dx="6" dy="10" stdDeviation="0" flood-color="#000" flood-opacity="1"/>
                </filter>
              </defs>
              <g filter="url(#leap-shadow)">
                <!-- Left Hand outstretched forward, shooting web at viewer -->
                <path d="M 85,110 Q 40,80 20,50 L 38,40 Q 60,70 100,95 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 20,50 L 8,30 C 14,20 28,24 38,40 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
                <!-- Iconic Thwip two-finger web gesture -->
                <circle cx="18" cy="30" r="7" fill="#D61827" stroke="#111" stroke-width="3"/>
                <!-- Web blast nozzle stream -->
                <path d="M 12,28 L -20,-10 M 16,24 L -10,-25" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>

                <!-- Right Arm supporting athletic leap -->
                <path d="M 140,110 Q 185,95 210,75 L 222,90 Q 190,120 145,120 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <circle cx="218" cy="80" r="14" fill="#D61827" stroke="#111" stroke-width="4"/>

                <!-- Torso with muscular contours -->
                <path d="M 85,85 C 75,130 80,175 90,190 L 140,190 C 150,175 155,130 145,85 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 98,85 C 92,130 96,175 102,190 L 128,190 C 134,175 138,130 132,85 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
                
                <!-- Webbing lines on red vest -->
                <g stroke="#111" stroke-width="1.8" opacity="0.85">
                  <path d="M 115,85 L 115,190"/>
                  <path d="M 98,105 Q 115,115 132,105"/>
                  <path d="M 94,130 Q 115,142 136,130"/>
                  <path d="M 96,155 Q 115,166 134,155"/>
                </g>

                <!-- Chest Spider Emblem -->
                <ellipse cx="115" cy="125" rx="4.5" ry="8" fill="#111"/>
                <circle cx="115" cy="116" r="3" fill="#111"/>
                <path d="M 112,120 Q 98,108 92,98 M 118,120 Q 132,108 138,98" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M 112,128 Q 96,140 94,156 M 118,128 Q 134,140 136,156" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>

                <!-- Mask Head looking directly at camera -->
                <ellipse cx="115" cy="62" rx="30" ry="38" fill="#D61827" stroke="#111" stroke-width="4"/>
                <!-- Web pattern on mask -->
                <g stroke="#111" stroke-width="1.8" opacity="0.85">
                  <path d="M 115,24 L 115,100"/>
                  <path d="M 85,62 L 145,62"/>
                  <ellipse cx="115" cy="62" rx="10" ry="12" fill="none"/>
                  <ellipse cx="115" cy="62" rx="20" ry="24" fill="none"/>
                </g>
                <!-- Eyes -->
                <path d="M 110,54 Q 96,46 88,62 Q 95,78 108,72 Z" fill="#FFF" stroke="#111" stroke-width="3.5"/>
                <path d="M 120,54 Q 134,46 142,62 Q 135,78 122,72 Z" fill="#FFF" stroke="#111" stroke-width="3.5"/>

                <!-- Dynamic Tuck Acrobatics Legs -->
                <path d="M 85,185 Q 45,200 40,240 L 62,246 Q 72,215 98,195 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 40,240 L 22,246 L 45,260 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
                <path d="M 145,185 Q 185,200 190,240 L 168,246 Q 158,215 132,195 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 190,240 L 208,246 L 185,260 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
              </g>
            </svg>
          </div>

          <!-- BACK VIEW: Turning around - MASSIVE RED SPIDER EMBLEM & RED EXPANSION -->
          <div class="spidey-leap-back" id="spidey-leap-back">
            <svg class="spidey-back-svg" viewBox="0 0 240 280" width="100%" height="100%">
              <g filter="url(#leap-shadow)">
                <!-- Arms spread wide in heroic flip -->
                <path d="M 70,80 Q 20,60 5,95 L 18,105 Q 35,78 70,100 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 5,95 L 0,115 L 18,105 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
                <path d="M 170,80 Q 220,60 235,95 L 222,105 Q 205,78 170,100 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 235,95 L 240,115 L 222,105 Z" fill="#D61827" stroke="#111" stroke-width="4"/>

                <!-- Blue shoulders and back lats -->
                <path d="M 55,75 C 45,130 55,190 70,210 L 170,210 C 185,190 195,130 185,75 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>

                <!-- Deep Red Back Torso -->
                <path d="M 72,70 C 66,120 75,180 82,210 L 158,210 C 165,180 174,120 168,70 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
                
                <!-- Webbing lines across back -->
                <g stroke="#111" stroke-width="2" opacity="0.85">
                  <path d="M 120,70 L 120,210"/>
                  <path d="M 78,90 Q 120,100 162,90"/>
                  <path d="M 72,120 Q 120,135 168,120"/>
                  <path d="M 74,155 Q 120,170 166,155"/>
                  <path d="M 78,185 Q 120,195 162,185"/>
                </g>

                <!-- Back of Masked Head -->
                <ellipse cx="120" cy="50" rx="28" ry="34" fill="#D61827" stroke="#111" stroke-width="4"/>
                <g stroke="#111" stroke-width="1.8" opacity="0.85">
                  <path d="M 120,16 L 120,84"/>
                  <path d="M 92,50 L 148,50"/>
                  <ellipse cx="120" cy="50" rx="14" ry="17" fill="none"/>
                  <ellipse cx="120" cy="50" rx="24" ry="29" fill="none"/>
                </g>

                <!-- THE ICONIC RED BACK SPIDER EMBLEM (Center of Red Screen Reveal!) -->
                <g id="spidey-back-symbol" class="spidey-back-symbol">
                  <ellipse cx="120" cy="140" rx="18" ry="26" fill="#FF172A" stroke="#111" stroke-width="4.5"/>
                  <!-- Upper legs -->
                  <path d="M 112,125 Q 90,110 80,88 M 128,125 Q 150,110 160,88" stroke="#FF172A" stroke-width="7" stroke-linecap="round" fill="none"/>
                  <path d="M 112,125 Q 90,110 80,88 M 128,125 Q 150,110 160,88" stroke="#111" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                  
                  <path d="M 110,135 Q 85,130 72,118 M 130,135 Q 155,130 168,118" stroke="#FF172A" stroke-width="7" stroke-linecap="round" fill="none"/>
                  <path d="M 110,135 Q 85,130 72,118 M 130,135 Q 155,130 168,118" stroke="#111" stroke-width="2.5" stroke-linecap="round" fill="none"/>

                  <!-- Lower legs -->
                  <path d="M 110,148 Q 85,155 78,182 M 130,148 Q 155,155 162,182" stroke="#FF172A" stroke-width="7" stroke-linecap="round" fill="none"/>
                  <path d="M 110,148 Q 85,155 78,182 M 130,148 Q 155,155 162,182" stroke="#111" stroke-width="2.5" stroke-linecap="round" fill="none"/>

                  <path d="M 114,158 Q 95,175 90,208 M 126,158 Q 145,175 150,208" stroke="#FF172A" stroke-width="7" stroke-linecap="round" fill="none"/>
                  <path d="M 114,158 Q 95,175 90,208 M 126,158 Q 145,175 150,208" stroke="#111" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                </g>

                <!-- Legs in dynamic kick -->
                <path d="M 75,205 Q 45,230 40,265 L 60,270 Q 75,235 90,215 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 165,205 Q 195,230 200,265 L 180,270 Q 165,235 150,215 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
              </g>
            </svg>
          </div>

        </div>
      </div>

      <!-- VIBRANT RED BACKGROUND REVEAL PORTAL (Expands from his back to reveal new page!) -->
      <div class="red-screen-reveal" id="red-screen-reveal">
        <div class="red-reveal-rays"></div>
        <div class="red-reveal-inner">
          <div class="red-reveal-badge" id="red-reveal-badge">SWITCHING ISSUE...</div>
          <div class="red-reveal-title" id="red-reveal-title">NEXT PAGE</div>
        </div>
      </div>
    `;

    document.body.appendChild(transitionOverlay);
    this.transitionOverlay = transitionOverlay;
  }

  setupWebCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.webCanvas.width = window.innerWidth;
    this.webCanvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('scroll', () => {
      this.targetScroll = window.scrollY;
    }, { passive: true });

    this.crawlerEl.addEventListener('click', () => {
      if (this.isTransitioning) return;
      if (window.comicAudio) window.comicAudio.playThwip();
      this.showBubble("THWIP! Hanging upside-down! Click any tab to see me flip!", 3000);
      this.triggerWebBounce();
    });

    this.crawlerEl.addEventListener('mouseenter', () => {
      this.crawlerEl.classList.add('hover-bob');
    });
    this.crawlerEl.addEventListener('mouseleave', () => {
      this.crawlerEl.classList.remove('hover-bob');
    });
  }

  triggerWebBounce() {
    this.crawlerEl.classList.remove('bounce-action');
    void this.crawlerEl.offsetWidth;
    this.crawlerEl.classList.add('bounce-action');
  }

  showBubble(text, duration = 2500) {
    if (!this.speechBubble) return;
    this.speechBubble.querySelector('span').innerText = text;
    this.speechBubble.classList.add('active');
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      this.speechBubble.classList.remove('active');
    }, duration);
  }

  // Draw continuous silk strand from top of screen to Spider-Man's hand
  drawWebLine(spideyScreenX, spideyScreenY, swayOffset = 0) {
    const ctx = this.webCtx;
    ctx.clearRect(0, 0, this.webCanvas.width, this.webCanvas.height);

    if (this.isTransitioning) return;

    const anchorX = spideyScreenX + this.webAnchorOffsetX + swayOffset;
    const anchorY = 0;
    const targetY = spideyScreenY + 4;

    ctx.save();

    // Shadow strand
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.4)';
    ctx.beginPath();
    ctx.moveTo(anchorX + 2, anchorY);
    ctx.quadraticCurveTo(anchorX + 2 + swayOffset * 0.35, targetY / 2, anchorX + 2, targetY);
    ctx.stroke();

    // Main silk strand
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.quadraticCurveTo(anchorX + swayOffset * 0.35, targetY / 2, anchorX, targetY);
    ctx.stroke();

    // Silk spiral knots
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#D8EDFA';
    const knots = Math.floor(targetY / 20);
    for (let i = 1; i < knots; i++) {
      const ky = i * 20;
      const kx = anchorX + Math.sin(i * 0.9 + Date.now() * 0.004) * 1.8;
      ctx.beginPath();
      ctx.arc(kx, ky, 2.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Scroll friction particles
    if (Math.abs(this.slideVelocity) > 0.8) {
      this.emitFrictionParticles(anchorX, targetY + 30);
    }

    this.renderParticles(ctx);

    ctx.restore();
  }

  emitFrictionParticles(x, y) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 1,
        life: 1,
        size: Math.random() * 2.5 + 1.5,
        color: Math.random() > 0.4 ? '#FFFFFF' : '#FFDE00'
      });
    }
  }

  renderParticles(ctx) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  animate() {
    this.currentScroll += (this.targetScroll - this.currentScroll) * 0.12;

    const scrollDelta = this.currentScroll - this.lastScroll;
    this.slideVelocity = scrollDelta;
    this.lastScroll = this.currentScroll;

    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    ) - window.innerHeight;

    const progress = docHeight > 0 ? Math.min(Math.max(this.currentScroll / docHeight, 0), 1) : 0;
    this.scrollProgress = progress;

    if (!this.isTransitioning) {
      this.updatePosition();
    }

    requestAnimationFrame(() => this.animate());
  }

  updatePosition(immediate = false) {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const minY = 35;
    const maxY = viewportHeight - this.spideyHeight - 50;
    const currentY = minY + (maxY - minY) * this.scrollProgress;

    const rightGutter = viewportWidth > 768 ? Math.max(20, viewportWidth * 0.04) : 8;
    const currentX = viewportWidth - rightGutter - this.spideyWidth;

    const sway = Math.sin(Date.now() * 0.002) * 6;
    const tilt = Math.max(Math.min(this.slideVelocity * 0.3, 5), -5);

    this.spideyX = currentX;
    this.spideyY = currentY;

    if (this.crawlerEl) {
      this.crawlerEl.style.transform = `translate3d(${currentX + sway}px, ${currentY}px, 0) rotate(${sway * 0.45 + tilt}deg)`;
    }

    this.drawWebLine(currentX, currentY, sway);
  }

  /**
   * THE REVAMPED CINEMATIC TRANSITION:
   * 1. Spider-Man shoots a web directly onto the screen (camera glass splat) with a loud "THWIP!"
   * 2. Leaps into the center of the viewport and SLOWLY turns in 3D mid-air
   * 3. As his back turns to the camera, a VIBRANT RED BACKGROUND bursts out from his back,
   *    revealing the new screen underneath!
   * 4. Comic impact "BAM!" and smooth return to hanging web line
   */
  async switchSection(targetSectionId, targetSectionTitle, onSwitchCallback) {
    if (this.isTransitioning) return;
    if (this.currentSectionId === targetSectionId) return;

    this.isTransitioning = true;
    const overlay = this.transitionOverlay;
    const webSplat = document.getElementById('camera-web-splat');
    const jumpingSpidey = document.getElementById('jumping-spidey');
    const jumpingInner = document.getElementById('jumping-spidey-inner');
    const sfxBadge = document.getElementById('transition-sfx');
    const redReveal = document.getElementById('red-screen-reveal');
    const redBadge = document.getElementById('red-reveal-badge');
    const redTitle = document.getElementById('red-reveal-title');

    // Hide normal crawler
    this.crawlerEl.style.opacity = '0';
    this.webCtx.clearRect(0, 0, this.webCanvas.width, this.webCanvas.height);

    // Starting and center coordinates
    const startX = this.spideyX;
    const startY = this.spideyY;
    const targetCenterX = window.innerWidth / 2 - 120;
    const targetCenterY = window.innerHeight / 2 - 140;

    // Reset transition DOM states
    redBadge.innerText = `NOW ENTERING ISSUE:`;
    redTitle.innerText = targetSectionTitle.toUpperCase();

    overlay.classList.remove('hidden');
    overlay.classList.add('active');

    // Reset web splat & character transform
    webSplat.classList.remove('active-splat');
    redReveal.classList.remove('expand-red-screen');
    jumpingSpidey.style.transition = 'none';
    jumpingSpidey.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(0.65)`;
    jumpingInner.style.transition = 'none';
    jumpingInner.style.transform = 'rotateY(0deg)';

    sfxBadge.innerText = 'THWIP!';
    sfxBadge.className = 'comic-sound-fx show thwip-fx';

    void jumpingSpidey.offsetWidth;

    // STEP 1: SPIDER-MAN SHOOTS WEB DIRECTLY ONTO THE SCREEN!
    if (window.comicAudio) window.comicAudio.playThwip();
    webSplat.classList.add('active-splat');

    await this.wait(200);

    // STEP 2: LEAPS FORWARD & SLOWLY TURNS IN 3D MID-AIR
    if (window.comicAudio) window.comicAudio.playWhoosh();
    sfxBadge.innerText = 'WHOOSH!';
    sfxBadge.className = 'comic-sound-fx show whoosh-fx';

    // Leap to center
    jumpingSpidey.style.transition = 'transform 0.85s cubic-bezier(0.2, 0.8, 0.25, 1)';
    jumpingSpidey.style.transform = `translate3d(${targetCenterX}px, ${targetCenterY}px, 0) scale(1.75)`;

    // SLOW, DELIBERATE 3D TURN (revealing his muscular back)
    jumpingInner.style.transition = 'transform 0.9s cubic-bezier(0.35, 0, 0.25, 1)';
    jumpingInner.style.transform = 'rotateY(180deg)';

    await this.wait(500);

    // STEP 3: VIBRANT RED BACKGROUND BURSTS OUT DIRECTLY FROM HIS BACK!
    sfxBadge.innerText = 'BAM!';
    sfxBadge.className = 'comic-sound-fx show bam-fx';
    if (window.comicAudio) window.comicAudio.playImpact();

    redReveal.classList.add('expand-red-screen');
    jumpingSpidey.style.transition = 'transform 0.5s ease-in';
    jumpingSpidey.style.transform = `translate3d(${targetCenterX}px, ${targetCenterY}px, 0) scale(9)`;

    await this.wait(400);

    // STEP 4: Switch DOM screen content under the red background
    if (onSwitchCallback) {
      onSwitchCallback(targetSectionId);
    }
    this.currentSectionId = targetSectionId;

    // Reset scroll to top of new section
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.currentScroll = 0;
    this.targetScroll = 0;
    this.scrollProgress = 0;

    await this.wait(350);

    // STEP 5: Smoothly fade out red transition and return Spider-Man to his web line
    overlay.classList.remove('active');
    await this.wait(280);
    overlay.classList.add('hidden');
    webSplat.classList.remove('active-splat');
    redReveal.classList.remove('expand-red-screen');

    // Restore Spidey hanging upside-down on the new page
    this.crawlerEl.style.opacity = '1';
    this.updatePosition();
    this.triggerWebBounce();
    this.showBubble(`Welcome to ${targetSectionTitle}!`, 2800);

    this.isTransitioning = false;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.spidermanController = null;
document.addEventListener('DOMContentLoaded', () => {
  window.spidermanController = new SpiderManController();
});
