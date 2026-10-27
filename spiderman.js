/**
 * Spider-Man Character Controller
 * 
 * Features:
 * 1. Exact upside-down hanging Spider-Man from the reference artwork
 * 2. Continuous descending along vertical web strand through all sections
 * 3. ZERO-GLITCH GUARANTEED: Container position translate3d(currentX, currentY) is permanently preserved
 * 4. PULL-PAGE-TO-THE-RIGHT TRANSITION:
 *    - Spider-Man shoots a web from his free hand to the screen glass ("THWIP!")
 *    - Web splat attaches to the screen
 *    - Spider-Man pulls with muscular recoil towards the right
 *    - The current page physically gets yanked and SLIDES TO THE RIGHT!
 *    - Vibrant red comic background revealed underneath with "NOW ENTERING: [SECTION]"
 *    - BAM! Impact sound, instant scroll to target section, page resets smoothly
 */

class SpiderManController {
  constructor() {
    this.container = null;
    this.crawlerEl = null;
    this.webCanvas = null;
    this.webCtx = null;
    this.speechBubble = null;

    this.currentScroll = 0;
    this.targetScroll = 0;
    this.scrollProgress = 0;
    this.isTransitioning = false;
    this.currentSectionId = 'home';

    // Physics & Sway
    this.slideVelocity = 0;
    this.lastScroll = 0;
    this.particles = [];

    // Pull Animation Web Line State
    this.pullWeb = {
      active: false,
      startX: 0,
      startY: 0,
      targetX: 0,
      targetY: 0,
      progress: 0,
      tension: 0
    };

    // Normalized dimensions (482x562 original):
    // Hanging web anchor at top: x = 227 / 482 = 0.471
    // Free hand: x = 315 / 482 = 0.653, y = 428 / 562 = 0.761
    this.spideyWidth = 175;
    this.spideyHeight = Math.round(175 * (562 / 482)); // ~204px
    this.webAnchorOffsetX = Math.round(this.spideyWidth * 0.471); // ~82px
    this.freeHandOffsetX = Math.round(this.spideyWidth * 0.653);  // ~114px
    this.freeHandOffsetY = Math.round(this.spideyHeight * 0.761); // ~155px

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
    const wrapper = document.createElement('div');
    wrapper.id = 'spidey-container';
    wrapper.innerHTML = `
      <canvas id="spidey-web-canvas"></canvas>
      
      <!-- Spider-Man Hanging Upside Down (Container NEVER teleports) -->
      <div id="spidey-crawler" class="spidey-crawler spidey-hanging-upside-down" title="Click me to interact!">
        <div class="spidey-speech-bubble" id="spidey-bubble">
          <span>Hanging around! Scroll to explore!</span>
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

      <!-- WEB SPLAT ATTACHED ONTO THE SCREEN GLASS -->
      <div class="screen-pull-splat" id="screen-pull-splat">
        <svg viewBox="0 0 320 320" class="pull-splat-svg">
          <g stroke="#FFFFFF" stroke-linecap="round" fill="none">
            <ellipse cx="160" cy="160" rx="16" ry="16" fill="#FFFFFF" stroke="#111" stroke-width="4"/>
            <path d="M 160,160 L 20,40 M 160,160 L 160,10 M 160,160 L 300,40" stroke-width="4.5"/>
            <path d="M 160,160 L 310,160 M 160,160 L 300,280 M 160,160 L 160,310" stroke-width="4.5"/>
            <path d="M 160,160 L 20,280 M 160,160 L 10,160" stroke-width="4.5"/>
            <path d="M 160,160 L 80,20 M 160,160 L 240,20 M 160,160 L 300,100" stroke-width="3"/>
            <path d="M 160,160 L 300,220 M 160,160 L 240,300 M 160,160 L 80,300" stroke-width="3"/>
            <path d="M 120,130 Q 160,115 200,130 Q 215,160 200,190 Q 160,205 120,190 Q 105,160 120,130 Z" stroke-width="3"/>
            <path d="M 70,90 Q 160,60 250,90 Q 275,160 250,230 Q 160,260 70,230 Q 45,160 70,90 Z" stroke-width="3.5"/>
          </g>
        </svg>
      </div>
    `;

    document.body.appendChild(wrapper);

    this.container = wrapper;
    this.crawlerEl = document.getElementById('spidey-crawler');
    this.hangImgEl = document.getElementById('spidey-hang-img');
    this.webCanvas = document.getElementById('spidey-web-canvas');
    this.webCtx = this.webCanvas.getContext('2d');
    this.speechBubble = document.getElementById('spidey-bubble');
    this.pullSplatEl = document.getElementById('screen-pull-splat');
    this.mainWrapperEl = document.getElementById('main-wrapper');
    this.backdropEl = document.getElementById('transition-backdrop');
    this.backdropTitleEl = document.getElementById('backdrop-title');
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
      this.showBubble("THWIP! Click any tab to see me pull the page to the right!", 3000);
      this.triggerWebBounce();
    });

    this.crawlerEl.addEventListener('mouseenter', () => {
      this.crawlerEl.classList.add('hover-bob');
    });
    this.crawlerEl.addEventListener('mouseleave', () => {
      this.crawlerEl.classList.remove('hover-bob');
    });
  }

  // Bounce applied to inner img so container position never glitches
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

  // Draw continuous hanging web line + dynamic pull web line
  drawWebCanvas(spideyScreenX, spideyScreenY, swayOffset = 0) {
    const ctx = this.webCtx;
    ctx.clearRect(0, 0, this.webCanvas.width, this.webCanvas.height);

    // 1. VERTICAL HANGING WEB STRAND (Anchor at top of screen)
    const anchorX = spideyScreenX + this.webAnchorOffsetX + swayOffset;
    const anchorY = 0;
    const targetY = spideyScreenY + 4;

    ctx.save();

    // Shadow
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

    // Spiral knots
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
    if (Math.abs(this.slideVelocity) > 0.8 && !this.isTransitioning) {
      this.emitFrictionParticles(anchorX, targetY + 30);
    }
    this.renderParticles(ctx);

    // 2. DYNAMIC PULL WEB LINE (From free hand to screen splat)
    if (this.pullWeb.active) {
      const handX = spideyScreenX + this.freeHandOffsetX + swayOffset;
      const handY = spideyScreenY + this.freeHandOffsetY;

      const p = this.pullWeb.progress;
      const currentTargetX = handX + (this.pullWeb.targetX - handX) * p;
      const currentTargetY = handY + (this.pullWeb.targetY - handY) * p;

      const tensionVibe = Math.sin(Date.now() * 0.05) * this.pullWeb.tension * 8;

      ctx.save();
      // Drop shadow
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#111111';
      ctx.beginPath();
      ctx.moveTo(handX + 2, handY + 3);
      ctx.quadraticCurveTo(
        (handX + currentTargetX) / 2 + tensionVibe,
        (handY + currentTargetY) / 2 + 15,
        currentTargetX + 2,
        currentTargetY + 3
      );
      ctx.stroke();

      // Bold white braided web cable
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.quadraticCurveTo(
        (handX + currentTargetX) / 2 + tensionVibe,
        (handY + currentTargetY) / 2 + 15,
        currentTargetX,
        currentTargetY
      );
      ctx.stroke();

      // Cyan core highlight
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#C5E6FF';
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.quadraticCurveTo(
        (handX + currentTargetX) / 2 + tensionVibe,
        (handY + currentTargetY) / 2 + 15,
        currentTargetX,
        currentTargetY
      );
      ctx.stroke();

      // Glowing projectile tip while web is flying across screen
      if (p < 0.98) {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(currentTargetX, currentTargetY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(currentTargetX, currentTargetY, 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

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

    this.updatePosition();

    requestAnimationFrame(() => this.animate());
  }

  updatePosition(immediate = false) {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Continuous sliding down the viewport as user scrolls
    const minY = 35;
    const maxY = viewportHeight - this.spideyHeight - 50;
    const currentY = minY + (maxY - minY) * this.scrollProgress;

    // Firmly anchored on the right margin (NEVER jumps to opposite side!)
    const rightGutter = viewportWidth > 768 ? Math.max(20, viewportWidth * 0.04) : 8;
    const currentX = viewportWidth - rightGutter - this.spideyWidth;

    const sway = Math.sin(Date.now() * 0.002) * 6;
    const tilt = Math.max(Math.min(this.slideVelocity * 0.3, 5), -5);

    this.spideyX = currentX;
    this.spideyY = currentY;

    if (this.crawlerEl) {
      // Container ALWAYS retains translate3d(currentX, currentY)
      this.crawlerEl.style.transform = `translate3d(${currentX + sway}px, ${currentY}px, 0) rotate(${sway * 0.45 + tilt}deg)`;
    }

    this.drawWebCanvas(currentX, currentY, sway);
  }

  /**
   * THE EXACT TRANSITION REQUESTED:
   * 1. Spider-Man shoots a web from his free hand onto a RANDOM non-center screen position (never covers text!)
   * 2. Web flies smoothly and deliberately (560ms) so user can clearly follow the projectile
   * 3. Web splat attaches to screen glass
   * 4. Spider-Man pulls with recoil towards the right
   * 5. The pre-transition page physically gets pulled and smoothly slides to the RIGHT (0.65s)!
   * 6. Behind it, a vibrant red comic background is revealed with "NOW ENTERING: [SECTION]"
   * 7. "BAM!" impact, scroll sets to target section, page resets smoothly
   */
  async switchSection(targetSectionId, targetSectionTitle, onSwitchCallback) {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    const splat = this.pullSplatEl;
    const mainWrapper = this.mainWrapperEl;
    const backdrop = this.backdropEl;

    if (this.backdropTitleEl) {
      this.backdropTitleEl.innerText = targetSectionTitle.toUpperCase();
    }

    // Hand position on the right side
    const handX = this.spideyX + this.freeHandOffsetX;
    const handY = this.spideyY + this.freeHandOffsetY;

    // RANDOM STRIKE POSITION AWAY FROM CENTER (Never covers central text!)
    // Selects from peripheral zones around screen margins:
    const strikeZones = [
      { xMin: 0.12, xMax: 0.28, yMin: 0.18, yMax: 0.32 }, // Upper-Left
      { xMin: 0.08, xMax: 0.22, yMin: 0.44, yMax: 0.62 }, // Mid-Left
      { xMin: 0.12, xMax: 0.28, yMin: 0.70, yMax: 0.85 }, // Lower-Left
      { xMin: 0.62, xMax: 0.76, yMin: 0.16, yMax: 0.28 }, // Upper-Right
      { xMin: 0.58, xMax: 0.74, yMin: 0.72, yMax: 0.85 }  // Lower-Right
    ];
    const zone = strikeZones[Math.floor(Math.random() * strikeZones.length)];
    const screenTargetX = window.innerWidth * (zone.xMin + Math.random() * (zone.xMax - zone.xMin));
    const screenTargetY = window.innerHeight * (zone.yMin + Math.random() * (zone.yMax - zone.yMin));

    // STEP 1: SPIDER-MAN SHOOTS WEB FROM FREE HAND ONTO SCREEN!
    if (window.comicAudio) window.comicAudio.playThwip();
    this.showBubble("THWIP! Got the page! Pulling it to the right!", 3000);

    splat.style.left = `${screenTargetX}px`;
    splat.style.top = `${screenTargetY}px`;

    this.pullWeb.active = true;
    this.pullWeb.startX = handX;
    this.pullWeb.startY = handY;
    this.pullWeb.targetX = screenTargetX;
    this.pullWeb.targetY = screenTargetY;
    this.pullWeb.progress = 0;
    this.pullWeb.tension = 0;

    // Shoot line slowly and deliberately (560ms) with smooth cubic ease-out
    const startTime = performance.now();
    const shootDuration = 560;

    await new Promise(resolve => {
      const shootStep = (now) => {
        const elapsed = now - startTime;
        const rawProgress = Math.min(elapsed / shootDuration, 1);
        // Smooth cubic ease-out so user can clearly follow the flight
        this.pullWeb.progress = 1 - Math.pow(1 - rawProgress, 3);
        if (rawProgress < 1) {
          requestAnimationFrame(shootStep);
        } else {
          this.pullWeb.progress = 1;
          resolve();
        }
      };
      requestAnimationFrame(shootStep);
    });

    // Splat pops onto screen glass at the random anchor
    splat.classList.add('splat-active');
    await this.wait(220);

    // STEP 2: SPIDER-MAN HEAVES & PULLS TOWARDS THE RIGHT!
    if (window.comicAudio) window.comicAudio.playWhoosh();

    this.crawlerEl.classList.add('spidey-pulling-recoil');
    this.pullWeb.tension = 1.0;
    this.pullWeb.targetX = handX + 70; // Pulls towards himself on the right

    await this.wait(180);

    // STEP 3: PRE-TRANSITION PAGE GETS YANKED AND SLIDES TO THE RIGHT (0.65s)!
    if (backdrop) backdrop.classList.add('active');
    if (mainWrapper) mainWrapper.classList.add('pull-page-right');

    await this.wait(550);

    // STEP 4: IMPACT "BAM!" & SET POSITION TO TARGET SECTION
    if (window.comicAudio) window.comicAudio.playImpact();

    const targetEl = document.getElementById(`section-${targetSectionId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    }

    if (onSwitchCallback) {
      onSwitchCallback(targetSectionId);
    }
    this.currentSectionId = targetSectionId;

    await this.wait(350);

    // STEP 5: PAGE RESETS INTO PLACE & RELEASE WEB
    this.pullWeb.active = false;
    splat.classList.remove('splat-active');
    this.crawlerEl.classList.remove('spidey-pulling-recoil');

    if (mainWrapper) mainWrapper.classList.remove('pull-page-right');
    if (backdrop) backdrop.classList.remove('active');

    await this.wait(400);

    // Settle bounce on the web line (applied to inner img, zero glitch!)
    this.updatePosition();
    this.triggerWebBounce();
    this.showBubble(`Welcome to ${targetSectionTitle}!`, 2500);

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
