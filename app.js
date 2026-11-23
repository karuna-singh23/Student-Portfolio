/**
 * CELESTIAL OBSERVATORY APP LOGIC // KARUNA SINGH
 * Strictly NO emojis. Pure celestial glyphs & terminal telemetry.
 */

// 1. Julian Date & Astronomical Telemetry
function updateJulianDate() {
  const el = document.getElementById('julian-date');
  if (!el) return;
  const now = new Date();
  // Standard Julian Date formula
  const jd = (now.getTime() / 86400000) + 2440587.5;
  el.textContent = `JD ${jd.toFixed(2)}`;
}

// 2. Web Audio API Ambient Celestial Synthesizer
class CelestialAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.droneGain = null;
    this.chimeInterval = null;
  }

  init() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    this.ctx = new AudioContext();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Ethereal Drone (Triad in D: D2, A2, D3)
    const freqs = [73.42, 110.00, 146.83];
    this.oscillators = freqs.map((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260 + i * 40, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.07 / (i + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      return osc;
    });

    return true;
  }

  playStarlightChime() {
    if (!this.ctx || !this.isPlaying) return;
    const notes = [587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66]; // D pentatonic high
    const freq = notes[Math.floor(Math.random() * notes.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Soft chime envelope
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.8);
  }

  toggle() {
    if (!this.ctx) {
      const ok = this.init();
      if (!ok) return false;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(0.18, this.ctx.currentTime, 0.4);
      this.chimeInterval = setInterval(() => {
        if (Math.random() > 0.4) {
          this.playStarlightChime();
        }
      }, 2400);
    } else {
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
      clearInterval(this.chimeInterval);
    }

    return this.isPlaying;
  }
}

// 3. Interactive Terminal System
class ObservatoryTerminal {
  constructor() {
    this.output = document.getElementById('term-output');
    this.input = document.getElementById('term-input');
    this.history = [];
    this.historyIdx = -1;

    this.commands = {
      help: () => this.cmdHelp(),
      about: () => this.cmdAbout(),
      'cat about.txt': () => this.cmdAbout(),
      skills: () => this.cmdSkills(),
      'cat skills.txt': () => this.cmdSkills(),
      projects: () => this.cmdProjects(),
      'cat projects.txt': () => this.cmdProjects(),
      education: () => this.cmdEducation(),
      'cat education.txt': () => this.cmdEducation(),
      star: () => this.cmdEntity(),
      entity: () => this.cmdEntity(),
      specimen: () => this.cmdEntity(),
      roast: () => this.cmdRoast(),
      'roast me': () => this.cmdRoast(),
      astrolabe: () => this.cmdAstrolabe(),
      ascii: () => this.cmdAstrolabe(),
      clear: () => this.cmdClear(),
      ping: (args) => this.cmdPing(args),
      matrix: () => this.cmdMatrix(),
      sudo: () => "Permission denied: You do not even have root privileges over your own sleep schedule."
    };

    this.init();
  }

  init() {
    if (!this.input) return;

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = this.input.value.trim();
        if (val) {
          this.history.push(val);
          this.historyIdx = this.history.length;
          this.execute(val);
          this.input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        if (this.historyIdx > 0) {
          this.historyIdx--;
          this.input.value = this.history[this.historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIdx < this.history.length - 1) {
          this.historyIdx++;
          this.input.value = this.history[this.historyIdx];
        } else {
          this.historyIdx = this.history.length;
          this.input.value = '';
        }
      }
    });

    // Handle quick terminal chips
    document.querySelectorAll('.term-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          this.input.value = cmd;
          this.execute(cmd);
          this.input.value = '';
        }
      });
    });
  }

  println(text, isBlock = false) {
    const line = document.createElement('div');
    line.className = isBlock ? 'term-output-block' : 'term-line';
    line.innerHTML = text;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  execute(cmdStr) {
    this.println(`<span class="prompt-text">karuna@observatory:~$</span> ${cmdStr}`);
    const normalized = cmdStr.toLowerCase().trim();

    if (this.commands[normalized]) {
      const res = this.commands[normalized]();
      if (res) this.println(res, true);
      return;
    }

    // Check prefix commands like 'ping'
    if (normalized.startsWith('ping')) {
      const res = this.cmdPing(normalized.replace('ping', '').trim());
      if (res) this.println(res, true);
      return;
    }

    this.println(`command not found: "${cmdStr}". Type <span class="term-highlight">help</span> for celestial commands.`);
  }

  cmdHelp() {
    return `
AVAILABLE OBSERVATORY COMMANDS:
  ✦ star / entity       - Inspect Specimen 01: Glass Star Entity
  ✦ cat about.txt       - The raw unvarnished biography
  ✦ cat skills.txt      - Technical proficiencies & sarcasm ratings
  ✦ cat projects.txt    - The Holy Trinity of CS Freshmen
  ✦ cat education.txt   - Shoolini University orbital details
  ✦ roast me            - High-voltage developer truth
  ✦ astrolabe           - Render high-density celestial ASCII art
  ✦ matrix              - Stream cosmic ASCII particle stream
  ✦ ping <target>        - Probe the cold void of deep space
  ✦ clear               - Wipe console telemetry buffer
    `;
  }

  cmdEntity() {
    return `
[SPECIMEN_01 // GLASS STAR ENTITY]
----------------------------------------------------------------
OBJECT:      Elongated Star Entity
MATERIAL:    Liquid Glass / Chrome
TEXTURE:     Transparent / Ultra Refractive
LIGHTING:    Neon Edge Glow // Caustics: Subtle
PERSPECTIVE: Symmetrical 3D // Stretched Sharp Vertices
STATUS:      Target Lock Active // Reflection Index: 1.52
PHILOSOPHY:  Human faces are transient; refractive chrome is eternal.
----------------------------------------------------------------
    `;
  }

  cmdAbout() {
    return `
[FILE: about.txt]
==============================================
Name:    Karuna Singh
Course:  B.Tech Computer Science & Engineering
College: Shoolini University, Solan (HP)
Status:  Surviving C pointer arithmetic & Himalayan mist.
Mindset: Sarcastic. Snappy. Deeply dedicated to craft.
==============================================
    `;
  }

  cmdSkills() {
    return `
[FILE: skills.txt // PROFICIENCY EPHEMERIS]
----------------------------------------------
1. Python          [████████░░] 88%  (Automation, Clean syntax, CLI)
2. C Programming   [████████░░] 82%  (Pointers, Structs, Zero leaks)
3. HTML/Semantics  [█████████░] 90%  (Zero div soup, accessible DOM)
4. Git & GitHub    [████████░░] 85%  (Rebase, branch integrity)
5. Problem Solving [█████████░] 94%  (Staring down computational void)
----------------------------------------------
    `;
  }

  cmdProjects() {
    return `
[FILE: projects.txt // THE HOLY TRINITY]
----------------------------------------------------------------
1. Student Management System [Python]
   - Relational schema, CLI query engine, zero data corruption.
2. Library Management System [C]
   - Linked-list catalog, binary search by ISBN, 0 Valgrind leaks.
3. Weather Forecast Application [Python / Telemetry]
   - Barometric sensor ingestion, solar angle calculation.
----------------------------------------------------------------
    `;
  }

  cmdEducation() {
    return `
[FILE: education.txt]
==============================================
Course:     B.Tech Computer Science & Engineering
University: Shoolini University
Period:     2025 - 2029 (Undergraduate Year 01)
Location:   Solan, Himachal Pradesh (1,500m AMSL)
Atmosphere: High altitude, low temps, pure logic.
==============================================
    `;
  }

  cmdRoast() {
    const roasts = [
      "You tell people you love C for 'the raw performance' but we all know you just miss the dopamine hit of fixing a segmentation fault after 5 hours.",
      "Your git history is 40% 'update', 30% 'fixed typo', and 30% 'please work God I beg you'.",
      "Using a 45MB Javascript framework just to show your name and a bio is like launching a Saturn V rocket to cross the street.",
      "You don't need a rubber duck for debugging when the sheer weight of existential dread is already staring back from your monitor.",
      "Sure, your Python code runs in O(1) time—if by O(1) you mean 'takes 1 lifetime to load dependencies'."
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }

  cmdAstrolabe() {
    return `
                 .---.
               .'     '.
             .'   .-.   '.
            /   .'   '.   \\
           |   /       \\   |
     ------|--|---☼---|---|------ [EQUINOX]
           |   \\       /   |
            \\   '.   .'   /
             '.   '-'   .'
               '.     .'
                 '---'
       [CELESTIAL SPHERE // 2025.0]
    `;
  }

  cmdPing(target) {
    const host = target || 'the.void';
    return `
PING ${host} (0.0.0.0): 56 data bytes
64 bytes from ${host}: icmp_seq=0 ttl=0 time=9999.99 ms (Cold silence)
64 bytes from ${host}: icmp_seq=1 ttl=0 time=inf ms (Void acknowledged)
--- ${host} ping statistics ---
2 packets transmitted, 0 packets received, 100.0% cosmic absorption
    `;
  }

  cmdMatrix() {
    let output = '';
    const glyphs = ['✦', '✧', '0', '1', '☼', '☾', '☿', '♄', '░', '▒', '▓'];
    for (let r = 0; r < 5; r++) {
      let row = '';
      for (let c = 0; c < 35; c++) {
        row += glyphs[Math.floor(Math.random() * glyphs.length)] + ' ';
      }
      output += row + '\n';
    }
    return `<span style="color: #e2c487;">${output}</span>\n[COSMIC DUST STREAM DECODED]`;
  }

  cmdClear() {
    this.output.innerHTML = '';
    return null;
  }
}

// 4. Modal Interactive Deep Dives for Projects
const projectData = {
  sms: {
    title: "SYS.01 // STUDENT MANAGEMENT SYSTEM",
    content: `
      <div class="modal-section">
        <p class="modal-lead">
          <strong>The Problem:</strong> Universities generate terabytes of bureaucratic paperwork while using spreadsheets that crash when more than 3 people open them.
        </p>
        <p class="modal-lead">
          <strong>The Architecture:</strong> Built in clean Python with a relational record index, input validation sanitizer, and persistence.
        </p>
      </div>

      <div class="modal-ascii-box">
<pre>
[DATABASE RELATION SCHEMATIC]
+-------------------------------------------------------+
| TABLE: STUDENTS                                       |
+---------------------+-------------------+-------------+
| roll_no (INT PK)    | name (VARCHAR)    | gpa (FLOAT) |
+---------------------+-------------------+-------------+
| 2025001             | Karuna Singh      | 3.98        |
| 2025002             | Erwin Schrödinger | 0.00 / 4.00 |
| 2025003             | Alan Turing       | 4.00        |
+---------------------+-------------------+-------------+
</pre>
      </div>

      <div class="modal-repl">
        <div class="repl-title">✦ INTERACTIVE TEST QUERIES</div>
        <div class="repl-btns">
          <button class="repl-run-btn" data-query="query_top">RUN: SELECT * WHERE gpa > 3.8</button>
          <button class="repl-run-btn" data-query="query_stats">RUN: CALCULATE CLASS GPA STATS</button>
          <button class="repl-run-btn" data-query="query_stress">RUN: STRESS INJECTION TEST</button>
        </div>
        <div id="sms-repl-output" class="repl-console">
          Click a query above to execute on the simulated engine.
        </div>
      </div>
    `
  },

  lms: {
    title: "SYS.02 // LIBRARY MANAGEMENT SYSTEM",
    content: `
      <div class="modal-section">
        <p class="modal-lead">
          <strong>The Sarcastic Truth:</strong> Managing library inventory in C is like doing brain surgery with a butter knife: one stray pointer and the entire heap dissolves into static.
        </p>
        <p class="modal-lead">
          <strong>The Technical Triumph:</strong> Implemented double-linked index nodes, binary search for ISBN lookups, and rigorous memory boundaries. Valgrind reports zero definitively lost blocks.
        </p>
      </div>

      <div class="modal-ascii-box">
<pre>
[C HEAP ALLOCATION & STRUCT LAYOUT]
typedef struct BookNode {
    char isbn[14];           // 13 + null terminator
    char title[64];          // Book title buffer
    int is_borrowed;         // 1 = loaned, 0 = available
    struct BookNode* next;   // [0x7ffee4a0] -> Next node
    struct BookNode* prev;   // [0x7ffee460] -> Prev node
} BookNode;
</pre>
      </div>

      <div class="modal-repl">
        <div class="repl-title">✦ SIMULATE C MEMORY ALLOCATION</div>
        <div class="repl-btns">
          <button class="repl-run-btn" data-query="c_malloc">SIMULATE: malloc(sizeof(BookNode))</button>
          <button class="repl-run-btn" data-query="c_search">SEARCH ISBN: 978-0131103627</button>
          <button class="repl-run-btn" data-query="c_free">SIMULATE: free_all_nodes()</button>
        </div>
        <div id="lms-repl-output" class="repl-console">
          Ready to allocate structs on simulated heap.
        </div>
      </div>
    `
  },

  weather: {
    title: "SYS.03 // WEATHER FORECAST APPLICATION",
    content: `
      <div class="modal-section">
        <p class="modal-lead">
          <strong>Atmospheric Telemetry:</strong> Situated at 1,500m elevation in Solan, weather shifts faster than a junior developer switching frameworks.
        </p>
        <p class="modal-lead">
          <strong>Features:</strong> REST ingestion, solar zenith calculations, barometric trend forecasting, and responsive ASCII radar plotting.
        </p>
      </div>

      <div class="modal-ascii-box">
<pre>
[SOLAN TROPOSPHERIC RADAR // ELEV: 1500m]
   ALTITUDE (m)
   2000 |      .--.      .--.    (Heavy Mist)
   1500 | ----(    )----(    )--- [SHOOLINI RIDGE]
   1000 |    '--'      '--'      TEMP: 14.2°C // RH: 87%
    500 |                        BARO: 1014.2 hPa
</pre>
      </div>

      <div class="modal-repl">
        <div class="repl-title">✦ SENSOR TELEMETRY SCAN</div>
        <div class="repl-btns">
          <button class="repl-run-btn" data-query="wx_scan">SCAN SOLAN ATMOSPHERE</button>
          <button class="repl-run-btn" data-query="wx_celestial">CALCULATE SOLAR & MOON PHASES</button>
        </div>
        <div id="weather-repl-output" class="repl-console">
          Click scan to sample simulated Himalayan meteorological sensors.
        </div>
      </div>
    `
  }
};

function initModals() {
  const modalOverlay = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-project-title');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close');

  if (!modalOverlay || !closeBtn) return;

  function closeModal() {
    modalOverlay.classList.add('hidden');
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.querySelectorAll('.open-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const projId = btn.getAttribute('data-modal');
      const data = projectData[projId];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalBody.innerHTML = data.content;
      modalOverlay.classList.remove('hidden');

      bindModalRepl(projId);
    });
  });
}

function bindModalRepl(projId) {
  const btns = document.querySelectorAll('.repl-run-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');

      if (projId === 'sms') {
        const out = document.getElementById('sms-repl-output');
        if (q === 'query_top') {
          out.innerHTML = `<span style="color:#e2c487;">[SUCCESS] 2 records retrieved:</span>\n> Roll: 2025001 | Karuna Singh | GPA: 3.98\n> Roll: 2025003 | Alan Turing  | GPA: 4.00`;
        } else if (q === 'query_stats') {
          out.innerHTML = `<span style="color:#e2c487;">[AGGREGATE METRICS]</span>\nMean GPA: 3.66 | Standard Dev: 0.42 | Total Records: 128\nSystem status: 0 schema lockouts reported.`;
        } else if (q === 'query_stress') {
          out.innerHTML = `<span style="color:#6ee2f5;">[INJECTING 5,000 MOCK RECORDS...]</span>\nInserted in 0.041s. Index recomputed with zero latency degradation.`;
        }
      } else if (projId === 'lms') {
        const out = document.getElementById('lms-repl-output');
        if (q === 'c_malloc') {
          out.innerHTML = `<span style="color:#e2c487;">[SYS_CALL] malloc(88 bytes)</span> -> Address: 0x7ffee4a0\nNode initialized. Pointers: prev=NULL, next=0x7ffee440.\nValgrind status: 0 leaks, 0 errors.`;
        } else if (q === 'c_search') {
          out.innerHTML = `<span style="color:#e2c487;">[BINARY SEARCH] ISBN 978-0131103627</span>\nFound in 3 hops: "The C Programming Language" (Kernighan & Ritchie).\nCopies in vault: 2 available, 1 checked out.`;
        } else if (q === 'c_free') {
          out.innerHTML = `<span style="color:#6ee2f5;">[FREEING HEAP CHAIN]</span>\nfree(0x7ffee4a0)\nfree(0x7ffee440)\nfree(0x7ffee3e0)\nHeap completely sanitized. 0 bytes leaked. Clean exit code: 0.`;
        }
      } else if (projId === 'weather') {
        const out = document.getElementById('weather-repl-output');
        if (q === 'wx_scan') {
          out.innerHTML = `<span style="color:#e2c487;">[SOLAN STATION TELEMETRY]</span>\nTemperature: 13.8°C | Humidity: 86% | Pressure: 1013.8 hPa\nPrecipitation Probability: 68% (Typical Himalayan mountain cloudcover)`;
        } else if (q === 'wx_celestial') {
          out.innerHTML = `<span style="color:#6ee2f5;">[CELESTIAL CALCULATIONS]</span>\nSolar Elevation: +44.2° | Solar Azimuth: 182.1° S\nMoon Phase: Waxing Gibbous (Illumination: 78.4%)\nSky Condition: Deep starlight obscured by thin cirrus haze.`;
        }
      }
    });
  });
}

// 5. Toast Notification
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

// 6. Init All
document.addEventListener('DOMContentLoaded', () => {
  updateJulianDate();
  setInterval(updateJulianDate, 30000);

  // Terminal
  new ObservatoryTerminal();

  // Audio
  const celestialAudio = new CelestialAudio();
  const audioBtn = document.getElementById('audio-toggle');
  const audioStatus = document.getElementById('audio-status');

  if (audioBtn && audioStatus) {
    audioBtn.addEventListener('click', () => {
      const active = celestialAudio.toggle();
      audioStatus.textContent = active ? 'LIVE' : 'MUTED';
      audioStatus.style.color = active ? '#e2c487' : 'inherit';
      showToast(active ? '✦ Celestial sound generator engaged' : '✧ Celestial sound generator muted');
    });
  }

  // ASCII mode toggle
  const asciiBtn = document.getElementById('ascii-mode-btn');
  let asciiHigh = true;
  if (asciiBtn) {
    asciiBtn.addEventListener('click', () => {
      asciiHigh = !asciiHigh;
      asciiBtn.innerHTML = `<span class="btn-glyph">✢</span> ASCII DENSITY: ${asciiHigh ? 'HIGH' : 'LOW'}`;
      showToast(asciiHigh ? '✦ ASCII density set to High' : '✧ ASCII density reduced');
    });
  }

  // Modals
  initModals();

  // Glass Star Entity Controls
  const pulseBtn = document.getElementById('pulse-refraction-btn');
  const wireframeBtn = document.getElementById('wireframe-hud-btn');
  const starGlare = document.getElementById('star-glare');
  const glassImg = document.getElementById('glass-star-img');

  function triggerStarPulse() {
    if (starGlare) {
      starGlare.classList.remove('pulse-active');
      void starGlare.offsetWidth; // trigger reflow
      starGlare.classList.add('pulse-active');
    }
    celestialAudio.playStarlightChime();
    showToast('✦ Refractive liquid chrome pulse emitted');
  }

  if (pulseBtn) pulseBtn.addEventListener('click', triggerStarPulse);
  if (glassImg) glassImg.addEventListener('click', triggerStarPulse);

  if (wireframeBtn) {
    wireframeBtn.addEventListener('click', () => {
      const term = document.getElementById('term-input');
      const termCard = document.getElementById('terminal');
      if (term) {
        term.value = 'star';
        term.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      }
      if (termCard) {
        termCard.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('✦ Streamed Glass Star HUD to terminal');
    });
  }

  // Copy coordinates
  const copyBtn = document.getElementById('copy-coords-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const coords = "30°54'N 77°06'E // Shoolini University, Solan, HP // Karuna Singh B.Tech CSE";
      navigator.clipboard.writeText(coords).then(() => {
        showToast('✦ Coordinates copied to clipboard');
      }).catch(() => {
        showToast('✦ Shoolini Observatory: 30°54\'N 77°06\'E');
      });
    });
  }
});
