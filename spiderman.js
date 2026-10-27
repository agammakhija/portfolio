/**
 * Spider-Man Character Controller - Realistic Hanging & Sliding Down the Web
 * Features:
 * 1. Hanging from vertical web strand with hands gripping the line
 * 2. Sliding smoothly down the web line as user scrolls, with silk friction particles & gentle sway
 * 3. Leap & 180° back-flip section transition (new screen unfolds from his back emblem)
 * 4. Realistic comic anatomy, shaded suit textures, responsive squint and comments
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
    this.swayAngle = 0;
    this.slideVelocity = 0;
    this.lastScroll = 0;
    this.particles = [];

    // Spidey coordinates
    this.spideyX = 0;
    this.spideyY = 60;

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
    // 1. Hanging Spider-Man Container
    const wrapper = document.createElement('div');
    wrapper.id = 'spidey-container';
    wrapper.innerHTML = `
      <canvas id="spidey-web-canvas"></canvas>
      <div id="spidey-crawler" class="spidey-crawler spidey-hanging" title="Click me to interact!">
        
        <div class="spidey-speech-bubble" id="spidey-bubble">
          <span>Sliding down the web! Keep scrolling!</span>
        </div>

        <!-- Realistic Hanging Spider-Man SVG -->
        <div class="spidey-body-wrapper" id="spidey-body-wrapper">
          <svg class="spidey-svg" id="spidey-hang-svg" viewBox="0 0 200 300" width="140" height="210">
            <defs>
              <!-- Drop shadow for comic ink depth -->
              <filter id="spidey-ink-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="4" dy="6" stdDeviation="0" flood-color="#050505" flood-opacity="0.95"/>
              </filter>

              <!-- Suit Red Gradient with deep comic shading -->
              <linearGradient id="spidey-suit-red" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stop-color="#FF3849" />
                <stop offset="45%" stop-color="#D91627" />
                <stop offset="85%" stop-color="#9C0A17" />
                <stop offset="100%" stop-color="#6E050F" />
              </linearGradient>

              <!-- Suit Blue Gradient with muscle contour depth -->
              <linearGradient id="spidey-suit-blue" x1="0%" y1="20%" x2="100%" y2="90%">
                <stop offset="0%" stop-color="#2472BA" />
                <stop offset="50%" stop-color="#12518C" />
                <stop offset="85%" stop-color="#0A3660" />
                <stop offset="100%" stop-color="#051D36" />
              </linearGradient>

              <!-- Eye Lenses with pearlescent glare -->
              <linearGradient id="spidey-lens" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="65%" stop-color="#F0F6FA" />
                <stop offset="100%" stop-color="#C2DCF2" />
              </linearGradient>

              <!-- Web line highlight pattern -->
              <linearGradient id="web-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="50%" stop-color="#E2F1FD" />
                <stop offset="100%" stop-color="#A9D4F7" />
              </linearGradient>
            </defs>

            <!-- SPIDER-MAN HANGING & SLIDING ON VERTICAL WEB STRAND -->
            <g id="spidey-hanging-rig" filter="url(#spidey-ink-shadow)">

              <!-- UPPER EXTENDED ARM & HAND (Reaching high up, gripping the web strand at x=100) -->
              <g id="upper-arm-group">
                <!-- Shoulder to Elbow -->
                <path d="M 85,90 Q 72,55 86,30 Q 94,32 96,48 L 95,90 Z" fill="url(#spidey-suit-blue)" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
                <!-- Forearm to Wrist (Red suit with web lines) -->
                <path d="M 86,30 Q 88,18 94,10 L 106,12 Q 102,25 96,48 Z" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="3"/>
                <!-- Upper Hand / Glove firmly clasped around the web at (100, 10) -->
                <path d="M 94,12 C 92,6 98,2 105,4 C 110,6 110,14 105,18 C 100,21 95,18 94,12 Z" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="2.5"/>
                <!-- Fingers wrapped over web -->
                <path d="M 97,6 Q 102,5 106,9 M 97,10 Q 103,9 106,13 M 97,14 Q 102,13 105,16" stroke="#111" stroke-width="1.8" fill="none"/>
              </g>

              <!-- LEGS IN CLASSIC ACROBATIC HANG POSE -->
              <!-- Back Leg (Right leg tucked in acrobatic counter-balance) -->
              <g id="leg-back">
                <!-- Thigh -->
                <path d="M 115,165 Q 145,180 150,210 Q 140,215 125,200 L 105,175 Z" fill="url(#spidey-suit-blue)" stroke="#111" stroke-width="3.5" stroke-linejoin="round"/>
                <!-- Calf & Boot -->
                <path d="M 150,210 Q 155,235 142,260 Q 134,260 132,248 L 125,200 Z" fill="url(#spidey-suit-blue)" stroke="#111" stroke-width="3"/>
                <!-- Red Boot -->
                <path d="M 144,242 L 142,265 C 136,270 128,266 128,258 L 134,240 Z" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="3"/>
                <path d="M 132,252 L 140,250 M 130,260 L 138,258" stroke="#111" stroke-width="1.5"/>
              </g>

              <!-- Front Leg (Left leg flexed forward, knee bent, near web line) -->
              <g id="leg-front">
                <!-- Thigh -->
                <path d="M 80,165 Q 50,185 55,220 Q 65,224 80,205 L 95,175 Z" fill="url(#spidey-suit-blue)" stroke="#111" stroke-width="3.5" stroke-linejoin="round"/>
                <!-- Calf -->
                <path d="M 55,220 Q 62,250 82,265 Q 88,258 84,240 L 80,205 Z" fill="url(#spidey-suit-blue)" stroke="#111" stroke-width="3"/>
                <!-- Red Boot reaching towards center web line -->
                <path d="M 78,245 L 88,272 C 94,275 98,268 96,260 L 84,240 Z" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="3"/>
                <path d="M 82,255 L 92,258 M 85,264 L 94,266" stroke="#111" stroke-width="1.5"/>
              </g>

              <!-- MAIN TORSO (Muscular comic form, red center with black web, blue ribs) -->
              <g id="spidey-torso">
                <!-- Blue side panels / Latissimus dorsi -->
                <path d="M 72,90 C 65,125 68,155 76,172 L 118,172 C 126,155 128,125 122,90 Z" fill="url(#spidey-suit-blue)" stroke="#111" stroke-width="3.5" stroke-linejoin="round"/>
                
                <!-- Red Center Suit Panel -->
                <path d="M 82,88 C 76,120 78,155 84,172 L 110,172 C 116,155 118,120 114,88 Z" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="3"/>

                <!-- Webbing grid on red torso -->
                <g stroke="#111" stroke-width="1.4" opacity="0.85">
                  <path d="M 98,88 L 98,172"/>
                  <path d="M 83,105 Q 98,114 113,105"/>
                  <path d="M 80,125 Q 98,136 116,125"/>
                  <path d="M 81,146 Q 98,155 114,146"/>
                  <path d="M 83,162 Q 98,168 111,162"/>
                </g>

                <!-- Sharp Classic Black Spider Emblem on Chest -->
                <g id="chest-spider">
                  <ellipse cx="98" cy="125" rx="3.5" ry="6" fill="#111"/>
                  <circle cx="98" cy="117" r="2.5" fill="#111"/>
                  <!-- Upper legs -->
                  <path d="M 96,120 Q 82,108 78,96 M 100,120 Q 114,108 118,96" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                  <path d="M 96,123 Q 80,118 76,109 M 100,123 Q 116,118 120,109" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                  <!-- Lower legs -->
                  <path d="M 96,127 Q 80,135 80,150 M 100,127 Q 116,135 116,150" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                  <path d="M 97,130 Q 86,146 88,160 M 99,130 Q 110,146 108,160" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- Comic muscle shading contour lines -->
                <path d="M 90,138 Q 98,142 106,138" stroke="#111" stroke-width="2" fill="none"/>
                <path d="M 92,156 Q 98,160 104,156" stroke="#111" stroke-width="1.8" fill="none"/>
              </g>

              <!-- LOWER ARM & HAND (Positioned lower, guiding/sliding along the web at x=100) -->
              <g id="lower-arm-group">
                <!-- Shoulder to Elbow -->
                <path d="M 118,100 Q 138,115 130,135 L 118,135 Z" fill="url(#spidey-suit-blue)" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
                <!-- Forearm into center web strand -->
                <path d="M 130,135 Q 120,142 108,136 L 105,124 Q 118,124 118,135 Z" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="3"/>
                <!-- Lower Hand gripping / sliding along the web strand at (100, 130) -->
                <path d="M 108,132 C 108,126 102,123 96,126 C 92,129 93,136 98,139 C 104,141 108,137 108,132 Z" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="2.5"/>
                <!-- Fingers curling around the vertical silk line -->
                <path d="M 97,126 Q 102,128 106,132 M 98,131 Q 103,133 106,136" stroke="#111" stroke-width="1.8" fill="none"/>
              </g>

              <!-- SPIDER-MAN HEAD / MASK (Realistic angles, slightly tilted looking towards the user) -->
              <g id="spidey-head-group">
                <!-- Neck -->
                <path d="M 92,85 L 104,85 L 102,95 L 94,95 Z" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="2"/>

                <!-- Mask Contour with 3D drop depth -->
                <ellipse cx="98" cy="65" rx="26" ry="32" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="3.5" transform="rotate(-3 98 65)"/>

                <!-- Mask Webbing Pattern radiating outward -->
                <g stroke="#111" stroke-width="1.4" opacity="0.85" transform="rotate(-3 98 65)">
                  <!-- Radiating Spoke Lines -->
                  <path d="M 98,33 L 98,97"/>
                  <path d="M 72,65 L 124,65"/>
                  <path d="M 77,44 L 119,86"/>
                  <path d="M 77,86 L 119,44"/>
                  <!-- Concentric Spider Web Rings -->
                  <ellipse cx="98" cy="65" rx="8" ry="10" fill="none"/>
                  <ellipse cx="98" cy="65" rx="16" ry="19" fill="none"/>
                  <ellipse cx="98" cy="65" rx="23" ry="28" fill="none"/>
                </g>

                <!-- Left Eye (Iconic angled white comic lens with sharp black frame) -->
                <g id="spidey-eye-left" class="spidey-eye">
                  <path d="M 95,57 Q 83,50 76,64 Q 82,78 94,74 Z" fill="#111"/>
                  <path d="M 93,58 Q 84,52 78,63 Q 83,75 92,72 Z" fill="url(#spidey-lens)"/>
                  <!-- Subtle glare spot -->
                  <ellipse cx="85" cy="62" rx="3.5" ry="1.8" fill="#FFF" transform="rotate(-20 85 62)"/>
                </g>

                <!-- Right Eye (Slight perspective tilt) -->
                <g id="spidey-eye-right" class="spidey-eye">
                  <path d="M 101,57 Q 113,50 120,64 Q 114,78 102,74 Z" fill="#111"/>
                  <path d="M 103,58 Q 112,52 118,63 Q 113,75 104,72 Z" fill="url(#spidey-lens)"/>
                  <!-- Subtle glare spot -->
                  <ellipse cx="111" cy="62" rx="3.5" ry="1.8" fill="#FFF" transform="rotate(20 111 62)"/>
                </g>
              </g>

              <!-- SILK FRICTION PARTICLES ANCHOR (around hands) -->
              <g id="friction-sparks"></g>

            </g>
          </svg>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    this.container = wrapper;
    this.crawlerEl = document.getElementById('spidey-crawler');
    this.webCanvas = document.getElementById('spidey-web-canvas');
    this.webCtx = this.webCanvas.getContext('2d');
    this.speechBubble = document.getElementById('spidey-bubble');

    // 2. Fullscreen Leap & Back-Turn Transition Overlay
    const transitionOverlay = document.createElement('div');
    transitionOverlay.id = 'spidey-transition-stage';
    transitionOverlay.className = 'spidey-transition-stage hidden';
    transitionOverlay.innerHTML = `
      <div class="speed-lines-container" id="speed-lines"></div>
      <div class="comic-sound-fx" id="transition-sfx">THWIP!</div>

      <div class="jumping-spidey" id="jumping-spidey">
        <div class="jumping-spidey-inner" id="jumping-spidey-inner">
          
          <!-- FRONT VIEW (During initial release from web) -->
          <div class="spidey-leap-front">
            <svg viewBox="0 0 220 260" width="100%" height="100%">
              <g filter="drop-shadow(6px 8px 0px #000)">
                <path d="M 80,120 Q 30,100 10,70 L 25,65 Q 45,90 85,110 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 10,70 L 5,50 L 22,58 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
                <path d="M 120,120 Q 160,110 185,90 L 195,105 Q 165,130 115,130 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <circle cx="190" cy="95" r="14" fill="#D61827" stroke="#111" stroke-width="4"/>
                <path d="M 75,90 C 65,130 70,170 80,180 L 120,180 C 130,170 135,130 125,90 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 85,90 C 80,130 84,170 90,180 L 110,180 C 116,170 120,130 115,90 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
                <ellipse cx="100" cy="130" rx="4" ry="7" fill="#111"/>
                <ellipse cx="100" cy="70" rx="28" ry="35" fill="#D61827" stroke="#111" stroke-width="4"/>
                <path d="M 96,62 Q 82,55 75,70 Q 82,85 95,80 Z" fill="#FFF" stroke="#111" stroke-width="3"/>
                <path d="M 104,62 Q 118,55 125,70 Q 118,85 105,80 Z" fill="#FFF" stroke="#111" stroke-width="3"/>
                <path d="M 75,175 Q 40,190 35,225 L 52,230 Q 60,200 85,185 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 125,175 Q 160,190 165,225 L 148,230 Q 140,200 115,185 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
              </g>
            </svg>
          </div>

          <!-- BACK VIEW (Turning around mid-air - NEW SCREEN EXPANDS FROM HIS BACK!) -->
          <div class="spidey-leap-back" id="spidey-leap-back">
            <svg class="spidey-back-svg" viewBox="0 0 240 280" width="100%" height="100%">
              <g filter="drop-shadow(8px 10px 0px #000)">
                <path d="M 70,80 Q 20,60 5,95 L 18,105 Q 35,78 70,100 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 5,95 L 0,115 L 18,105 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
                <path d="M 170,80 Q 220,60 235,95 L 222,105 Q 205,78 170,100 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 235,95 L 240,115 L 222,105 Z" fill="#D61827" stroke="#111" stroke-width="4"/>
                <path d="M 55,75 C 45,130 55,190 70,210 L 170,210 C 185,190 195,130 185,75 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 72,70 C 66,120 75,180 82,210 L 158,210 C 165,180 174,120 168,70 Z" fill="url(#spidey-suit-red)" stroke="#111" stroke-width="4"/>
                
                <!-- Webbing lines across back -->
                <g stroke="#111" stroke-width="2" opacity="0.8">
                  <path d="M 120,70 L 120,210"/>
                  <path d="M 78,90 Q 120,100 162,90"/>
                  <path d="M 72,120 Q 120,135 168,120"/>
                  <path d="M 74,155 Q 120,170 166,155"/>
                  <path d="M 78,185 Q 120,195 162,185"/>
                </g>

                <ellipse cx="120" cy="50" rx="28" ry="34" fill="#D61827" stroke="#111" stroke-width="4"/>
                
                <!-- THE ICONIC RED BACK SPIDER EMBLEM -->
                <g id="spidey-back-symbol" class="spidey-back-symbol">
                  <ellipse cx="120" cy="140" rx="17" ry="25" fill="#E23636" stroke="#111" stroke-width="4"/>
                  <!-- Upper legs -->
                  <path d="M 112,125 Q 90,110 82,90 M 128,125 Q 150,110 158,90" stroke="#E23636" stroke-width="6" stroke-linecap="round" fill="none"/>
                  <path d="M 112,125 Q 90,110 82,90 M 128,125 Q 150,110 158,90" stroke="#111" stroke-width="2" stroke-linecap="round" fill="none"/>
                  
                  <path d="M 110,135 Q 85,130 75,120 M 130,135 Q 155,130 165,120" stroke="#E23636" stroke-width="6" stroke-linecap="round" fill="none"/>
                  <path d="M 110,135 Q 85,130 75,120 M 130,135 Q 155,130 165,120" stroke="#111" stroke-width="2" stroke-linecap="round" fill="none"/>

                  <!-- Lower legs -->
                  <path d="M 110,148 Q 85,155 80,180 M 130,148 Q 155,155 160,180" stroke="#E23636" stroke-width="6" stroke-linecap="round" fill="none"/>
                  <path d="M 110,148 Q 85,155 80,180 M 130,148 Q 155,155 160,180" stroke="#111" stroke-width="2" stroke-linecap="round" fill="none"/>

                  <path d="M 114,158 Q 95,175 92,205 M 126,158 Q 145,175 148,205" stroke="#E23636" stroke-width="6" stroke-linecap="round" fill="none"/>
                  <path d="M 114,158 Q 95,175 92,205 M 126,158 Q 145,175 148,205" stroke="#111" stroke-width="2" stroke-linecap="round" fill="none"/>
                </g>

                <path d="M 75,205 Q 45,230 40,265 L 60,270 Q 75,235 90,215 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
                <path d="M 165,205 Q 195,230 200,265 L 180,270 Q 165,235 150,215 Z" fill="#0F4C81" stroke="#111" stroke-width="4"/>
              </g>
            </svg>

            <!-- Screen Portal Expanding from his back! -->
            <div class="back-screen-portal" id="back-screen-portal">
              <div class="portal-inner" id="portal-inner">
                <div class="portal-badge" id="portal-badge">NEW ISSUE!</div>
                <div class="portal-screen-preview" id="portal-screen-preview"></div>
              </div>
            </div>

          </div>

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
      this.showBubble("Sliding down the web strand! Check out the projects!", 2800);
      this.triggerWebBounce();
    });

    this.crawlerEl.addEventListener('mouseenter', () => {
      this.crawlerEl.classList.add('squint');
    });
    this.crawlerEl.addEventListener('mouseleave', () => {
      this.crawlerEl.classList.remove('squint');
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

  /**
   * Draw the realistic web strand:
   * Extends from top of viewport straight through Spidey's upper grip (x=70 in crawler)
   * down to his lower grip, and trails down below him!
   */
  drawWebLine(spideyScreenX, spideyScreenY, swayOffset = 0) {
    const ctx = this.webCtx;
    ctx.clearRect(0, 0, this.webCanvas.width, this.webCanvas.height);

    if (this.isTransitioning) return;

    // Web runs through x = spideyScreenX + 70 (where hands grip)
    const webX = spideyScreenX + 70 + swayOffset;
    const anchorY = 0;
    const bottomY = Math.min(window.innerHeight, spideyScreenY + 280);

    ctx.save();

    // 1. Shadow strand for ink depth
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.4)';
    ctx.beginPath();
    ctx.moveTo(webX + 2, anchorY);
    ctx.quadraticCurveTo(webX + 2 + swayOffset * 0.4, (anchorY + bottomY) / 2, webX + 2, bottomY);
    ctx.stroke();

    // 2. Main high-tensile braided silk strand (Bright white with blue sheen)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(webX, anchorY);
    ctx.quadraticCurveTo(webX + swayOffset * 0.4, (anchorY + bottomY) / 2, webX, bottomY);
    ctx.stroke();

    // 3. Braided spiral silk fibers wrapping around the strand
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#D0EAFA';
    const totalKnots = Math.floor(bottomY / 18);
    for (let i = 1; i < totalKnots; i++) {
      const ky = i * 18;
      const kx = webX + Math.sin(i * 0.8 + Date.now() * 0.005) * 2;
      ctx.beginPath();
      ctx.arc(kx, ky, 2.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Silk sliding friction particles around his hands when scrolling
    if (Math.abs(this.slideVelocity) > 0.8) {
      this.emitFrictionParticles(webX, spideyScreenY + 25);
      this.emitFrictionParticles(webX, spideyScreenY + 95);
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

  // Animation Loop
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

    // Hanging & Sliding down vertically
    // Top position: 40px; Bottom: near viewport bottom (padding 220px)
    const minY = 40;
    const maxY = viewportHeight - 240;
    const currentY = minY + (maxY - minY) * this.scrollProgress;

    // Right margin gutter
    const rightGutter = viewportWidth > 768 ? Math.max(25, viewportWidth * 0.04) : 10;
    const currentX = viewportWidth - rightGutter - 145;

    // Natural pendulum sway while hanging
    const sway = Math.sin(Date.now() * 0.0022) * 5;
    const slideTilt = Math.max(Math.min(this.slideVelocity * 0.35, 4), -4);

    this.spideyX = currentX;
    this.spideyY = currentY;

    if (this.crawlerEl) {
      this.crawlerEl.style.transform = `translate3d(${currentX + sway}px, ${currentY}px, 0) rotate(${sway * 0.4 + slideTilt}deg)`;

      // Subtle hand slide feedback on scroll
      const upperArm = document.getElementById('upper-arm-group');
      const lowerArm = document.getElementById('lower-arm-group');
      if (Math.abs(this.slideVelocity) > 0.5) {
        const slideBob = Math.sin(Date.now() * 0.02) * 3;
        if (upperArm) upperArm.style.transform = `translateY(${slideBob}px)`;
        if (lowerArm) lowerArm.style.transform = `translateY(${-slideBob}px)`;
      } else {
        if (upperArm) upperArm.style.transform = 'translateY(0)';
        if (lowerArm) lowerArm.style.transform = 'translateY(0)';
      }
    }

    this.drawWebLine(currentX, currentY, sway);
  }

  /**
   * Section Switch:
   * Spider-Man lets go of web strand, leaps to center, flips to show his back,
   * and the new section expands directly from his back spider emblem!
   */
  async switchSection(targetSectionId, targetSectionTitle, onSwitchCallback) {
    if (this.isTransitioning) return;
    if (this.currentSectionId === targetSectionId) return;

    this.isTransitioning = true;
    const overlay = this.transitionOverlay;
    const jumpingSpidey = document.getElementById('jumping-spidey');
    const jumpingInner = document.getElementById('jumping-spidey-inner');
    const sfxBadge = document.getElementById('transition-sfx');
    const portal = document.getElementById('back-screen-portal');
    const portalPreview = document.getElementById('portal-screen-preview');

    if (window.comicAudio) {
      window.comicAudio.playThwip();
      setTimeout(() => window.comicAudio.playWhoosh(), 220);
    }

    this.crawlerEl.style.opacity = '0';
    this.webCtx.clearRect(0, 0, this.webCanvas.width, this.webCanvas.height);

    const startX = this.spideyX;
    const startY = this.spideyY;
    const targetCenterX = window.innerWidth / 2 - 120;
    const targetCenterY = window.innerHeight / 2 - 140;

    document.getElementById('portal-badge').innerText = `NEXT: ${targetSectionTitle.toUpperCase()}!`;
    portalPreview.innerText = targetSectionTitle.toUpperCase();

    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    jumpingSpidey.style.transition = 'none';
    jumpingSpidey.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(0.6)`;
    jumpingInner.style.transform = 'rotateY(0deg)';
    portal.classList.remove('expand-screen');
    sfxBadge.innerText = 'THWIP!';
    sfxBadge.className = 'comic-sound-fx show thwip-fx';

    void jumpingSpidey.offsetWidth;

    // 1. Acrobatic Leap into Center Screen
    jumpingSpidey.style.transition = 'transform 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    jumpingSpidey.style.transform = `translate3d(${targetCenterX}px, ${targetCenterY}px, 0) scale(1.6)`;

    await this.wait(220);

    // 2. Mid-air somersault turning to show his BACK!
    sfxBadge.innerText = 'WHOOSH!';
    sfxBadge.className = 'comic-sound-fx show whoosh-fx';
    jumpingInner.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
    jumpingInner.style.transform = 'rotateY(180deg)';

    await this.wait(350);

    // 3. Screen expands directly from the Spider Emblem on his back!
    sfxBadge.innerText = 'BAM!';
    sfxBadge.className = 'comic-sound-fx show bam-fx';
    if (window.comicAudio) window.comicAudio.playImpact();

    portal.classList.add('expand-screen');
    jumpingSpidey.style.transition = 'transform 0.5s ease-in-out';
    jumpingSpidey.style.transform = `translate3d(${targetCenterX}px, ${targetCenterY}px, 0) scale(8.5)`;

    await this.wait(380);

    // 4. Switch the DOM content
    if (onSwitchCallback) {
      onSwitchCallback(targetSectionId);
    }
    this.currentSectionId = targetSectionId;

    window.scrollTo({ top: 0, behavior: 'instant' });
    this.currentScroll = 0;
    this.targetScroll = 0;
    this.scrollProgress = 0;

    await this.wait(280);

    // 5. Fade out transition & restore Spidey to his web perch on the new page
    overlay.classList.remove('active');
    await this.wait(250);
    overlay.classList.add('hidden');

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
