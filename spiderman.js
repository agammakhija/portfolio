/**
 * Spider-Man Character Controller
 * 
 * Features:
 * 1. Upside-down hanging Spider-Man from the reference artwork
 * 2. Continuous descending along vertical web strand through all sections
 * 3. SCREEN WEB-SHOOT & PULL TRANSITION (PURE RIGHT-TO-LEFT):
 *    - Spider-Man shoots a web from his free hand directly onto the screen ("THWIP!")
 *    - Web splat attaches to the screen
 *    - Spider-Man physically heaves and recoils (inner image animates, zero position teleportation)
 *    - The pull sweeps a bold RED COMIC CURTAIN from RIGHT to LEFT across the screen!
 *    - Smoothly scrolls to the requested section and exits off to the left!
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
      
      <!-- Spider-Man Hanging Upside Down -->
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

      <!-- ONOMATOPOEIA BADGE -->
      <div class="comic-sound-fx" id="transition-sfx">THWIP!</div>

      <!-- RED COMIC TRANSITION CURTAIN (PURE RIGHT-TO-LEFT SWEEP) -->
      <div class="red-pull-curtain" id="red-pull-curtain">
        <div class="curtain-halftone-overlay"></div>
        <div class="curtain-action-lines"></div>
        
        <div class="curtain-content">
          <div class="curtain-badge" id="curtain-badge">NEW ISSUE INCOMING</div>
          <div class="curtain-title" id="curtain-title">PROJECTS</div>
          <div class="curtain-subtitle">PULLED RIGHT-TO-LEFT BY SPIDER-MAN!</div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    this.container = wrapper;
    this.crawlerEl = document.getElementById('spidey-crawler');
    this.webCanvas = document.getElementById('spidey-web-canvas');
    this.webCtx = this.webCanvas.getContext('2d');
    this.speechBubble = document.getElementById('spidey-bubble');
    this.pullSplatEl = document.getElementById('screen-pull-splat');
    this.pullCurtainEl = document.getElementById('red-pull-curtain');
    this.sfxEl = document.getElementById('transition-sfx');
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
      this.showBubble("THWIP! Scroll down to see my Education & Projects!", 3000);
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

    // 2. DYNAMIC PULL WEB LINE (Shooting from Spidey's free hand across to the screen)
    if (this.pullWeb.active) {
      const handX = spideyScreenX + this.freeHandOffsetX + swayOffset;
      const handY = spideyScreenY + this.freeHandOffsetY;

      const p = this.pullWeb.progress;
      const currentTargetX = handX + (this.pullWeb.targetX - handX) * p;
      const currentTargetY = handY + (this.pullWeb.targetY - handY) * p;

      // Elastic tension vibration
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

    // Firmly placed on the right margin (NEVER jumps to opposite side!)
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
   * PURE RIGHT-TO-LEFT SCREEN WEB PULL TRANSITION:
   * 1. Spider-Man shoots web from his free hand onto the screen ("THWIP!")
   * 2. Web splat attaches to screen center
   * 3. Spider-Man pulls with recoil effort (inner image animates, container NEVER teleports!)
   * 4. The pull DRAGS the RED COMIC CURTAIN from RIGHT to LEFT across the screen!
   * 5. Smoothly scrolls down to the target section
   * 6. The red curtain continues out off-screen to the LEFT!
   */
  async switchSection(targetSectionId, targetSectionTitle, onSwitchCallback) {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    const sfx = this.sfxEl;
    const splat = this.pullSplatEl;
    const curtain = this.pullCurtainEl;
    const badge = document.getElementById('curtain-badge');
    const title = document.getElementById('curtain-title');

    badge.innerText = `NOW ENTERING:`;
    title.innerText = targetSectionTitle.toUpperCase();

    // Hand position on the right side
    const handX = this.spideyX + this.freeHandOffsetX;
    const handY = this.spideyY + this.freeHandOffsetY;

    // Target position on screen
    const screenCenterX = window.innerWidth * 0.45;
    const screenCenterY = window.innerHeight * 0.48;

    // Reset curtain to start off-screen on the RIGHT (105vw)
    curtain.classList.remove('curtain-pulling-in', 'curtain-settle-out');
    void curtain.offsetWidth; // Force reflow

    // STEP 1: SPIDER-MAN SHOOTS WEB FROM FREE HAND ONTO SCREEN!
    if (window.comicAudio) window.comicAudio.playThwip();
    this.showBubble("THWIP! Got the screen! Pulling it in!", 2500);

    splat.style.left = `${screenCenterX}px`;
    splat.style.top = `${screenCenterY}px`;

    this.pullWeb.active = true;
    this.pullWeb.startX = handX;
    this.pullWeb.startY = handY;
    this.pullWeb.targetX = screenCenterX;
    this.pullWeb.targetY = screenCenterY;
    this.pullWeb.progress = 0;
    this.pullWeb.tension = 0;

    sfx.innerText = 'THWIP!';
    sfx.className = 'comic-sound-fx show thwip-fx';

    // Shoot line rapidly from hand to screen (170ms)
    const startTime = performance.now();
    const shootDuration = 170;

    await new Promise(resolve => {
      const shootStep = (now) => {
        const elapsed = now - startTime;
        this.pullWeb.progress = Math.min(elapsed / shootDuration, 1);
        if (this.pullWeb.progress < 1) {
          requestAnimationFrame(shootStep);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(shootStep);
    });

    splat.classList.add('splat-active');
    await this.wait(100);

    // STEP 2: SPIDER-MAN HEAVES BACKWARD (NO CONTAINER TELEPORT GLITCH!)
    if (window.comicAudio) window.comicAudio.playWhoosh();
    sfx.innerText = 'YANK!';
    sfx.className = 'comic-sound-fx show whoosh-fx';

    this.crawlerEl.classList.add('spidey-pulling-recoil');
    this.pullWeb.tension = 1.0;
    this.pullWeb.targetX = handX - 160;

    await this.wait(100);

    // STEP 3: RED CURTAIN SWEEPS IN FROM RIGHT TO LEFT!
    curtain.classList.add('curtain-pulling-in');
    document.body.classList.add('page-being-pulled');

    await this.wait(380);

    // STEP 4: IMPACT "BAM!" & SCROLL CONTINUOUSLY TO TARGET SECTION
    sfx.innerText = 'BAM!';
    sfx.className = 'comic-sound-fx show bam-fx';
    if (window.comicAudio) window.comicAudio.playImpact();

    const targetEl = document.getElementById(`section-${targetSectionId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    }

    if (onSwitchCallback) {
      onSwitchCallback(targetSectionId);
    }
    this.currentSectionId = targetSectionId;

    await this.wait(250);

    // STEP 5: RED CURTAIN CONTINUES OFF-SCREEN TO THE LEFT (PURE RIGHT-TO-LEFT!)
    this.pullWeb.active = false;
    splat.classList.remove('splat-active');
    this.crawlerEl.classList.remove('spidey-pulling-recoil');

    curtain.classList.add('curtain-settle-out');

    await this.wait(400);

    curtain.classList.remove('curtain-pulling-in', 'curtain-settle-out');
    document.body.classList.remove('page-being-pulled');

    // Settle bounce on the web line
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
