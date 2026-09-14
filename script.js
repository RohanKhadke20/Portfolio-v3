/* ==========================================================================
   PORTFOLIO V3 - INTERACTIVE ENGINE & SCRIPTS
   Author: Rohan Khadke (B.Tech CSE Core, Parul University)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. Web Audio Synthesizer (UI Sound Effects without External Files)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let audioEnabled = localStorage.getItem('portfolio_audio') === 'true';

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playSound(type = 'click') {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(290, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'terminal') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(750, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch (e) {
      console.warn('Audio play exception', e);
    }
  }

  const audioToggleBtn = document.getElementById('audio-toggle');
  const audioIcon = document.getElementById('audio-icon');

  function updateAudioButtonUI() {
    if (audioEnabled) {
      audioIcon.className = 'fas fa-volume-up';
      audioToggleBtn.style.color = 'var(--accent-cyan)';
    } else {
      audioIcon.className = 'fas fa-volume-mute';
      audioToggleBtn.style.color = 'var(--text-dim)';
    }
  }
  updateAudioButtonUI();

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      localStorage.setItem('portfolio_audio', audioEnabled);
      updateAudioButtonUI();
      if (audioEnabled) {
        initAudio();
        playSound('success');
        showToast('UI Sound FX Enabled 🔊');
      } else {
        showToast('UI Sound FX Muted 🔇');
      }
    });
  }

  // Attach hover sounds to interactive elements
  document.querySelectorAll('a, button, .tab-btn, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => playSound('hover'));
    el.addEventListener('click', () => playSound('click'));
  });

  // --------------------------------------------------------------------------
  // 2. Dark / Light Theme System
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('portfolio_theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  function updateThemeIcon(theme) {
    if (themeIcon) {
      if (theme === 'light') {
        themeIcon.className = 'fas fa-sun';
      } else {
        themeIcon.className = 'fas fa-moon';
      }
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('portfolio_theme', newTheme);
      updateThemeIcon(newTheme);
      playSound('click');
      showToast(`Switched to ${newTheme.toUpperCase()} theme`);
    });
  }

  // --------------------------------------------------------------------------
  // 3. Constellation Background Particle Canvas
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 140 };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.6;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.color = Math.random() > 0.5 ? '#38bdf8' : '#818cf8';
        this.alpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;

        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            let dirX = dx / distance;
            let dirY = dy / distance;
            this.x -= dirX * force * 2;
            this.y -= dirY * force * 2;
          }
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 14000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            ctx.save();
            ctx.globalAlpha = (1 - distance / 110) * 0.15;
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connectParticles();
      requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    resizeCanvas();
    animateParticles();
  }

  // --------------------------------------------------------------------------
  // 4. Navbar Scroll & Mobile Navigation
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const scrollProgressBar = document.getElementById('scroll-progress');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }

    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Active Section Detection
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinkItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      playSound('click');
    });

    navLinkItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. 3D Tilt Card & Specular Highlight Effect
  // --------------------------------------------------------------------------
  const heroCard = document.getElementById('hero-profile-card');
  if (heroCard) {
    heroCard.addEventListener('mousemove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      heroCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      heroCard.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      heroCard.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // --------------------------------------------------------------------------
  // 6. Number Counter Animation on Viewport Entry
  // --------------------------------------------------------------------------
  const counters = document.querySelectorAll('.counter');
  let counterStarted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counterStarted) {
        counterStarted = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1500;
          const stepTime = 20;
          const totalSteps = duration / stepTime;
          const increment = target / totalSteps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target;
              clearInterval(timer);
            } else {
              counter.textContent = Math.ceil(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsSection = document.querySelector('.metrics-strip');
  if (metricsSection) {
    countObserver.observe(metricsSection);
  }

  // --------------------------------------------------------------------------
  // 7. Skills Tab Filter System
  // --------------------------------------------------------------------------
  const skillTabs = document.querySelectorAll('.skills-tabs .tab-btn');
  const skillCards = document.querySelectorAll('.skills-grid .skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-category');

      skillCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 8. Projects Filter System
  // --------------------------------------------------------------------------
  const projectFilters = document.querySelectorAll('.project-filters .filter-btn');
  const projectCards = document.querySelectorAll('.projects-grid .project-card');

  projectFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      projectFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 9. Interactive CLI Terminal Console
  // --------------------------------------------------------------------------
  const terminalInput = document.getElementById('terminal-input');
  const termHistory = document.getElementById('term-history');
  const termBody = document.getElementById('term-body');
  let cmdHistory = [];
  let historyIndex = -1;

  const terminalCommands = {
    help: `
      <div class="term-cyan">Available Commands:</div>
      <div>- <span class="term-green">about</span>: Background & Education summary</div>
      <div>- <span class="term-green">skills</span>: Core capabilities & technology stacks</div>
      <div>- <span class="term-green">projects</span>: Production monorepos & engineering works</div>
      <div>- <span class="term-green">benchmarks</span>: Quantitative performance & architecture metrics</div>
      <div>- <span class="term-green">rakshak</span>: Project RAKSHAK security architecture</div>
      <div>- <span class="term-green">astrolith</span>: 3D Three.js & WebSocket cosmic engine</div>
      <div>- <span class="term-green">arbitrack</span>: Real-time arbitrage tracking specs</div>
      <div>- <span class="term-green">agentpay</span>: Autonomous AI payment orchestration</div>
      <div>- <span class="term-green">aether</span>: Deterministic 2D Newtonian physics sandbox</div>
      <div>- <span class="term-green">contact</span>: Direct email, LinkedIn & GitHub coordinates</div>
      <div>- <span class="term-green">quote</span>: Inspire with engineering wisdom</div>
      <div>- <span class="term-green">matrix</span>: Initiate cyber rain simulation</div>
      <div>- <span class="term-green">theme</span>: Toggle Light/Dark workspace mode</div>
      <div>- <span class="term-green">clear</span>: Clear terminal console</div>
    `,
    about: `
      <div class="term-purple">=== DEVELOPER PROFILE ===</div>
      <div>Name: <strong>Rohan Khadke</strong></div>
      <div>University: <strong>Parul University</strong> (B.Tech CSE Core)</div>
      <div>Specialization: Full-Stack Systems, Native C/C++, AWS Cloud, Interactive Graphics</div>
      <div>Mission: Designing resilient distributed systems & high-aesthetic web interfaces.</div>
    `,
    skills: `
      <div class="term-purple">=== CORE SKILLSET ===</div>
      <div>- Languages: C, C++20, JavaScript (ES6+), TypeScript, SQL, HTML5, CSS3</div>
      <div>- Frameworks & Libs: React, Next.js, Node.js, Express, Three.js, Zustand, Prisma</div>
      <div>- Cloud & Tools: AWS (EC2, S3), Git/GitHub, WebSockets, REST APIs, Linux/Bash</div>
    `,
    projects: `
      <div class="term-purple">=== SELECTED REPOSITORIES ===</div>
      <div>1. <span class="term-cyan">Project RAKSHAK</span>: Security & Resource Node Operations Center</div>
      <div>2. <span class="term-cyan">Astrolith / GameInterstellar</span>: 3D Three.js Space Engine with WebSockets</div>
      <div>3. <span class="term-cyan">ArbiTrack</span>: Arbitrage Opportunity Tracker & Mobile-Ready App</div>
      <div>4. <span class="term-cyan">AgentPay Razorpay</span>: Autonomous AI Agent Payment Protocol</div>
      <div>5. <span class="term-cyan">AetherEngine</span>: Deterministic 2D Physics Sandbox & 35 Unit Tests</div>
      <div>6. <span class="term-cyan">OSN Safety Scanner</span>: Automated network & vulnerability toolkit</div>
    `,
    benchmarks: `
      <div class="term-purple">=== QUANTITATIVE BENCHMARKS & SPECS ===</div>
      <div>🛡️ <span class="term-cyan">RAKSHAK</span>: &lt; 14ms Query Latency | 100% RBAC Coverage | Docker Compose Instant Run</div>
      <div>🌌 <span class="term-cyan">Astrolith</span>: 60 FPS WebGL Loop | Sub-ms WebSocket Sync | SQLite3 Persistence</div>
      <div>📈 <span class="term-cyan">ArbiTrack</span>: 100% Offline-First PWA | 1-Click Demo Pre-Seed | Dexie IndexedDB + P2P</div>
      <div>🤖 <span class="term-cyan">AgentPay</span>: HMAC-SHA256 Signatures | Gemini Function Calling | Prisma Audit Trail</div>
      <div>⚛️ <span class="term-cyan">AetherEngine</span>: 35/35 Passing Headless Tests | 60 FPS Canvas Physics | Inelastic Coalescence</div>
    `,
    rakshak: `
      <div class="term-cyan">🛡️ PROJECT RAKSHAK:</div>
      <div>Full-Stack security telemetry operations center.</div>
      <div>Stack: Next.js, Tailwind, TypeScript, Node.js/Express, PostgreSQL, Prisma ORM.</div>
    `,
    astrolith: `
      <div class="term-purple">🌌 ASTROLITH MONOREPO:</div>
      <div>3D procedural space rendering with WebSocket synchronization.</div>
      <div>Stack: React, Three.js, Zustand, Node.js, SQLite3, ws protocol.</div>
    `,
    arbitrack: `
      <div class="term-green">📈 ARBITRACK:</div>
      <div>High-throughput crypto/fintech arbitrage scanner with live spread calculations.</div>
      <div>Stack: React, Vite, TypeScript, Tailwind, Capacitor.</div>
    `,
    agentpay: `
      <div class="term-yellow">🤖 AGENTPAY RAZORPAY PROTOCOL:</div>
      <div>Autonomous AI Agent payment execution and checkout protocol with Razorpay APIs.</div>
      <div>Stack: Node.js, Express, Razorpay API, HMAC Webhooks, Prisma ORM.</div>
    `,
    aether: `
      <div class="term-yellow">⚡ AETHERENGINE: ORBIT COLLAPSE:</div>
      <div>Deterministic 2D Newtonian gravity physics sandbox built with HTML5 canvas and modular JavaScript.</div>
      <div>Features n-body gravity, momentum conservation, zero-g shields, and 35/35 passing unit tests.</div>
    `,
    contact: `
      <div class="term-purple">=== CONTACT COORDINATES ===</div>
      <div>Email: <a href="mailto:rohankhadke20@gmail.com" class="term-cyan">rohankhadke20@gmail.com</a></div>
      <div>GitHub: <a href="https://github.com/RohanKhadke20" target="_blank" class="term-cyan">github.com/RohanKhadke20</a></div>
      <div>LinkedIn: <a href="https://www.linkedin.com/in/rohan-khadke" target="_blank" class="term-cyan">linkedin.com/in/rohan-khadke</a></div>
    `,
    quote: `
      <div class="term-yellow">"Simplicity is prerequisite for reliability." &mdash; Edsger W. Dijkstra</div>
    `,
    sudo: `
      <div class="term-yellow">⚠️ Permission Denied: You are already in master developer mode. Enjoy exploring!</div>
    `,
    theme: () => {
      const current = htmlRoot.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', next);
      localStorage.setItem('portfolio_theme', next);
      updateThemeIcon(next);
      return `<div class="term-green">Theme switched to ${next.toUpperCase()} mode.</div>`;
    },
    matrix: () => {
      return `
        <div class="term-green" style="font-family: monospace; line-height: 1.2;">
          01001001 01001110 01010011 01010000 01001001 01010010 01000101<br>
          01010011 01011001 01010011 01010100 01000101 01001101 01010011<br>
          ⚡ SYSTEM ONLINE: Antigravity Cyber Environment Initialized.<br>
        </div>
      `;
    }
  };

  function executeTerminalCommand(inputCmd) {
    const raw = inputCmd.trim();
    if (!raw) return;

    cmdHistory.push(raw);
    historyIndex = cmdHistory.length;

    const lower = raw.toLowerCase();
    const line = document.createElement('div');
    line.className = 'terminal-entry';
    line.innerHTML = `
      <div class="terminal-line">
        <span class="term-prompt">rohan@portfolio:~$</span>
        <span>${escapeHtml(raw)}</span>
      </div>
    `;

    if (lower === 'clear') {
      termHistory.innerHTML = '';
      playSound('terminal');
      return;
    }

    let outputContent = '';
    if (typeof terminalCommands[lower] === 'function') {
      outputContent = terminalCommands[lower]();
    } else if (terminalCommands[lower]) {
      outputContent = terminalCommands[lower];
    } else {
      outputContent = `<div class="term-yellow">Command not recognized: '${escapeHtml(raw)}'. Type <span class="term-green">'help'</span> for valid commands.</div>`;
    }

    const outputDiv = document.createElement('div');
    outputDiv.className = 'terminal-output';
    outputDiv.style.marginTop = '0.35rem';
    outputDiv.innerHTML = outputContent;
    line.appendChild(outputDiv);

    termHistory.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
    playSound('terminal');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.runTerminalQuick = (cmd) => {
    if (terminalInput) {
      terminalInput.value = cmd;
      executeTerminalCommand(cmd);
      terminalInput.value = '';
      terminalInput.focus();
    }
  };

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeTerminalCommand(terminalInput.value);
        terminalInput.value = '';
      } else if (e.key === 'ArrowUp') {
        if (historyIndex > 0) {
          historyIndex--;
          terminalInput.value = cmdHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < cmdHistory.length - 1) {
          historyIndex++;
          terminalInput.value = cmdHistory[historyIndex];
        } else {
          historyIndex = cmdHistory.length;
          terminalInput.value = '';
        }
      }
    });
  }

  const openTerminalBtn = document.getElementById('open-terminal-btn');
  if (openTerminalBtn) {
    openTerminalBtn.addEventListener('click', () => {
      const termSection = document.getElementById('terminal');
      if (termSection) {
        termSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => terminalInput && terminalInput.focus(), 600);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10. Project Deep Dive Modal Data & Controller
  // --------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const projectModalContent = document.getElementById('project-modal-content');
  const closeProjBtn = document.getElementById('close-proj-btn');

  const projectDetailsMap = {
    rakshak: {
      title: 'Project RAKSHAK Monorepo',
      tagline: 'Enterprise Security & Resource Node Operations Center',
      icon: 'fa-shield-halved',
      iconColor: '#38bdf8',
      repoUrl: 'https://github.com/RohanKhadke20/Rakshak',
      summary: 'Project RAKSHAK is a state-of-the-art security and resource node monitoring dashboard designed for mission-critical infrastructure oversight.',
      features: [
        'Real-time telemetry feeds with incident logging and threat triage',
        'Node.js & Express TypeScript REST API with Prisma ORM and PostgreSQL',
        'Next.js modern responsive Operations Center with dark cyber aesthetics',
        'Database seed pipelines and automated system health probes'
      ],
      stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Prisma ORM', 'Express.js'],
      simulatedStats: { 'Node Uptime': '99.98%', 'Active Sensors': '1,420', 'Threat Latency': '< 14ms' }
    },
    astrolith: {
      title: 'Astrolith / GameInterstellar',
      tagline: 'Cosmic 3D Three.js & High-Frequency WebSocket Engine',
      icon: 'fa-rocket',
      iconColor: '#a855f7',
      repoUrl: 'https://github.com/RohanKhadke20/GameInterstellar',
      summary: 'A full-stack monorepo featuring an interactive 3D WebGL space environment with live WebSocket state replication across client nodes.',
      features: [
        'Vite + React frontend with custom Three.js camera controls & particle stars',
        'Zustand global store managing real-time coordinates and WebSocket messages',
        'Node.js backend with SQLite3 database and custom ws communication layer',
        'Live telemetry feed, asteroid physics simulator, and multi-client synchronization'
      ],
      stack: ['Three.js', 'WebGL', 'React', 'Zustand', 'Node.js', 'WebSockets', 'SQLite3'],
      simulatedStats: { 'Render FPS': '60 FPS', 'Sync Delay': '< 8ms', 'Scene Objects': '5,000+' }
    },
    arbitrack: {
      title: 'ArbiTrack Engine',
      tagline: 'Arbitrage Opportunity Tracker & Mobile-Ready Analytics',
      icon: 'fa-chart-line',
      iconColor: '#34d399',
      repoUrl: 'https://github.com/RohanKhadke20/ArbiTrack',
      summary: 'High-speed arbitrage calculation platform providing traders with instant market discrepancy alerts across multiple asset feeds.',
      features: [
        'Real-time price spread tracking and automated profit margin calculations',
        'Capacitor compilation for seamless cross-platform iOS and Android builds',
        'Modern reactive UI with TypeScript safety and Vite lightning bundling',
        'Configurable risk parameters and custom exchange integrations'
      ],
      stack: ['React', 'TypeScript', 'Vite', 'Capacitor', 'Tailwind CSS'],
      simulatedStats: { 'Scan Rate': '120/sec', 'Supported Pairs': '250+', 'Mobile Build': 'Capacitor Native' }
    },
    agentpay: {
      title: 'AgentPay Razorpay Protocol',
      tagline: 'Autonomous AI Agent Payment Orchestration Engine',
      icon: 'fa-robot',
      iconColor: '#fbbf24',
      repoUrl: 'https://github.com/RohanKhadke20/agentpay-razorpay',
      summary: 'A secure financial transaction broker enabling AI autonomous agents to request and settle payment workflows with Razorpay API endpoints.',
      features: [
        'Cryptographically signed agent authorization headers & rate limiters',
        'Webhook listener verifying payment signatures with zero-trust validation',
        'Automated checkout link generation and session lifecycle handlers',
        'Mock test suites validating transaction idempotency under network partitions'
      ],
      stack: ['Node.js', 'Razorpay API', 'AI Agent Protocols', 'HMAC Webhooks', 'Express'],
      simulatedStats: { 'Signature Security': 'SHA-256 HMAC', 'Tx Settlement': 'Instant', 'Agent Auth': 'Tokenized' }
    },
    aether: {
      title: 'AetherEngine: Orbit Collapse',
      tagline: 'Deterministic 2D Newtonian Gravity Physics Sandbox',
      icon: 'fa-atom',
      iconColor: '#60a5fa',
      repoUrl: 'https://github.com/RohanKhadke20/AetherEngine',
      summary: 'A modular computational physics engine simulating n-body gravitational attraction, momentum-conserving collisions, orbital velocity mechanics, and field diverters on HTML5 Canvas, validated with a 35-test headless suite.',
      features: [
        'Custom 2D Vector mathematics library with normalization, dot products, and vector arithmetic',
        'Deterministic Newtonian gravity solver with G-constant and orbital velocity formulas',
        'Momentum-conserving asteroid inelastic collision merging and dynamic mass swelling',
        'Zero-G shields, inversion repulsion fields, and dynamic directional beam diverters',
        'Headless automated test runner with 35 passing physics and orbital stability assertions'
      ],
      stack: ['HTML5 Canvas', 'Modular JavaScript', 'Vector Math', 'Physics Engine', 'Headless Testing'],
      simulatedStats: { 'Unit Tests': '35/35 Passed', 'Orbit Stability': '99.94%', 'Physics Clock': '60 Hz' }
    },
    osn: {
      title: 'OSN Safety Scanner',
      tagline: 'Network & Vulnerability Assessment Security Toolkit',
      icon: 'fa-radar',
      iconColor: '#f43f5e',
      repoUrl: 'https://github.com/RohanKhadke20/OSN_Extension',
      summary: 'An automated security analysis tool created to inspect socket configurations, verify SSL/TLS certificates, and detect anomalous payloads.',
      features: [
        'Comprehensive port scan & banner grabbing routines',
        'Security policy compliance checks and cipher suite inspection',
        'Colorized terminal auditing reports with actionable remediation advice',
        'Lightweight, zero-dependency deployment philosophy'
      ],
      stack: ['Network Sockets', 'SSL/TLS Analysis', 'Security Auditing', 'Python/JS'],
      simulatedStats: { 'Scan Duration': '< 2s', 'Audit Depth': 'L4/L7 Protocol', 'Report Output': 'JSON/Terminal' }
    }
  };

  document.querySelectorAll('.open-proj-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const projKey = btn.getAttribute('data-project');
      const data = projectDetailsMap[projKey];
      if (data && projectModalContent) {
        projectModalContent.innerHTML = `
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 52px; height: 52px; border-radius: var(--radius-md); background: rgba(255,255,255,0.05); border: 1px solid var(--border-glow); display: grid; place-items: center; font-size: 1.5rem; color: ${data.iconColor};">
              <i class="fas ${data.icon}"></i>
            </div>
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 1.6rem; line-height: 1.2;">${data.title}</h2>
              <p style="font-size: 0.85rem; color: var(--text-dim); font-family: var(--font-mono);">${data.tagline}</p>
            </div>
          </div>

          <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
            ${data.summary}
          </p>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; margin-bottom: 0.75rem; color: var(--text-main);">Architectural Highlights</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">
              ${data.features.map(f => `<li style="display: flex; align-items: flex-start; gap: 0.5rem;"><i class="fas fa-check-circle" style="color: var(--accent-cyan); margin-top: 0.2rem;"></i><span>${f}</span></li>`).join('')}
            </ul>
          </div>

          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim); margin-bottom: 0.75rem;">Engine Telemetry & Benchmarks</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
              ${Object.entries(data.simulatedStats).map(([k, v]) => `
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-dim);">${k}</div>
                  <strong style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 1.05rem;">${v}</strong>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              ${data.stack.map(s => `<span class="tech-chip" style="background: rgba(56,189,248,0.1); color: var(--accent-cyan); border-color: var(--border-glow);">${s}</span>`).join('')}
            </div>
            <a href="${data.repoUrl || 'https://github.com/RohanKhadke20'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size: 0.85rem; padding: 0.55rem 1.25rem;">
              <i class="fab fa-github"></i>
              <span>View Source on GitHub</span>
            </a>
          </div>
        `;
        projectModal.classList.add('active');
        playSound('click');
      }
    });
  });

  if (closeProjBtn && projectModal) {
    closeProjBtn.addEventListener('click', () => {
      projectModal.classList.remove('active');
    });
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        projectModal.classList.remove('active');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 11. Portfolio Evolution Modal
  // --------------------------------------------------------------------------
  const iterModal = document.getElementById('iterations-modal');
  const openIterBtn = document.getElementById('open-iterations-modal');
  const openIterFooter = document.getElementById('open-evolution-footer');
  const closeIterBtn = document.getElementById('close-iterations-btn');

  function showIterationsModal(e) {
    if (e) e.preventDefault();
    if (iterModal) {
      iterModal.classList.add('active');
      playSound('click');
    }
  }

  if (openIterBtn) openIterBtn.addEventListener('click', showIterationsModal);
  if (openIterFooter) openIterFooter.addEventListener('click', showIterationsModal);
  if (closeIterBtn && iterModal) {
    closeIterBtn.addEventListener('click', () => iterModal.classList.remove('active'));
    iterModal.addEventListener('click', (e) => {
      if (e.target === iterModal) iterModal.classList.remove('active');
    });
  }

  // Keyboard accessibility: dismiss any active modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (projectModal && projectModal.classList.contains('active')) {
        projectModal.classList.remove('active');
        playSound('click');
      }
      if (iterModal && iterModal.classList.contains('active')) {
        iterModal.classList.remove('active');
        playSound('click');
      }
    }
  });

  // --------------------------------------------------------------------------
  // 12. Contact Form & Clipboard Toast System
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const toastContainer = document.getElementById('toast-container');
  const copyHeroEmailBtn = document.getElementById('copy-email-hero-btn');

  function showToast(message, icon = 'fas fa-check-circle') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${icon} toast-icon-success"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 20);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  if (copyHeroEmailBtn) {
    copyHeroEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('rohankhadke20@gmail.com').then(() => {
        playSound('success');
        showToast('Email address copied to clipboard! (rohankhadke20@gmail.com)');
      }).catch(() => {
        showToast('rohankhadke20@gmail.com');
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      const submitBtn = document.getElementById('send-msg-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Transmitting...</span>';

      setTimeout(() => {
        playSound('success');
        showToast(`Thank you, ${name}! Your transmission has been queued.`);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Transmit Message</span> <i class="fas fa-paper-plane"></i>';
        contactForm.reset();

        // Trigger user mailto as fallback
        const mailtoUri = `mailto:rohankhadke20@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
        window.location.href = mailtoUri;
      }, 900);
    });
  }

});
