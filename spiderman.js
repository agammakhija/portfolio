/**
 * Spider-Man Character Controller
 * 
 * Features:
 * 1. Exact upside-down hanging Spider-Man from the reference artwork
 * 2. Continuous descending along vertical web strand through all sections
 * 3. ZERO-GLITCH GUARANTEED: Container position translate3d(currentX, currentY) is permanently preserved
 * 4. 30-SECOND ACROBATIC SWING:
 *    - Automatically swings to the opposite side every 30 seconds with pendulum physics
 *    - Web line dynamically connects and sways with aerodynamic curve
 * 5. ALWAYS RETURNS TO RIGHT SIDE ON SLIDE TRANSITION:
 *    - Whenever user navigates or changes slides, Spider-Man immediately swings back to the right side
 *    - Fires web from free hand to random non-center screen point ("THWIP!")
 *    - Heaves and physically pulls current page to the RIGHT (0.65s)
 *    - Reveals vibrant red comic backdrop underneath with target section title
 *    - Impact "BAM!", instant scroll, smooth reset, and timer restarts
 */

class SpiderManController {
  constructor() {
    this.container = null;
    this.crawlerEl = null;
    this.hangImgEl = null;
    this.webCanvas = null;
    this.webCtx = null;
    this.speechBubble = null;
    this.pullSplatEl = null;
    this.mainWrapperEl = null;
    this.backdropEl = null;
    this.backdropTitleEl = null;

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
      opacity: 1.0,
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

    // Periodic 30-Second Swing System
    this.currentSide = 'right'; // 'right' (default) or 'left'
    this.isSwinging = false;
    this.swingState = null;
    this.swingTimer = null;
    this.SWING_INTERVAL = 30000; // 30 seconds

    // TASM 2 Skydive Dive Entrance State
    this.isDiving = true;
    this.diveState = null;
    this.diveSpeedLines = [];

    // Floor Landing State (When approaching yellow footer / floor)
    this.isOnFloor = false;
    this.isLanding = false;
    this.isTakingFlight = false;

    this.init();
  }

  init() {
    this.setupDOM();
    this.setupWebCanvas();
    this.bindEvents();
    this.updatePosition(true);
    this.animate();
    this.playTASM2DiveEntrance();
  }

  setupDOM() {
    const isVintage = document.body.classList.contains('theme-vintage') || localStorage.getItem('comic-theme-era') === 'vintage';
    const hangSrc = isVintage ? 'spiderman-hanging-vintage.png' : 'spiderman-hanging.png';
    const standSrc = isVintage ? 'spiderman-standing-vintage.png' : 'spiderman-standing.png';
    const diveSrc = isVintage ? 'spiderman-diving-back-vintage.png' : 'spiderman-diving-back.png';

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
          <!-- Hanging Sprite (Upside Down) -->
          <img 
            src="${hangSrc}" 
            alt="Spider-Man Hanging Upside Down" 
            id="spidey-hang-img"
            class="spidey-hang-img"
            draggable="false"
          />
          <!-- Standing Sprite (Normal Feet on Floor) -->
          <img 
            src="${standSrc}" 
            alt="Spider-Man Standing Normally" 
            id="spidey-stand-img"
            class="spidey-stand-img"
            draggable="false"
          />
          <!-- TASM 2 Diving Sprite (Iconic Back View) -->
          <img 
            src="${diveSrc}" 
            alt="Spider-Man Diving Back View" 
            id="spidey-dive-img"
            class="spidey-dive-img"
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
    this.standImgEl = document.getElementById('spidey-stand-img');
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
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.updatePosition();
    });
  }

  resizeCanvas() {
    this.webCanvas.width = window.innerWidth;
    this.webCanvas.height = window.innerHeight;
  }

  setThemeEra(isVintage) {
    const hangImg = document.getElementById('spidey-hang-img');
    const standImg = document.getElementById('spidey-stand-img');
    const diveImg = document.getElementById('spidey-dive-img');
    if (hangImg) {
      hangImg.src = isVintage ? 'spiderman-hanging-vintage.png' : 'spiderman-hanging.png';
    }
    if (standImg) {
      standImg.src = isVintage ? 'spiderman-standing-vintage.png' : 'spiderman-standing.png';
    }
    if (diveImg) {
      diveImg.src = isVintage ? 'spiderman-diving-back-vintage.png' : 'spiderman-diving-back.png';
    }
  }

  bindEvents() {
    window.addEventListener('scroll', () => {
      this.targetScroll = window.scrollY;
    }, { passive: true });

    this.crawlerEl.addEventListener('click', (e) => {
      if (this.isTransitioning || this.isLanding || this.isTakingFlight) return;
      if (window.comicAudio) window.comicAudio.playThwip();
      
      const isVintage = document.body.classList.contains('theme-vintage');
      const modernQuotes = [
        "With great Python scripts comes great exception handling!",
        "Rule #1 of Prompting: Always give your LLM clear examples!",
        "Spider-Sense is tingling... someone pushed directly to main!",
        "Don't worry, my webs caught the production server!",
        "I can stick to walls, but I can't escape recursive loops!",
        "Did someone say Python? Let's automate this whole universe!",
        "THWIP! Click any tab to watch me swing and pull the page!",
        "Standing by! Drop Agam an email message below!"
      ];
      const vintageQuotes = [
        "With great power there must also come great responsibility! (Amazing Fantasy #15, 1962)",
        "Face it, Tiger, you just hit the jackpot! (Classic 1960s Edition)",
        "Stan Lee & Steve Ditko drew me this way back in '62!",
        "Look out, here comes the Spider-Man! Direct from the Silver Age!",
        "Leapin' lizards! Now that's what I call a genuine vintage comic!",
        "THWIP! Swinging through the original 1960s comic strip!"
      ];
      const quotes = isVintage ? vintageQuotes : modernQuotes;

      if (this.isOnFloor) {
        this.showBubble(
          isVintage ? "Superhero landing! Send Agam a dispatch below!" : "Superhero landing! Send Agam an email below!",
          3200
        );
      } else {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        this.showBubble(randomQuote, 3200);
      }
      this.triggerWebBounce();
    });

    this.crawlerEl.addEventListener('mouseenter', () => {
      this.crawlerEl.classList.add('hover-bob');
    });
    this.crawlerEl.addEventListener('mouseleave', () => {
      this.crawlerEl.classList.remove('hover-bob');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.clearSwingTimer();
      } else if (!this.isTransitioning) {
        this.resetSwingTimer();
      }
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

  // 30-Second Swing Timer Management
  startSwingTimer() {
    this.clearSwingTimer();
    this.swingTimer = setTimeout(() => {
      this.triggerPeriodicSwing();
    }, this.SWING_INTERVAL);
  }

  clearSwingTimer() {
    if (this.swingTimer) {
      clearTimeout(this.swingTimer);
      this.swingTimer = null;
    }
  }

  resetSwingTimer() {
    this.clearSwingTimer();
    this.startSwingTimer();
  }

  async triggerPeriodicSwing() {
    // If user is currently running a transition or standing on the floor, postpone swing
    if (this.isTransitioning || this.isOnFloor || this.isLanding || this.isTakingFlight || document.hidden) {
      this.startSwingTimer();
      return;
    }

    const nextSide = this.currentSide === 'right' ? 'left' : 'right';
    await this.swingToSide(nextSide, 1200);

    // Re-schedule next swing in 30 seconds
    this.startSwingTimer();
  }

  /**
   * Acrobatically swings Spider-Man to targetSide ('left' or 'right')
   */
  swingToSide(targetSide, duration = 1200) {
    if (this.currentSide === targetSide && !this.isSwinging) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      if (window.comicAudio) {
        window.comicAudio.playWhoosh();
      }

      const viewportWidth = window.innerWidth;
      const startX = this.spideyX;
      const endX = this.getSideX(targetSide, viewportWidth);
      const targetCeilingX = endX + this.webAnchorOffsetX;
      const direction = targetSide === 'left' ? -1 : 1;

      this.isSwinging = true;

      // Update crawler alignment class for speech bubble
      if (targetSide === 'left') {
        this.crawlerEl.classList.add('spidey-on-left');
      } else {
        this.crawlerEl.classList.remove('spidey-on-left');
      }

      const startTime = performance.now();

      const swingStep = (now) => {
        if (!this.isSwinging) {
          resolve();
          return;
        }

        const elapsed = now - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);

        // Sinusoidal easeInOut for genuine pendulum physics
        const eased = 0.5 - 0.5 * Math.cos(rawProgress * Math.PI);

        // Parabolic arc dip (deepest at midpoint)
        const maxDip = Math.min(85, window.innerHeight * 0.12);
        const dip = Math.sin(rawProgress * Math.PI) * maxDip;

        // Dynamic tilt into the swing direction
        const tilt = direction * Math.sin(rawProgress * Math.PI) * 22;

        this.swingState = {
          startX,
          endX,
          currentX: startX + (endX - startX) * eased,
          ceilingAnchorX: targetCeilingX,
          dip,
          tilt,
          direction,
          progress: rawProgress,
          easedProgress: eased
        };

        if (rawProgress < 1) {
          requestAnimationFrame(swingStep);
        } else {
          this.isSwinging = false;
          this.swingState = null;
          this.currentSide = targetSide;

          // Settle bounce on arrival
          this.triggerWebBounce();

          // Character speech bubble
          if (targetSide === 'left') {
            this.showBubble("WHOOSH! Patrolling the left side!", 2500);
          } else {
            this.showBubble("Back on the right flank!", 2500);
          }

          resolve();
        }
      };

      requestAnimationFrame(swingStep);
    });
  }

  /**
   * Fast return to right side when transition is triggered
   */
  async returnToRightSideFast() {
    const rightX = this.getSideX('right', window.innerWidth);
    if (this.currentSide === 'right' && !this.isSwinging && Math.abs(this.spideyX - rightX) < 5) {
      return;
    }

    // Cancel any ongoing slow swing
    this.isSwinging = false;
    this.swingState = null;

    if (window.comicAudio) window.comicAudio.playWhoosh();
    this.showBubble("Duty calls! Back to the right!", 1500);

    // Fast, energetic 460ms return swing to the right side
    await this.swingToSide('right', 460);
    this.currentSide = 'right';
    this.crawlerEl.classList.remove('spidey-on-left');
    this.updatePosition();
  }

  /**
   * ICONIC THE AMAZING SPIDER-MAN 2 (TASM 2) SKYDIVE ENTRANCE
   * Triggers automatically every time the website refreshes or is opened.
   * 1. Free-falls headfirst from above the clouds at supersonic speed with vertical speed lines
   * 2. Fires a web-line upward with an explosive "THWIP!" right as he reaches terminal depth
   * 3. The web pulls taut with elastic recoil, arresting his dive and converting momentum into a huge upward swoop
   * 4. Swings dynamically into resting position, flips into classic hanging pose
   * 5. Settle bounce + comic greeting speech bubble!
   */
  async playTASM2DiveEntrance() {
    this.isDiving = true;
    this.diveSpeedLines = [];

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Initialize speed lines for wind rush effect
    for (let i = 0; i < 35; i++) {
      this.diveSpeedLines.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 110 + 45,
        speed: Math.random() * 32 + 22,
        width: Math.random() * 2.2 + 1,
        alpha: Math.random() * 0.65 + 0.35
      });
    }

    const targetRestX = this.getSideX('right', width);
    // If opened scrolled down, calculate resting Y based on current scroll
    const minY = 35;
    const maxY = height - this.spideyHeight - 50;
    const targetRestY = minY + (maxY - minY) * this.scrollProgress;

    // Start dive high above viewport, angled slightly inward
    const startX = targetRestX - 120;
    const startY = -this.spideyHeight - 120;
    const maxDiveY = Math.min(height * 0.65, targetRestY + 380);
    const ceilingAnchorX = targetRestX + this.webAnchorOffsetX;
    const ceilingAnchorY = 0;

    this.diveState = {
      currentX: startX,
      currentY: startY,
      tilt: -16, // Aerodynamic dive angle
      webShooting: false,
      webAttached: false,
      webProgress: 0,
      webTension: 0,
      anchorX: ceilingAnchorX,
      anchorY: ceilingAnchorY
    };

    if (this.crawlerEl) {
      this.crawlerEl.classList.add('spidey-diving');
    }

    // Audio: Wind rush / diving whoosh
    try {
      if (window.comicAudio) window.comicAudio.playWhoosh();
    } catch (e) {}

    // ==========================================
    // PHASE 1: SUPERSONIC FREE-FALL (0 to 800ms)
    // ==========================================
    const diveDuration = 800;
    const diveStartTime = performance.now();

    await new Promise(resolve => {
      const diveStep = (now) => {
        const elapsed = now - diveStartTime;
        const p = Math.min(elapsed / diveDuration, 1);

        // Power acceleration curve (accelerates under gravity)
        const easeDown = Math.pow(p, 2.3);
        const swayWind = Math.sin(p * Math.PI * 4) * 7;

        this.diveState.currentX = startX + (targetRestX - startX) * 0.35 * easeDown + swayWind;
        this.diveState.currentY = startY + (maxDiveY - startY) * easeDown;
        this.diveState.tilt = -16 + p * 8 + Math.sin(p * Math.PI * 6) * 3;

        this.spideyX = this.diveState.currentX;
        this.spideyY = this.diveState.currentY;

        if (p < 1) {
          requestAnimationFrame(diveStep);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(diveStep);
    });

    // ==========================================
    // PHASE 2: "THWIP!" WEB SHOOT (800 to 1020ms)
    // ==========================================
    try {
      if (window.comicAudio) window.comicAudio.playThwip();
    } catch (e) {}

    this.diveState.webShooting = true;
    const shootStartTime = performance.now();
    const shootDuration = 220;

    // Spawn explosive comic THWIP! at hand position
    if (window.portfolioApp && window.portfolioApp.spawnActionWord) {
      window.portfolioApp.spawnActionWord(
        this.diveState.currentX + this.webAnchorOffsetX,
        this.diveState.currentY + 12,
        'THWIP!',
        '#FFDE00'
      );
    }

    await new Promise(resolve => {
      const shootStep = (now) => {
        const elapsed = now - shootStartTime;
        const p = Math.min(elapsed / shootDuration, 1);
        this.diveState.webProgress = Math.pow(p, 0.6); // Lightning-fast web shoot

        // In mid-shoot, Spider-Man reaches bottom apex
        this.diveState.currentY = maxDiveY + Math.sin(p * Math.PI) * 14;
        this.diveState.tilt = -8 + p * 12;

        this.spideyX = this.diveState.currentX;
        this.spideyY = this.diveState.currentY;

        if (p < 1) {
          requestAnimationFrame(shootStep);
        } else {
          this.diveState.webAttached = true;
          this.diveState.webShooting = false;
          resolve();
        }
      };
      requestAnimationFrame(shootStep);
    });

    // ==========================================
    // PHASE 3: ELASTIC ARREST & SWOOP UP (1020 to 1750ms)
    // ==========================================
    if (this.crawlerEl) {
      this.crawlerEl.classList.remove('spidey-diving');
      this.crawlerEl.classList.add('spidey-dive-hook');
    }

    try {
      if (window.comicAudio) window.comicAudio.playWhoosh();
    } catch (e) {}

    const swoopStartTime = performance.now();
    const swoopDuration = 730;
    const fromX = this.diveState.currentX;
    const fromY = this.diveState.currentY;

    await new Promise(resolve => {
      const swoopStep = (now) => {
        const elapsed = now - swoopStartTime;
        const p = Math.min(elapsed / swoopDuration, 1);

        // Bungee deceleration and smooth upward swing
        const easeSwoop = 1 - Math.pow(1 - p, 3);

        this.diveState.currentX = fromX + (targetRestX - fromX) * easeSwoop;
        this.diveState.currentY = fromY + (targetRestY - fromY) * easeSwoop;
        this.diveState.tilt = 12 * (1 - p); // Flips upright into hanging stance
        this.diveState.webTension = 1.0 - p * 0.7;

        this.spideyX = this.diveState.currentX;
        this.spideyY = this.diveState.currentY;

        if (p < 1) {
          requestAnimationFrame(swoopStep);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(swoopStep);
    });

    if (this.crawlerEl) {
      this.crawlerEl.classList.remove('spidey-dive-hook');
    }

    // ==========================================
    // PHASE 4: ELASTIC BOUNCE & HERO SETTLE
    // ==========================================
    this.isDiving = false;
    this.diveSpeedLines = [];
    this.spideyX = targetRestX;
    this.spideyY = targetRestY;
    this.updatePosition();

    // Natural web spring recoil
    this.triggerWebBounce();

    // Welcome speech bubble with TASM / Comic excitement!
    const isVintage = document.body.classList.contains('theme-vintage');
    const bubbleMsg = isVintage
      ? "Face it, Tiger! The Amazing Spider-Man has arrived!"
      : "WOOO-HOOO! Now THAT'S what I call an entrance!";
    this.showBubble(bubbleMsg, 3200);

    // Start periodic 30-second swing timer
    this.startSwingTimer();
  }

  /**
   * Floor Landing Mechanic:
   * When approaching the contact / footer floor, Spider-Man lets go of the web,
   * flips 180 degrees upright, and lands right onto the black line before the yellow footer!
   */
  async landOnFloor() {
    if (this.isOnFloor || this.isLanding || this.isTakingFlight || this.isTransitioning) return;
    this.isLanding = true;

    if (window.comicAudio) window.comicAudio.playWhoosh();

    // Flip body to stand upright on feet
    this.crawlerEl.classList.add('spidey-on-floor');

    const startY = this.spideyY;
    const dropStartTime = performance.now();
    const dropDuration = 260;

    await new Promise(resolve => {
      const dropStep = (now) => {
        const elapsed = now - dropStartTime;
        const p = Math.min(elapsed / dropDuration, 1);
        const easeDrop = p * p; // Natural gravity drop acceleration

        const footerEl = document.querySelector('.comic-footer');
        const footerTop = footerEl ? footerEl.getBoundingClientRect().top : window.innerHeight;
        const currentFloorY = footerTop - this.spideyHeight + 12;

        this.spideyY = startY + (currentFloorY - startY) * easeDrop;
        if (this.crawlerEl) {
          this.crawlerEl.style.transform = `translate3d(${this.spideyX}px, ${this.spideyY}px, 0)`;
        }

        if (p < 1) {
          requestAnimationFrame(dropStep);
        } else {
          this.spideyY = currentFloorY;
          resolve();
        }
      };
      requestAnimationFrame(dropStep);
    });

    // Impact thud upon landing on the black line!
    if (window.comicAudio) window.comicAudio.playImpact();
    this.crawlerEl.classList.add('floor-landing');
    setTimeout(() => this.crawlerEl.classList.remove('floor-landing'), 380);

    // Emit landing comic dust particles from feet
    this.emitLandingParticles(this.spideyX + this.spideyWidth / 2, this.spideyY + this.spideyHeight);

    this.isOnFloor = true;
    this.isLanding = false;

    this.showBubble("Superhero landing! Send me a message below!", 2800);
  }

  /**
   * Take Flight from Floor:
   * When user scrolls back up, Spider-Man shoots a web up to the ceiling,
   * flips back into his upside-down pose, and catches the web line!
   */
  async takeFlightFromFloor() {
    if (!this.isOnFloor || this.isLanding || this.isTakingFlight) return;
    this.isTakingFlight = true;

    // 1. Spider-Man shoots web to ceiling to catch it!
    if (window.comicAudio) window.comicAudio.playThwip();
    this.showBubble("THWIP! Catching the web line!", 2000);

    // Flip body back to upside-down hanging pose
    this.crawlerEl.classList.remove('spidey-on-floor');
    this.crawlerEl.classList.add('floor-takeoff');
    setTimeout(() => this.crawlerEl.classList.remove('floor-takeoff'), 350);

    const startY = this.spideyY;
    const zipStartTime = performance.now();
    const zipDuration = 300;

    await new Promise(resolve => {
      const zipStep = (now) => {
        const elapsed = now - zipStartTime;
        const p = Math.min(elapsed / zipDuration, 1);
        const easeZip = 1 - Math.pow(1 - p, 3); // Decelerating zip up

        const viewportHeight = window.innerHeight;
        const minY = 35;
        const maxY = viewportHeight - this.spideyHeight - 50;
        const targetHangingY = minY + (maxY - minY) * this.scrollProgress;

        this.spideyY = startY + (targetHangingY - startY) * easeZip;
        if (this.crawlerEl) {
          this.crawlerEl.style.transform = `translate3d(${this.spideyX}px, ${this.spideyY}px, 0)`;
        }

        if (p < 1) {
          requestAnimationFrame(zipStep);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(zipStep);
    });

    if (window.comicAudio) window.comicAudio.playWhoosh();
    this.isOnFloor = false;
    this.isTakingFlight = false;

    // Catch the web line with settle bounce
    this.triggerWebBounce();
  }

  emitLandingParticles(centerX, bottomY) {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 40,
        y: bottomY - 6,
        vx: (Math.random() - 0.5) * 7,
        vy: -Math.random() * 3.5 - 1.5,
        life: 1,
        size: Math.random() * 3 + 2,
        color: Math.random() > 0.4 ? '#FFDE00' : '#FFFFFF'
      });
    }
  }

  getSideX(side, viewportWidth) {
    const isMobile = viewportWidth <= 600;
    const isTablet = viewportWidth <= 900;
    const scale = isMobile ? 0.62 : (isTablet ? 0.82 : 1.0);
    const effectiveWidth = this.spideyWidth * scale;
    const gutter = isMobile ? 4 : (viewportWidth > 768 ? Math.max(20, viewportWidth * 0.04) : 8);
    if (side === 'left') {
      return gutter;
    } else {
      return viewportWidth - gutter - effectiveWidth;
    }
  }

  // Draw continuous hanging web line + dynamic pull web line
  drawWebCanvas(spideyScreenX, spideyScreenY, swayOffset = 0) {
    const ctx = this.webCtx;
    ctx.clearRect(0, 0, this.webCanvas.width, this.webCanvas.height);
    const isVintage = document.body.classList.contains('theme-vintage');

    // ==========================================
    // 0. TASM 2 SKYDIVE SPEED LINES & DIVE WEB
    // ==========================================
    if (this.isDiving && this.diveState) {
      // Wind speed streaks rushing upwards past falling Spider-Man
      if (this.diveSpeedLines && this.diveSpeedLines.length > 0) {
        ctx.save();
        for (const line of this.diveSpeedLines) {
          line.y -= line.speed;
          if (line.y + line.length < 0) {
            line.y = this.webCanvas.height + Math.random() * 50;
            line.x = Math.random() * this.webCanvas.width;
          }
          ctx.lineWidth = line.width;
          ctx.strokeStyle = isVintage ? `rgba(221, 167, 38, ${line.alpha * 0.7})` : `rgba(255, 255, 255, ${line.alpha})`;
          ctx.beginPath();
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x, line.y + line.length);
          ctx.stroke();
        }
        ctx.restore();
      }

      const handX = spideyScreenX + this.webAnchorOffsetX;
      const handY = spideyScreenY + 4;
      const anchorX = this.diveState.anchorX;
      const anchorY = 0;

      if (this.diveState.webShooting) {
        // High-velocity silk projectile shooting to ceiling
        const currTipX = handX + (anchorX - handX) * this.diveState.webProgress;
        const currTipY = handY + (anchorY - handY) * this.diveState.webProgress;

        ctx.save();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = isVintage ? '#F3E5C8' : '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(currTipX, currTipY);
        ctx.stroke();
        ctx.restore();
      } else if (this.diveState.webAttached) {
        // Elastic dynamic web line decelerating and pulling Spidey out of the dive
        const tension = this.diveState.webTension || 0;
        const ctrlX = (anchorX + handX) / 2 + tension * 20;
        const ctrlY = (anchorY + handY) / 2 + tension * 45;

        ctx.save();
        // Drop shadow on elastic web
        ctx.lineWidth = 4;
        ctx.strokeStyle = isVintage ? 'rgba(31, 27, 22, 0.7)' : 'rgba(17, 17, 17, 0.4)';
        ctx.beginPath();
        ctx.moveTo(anchorX + 2, anchorY);
        ctx.quadraticCurveTo(ctrlX + 2, ctrlY, handX + 2, handY);
        ctx.stroke();

        // Main web strand
        ctx.lineWidth = 3;
        ctx.strokeStyle = isVintage ? '#F3E5C8' : '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(anchorX, anchorY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, handX, handY);
        ctx.stroke();

        // Spiral knots
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = isVintage ? '#DDA726' : '#D8EDFA';
        const totalDist = Math.hypot(handX - anchorX, handY - anchorY);
        const knots = Math.max(3, Math.floor(totalDist / 22));
        for (let i = 1; i < knots; i++) {
          const frac = i / knots;
          const ky = anchorY + (handY - anchorY) * frac;
          const kx = anchorX + (handX - anchorX) * frac;
          ctx.beginPath();
          ctx.arc(kx, ky, 2.2, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Early return during dive mode so regular hanging strand is not drawn
      return;
    }

    // 1. VERTICAL HANGING OR ACROBATIC SWINGING WEB STRAND
    // If Spider-Man is on the floor, he has released the hanging web!
    if (!this.isOnFloor && !this.isLanding) {
      let anchorX, anchorY, targetX, targetY, controlX, controlY;

      if (this.isSwinging && this.swingState) {
        // Connect to ceiling anchor above destination during swing
        anchorX = this.swingState.ceilingAnchorX;
        anchorY = 0;
        targetX = spideyScreenX + this.webAnchorOffsetX;
        targetY = spideyScreenY + 4;

        // Aerodynamic curve in web line as it cuts through the air
        const dragLag = -this.swingState.direction * Math.sin(this.swingState.progress * Math.PI) * 25;
        controlX = (anchorX + targetX) / 2 + dragLag;
        controlY = (anchorY + targetY) / 2 + 10;
      } else {
        // Resting vertical hanging strand
        anchorX = spideyScreenX + this.webAnchorOffsetX + swayOffset;
        anchorY = 0;
        targetX = spideyScreenX + this.webAnchorOffsetX + swayOffset;
        targetY = spideyScreenY + 4;
        controlX = anchorX + swayOffset * 0.35;
        controlY = targetY / 2;
      }

      ctx.save();

      const isVintage = document.body.classList.contains('theme-vintage');

      // Shadow
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = isVintage ? 'rgba(31, 27, 22, 0.75)' : 'rgba(17, 17, 17, 0.4)';
      ctx.beginPath();
      ctx.moveTo(anchorX + 2, anchorY);
      ctx.quadraticCurveTo(controlX + 2, controlY, targetX + 2, targetY);
      ctx.stroke();

      // Main silk strand
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = isVintage ? '#F3E5C8' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.quadraticCurveTo(controlX, controlY, targetX, targetY);
      ctx.stroke();

      // Spiral knots
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = isVintage ? '#DDA726' : '#D8EDFA';
      const totalDist = Math.hypot(targetX - anchorX, targetY - anchorY);
      const knots = Math.max(3, Math.floor(totalDist / 20));
      for (let i = 1; i < knots; i++) {
        const frac = i / knots;
        const ky = anchorY + (targetY - anchorY) * frac;
        const kx = anchorX + (targetX - anchorX) * frac + Math.sin(i * 0.9 + Date.now() * 0.004) * 1.8;
        ctx.beginPath();
        ctx.arc(kx, ky, 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Friction / Wind particles
      if (this.isSwinging) {
        if (Math.random() > 0.4) {
          this.emitFrictionParticles(targetX, targetY);
        }
      } else if (Math.abs(this.slideVelocity) > 0.8 && !this.isTransitioning) {
        this.emitFrictionParticles(anchorX, targetY + 30);
      }

      ctx.restore();
    }

    this.renderParticles(ctx);

    // 2. DYNAMIC PULL WEB LINE (From free hand to screen splat)
    if (this.pullWeb.active) {
      const alpha = this.pullWeb.opacity !== undefined ? this.pullWeb.opacity : 1.0;
      if (alpha <= 0.001) return;

      const handX = spideyScreenX + this.freeHandOffsetX + swayOffset;
      const handY = spideyScreenY + this.freeHandOffsetY;

      const p = this.pullWeb.progress;
      const currentTargetX = handX + (this.pullWeb.targetX - handX) * p;
      const currentTargetY = handY + (this.pullWeb.targetY - handY) * p;

      const tensionVibe = Math.sin(Date.now() * 0.05) * this.pullWeb.tension * 8;

      ctx.save();
      ctx.globalAlpha = alpha;

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

    // Check floor position (the black line at the top of the yellow footer)
    const footerEl = document.querySelector('.comic-footer');
    let footerTop = Infinity;
    if (footerEl) {
      footerTop = footerEl.getBoundingClientRect().top;
    }

    const floorStandingY = footerTop - this.spideyHeight + 12;
    const isNearFloor = footerTop <= viewportHeight - 15;
    const isFarFromFloor = footerTop > viewportHeight + 50;

    // Trigger floor landing or takeoff if not currently transitioning
    if (!this.isTransitioning && !this.isLanding && !this.isTakingFlight) {
      if (isNearFloor && !this.isOnFloor) {
        this.landOnFloor();
      } else if (isFarFromFloor && this.isOnFloor) {
        this.takeFlightFromFloor();
      }
    }

    // Continuous sliding down the viewport as user scrolls
    const minY = 35;
    const maxY = viewportHeight - this.spideyHeight - 50;
    const baseCurrentY = minY + (maxY - minY) * this.scrollProgress;

    let currentX, currentY, tiltAngle;
    const sway = Math.sin(Date.now() * 0.002) * 6;
    const scrollTilt = Math.max(Math.min(this.slideVelocity * 0.3, 5), -5);

    if (this.isDiving && this.diveState) {
      currentX = this.diveState.currentX;
      currentY = this.diveState.currentY;
      tiltAngle = this.diveState.tilt;
    } else if (this.isLanding || this.isTakingFlight) {
      currentX = this.spideyX;
      currentY = this.spideyY;
      tiltAngle = 0;
    } else if (this.isOnFloor) {
      currentX = this.getSideX(this.currentSide, viewportWidth);
      currentY = floorStandingY;
      tiltAngle = 0; // Standing upright on the floor
    } else if (this.isSwinging && this.swingState) {
      currentX = this.swingState.currentX;
      currentY = baseCurrentY + this.swingState.dip;
      tiltAngle = this.swingState.tilt + scrollTilt;
    } else {
      currentX = this.getSideX(this.currentSide, viewportWidth);
      currentY = baseCurrentY;
      tiltAngle = sway * 0.45 + scrollTilt;
    }

    this.spideyX = currentX;
    this.spideyY = currentY;

    if (this.crawlerEl) {
      const renderX = (this.isDiving || this.isSwinging || this.isOnFloor || this.isLanding) ? currentX : (currentX + sway);
      this.crawlerEl.style.transform = `translate3d(${renderX}px, ${currentY}px, 0) rotate(${tiltAngle}deg)`;
    }

    this.drawWebCanvas(currentX, currentY, (this.isOnFloor || this.isDiving ? 0 : sway));
  }

  /**
   * SILKY-SMOOTH CINEMATIC COMIC TRANSITION:
   * 1. Guarantees Spider-Man returns swiftly to the RIGHT side first (if on left)
   * 2. Fires smooth silk projectile to a random non-center screen glass location
   * 3. Splat springs open on impact, locking the web line in place
   * 4. Spider-Man heaves & pulls with continuous 60fps physics:
   *    - Page smoothly accelerates to the right
   *    - Splat moves with the page to the right
   *    - Web line stays locked to the splat the entire time
   *    - Vibrant red comic background is revealed underneath with target section banner
   * 5. Impact "BAM!", silk dissolves smoothly
   * 6. Silent scroll & transform reset behind the opaque red backdrop
   * 7. Smooth backdrop dissolve (350ms) unveiling the new section in place
   * 8. 30-second swing timer restarts fresh
   */
  async switchSection(targetSectionId, targetSectionTitle, onSwitchCallback) {
    if (this.isTransitioning || this.isDiving) return;

    this.isTransitioning = true;

    // Clear periodic swing timer so Spider-Man stays dedicated to this transition
    this.clearSwingTimer();

    // If standing on the floor, take flight and catch the web first!
    if (this.isOnFloor) {
      await this.takeFlightFromFloor();
      await this.wait(100);
    }

    // 1. MANDATORY: Guarantee Spider-Man is back on the right side first!
    if (this.currentSide !== 'right' || this.isSwinging) {
      await this.returnToRightSideFast();
      await this.wait(120); // Small natural settling breath
    }

    const splat = this.pullSplatEl;
    const mainWrapper = this.mainWrapperEl;
    const backdrop = this.backdropEl;

    if (this.backdropTitleEl) {
      this.backdropTitleEl.innerText = targetSectionTitle.toUpperCase();
    }

    // Hand position firmly anchored on the right side
    const handX = this.spideyX + this.freeHandOffsetX;
    const handY = this.spideyY + this.freeHandOffsetY;

    // RANDOM STRIKE POSITION AWAY FROM CENTER (Never covers central text!)
    const strikeZones = [
      { xMin: 0.12, xMax: 0.28, yMin: 0.20, yMax: 0.34 }, // Upper-Left
      { xMin: 0.08, xMax: 0.22, yMin: 0.45, yMax: 0.60 }, // Mid-Left
      { xMin: 0.12, xMax: 0.28, yMin: 0.70, yMax: 0.82 }, // Lower-Left
      { xMin: 0.60, xMax: 0.74, yMin: 0.18, yMax: 0.30 }, // Upper-Right
      { xMin: 0.56, xMax: 0.72, yMin: 0.70, yMax: 0.82 }  // Lower-Right
    ];
    const zone = strikeZones[Math.floor(Math.random() * strikeZones.length)];
    const screenTargetX = window.innerWidth * (zone.xMin + Math.random() * (zone.xMax - zone.xMin));
    const screenTargetY = window.innerHeight * (zone.yMin + Math.random() * (zone.yMax - zone.yMin));

    // PHASE 1: SPIDER-MAN SHOOTS WEB FROM FREE HAND ONTO SCREEN GLASS
    if (window.comicAudio) window.comicAudio.playThwip();
    this.showBubble("THWIP! Got the page! Pulling it to the right!", 2800);

    splat.style.left = `${screenTargetX}px`;
    splat.style.top = `${screenTargetY}px`;
    splat.style.opacity = '1';
    splat.style.transform = 'translate(-50%, -50%) scale(0)';

    this.pullWeb.active = true;
    this.pullWeb.opacity = 1.0;
    this.pullWeb.startX = handX;
    this.pullWeb.startY = handY;
    this.pullWeb.targetX = screenTargetX;
    this.pullWeb.targetY = screenTargetY;
    this.pullWeb.progress = 0;
    this.pullWeb.tension = 0;

    // Shoot line with smooth cubic deceleration (460ms)
    const shootStartTime = performance.now();
    const shootDuration = 460;

    await new Promise(resolve => {
      const shootStep = (now) => {
        const elapsed = now - shootStartTime;
        const rawProgress = Math.min(elapsed / shootDuration, 1);
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

    // Splat pops onto screen glass with bouncy comic scale
    splat.classList.add('splat-active');
    splat.style.transform = 'translate(-50%, -50%) scale(1)';

    // PHASE 2: TENSION BUILD-UP & RECOIL (130ms)
    this.crawlerEl.classList.add('spidey-pulling-recoil');
    this.pullWeb.tension = 1.0;
    if (window.comicAudio) window.comicAudio.playWhoosh();

    await this.wait(130);

    // PHASE 3: THE YANK / PULL TO THE RIGHT (520ms)
    // Synchronously pulls mainWrapper, splat, and web line target in real-time
    if (backdrop) backdrop.classList.add('active');

    const pullStartTime = performance.now();
    const pullDuration = 520;
    const maxShiftX = window.innerWidth + 140;

    await new Promise(resolve => {
      const pullStep = (now) => {
        const elapsed = now - pullStartTime;
        const rawProgress = Math.min(elapsed / pullDuration, 1);

        // Superhero acceleration power curve
        const easePull = Math.pow(rawProgress, 2.2);
        const currentShiftX = easePull * maxShiftX;
        const tilt = easePull * 1.5;

        // 1. Move page smoothly to the right
        if (mainWrapper) {
          mainWrapper.style.transform = `translate3d(${currentShiftX}px, 0, 0) rotate(${tilt}deg)`;
        }

        // 2. Move splat with the page to the right
        splat.style.left = `${screenTargetX + currentShiftX}px`;

        // 3. Keep web line endpoint locked to the moving splat
        this.pullWeb.targetX = screenTargetX + currentShiftX;
        this.pullWeb.targetY = screenTargetY;
        this.pullWeb.tension = Math.max(0.15, 1.0 - easePull * 0.85);

        if (rawProgress < 1) {
          requestAnimationFrame(pullStep);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(pullStep);
    });

    // PHASE 4: IMPACT "BAM!" & SILENT RESET BEHIND RED BACKDROP
    if (window.comicAudio) window.comicAudio.playImpact();

    // HIDE MAIN WRAPPER COMPLETELY so no text can appear over the red background!
    if (mainWrapper) {
      mainWrapper.style.transition = 'none';
      mainWrapper.style.opacity = '0';
      mainWrapper.style.transform = '';
    }

    // Smoothly fade out the pull web line (160ms)
    const fadeStartTime = performance.now();
    const fadeDuration = 160;
    await new Promise(resolve => {
      const fadeStep = (now) => {
        const elapsed = now - fadeStartTime;
        const raw = Math.min(elapsed / fadeDuration, 1);
        this.pullWeb.opacity = 1 - raw;
        splat.style.opacity = `${1 - raw}`;
        if (raw < 1) {
          requestAnimationFrame(fadeStep);
        } else {
          this.pullWeb.active = false;
          this.pullWeb.opacity = 1.0;
          splat.classList.remove('splat-active');
          splat.style.opacity = '0';
          splat.style.left = '-9999px';
          splat.style.top = '-9999px';
          this.crawlerEl.classList.remove('spidey-pulling-recoil');
          resolve();
        }
      };
      requestAnimationFrame(fadeStep);
    });

    // Instant scroll to target section while mainWrapper is hidden (opacity: 0)
    const targetEl = document.getElementById(`section-${targetSectionId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    }

    if (onSwitchCallback) {
      onSwitchCallback(targetSectionId);
    }
    this.currentSectionId = targetSectionId;

    // Synchronize scroll coordinates to prevent Spider-Man from sliding frantically
    this.targetScroll = window.scrollY;
    this.currentScroll = window.scrollY;
    this.lastScroll = window.scrollY;
    this.slideVelocity = 0;
    this.updatePosition();

    // Pause to let the user absorb the red backdrop comic announcement
    await this.wait(450);

    // PHASE 5: FADE OUT THE RED BACKDROP FIRST!
    if (backdrop) {
      backdrop.classList.remove('active');
    }

    // Wait until the red background has completely disappeared (360ms)
    await this.wait(360);

    // PHASE 6: NOW AND ONLY NOW, REVEAL THE NEW SECTION TEXT AFTER BACKGROUND IS GONE!
    if (mainWrapper) {
      mainWrapper.style.transform = 'translateY(16px)';
      mainWrapper.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
      void mainWrapper.offsetWidth; // Force layout recalculation
      mainWrapper.style.opacity = '1';
      mainWrapper.style.transform = 'translateY(0)';
    }

    // Wait for text fade-in
    await this.wait(460);

    if (mainWrapper) {
      mainWrapper.style.transform = '';
      mainWrapper.style.transition = '';
    }

    // Settle bounce on the web line & welcome speech bubble
    this.updatePosition();
    this.triggerWebBounce();
    this.showBubble(`Welcome to ${targetSectionTitle}!`, 2500);

    this.isTransitioning = false;

    // Restart the 30-second swing timer fresh!
    this.startSwingTimer();
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.spidermanController = null;
document.addEventListener('DOMContentLoaded', () => {
  window.spidermanController = new SpiderManController();
});
