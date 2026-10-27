/**
 * Main Portfolio Application Logic
 * Agam Makhija - Python & AI Prompt Specialist
 */

class PortfolioApp {
  constructor() {
    this.currentSection = 'home';
    this.navLinks = document.querySelectorAll('.nav-item button');
    this.sections = document.querySelectorAll('.portfolio-section');
    this.soundToggleBtn = document.getElementById('sound-toggle');
    this.contactForm = document.getElementById('contact-form');

    // Prompt Crafter Simulation State
    this.promptPatternIndex = 0;
    this.promptPatterns = [
      {
        name: 'CHAIN-OF-THOUGHT (CoT)',
        log: `[SYSTEM]: You are a specialized AI logic analyzer.<br>
              [INSTRUCTION]: Break the task into discrete verification steps.<br>
              [INPUT]: "Analyze data structure trade-offs for fast lookups."<br>
              [STEP 1]: Evaluate Hash Map average lookup O(1) vs worst-case O(n).<br>
              [STEP 2]: Evaluate Balanced BST lookup O(log n) with ordered keys.<br>
              [SYNTHESIS]: Hash Map optimal for unstructured O(1); BST optimal for range queries.`
      },
      {
        name: 'FEW-SHOT SCHEMA EXTRACTION',
        log: `[SYSTEM]: Extract structured JSON data from messy user input.<br>
              [EXAMPLE 1]: "Deploy v2 to prod at 4pm" -> {"action": "deploy", "ver": 2, "env": "prod"}<br>
              [INPUT]: "Run overnight Python batch ETL on customer records table"<br>
              [OUTPUT JSON]:<br>
              {<br>
              &nbsp;&nbsp;"task": "ETL_BATCH",<br>
              &nbsp;&nbsp;"language": "python",<br>
              &nbsp;&nbsp;"target": "customer_records",<br>
              &nbsp;&nbsp;"schedule": "overnight"<br>
              }`
      },
      {
        name: 'SYSTEM INSTRUCTION & GUARDRAILS',
        log: `[SYSTEM PROMPT]: Strict Python 3.12 Assistant.<br>
              [GUARDRAIL 1]: Always include type hints and docstrings.<br>
              [GUARDRAIL 2]: Prohibit deprecated standard library calls.<br>
              [VERIFICATION]: Code passed static AST lint check with 0 warnings.<br>
              [STATUS]: System prompt enforces production-grade determinism.`
      }
    ];

    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindSoundToggle();
    this.bindContactForm();
    this.bindSimulator();
    this.bindEasterEggs();
  }

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

    this.bindScrollSpy();
  }

  // Highlights active navigation pill as user scrolls continuously
  bindScrollSpy() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('section-', '');
          this.updateActiveNav(id);
          if (id === 'skills') {
            this.animateSkillBars();
          }
        }
      });
    }, {
      threshold: 0.3
    });

    this.sections.forEach(sec => observer.observe(sec));
  }

  updateActiveNav(sectionId) {
    this.currentSection = sectionId;
    this.navLinks.forEach(btn => {
      const parent = btn.parentElement;
      if (btn.getAttribute('data-target') === sectionId) {
        parent.classList.add('active');
      } else {
        parent.classList.remove('active');
      }
    });
  }

  navigateToSection(sectionId, sectionTitle) {
    if (window.spidermanController) {
      window.spidermanController.switchSection(sectionId, sectionTitle, (newId) => {
        this.updateActiveNav(newId);
      });
    } else {
      const targetEl = document.getElementById(`section-${sectionId}`);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      this.updateActiveNav(sectionId);
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

  // Interactive Prompt Crafter & Python Simulator
  bindSimulator() {
    const tabPrompt = document.getElementById('sim-tab-prompt');
    const tabPy = document.getElementById('sim-tab-py');
    const screenPrompt = document.getElementById('sim-screen-prompt');
    const screenPy = document.getElementById('sim-screen-py');

    if (tabPrompt && tabPy) {
      tabPrompt.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playClick();
        tabPrompt.classList.add('active');
        tabPy.classList.remove('active');
        screenPrompt.classList.remove('hidden');
        screenPy.classList.add('hidden');
      });

      tabPy.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playClick();
        tabPy.classList.add('active');
        tabPrompt.classList.remove('active');
        screenPy.classList.remove('hidden');
        screenPrompt.classList.add('hidden');
      });
    }

    // Prompt Execute Button
    const btnRunPrompt = document.getElementById('btn-run-prompt');
    const btnCyclePrompt = document.getElementById('btn-cycle-prompt');
    const promptLog = document.getElementById('prompt-sim-log');
    const promptName = document.getElementById('prompt-pattern-name');

    if (btnRunPrompt) {
      btnRunPrompt.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playImpact();
        const current = this.promptPatterns[this.promptPatternIndex % this.promptPatterns.length];
        promptLog.innerHTML = current.log;
      });
    }

    if (btnCyclePrompt) {
      btnCyclePrompt.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playClick();
        this.promptPatternIndex++;
        const next = this.promptPatterns[this.promptPatternIndex % this.promptPatterns.length];
        promptName.innerText = next.name;
        promptLog.innerHTML = next.log;
      });
    }

    // Python Script Simulation Button
    const btnPySim = document.getElementById('btn-run-py-sim');
    const pyLog = document.getElementById('py-sim-log');

    if (btnPySim) {
      btnPySim.addEventListener('click', () => {
        if (window.comicAudio) window.comicAudio.playClick();
        btnPySim.disabled = true;

        let output = `<strong>[PYTHON 3.12 EXECUTION]: Processing 4 mock records...</strong><br>`;
        const records = [
          { id: 'REC-001', name: 'User_Alpha', score: 92, active: true },
          { id: 'REC-002', name: 'User_Beta', score: 88, active: true },
          { id: 'REC-003', name: 'User_Gamma', score: 45, active: false },
          { id: 'REC-004', name: 'User_Delta', score: 95, active: true }
        ];

        records.forEach(r => {
          const statusBadge = r.active ? `<span style="color: #00E676;">[FILTER: PASS]</span>` : `<span style="color: #FF5252;">[FILTER: SKIP]</span>`;
          output += `${r.id} (${r.name}): ${statusBadge} score=${r.score}<br>`;
        });
        output += `<span style="color: #64FFDA;">✓ Dictionary comprehension complete: 3 records indexed in 0.42ms.</span>`;
        pyLog.innerHTML = output;

        setTimeout(() => {
          btnPySim.disabled = false;
        }, 600);
      });
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
      btn.innerHTML = `DISPATCHING...`;
      btn.disabled = true;

      setTimeout(() => {
        if (window.spidermanController) {
          window.spidermanController.showBubble("TRANSMISSION RECEIVED! I'll get back to you soon!", 4000);
        }
        btn.innerHTML = `✓ DISPATCHED TO AGAM!`;
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
