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
    this.themeToggleBtn = document.getElementById('theme-toggle');
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
    this.bindThemeToggle();
    this.bindSoundToggle();
    this.bindContactForm();
    this.bindSimulator();
    this.bindComicActionWords();
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

  bindThemeToggle() {
    if (!this.themeToggleBtn) {
      this.themeToggleBtn = document.getElementById('theme-toggle');
    }
    if (!this.themeToggleBtn) return;

    // Restore saved theme preference from localStorage
    const savedEra = localStorage.getItem('comic-theme-era');
    if (savedEra === 'vintage') {
      document.documentElement.classList.add('theme-vintage');
      document.body.classList.add('theme-vintage');
      this.themeToggleBtn.innerHTML = `<span>📰</span> ERA: 1960s`;
      setTimeout(() => {
        if (window.spidermanController) {
          window.spidermanController.setThemeEra(true);
        }
      }, 50);
    } else {
      this.themeToggleBtn.innerHTML = `<span>✨</span> ERA: MODERN`;
    }

    this.themeToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isVintage = document.body.classList.toggle('theme-vintage');
      document.documentElement.classList.toggle('theme-vintage', isVintage);
      localStorage.setItem('comic-theme-era', isVintage ? 'vintage' : 'modern');
      this.themeToggleBtn.innerHTML = isVintage 
        ? `<span>📰</span> ERA: 1960s` 
        : `<span>✨</span> ERA: MODERN`;

      if (window.spidermanController) {
        window.spidermanController.setThemeEra(isVintage);
        window.spidermanController.showBubble(
          isVintage ? "Face it, Tiger! 1962 Steve Ditko Silver Age activated!" : "Back to Modern High-Gloss comics!",
          3000
        );
      }

      if (window.comicAudio) window.comicAudio.playClick();
    });
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

      const name = document.getElementById('sender-name').value.trim();
      const email = document.getElementById('sender-email').value.trim();
      const missionSelect = document.getElementById('mission-type');
      const missionText = missionSelect.options[missionSelect.selectedIndex].text;
      const message = document.getElementById('mission-message').value.trim();

      const btn = this.contactForm.querySelector('button[type="submit"]');
      const statusNote = document.getElementById('contact-status-note');
      const originalText = btn.innerHTML;
      btn.innerHTML = `DISPATCHING EMAIL...`;
      btn.disabled = true;

      const subject = encodeURIComponent(`[Portfolio Dispatch] ${missionText} - from ${name}`);
      const body = encodeURIComponent(
        `Hi Agam,\n\nName: ${name}\nEmail: ${email}\nMission/Topic: ${missionText}\n\nMessage:\n${message}\n\n---\nSent via Agam Makhija's Comic Portfolio`
      );
      const mailtoUrl = `mailto:agam.makhija07@gmail.com?subject=${subject}&body=${body}`;

      setTimeout(() => {
        // Trigger mail client
        window.location.href = mailtoUrl;

        if (window.spidermanController) {
          window.spidermanController.showBubble("Transmission prepared! Opening your email app to send!", 4500);
        }

        btn.innerHTML = `✓ OPENING EMAIL CLIENT...`;
        btn.style.background = '#00E676';

        if (statusNote) {
          statusNote.style.display = 'block';
          statusNote.innerHTML = `
            ✉️ Email drafted! If your email app didn't open automatically, 
            <a href="${mailtoUrl}">click here to send directly to agam.makhija07@gmail.com</a>.
          `;
        }

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 5000);
      }, 500);
    });
  }

  bindComicActionWords() {
    const handlePop = (clientX, clientY, target) => {
      let wordPool = ['POW!', 'BAM!', 'WHAM!', 'POP!', 'ZAP!', 'BOOM!'];

      if (target && target.closest('#spidey-container, .spidey-crawler')) {
        wordPool = ['THWIP!', 'WALL-CRAWL!', 'HEY!', 'SPIDEY!'];
      } else if (target && target.closest('.nav-item button')) {
        wordPool = ['THWIP!', 'SWOOSH!', 'WHOOSH!', 'ZOOM!'];
      } else if (target && target.closest('#btn-run-py-sim, #btn-cycle-prompt, .sim-tab-btn')) {
        wordPool = ['ZAP!', 'CRACKLE!', 'EXEC!', 'BOOM!'];
      } else if (target && target.closest('.sound-toggle-btn, .theme-toggle-btn')) {
        wordPool = ['CLICK!', 'SWITCH!', 'POP!'];
      } else if (target && target.closest('button[type="submit"]')) {
        wordPool = ['DISPATCH!', 'KAPOW!', 'BAM!'];
      }

      const word = wordPool[Math.floor(Math.random() * wordPool.length)];
      const colors = ['#FFDE00', '#00E5FF', '#FF1744', '#00E676', '#FF9100'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = (Math.random() * 26 - 13).toFixed(1);

      if ((!clientX && !clientY) || (clientX === 0 && clientY === 0)) {
        if (target && target.getBoundingClientRect) {
          const rect = target.getBoundingClientRect();
          clientX = rect.left + rect.width / 2;
          clientY = rect.top + rect.height / 2;
        } else {
          clientX = window.innerWidth / 2;
          clientY = window.innerHeight / 2;
        }
      }

      const popEl = document.createElement('div');
      popEl.className = 'comic-action-pop';
      popEl.textContent = word;
      popEl.style.position = 'fixed';
      popEl.style.left = `${clientX}px`;
      popEl.style.top = `${clientY}px`;
      popEl.style.background = color;
      popEl.style.color = (color === '#FFDE00' || color === '#00E5FF' || color === '#00E676') ? '#111' : '#FFF';
      popEl.style.setProperty('--rot', `${rotation}deg`);
      popEl.style.pointerEvents = 'none';
      popEl.style.zIndex = '9999999';

      document.body.appendChild(popEl);

      setTimeout(() => {
        if (popEl.parentNode) popEl.remove();
      }, 650);
    };

    // Capture-phase listener guarantees it fires on every click anywhere
    window.addEventListener('click', (e) => {
      if (e.button !== 0) return;
      handlePop(e.clientX, e.clientY, e.target);
    }, true);
  }

  bindEasterEggs() {
    document.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.comicAudio && !btn.classList.contains('sound-toggle-btn') && !btn.classList.contains('theme-toggle-btn')) {
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
