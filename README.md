# 🕷️ Agam Makhija - Comic Book Game Designer Portfolio

An interactive, Marvel/Golden-Age comic book styled portfolio website crafted purely with **Vanilla HTML5, CSS3, and JavaScript**.

---

## 🌟 Key Features & Creative Elements

1. **Spider-Man Scroll Crawler (Kinematic Descent)**:
   - Clings to the right gutter on an anchored high-tensile web strand originating from the top of the browser.
   - Smoothly crawls down the page in direct synchronization with your scroll progress.
   - Alternating animated limb kinematics (arms and legs articulate with realistic climbing strides as you scroll).
   - Interactive eye squinting and speech bubble commentary on click/hover ("THWIP! Ready when you are!").

2. **Acrobatic Jump & Back-Turn Screen Switch Transition**:
   - When switching sections (e.g. from **COVER** to **PROJECTS**, **SUPERPOWERS**, **ORIGIN**, or **CONTACT**):
     1. Spider-Man detaches with a synthesized **"THWIP!"** web shot.
     2. Leaps into the center of the viewport scaling up in an acrobatic somersault arc.
     3. Flips around mid-air (`180° twist`) to face away from the screen, displaying his muscular comic back with the iconic red spider emblem.
     4. With a **"BAM!"** comic burst, the spider emblem on his back dynamically expands to reveal the new screen inside!
     5. Spider-Man drops into position at the top-right of the newly loaded page, ready for scrolling again.

3. **Prominent Name & Big "GAME DESIGNER" Typography**:
   - Prominently showcases **AGAM MAKHIJA** in a bold comic banner.
   - Massive, 3D extruded lettering for **GAME DESIGNER** with ink drop shadows and vibrant comic contrast.

4. **Comic Book Aesthetic**:
   - Halftone Ben-Day dots pattern background.
   - Comics Code Authority seal, Issue number, volume, and 25¢ price tag badge.
   - Bold 3.5px-5px ink outlines, angled drop shadows (`6px 6px 0 #111`), speech bubbles with pointer tails, and action callout stamps (*THWIP!*, *WHOOSH!*, *BAM!*).

5. **Procedural Web Audio API (Zero External Asset Dependency)**:
   - Procedurally synthesizes iconic sound effects in real-time (`THWIP!` web shooter, `WHOOSH!` flip, `BAM!` impact punch, and UI clicks) without needing external MP3 files.
   - Includes a one-click **SFX: ON / OFF** toggle button in the top bar.

6. **Interactive Game Design Content**:
   - **Cover / Home**: Pitch, core specialties, and stats overview.
   - **The Game Vault (Projects)**: Filterable showcase of game projects (*Chrono Weaver*, *Neon Siege*, *Echoes of Eldonia*, *Aeroball 3000*) with an interactive **GDD Dossier Modal** breaking down core loops and design rationale.
   - **Hero Superpowers (Skills)**: Comic power meter grids measuring Combat Architecture, Level Design, Systems Balancing, Engine Prototyping, and toolsets.
   - **The Origin Story (About)**: 4-panel comic strip chronicling design philosophy and milestones.
   - **Hero Signal (Contact)**: Dispatch form and quick links.

---

## 🚀 How to Run & Preview

Open `index.html` in any modern web browser:
- Double-click `index.html` directly from Finder/Explorer, OR
- Run a simple local server if preferred:
  ```bash
  python3 -m http.server 8080
  ```
  Then visit: `http://localhost:8080`

---

## 🛠️ Technology Stack
- **HTML5**: Semantic structure, inline SVG graphics.
- **CSS3**: Halftone gradients, 3D preserve-3d transforms, comic borders, and responsive grid layouts.
- **JavaScript (ES6+)**: Scroll tracking kinematics, Web Audio API synthesis, section router, and modal viewer.
- **Dependencies**: **0 (Zero external libraries or frameworks)**.

