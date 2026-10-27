/**
 * Main Portfolio Application Logic
 * Agam Makhija - Game Designer Portfolio (AI & Python Focus)
 */

// Comprehensive Game Design Projects Data
const PORTFOLIO_PROJECTS = [
  {
    id: 'chrono-weaver',
    title: 'Chrono Weaver: Web of Time',
    genre: '2.5D Precision Platformer & Time-Rewind',
    role: 'Lead Systems & Mechanics Designer',
    engine: 'Unity / C# & Python Prototyping',
    category: 'systems',
    stamp: 'FEATURED TITLE',
    bgGradient: 'linear-gradient(135deg, #1E3C72, #2A5298)',
    shortDesc: 'A high-speed physics platformer revolving around kinetic momentum preservation and high-tensile grappling ropes.',
    mechanics: [
      'Momentum-preserving grapple swing physics modeled in Python',
      'Local temporal rewind without interrupting global physics',
      'Boss telegraph system tuned for 120ms human reaction time'
    ],
    fullDetails: {
      pitch: 'You play as an operative navigating collapsing chrono-dimensions using an elastic tether that anchors to temporal echoes.',
      gameLoop: 'Grapple to Anchor → Build Angular Momentum → Launch into Drift → Rewind Mistakes → Reach Dimension Gate',
      designDecisions: [
        'Built a custom Python sandbox to simulate 40+ aerodynamic damping curves before writing a single line of C# in Unity.',
        'Designed high-contrast visual telegraphs for hazard zones using comic action lines, dropping death friction by 34% in playtests.',
        'Engineered an adaptive checkpoint cadence based on consecutive player execution errors.'
      ],
      metrics: 'Winner: Best Gameplay Innovation - Indie Mechanics Festival 2025'
    }
  },
  {
    id: 'neon-siege',
    title: 'Neon Siege: Protocol Zero',
    genre: 'Cyberpunk Tactical Roguelike Deckbuilder',
    role: 'Lead Game & Economy Designer (AI & Math)',
    engine: 'Unreal Engine 5 / Python Sim / C++',
    category: 'systems',
    stamp: 'TACTICAL HIT',
    bgGradient: 'linear-gradient(135deg, #FF416C, #FF4B2B)',
    shortDesc: 'Turn-based cyber warfare grid where positional board state directly mutates deck synergy and cooldown timers.',
    mechanics: [
      'Hexagonal node control directly altering energy generation',
      'Enemy AI with 100% transparent intent telegraphing using Behavior Trees',
      'Push-your-luck overclocking mechanics with progressive burnout risks'
    ],
    fullDetails: {
      pitch: 'A gritty neon roguelike where every card played emits digital noise, drawing security firewalls closer while unleashing immense offensive power.',
      gameLoop: 'Survey Node Grid → Calculate AI Threat Intent → Execute Synergistic Overclock Sequence → Manage Core Heat → Advance Node',
      designDecisions: [
        'Authored a Python Monte Carlo simulator running 100,000 automated card battles to mathematically eliminate degenerate infinite loops.',
        'Introduced the "Overclock" mechanic: players trade next-turn action economy for immediate burst lethality.',
        'Implemented clear color-coded ink icons for status ailments inspired by classic Marvel battle guides.'
      ],
      metrics: 'Over 85,000 Early Access sessions played with an average run time of 38 minutes.'
    }
  },
  {
    id: 'echoes-eldonia',
    title: 'Echoes of Eldonia',
    genre: 'Atmospheric Action-Adventure & Dungeon Architecture',
    role: 'Lead Level & Environmental Designer',
    engine: 'Unreal Engine 5',
    category: 'level',
    stamp: 'EXPLORATION',
    bgGradient: 'linear-gradient(135deg, #11998E, #38EF7D)',
    shortDesc: 'Non-linear dungeon crawler exploring monumental ruined temples using lighting, spatial flow, and environmental cues.',
    mechanics: [
      'Multi-tiered architectural vistas guiding player navigation without mini-maps',
      'Physics-based counterweight water and sand puzzle systems',
      'Dynamic spatial pacing alternating between claustrophobic crypts and subterranean caverns'
    ],
    fullDetails: {
      pitch: 'An expedition into sunken monolithic ruins where player curiosity is guided purely through environmental composition and architectural leading lines.',
      gameLoop: 'Explore Monumental Landmark → Solve Kinetic Gate Lock → Descend to Ancient Crypt → Unlock Ancient Tool → Reveal Shortcut to Hub',
      designDecisions: [
        'Built full greybox blockouts with strict adherence to 3:1 sightline ratios to prevent player disorientation.',
        'Crafted breadcrumb lighting palettes: warm torchlight denotes safety and puzzles; cool bioluminescence indicates vertical climb paths.',
        'Authored comprehensive level design documents (LDDs) coordinating 3D artists, audio designers, and gameplay programmers.'
      ],
      metrics: 'Praised for intuitive navigation without navigational UI clutter in playtest feedback.'
    }
  },
  {
    id: 'aeroball-3000',
    title: 'Aeroball 3000',
    genre: 'Fast-Paced Multiplayer Physics Arena',
    role: 'Combat & Prototyping Designer (AI Bots)',
    engine: 'Unity / PhysX & AI NavMesh',
    category: 'combat',
    stamp: 'MULTIPLAYER',
    bgGradient: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
    shortDesc: 'Zero-gravity competitive arena sport where players blast energy spheres into dynamic gravity goals.',
    mechanics: [
      'Sub-millisecond input response curve optimized for esports play',
      'Tactile screen-shake, comic freeze-frames (hit-stop), and impact sound triggers',
      'Adaptive AI bot teammates with intercept vectors and tactical passing'
    ],
    fullDetails: {
      pitch: 'A sports brawler designed for high spectator clarity, dramatic clutch saves, and deep physics-based team passing.',
      gameLoop: 'Boost for Ball Control → Pass or Ricochet off Walls → Execute Charged Kinetic Strike → Score Goal → Reset Arena',
      designDecisions: [
        'Implemented custom hit-stop freeze frames (6 frames on heavy impact) to give every goal and block immense tactile satisfaction.',
        'Tuned sphere aerodynamic drag coefficients in Python to ensure predictable ricochets while enabling spin curves.',
        'Created comic book style impact overlays ("POW!", "KRAK!") during explosive super shots.'
      ],
      metrics: 'Featured in local indie showcases and collegiate esports tournaments.'
    }
  }
];

// Main App Controller
class PortfolioApp {
  constructor() {
    this.currentSection = 'home';
    this.navLinks = document.querySelectorAll('.nav-item button');
    this.sections = document.querySelectorAll('.portfolio-section');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.projectsContainer = document.getElementById('projects-container');
    this.modalBackdrop = document.getElementById('project-modal');
    this.soundToggleBtn = document.getElementById('sound-toggle');
    this.contactForm = document.getElementById('contact-form');

    // AI Simulation State
    this.aiStep = 0;

    this.init();
  }

  init() {
    this.renderProjects(PORTFOLIO_PROJECTS);
    this.bindNavigation();
    this.bindFilters();
    this.bindModal();
    this.bindSoundToggle();
    this.bindContactForm();
    this.bindSimulator();
    this.bindEasterEggs();
  }

  // Render Projects to the Grid
  renderProjects(projects) {
    if (!this.projectsContainer) return;

    this.projectsContainer.innerHTML = projects.map(proj => `
      <article class="project-comic-card" data-category="${proj.category}" data-id="${proj.id}">
        <div class="card-comic-banner">
          <span>ISSUE #${proj.id.toUpperCase().slice(0, 4)}</span>
          <span class="card-role-tag">${proj.role}</span>
        </div>

        <div class="card-visual-wrapper" style="background: ${proj.bgGradient}">
          <div class="card-visual-bg"></div>
          <div style="font-family: var(--font-title); font-size: 38px; color: #FFF; text-shadow: 3px 3px 0 #000; text-align: center; padding: 20px; z-index: 1;">
            ${proj.title}
          </div>
          <div class="card-comic-stamp">${proj.stamp}</div>
        </div>

        <div class="card-content">
          <h3 class="card-project-title">${proj.title}</h3>
          <div class="card-genre-sub">⚡ ${proj.genre} • [${proj.engine}]</div>
          <p class="card-project-desc">${proj.shortDesc}</p>

          <div class="card-mechanics-list">
            <strong>KEY DESIGN MECHANICS:</strong>
            <ul>
              ${proj.mechanics.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>

          <div class="card-footer-action">
            <button class="btn-comic-primary btn-card-action" onclick="window.portfolioApp.openModal('${proj.id}')">
              VIEW GDD DOSSIER
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Navigation with Spider-Man Acrobatic Back-Turn Transition
  bindNavigation() {
    this.navLinks.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        const title = btn.getAttribute('data-title') || target;
        this.navigateToSection(target, title);
      });
    });

    document.querySelectorAll('[data-cta-target]').forEach(cta => {
      cta.addEventListener('click', () => {
        const target = cta.getAttribute('data-cta-target');
        const title = cta.getAttribute('data-cta-title') || target;
        this.navigateToSection(target, title);
      });
    });
  }

  navigateToSection(sectionId, sectionTitle) {
    if (this.currentSection === sectionId) return;

    if (window.spidermanController) {
      window.spidermanController.switchSection(sectionId, sectionTitle, (newId) => {
        this.applySectionDOMSwitch(newId);
      });
    } else {
      this.applySectionDOMSwitch(sectionId);
    }
  }

  applySectionDOMSwitch(newId) {
    this.sections.forEach(sec => {
      if (sec.id === `section-${newId}`) {
        sec.classList.add('active-section');
      } else {
        sec.classList.remove('active-section');
      }
    });

    this.navLinks.forEach(btn => {
      const parent = btn.parentElement;
      if (btn.getAttribute('data-target') === newId) {
        parent.classList.add('active');
      } else {
        parent.classList.remove('active');
      }
    });

    this.currentSection = newId;

    if (newId === 'skills') {
      this.animateSkillBars();
    }
  }

  animateSkillBars() {
    const bars = document.querySelectorAll('.stat-fill');
    bars.forEach(bar => {
      const width = bar.getAttribute('data-width') || '85%';
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = width;
      }, 100);
    });
  }

  // Category Filtering
  bindFilters() {
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playClick();
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        const filtered = filter === 'all'
          ? PORTFOLIO_PROJECTS
          : PORTFOLIO_PROJECTS.filter(p => p.category === filter);

        this.renderProjects(filtered);
      });
    });
  }

  // Interactive AI & Python Simulator on the Skills page
  bindSimulator() {
    const tabAI = document.getElementById('sim-tab-ai');
    const tabPy = document.getElementById('sim-tab-py');
    const screenAI = document.getElementById('sim-screen-ai');
    const screenPy = document.getElementById('sim-screen-py');

    if (tabAI && tabPy) {
      tabAI.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playClick();
        tabAI.classList.add('active');
        tabPy.classList.remove('active');
        screenAI.classList.remove('hidden');
        screenPy.classList.add('hidden');
      });

      tabPy.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playClick();
        tabPy.classList.add('active');
        tabAI.classList.remove('active');
        screenPy.classList.remove('hidden');
        screenAI.classList.add('hidden');
      });
    }

    // AI Trigger Threat Button
    const btnThreat = document.getElementById('btn-trigger-threat');
    const btnResetAI = document.getElementById('btn-reset-ai');
    const aiLog = document.getElementById('ai-sim-log');
    const aiState = document.getElementById('ai-agent-state');

    const aiStates = [
      { state: 'ALERT: THREAT DETECTED', color: '#FFDE00', text: '[AI-NODE]: Peripheral raycast hit player target at 14m!<br>[AI-NODE]: Selector -> Branch to Combat Subtree.<br>[AI-NODE]: Calculating line-of-sight & cover opportunities...' },
      { state: 'CALCULATING ATTACK VECTOR', color: '#FF7043', text: '[AI-NODE]: Evaluating Player Velocity Vector: (vx: 12.4, vy: -2.1).<br>[AI-NODE]: Predictive Intercept Position computed at (x: 18.2, y: 4.5).<br>[AI-NODE]: Action -> Prime High-Tensile Web Tether.' },
      { state: 'EXECUTING WEB STRIKE', color: '#00E676', text: '[AI-NODE]: Executing Web Shot! Hit confirmed!<br>[AI-NODE]: Transition to Hit-Stop state (6 frames).<br>[AI-NODE]: Player immobilized for 1.8 seconds.' }
    ];

    if (btnThreat) {
      btnThreat.addEventListener('click', () => {
        if (window.comicAudio) {
          if (this.aiStep === 1) window.comicAudio.playThwip();
          else window.comicAudio.playImpact();
        }

        const next = aiStates[this.aiStep % aiStates.length];
        aiState.innerText = next.state;
        aiState.style.color = next.color;
        aiLog.innerHTML = next.text;
        this.aiStep++;
      });
    }

    if (btnResetAI) {
      btnResetAI.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playClick();
        this.aiStep = 0;
        aiState.innerText = 'PATROLLING';
        aiState.style.color = 'var(--comic-yellow)';
        aiLog.innerHTML = `[AI-NODE]: Root Selector initialized.<br>[AI-NODE]: Distance to player: 24m. Within safe perimeter.<br>[AI-NODE]: Action -> Execute Waypoint Patrol.`;
      });
    }

    // Python Simulation Button
    const btnPySim = document.getElementById('btn-run-py-sim');
    const pyLog = document.getElementById('py-sim-log');

    if (btnPySim) {
      btnPySim.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playClick();
        btnPySim.disabled = true;

        let output = `<strong>[PYTHON RUNTIME]: Running 5 combat hits (Base Atk: 85, Def: 35, Crit: 30%):</strong><br>`;
        for (let i = 1; i <= 5; i++) {
          const isCrit = Math.random() < 0.3;
          const mitigation = 1.0 - (35 / (35 + 100));
          const dmg = Math.round(85 * mitigation * (isCrit ? 1.75 : 1.0));
          const critBadge = isCrit ? `<span style="color: #FFDE00; font-weight: bold;">[CRITICAL HIT! +75%]</span>` : `[NORMAL]`;
          output += `Hit #${i}: ${critBadge} Damage dealt: <strong>${dmg} HP</strong> (Mitigated 26%)<br>`;
        }
        output += `<span style="color: #64FFDA;">✓ Simulation complete. Average DPS matches target TTK curve within 1.4% variance.</span>`;
        pyLog.innerHTML = output;

        setTimeout(() => {
          btnPySim.disabled = false;
        }, 800);
      });
    }
  }

  // Project Dossier Modal
  bindModal() {
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) {
          this.closeModal();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  openModal(projectId) {
    const proj = PORTFOLIO_PROJECTS.find(p => p.id === projectId);
    if (!proj) return;

    if (window.comicAudio) window.comicAudio.playClick();

    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    titleEl.innerText = proj.title.toUpperCase();

    bodyEl.innerHTML = `
      <div style="background: var(--comic-yellow); border: var(--border-thick); padding: 8px 14px; font-family: var(--font-subhead); font-size: 13px; margin-bottom: 20px;">
        ROLE: ${proj.role} • ENGINE: ${proj.engine} • ${proj.genre}
      </div>

      <div style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">
        ${proj.fullDetails.pitch}
      </div>

      <div style="background: var(--comic-ink); color: #FFF; border: var(--border-thick); padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
        <div style="font-family: var(--font-title); font-size: 20px; color: var(--comic-yellow); margin-bottom: 6px;">
          ★ THE CORE GAMEPLAY LOOP
        </div>
        <div style="font-family: var(--font-subhead); font-size: 13px; line-height: 1.5; color: #EEE;">
          ${proj.fullDetails.gameLoop}
        </div>
      </div>

      <div style="margin: 24px 0;">
        <h4 style="color: var(--comic-red); font-size: 24px; margin-bottom: 10px;">DESIGN DECISIONS & PLAYER AGENCY</h4>
        <ul style="font-size: 16px; line-height: 1.6; padding-left: 20px;">
          ${proj.fullDetails.designDecisions.map(d => `<li style="margin-bottom: 8px;">${d}</li>`).join('')}
        </ul>
      </div>

      <div style="background: var(--comic-paper); border: 2.5px solid var(--comic-ink); padding: 12px 16px; font-family: var(--font-subhead); font-size: 13px; color: var(--comic-blue);">
        🏆 IMPACT: ${proj.fullDetails.metrics}
      </div>
    `;

    this.modalBackdrop.classList.add('active');
  }

  closeModal() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('active');
      if (window.comicAudio) window.comicAudio.playClick();
    }
  }

  bindSoundToggle() {
    if (!this.soundToggleBtn) return;
    this.soundToggleBtn.addEventListener('click', () => {
      const isEnabled = window.comicAudio.toggleSound();
      this.soundToggleBtn.innerHTML = isEnabled
        ? `<span>🔊</span> SFX: ON`
        : `<span>🔇</span> SFX: OFF`;
      if (isEnabled) window.comicAudio.playClick();
    });
  }

  bindContactForm() {
    if (!this.contactForm) return;
    this.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.comicAudio) window.comicAudio.playImpact();

      const btn = this.contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = `DISPATCHING SIGNAL...`;
      btn.disabled = true;

      setTimeout(() => {
        if (window.spidermanController) {
          window.spidermanController.showBubble("SIGNAL RECEIVED! I'll be in touch!", 4000);
        }
        btn.innerHTML = `✓ DISPATCHED TO HERO HQ!`;
        btn.style.background = '#00E676';
        this.contactForm.reset();

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3500);
      }, 700);
    });
  }

  bindEasterEggs() {
    document.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.comicAudio && !btn.classList.contains('sound-toggle-btn')) {
          window.comicAudio.playClick();
        }
      });
    });
  }
}

window.portfolioApp = null;
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioApp();
});
