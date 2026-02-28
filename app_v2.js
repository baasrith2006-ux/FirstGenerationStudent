// ===== PATHWISE APP.JS =====

// ---- DATA STORE ----
const DEFAULT_STATE = {
  student: { name: 'Student Name', initials: 'SN', stream: 'Not set', year: 'Not set', goal: 'Not set' },
  streak: 0,
  subjects: [],
  todayTasks: [],
  nudges: [
    'Welcome! Add some tasks and your subjects to get started.',
    'Update your profile in the settings.'
  ],
  plannerSessions: {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  },
  testHistory: [],
  usedQuestions: { math: [], physics: [], cs: [], chemistry: [] },
  chatMessages: [],
};

let AppState = DEFAULT_STATE;

async function initApp() {
  try {
    // Show skeletons first
    showSkeletons('dashboard-task-list', 4);
    showSkeletons('dna-subjects-grid', 3);

    const [user, subjects, tasks, planner, chats, syllabus, testHistory] = await Promise.all([
      API.getUser(),
      API.getSubjects(),
      API.getTasks(),
      API.getPlanner(),
      API.getChat(),
      API.getSyllabus(),
      API.getTestHistory()
    ]);

    AppState.student = {
      name: user.name || 'Student Name',
      initials: user.initials || 'SN',
      stream: user.stream || 'Not set',
      year: user.year || 'Not set',
      goal: user.goal || 'Not set',
      streak: user.streak || 0,
    };
    AppState.dnaTraits = user.dnaTraits || [];
    AppState.dnaProfile = user.dnaProfile || { type: 'Not yet analyzed', description: 'Complete your profile to see your study DNA.' };
    AppState.subjects = subjects;
    AppState.todayTasks = tasks;
    AppState.planner = planner;
    AppState.chatHistory = chats;
    AppState.extractedSyllabus = syllabus;
    extractedSyllabus = syllabus;
    AppState.testHistory = testHistory;
    AppState.usedQuestions = user.usedQuestions || { math: [], physics: [], cs: [], chemistry: [] };

    // Initial renders
    initNav();
    renderDashboard();
    renderDNA();
    renderPlanner();
    renderChat();
    renderSyllabusAI();
    renderTestSetup();
    renderAnalytics();

    Toast.info('System connected. Welcome back!');
  } catch (err) {
    console.error('Failed to initialize app:', err);
    Toast.error('Failed to connect to backend. Please check your connection.');
  }
}

function initNav() {
  document.getElementById('nav-student-name').textContent = AppState.student.name;
  document.getElementById('nav-avatar').textContent = AppState.student.initials;
}

function showSkeletons(containerId, count = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = Array(count).fill('<div class="loading-skeleton skeleton-card"></div>').join('');
}

function saveState() {
  // No-op for now, as we save individually to backend
}

async function clearAllData() {
  if (confirm('Are you sure you want to clear all data?')) {
    // Implement full clear in backend if needed
    localStorage.clear();
    location.reload();
  }
}

async function addTask() {
  const name = document.getElementById('new-task-name').value.trim();
  const sub = document.getElementById('new-task-subject').value.trim() || 'General';
  const dur = document.getElementById('new-task-duration').value.trim() || '30m';
  if (!name) return;

  const newTask = await API.addTask({ name, subject: sub, duration: dur });
  AppState.todayTasks.push(newTask);

  document.getElementById('new-task-duration').value = '';
  Toast.success('Task added successfully!');
  renderDashboard();
}

async function removeTask(id) {
  await API.deleteTask(id);
  AppState.todayTasks = AppState.todayTasks.filter(t => t._id !== id);
  renderDashboard();
}

async function addSubject() {
  const name = prompt('Enter subject name:');
  if (!name) return;
  const icon = prompt('Enter an emoji icon for the subject:') || '📚';
  const colorsList = ['#6C63FF', '#43D9B6', '#FFB347', '#FF6584', '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c'];
  const color = colorsList[Math.floor(Math.random() * colorsList.length)];

  const newSub = await API.addSubject({ name, icon });
  AppState.subjects.push(newSub);
  Toast.success(`Subject "${name}" created!`);
  renderDNA();
}

async function removeSubject(id) {
  if (confirm('Remove subject?')) {
    await API.deleteSubject(id);
    AppState.subjects = AppState.subjects.filter(s => s._id !== id);
    renderDashboard();
  }
}


// ---- NAVIGATION ----
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + page);
  const nv = document.getElementById('nav-' + page);
  if (pg) pg.classList.add('active');
  if (nv) nv.classList.add('active');
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('open')) sidebar.classList.remove('open');
  // Lazy-render page content
  const renderers = {
    dashboard: renderDashboard, 'study-dna': renderDNA,
    'academic-gps': renderGPS, 'exam-readiness': renderReadiness,
    'dropout-risk': renderRisk, 'adaptive-test': renderTestSetup,
    planner: renderPlanner, analytics: renderAnalytics,
    'ai-mentor': renderChat, 'syllabus-ai': renderSyllabusAI,
  };
  if (renderers[page]) renderers[page]();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => { e.preventDefault(); navigateTo(item.dataset.page); });
});

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ---- HELPERS ----
function bar(pct, color) {
  return `<div class="mastery-bar">
    <div class="mastery-fill" style="width:0%;background:${color}" data-target="${pct}"></div>
    <div class="bar-text">${pct}%</div>
  </div>`;
}
function animateBars() {
  setTimeout(() => {
    document.querySelectorAll('.mastery-fill[data-target]').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 100);
}
function drawRing(canvasId, pct, color, size = 300, label = '') {
  const c = document.getElementById(canvasId); if (!c) return;
  const ctx = c.getContext('2d');
  const cx = c.width / 2, cy = c.height / 2, r = size / 2 - 20;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 18; ctx.stroke();
  const angle = (pct / 100) * Math.PI * 2 - Math.PI / 2;
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, color); grad.addColorStop(1, '#8B85FF');
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, angle);
  ctx.strokeStyle = grad; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.stroke();
}
function drawGauge(canvasId, pct) {
  const c = document.getElementById(canvasId); if (!c) return;
  const ctx = c.getContext('2d');
  const cx = c.width / 2, cy = c.height - 20, r = Math.min(c.width, c.height * 2) / 2 - 20;
  ctx.clearRect(0, 0, c.width, c.height);
  const zones = [['#43D9B6', 0, 0.4], ['#FFB347', 0.4, 0.7], ['#FF6584', 0.7, 1]];
  zones.forEach(([col, s, e]) => {
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * (s + 0), Math.PI * (e + 0));
    ctx.strokeStyle = col; ctx.lineWidth = 22; ctx.stroke();
  });
  const needle = Math.PI * Math.min(pct / 100, 1);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (r - 10) * Math.cos(needle), cy + (r - 10) * Math.sin(needle));
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}
function getGrade(pct) { return pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 55 ? 'Average' : 'Needs Work'; }
function getColor(pct) { return pct >= 75 ? '#43D9B6' : pct >= 50 ? '#FFB347' : '#FF6584'; }

// ---- DASHBOARD ----
function renderDashboard() {
  // Date
  const d = new Date();
  document.getElementById('today-date').textContent = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  document.getElementById('dash-student-name').textContent = AppState.student.name.split(' ')[0];
  // Today tasks
  const tl = document.getElementById('today-tasks-list');
  tl.innerHTML = AppState.todayTasks.map((t) => `
    <div class="task-item">
      <div class="task-check ${t.done ? 'done' : ''}" onclick="toggleTask('${t._id}')"></div>
      <div class="task-info">
        <div class="task-name ${t.done ? 'done' : ''}">${t.name}</div>
        <div class="task-meta">${t.subject}</div>
      </div>
      <div class="task-duration">${t.duration}</div>
      <div style="cursor:pointer;color:var(--error); margin-left: 8px;" onclick="removeTask('${t._id}')" title="Delete">
        <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
      </div>
    </div>`).join('');
  // Mastery
  const ml = document.getElementById('mastery-list');
  ml.innerHTML = AppState.subjects.map((s) => `
    <div class="mastery-item">
      <div class="mastery-header">
        <span class="mastery-name">${s.icon} ${s.name}</span>
        <span class="material-symbols-outlined" style="font-size:14px;cursor:pointer;opacity:0.6;margin-left:auto;" onclick="removeSubject('${s._id}')">delete</span>
      </div>
      ${bar(s.mastery, s.color)}
    </div>`).join('');
  // DNA preview
  const traits = ['Visual-Kinesthetic', 'Sprint Learner', 'Morning Boost', 'Pattern Thinker'];
  document.getElementById('dna-traits-preview').innerHTML = traits.map(t => `<span class="dna-trait-chip">${t}</span>`).join('');
  // Risk gauge preview
  document.getElementById('dash-risk-gauge').innerHTML = `<div style="text-align:center;padding:16px 0"><div style="font-size:36px;font-weight:900;color:#43D9B6">LOW</div><div style="font-size:13px;color:var(--text-muted);margin-top:6px">Risk Score: 23/100</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px">Click to see full analysis →</div></div>`;
  animateBars();
  refreshNudge();
}

async function toggleTask(id) {
  const updatedTask = await API.toggleTask(id);
  const taskIdx = AppState.todayTasks.findIndex(t => t._id === id);
  if (taskIdx !== -1) AppState.todayTasks[taskIdx] = updatedTask;

  const done = AppState.todayTasks.filter(t => t.done).length;
  document.getElementById('stat-goals').textContent = `${done}/${AppState.todayTasks.length}`;
  renderDashboard();
}

function refreshNudge() {
  if (AppState.nudges.length === 0) return;
  const n = AppState.nudges[Math.floor(Math.random() * AppState.nudges.length)];
  const nElement = document.getElementById('nudge-message');
  if (nElement) nElement.textContent = n;
}

// ---- STUDY DNA ----
const DNA = {
  type: 'Visual-Kinesthetic Learner',
  desc: 'You absorb information best through diagrams, mind maps, and hands-on practice. You have strong spatial intelligence and thrive when concepts are visualized. You prefer shorter, intense study sprints over long sessions.',
  strengths: [{ i: '🧠', t: 'Strong spatial reasoning and pattern recognition' }, { i: '⚡', t: 'Excellent focus in 25–45 minute deep work sprints' }, { i: '🔗', t: 'Natural ability to connect concepts across subjects' }, { i: '🎯', t: 'High retention when information is visually structured' }],
  weaknesses: [{ i: '📖', t: 'Long text-heavy reading lowers retention after 20 min' }, { i: '🕐', t: 'Difficulty sustaining attention in 2+ hour sessions' }, { i: '📝', t: 'Note-taking speed lags behind lecture pace' }],
  conditions: [{ i: '🌙', t: 'Peak performance window: 7 PM – 10 PM' }, { i: '🎧', t: 'Prefers lo-fi instrumental music while studying' }, { i: '📵', t: 'Needs phone-free environment for deep focus' }, { i: '🌿', t: 'Short 5-min breaks every 30 minutes boosts performance' }],
  techniques: [{ i: '🗺️', t: 'Mind Mapping for complex topics' }, { i: '🔄', t: 'Feynman Technique — explain it simply' }, { i: '📊', t: 'Concept diagrams over bullet-point notes' }, { i: '🧩', t: 'Practice problems immediately after theory' }],
  radar: [{ label: 'Visual', val: 90 }, { label: 'Auditory', val: 45 }, { label: 'Reading', val: 60 }, { label: 'Kinesthetic', val: 82 }, { label: 'Social', val: 65 }, { label: 'Solo', val: 78 }],
};

function renderDNA() {
  document.getElementById('dna-type-badge').textContent = '🧬 ' + DNA.type;
  document.getElementById('dna-description').textContent = DNA.desc;
  const attrs = [{ icon: '⚡', label: 'Sprint Learner', color: '#6C63FF' }, { icon: '👁️', label: 'Visual', color: '#FF6584' }, { icon: '🤲', label: 'Kinesthetic', color: '#43D9B6' }, { icon: '🌙', label: 'Night Owl', color: '#FFB347' }];
  document.getElementById('dna-attributes').innerHTML = attrs.map(a => `<span class="dna-attr" style="background:${a.color}22;color:${a.color};border:1px solid ${a.color}44">${a.icon} ${a.label}</span>`).join('');
  const renderTraits = (id, arr) => { document.getElementById(id).innerHTML = arr.map(t => `<div class="trait-item"><span class="trait-icon">${t.i}</span><span>${t.t}</span></div>`).join(''); };
  renderTraits('dna-strengths', DNA.strengths);
  renderTraits('dna-weaknesses', DNA.weaknesses);
  renderTraits('dna-conditions', DNA.conditions);
  renderTraits('dna-techniques', DNA.techniques);
  renderDNAHelix();
  drawRadar();
}

function renderDNAHelix() {
  const el = document.getElementById('dna-helix');
  const colors = ['#6C63FF', '#FF6584', '#43D9B6', '#FFB347'];
  let html = '';
  for (let i = 0; i < 18; i++) {
    const x1 = 40 + 30 * Math.sin(i * 0.7), x2 = 80 + 30 * Math.sin(i * 0.7 + Math.PI);
    const y = i * 14, col = colors[i % colors.length];
    html += `<div style="position:absolute;top:${y}px;left:${x1}px;width:8px;height:8px;border-radius:50%;background:${col};opacity:${0.5 + 0.5 * Math.abs(Math.sin(i * 0.7))}"></div>`;
    html += `<div style="position:absolute;top:${y}px;left:${x2}px;width:8px;height:8px;border-radius:50%;background:${col};opacity:${0.5 + 0.5 * Math.abs(Math.sin(i * 0.7 + Math.PI))}"></div>`;
    if (i % 3 === 0) html += `<div style="position:absolute;top:${y + 4}px;left:${Math.min(x1, x2) + 8}px;width:${Math.abs(x2 - x1) - 8}px;height:2px;background:${col};opacity:0.3"></div>`;
  }
  el.innerHTML = html;
}

function drawRadar() {
  const c = document.getElementById('dna-radar-canvas'); if (!c) return;
  const ctx = c.getContext('2d'); const cx = 210, cy = 190, r = 130;
  ctx.clearRect(0, 0, c.width, c.height);
  const pts = DNA.radar; const n = pts.length;
  // Grid
  [0.25, 0.5, 0.75, 1].forEach(f => {
    ctx.beginPath();
    pts.forEach((_, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + r * f * Math.cos(a), cy + r * f * Math.sin(a)); });
    ctx.closePath(); ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1; ctx.stroke();
  });
  // Axes
  pts.forEach((_, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.stroke(); });
  // Fill
  ctx.beginPath();
  pts.forEach((p, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; const v = p.val / 100; ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + r * v * Math.cos(a), cy + r * v * Math.sin(a)); });
  ctx.closePath();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, 'rgba(108,99,255,0.5)'); g.addColorStop(1, 'rgba(255,101,132,0.2)');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#6C63FF'; ctx.lineWidth = 2.5; ctx.stroke();
  // Labels
  ctx.font = 'bold 12px Inter'; ctx.fillStyle = 'rgba(240,242,255,0.85)'; ctx.textAlign = 'center';
  pts.forEach((p, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; ctx.fillText(p.label, cx + (r + 22) * Math.cos(a), cy + (r + 22) * Math.sin(a) + 4); });
  // Dots
  pts.forEach((p, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; const v = p.val / 100; ctx.beginPath(); ctx.arc(cx + r * v * Math.cos(a), cy + r * v * Math.sin(a), 5, 0, Math.PI * 2); ctx.fillStyle = '#6C63FF'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); });
}

function reanalyzeDNA() {
  const el = document.getElementById('dna-type-badge');
  el.textContent = '🔄 Analyzing...';
  setTimeout(() => { el.textContent = '🧬 ' + DNA.type; }, 1800);
}

// ---- ACADEMIC GPS ----
const GPS_DATA = {
  math: [
    { level: 0, nodes: [{ id: 'arith', label: 'Arithmetic', status: 'mastered' }, { id: 'algebra', label: 'Algebra', status: 'mastered' }] },
    { level: 1, nodes: [{ id: 'trig', label: 'Trigonometry', status: 'mastered' }, { id: 'coord', label: 'Coordinate Geometry', status: 'in-progress' }] },
    { level: 2, nodes: [{ id: 'calc', label: 'Calculus', status: 'recommended' }, { id: 'stats', label: 'Statistics', status: 'in-progress' }] },
    { level: 3, nodes: [{ id: 'diffeq', label: 'Differential Equations', status: 'locked' }, { id: 'linalg', label: 'Linear Algebra', status: 'locked' }] },
  ],
  physics: [
    { level: 0, nodes: [{ id: 'kinematics', label: 'Kinematics', status: 'mastered' }, { id: 'newton', label: "Newton's Laws", status: 'mastered' }] },
    { level: 1, nodes: [{ id: 'work', label: 'Work & Energy', status: 'mastered' }, { id: 'rotation', label: 'Rotational Motion', status: 'in-progress' }] },
    { level: 2, nodes: [{ id: 'thermo', label: 'Thermodynamics', status: 'recommended' }, { id: 'waves', label: 'Waves', status: 'locked' }] },
    { level: 3, nodes: [{ id: 'optics', label: 'Optics', status: 'locked' }, { id: 'em', label: 'Electromagnetism', status: 'locked' }] },
  ],
  cs: [
    { level: 0, nodes: [{ id: 'prog', label: 'Programming Basics', status: 'mastered' }, { id: 'data', label: 'Data Types', status: 'mastered' }] },
    { level: 1, nodes: [{ id: 'arrays', label: 'Arrays & Strings', status: 'mastered' }, { id: 'oop', label: 'OOP Concepts', status: 'mastered' }] },
    { level: 2, nodes: [{ id: 'ds', label: 'Data Structures', status: 'in-progress' }, { id: 'algo', label: 'Algorithms', status: 'recommended' }] },
    { level: 3, nodes: [{ id: 'db', label: 'Databases', status: 'locked' }, { id: 'os', label: 'OS Concepts', status: 'locked' }] },
  ],
  chemistry: [
    { level: 0, nodes: [{ id: 'atoms', label: 'Atomic Structure', status: 'mastered' }, { id: 'periodic', label: 'Periodic Table', status: 'mastered' }] },
    { level: 1, nodes: [{ id: 'bonding', label: 'Chemical Bonding', status: 'in-progress' }, { id: 'states', label: 'States of Matter', status: 'mastered' }] },
    { level: 2, nodes: [{ id: 'thermo2', label: 'Thermochemistry', status: 'recommended' }, { id: 'equil', label: 'Equilibrium', status: 'locked' }] },
    { level: 3, nodes: [{ id: 'organic', label: 'Organic Chemistry', status: 'locked' }, { id: 'electro', label: 'Electrochemistry', status: 'locked' }] },
  ],
};
const GPS_DETAILS = {
  arith: { title: 'Arithmetic', desc: 'Foundation of all mathematics.', prereq: 'None', time: 'Completed', tip: 'N/A — already mastered!' },
  calc: { title: 'Calculus', desc: 'Study of rates of change and accumulation. Essential for Physics and Engineering.', prereq: 'Trigonometry + Coordinate Geometry', time: '~3 weeks', tip: 'Start with limits, then differentiation. Use visual tools like Desmos.' },
  thermo: { title: 'Thermodynamics', desc: 'Laws of heat, energy, and entropy. One of your weakest areas — high priority!', prereq: "Newton's Laws + Work & Energy", time: '~2 weeks', tip: 'Focus on the 4 laws. Draw P-V diagrams for every problem.' },
  algo: { title: 'Algorithms', desc: 'Core computer science — sorting, searching, complexity analysis.', prereq: 'Data Structures', time: '~4 weeks', tip: 'Practice on LeetCode (Easy → Medium). Understand Big-O before solving.' },
  thermo2: { title: 'Thermochemistry', desc: 'Energy changes in chemical reactions. Builds on bonding concepts.', prereq: 'Chemical Bonding + States of Matter', time: '~2 weeks', tip: 'Master Hess\'s Law and enthalpy calculations first.' },
};

function renderGPS() {
  const subject = document.getElementById('gps-subject-select').value;
  const data = GPS_DATA[subject] || GPS_DATA.math;
  const map = document.getElementById('gps-map');
  map.innerHTML = data.map(row => `
    <div class="gps-level">
      ${row.nodes.map(n => `
        <div class="gps-node ${n.status}" onclick="showGPSDetail('${n.id}')">
          ${n.status === 'mastered' ? '<span class="gps-node-check">✅</span>' : ''}
          ${n.status === 'recommended' ? '<span class="gps-node-check" style="font-size:14px">⭐</span>' : ''}
          <div class="gps-node-circle">${n.label}</div>
          <div class="gps-node-label">${n.status === 'mastered' ? '✓ Done' : n.status === 'in-progress' ? 'In Progress' : n.status === 'recommended' ? '★ Next' : '🔒 Locked'}</div>
        </div>`).join('')}
    </div>`).join('');
  document.getElementById('gps-detail-panel').innerHTML = `<div class="gps-detail-placeholder"><span style="font-size:2rem">🗺️</span><p>Click any topic node to see details, prerequisites, and study resources</p></div>`;
}

function showGPSDetail(id) {
  const d = GPS_DETAILS[id];
  if (!d) { document.getElementById('gps-detail-panel').innerHTML = `<div style="padding:8px;color:var(--text-secondary)">ℹ️ Keep up the great work on this topic!</div>`; return; }
  document.getElementById('gps-detail-panel').innerHTML = `
    <div class="card-header"><h3>📍 ${d.title}</h3></div>
    <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px">${d.desc}</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="action-item"><div><div class="action-title">🔗 Prerequisites</div><div class="action-desc">${d.prereq}</div></div></div>
      <div class="action-item"><div><div class="action-title">⏱️ Estimated Time</div><div class="action-desc">${d.time}</div></div></div>
      <div class="action-item"><div><div class="action-title">💡 AI Study Tip</div><div class="action-desc">${d.tip}</div></div></div>
    </div>`;
}

// ---- EXAM READINESS ----
const READINESS = {
  score: 78,
  factors: [
    { label: 'Topic Coverage', pct: 85, color: '#6C63FF' },
    { label: 'Practice Tests', pct: 70, color: '#FF6584' },
    { label: 'Consistency', pct: 82, color: '#43D9B6' },
    { label: 'Weak Area Focus', pct: 60, color: '#FFB347' },
    { label: 'Revision Quality', pct: 75, color: '#6C63FF' },
  ],
  subjects: [
    { name: 'Mathematics', icon: '📐', pct: 82, status: 'good' }, { name: 'Physics', icon: '⚛️', pct: 65, status: 'warn' },
    { name: 'CS', icon: '💻', pct: 91, status: 'good' }, { name: 'Chemistry', icon: '🧪', pct: 55, status: 'crit' },
  ],
  actions: [
    { priority: 'high', title: 'Chemistry Weak Area Sprint', desc: 'Spend 90 mins on Thermochemistry — lowest readiness topic' },
    { priority: 'high', title: 'Take a Physics Mock Test', desc: 'Practice test score lags 15% behind your actual mastery' },
    { priority: 'medium', title: 'Revise Calculus Formulas', desc: 'Formula recall drops under exam pressure for this topic' },
    { priority: 'low', title: 'CS Data Structures Review', desc: 'Quick 20-min refresh to maintain your 91% mastery' },
  ],
};

function renderReadiness() {
  drawRing('readiness-ring', READINESS.score, '#6C63FF', 220);
  document.getElementById('readiness-score-label').textContent = READINESS.score;
  const gl = document.getElementById('readiness-grade-label');
  const g = getGrade(READINESS.score);
  gl.textContent = g; gl.style.color = getColor(READINESS.score);
  document.getElementById('readiness-factors').innerHTML = READINESS.factors.map(f => `
    <div class="readiness-factor">
      <span class="factor-label">${f.label}</span>
      <div class="factor-bar">
        <div class="factor-fill" style="width:${f.pct}%;background:${f.color}"></div>
        <div class="bar-text">${f.pct}%</div>
      </div>
    </div>`).join('');
  document.getElementById('subject-readiness-list').innerHTML = READINESS.subjects.map(s => `
    <div class="subject-readiness-item">
      <span class="subject-icon">${s.icon}</span>
      <span class="subject-name">${s.name}</span>
      <div class="srb-wrap">
        <div class="srb-fill" style="width:${s.pct}%;background:${getColor(s.pct)}"></div>
        <div class="bar-text">${s.pct}%</div>
      </div>
      <span class="srb-status ${s.status}">${s.status === 'good' ? 'Ready' : s.status === 'warn' ? 'Review' : 'Critical'}</span>
    </div>`).join('');
  document.getElementById('readiness-action-plan').innerHTML = READINESS.actions.map(a => `
    <div class="action-item">
      <span class="action-priority ${a.priority}">${a.priority.toUpperCase()}</span>
      <div class="action-text"><div class="action-title">${a.title}</div><div class="action-desc">${a.desc}</div></div>
    </div>`).join('');
}

function recalcReadiness() {
  const btn = document.querySelector('[onclick="recalcReadiness()"]');
  btn.textContent = '🔄 Calculating...'; btn.disabled = true;
  setTimeout(() => { btn.textContent = '🔄 Recalculate Score'; btn.disabled = false; renderReadiness(); }, 1500);
}

// ---- DROPOUT RISK ----
const RISK = {
  score: 23, level: 'LOW',
  factorCards: [
    { icon: '📅', name: 'Attendance', value: '92%', status: 'Excellent', color: '#43D9B6' },
    { icon: '📚', name: 'Study Hours', value: '11h/wk', status: 'On Track', color: '#43D9B6' },
    { icon: '📊', name: 'GPA Trend', value: '+0.3↑', status: 'Improving', color: '#6C63FF' },
    { icon: '🎯', name: 'Goal Completion', value: '70%', status: 'Good', color: '#6C63FF' },
    { icon: '💬', name: 'Engagement', value: 'High', status: 'Active', color: '#43D9B6' },
    { icon: '😰', name: 'Stress Level', value: 'Moderate', status: 'Watch', color: '#FFB347' },
  ],
  protective: ['🔥 14-day study streak shows strong commitment',
    '💻 High engagement in CS (your strongest subject)',
    '📈 Consistent improvement in Mathematics this month',
    '🎯 Clear goal-setting behavior detected'],
  interventions: [
    { priority: 'medium', title: 'Chemistry Support Session', desc: 'Your Chemistry score is below threshold — try a 1-on-1 AI review session' },
    { priority: 'low', title: 'Stress Management Check-in', desc: 'Moderate stress flagged. Try the 5-min mindfulness break in the app' },
    { priority: 'low', title: 'Peer Study Group', desc: 'Connecting with 2–3 study partners can boost retention by 28%' },
  ],
};

function renderRisk() {
  drawGauge('risk-gauge-canvas', RISK.score);
  const lvl = document.getElementById('risk-level-text');
  lvl.textContent = `${RISK.level} RISK`;
  lvl.className = 'risk-level-label risk-' + RISK.level.toLowerCase();
  document.getElementById('risk-score-display').textContent = `Score: ${RISK.score} / 100`;
  document.getElementById('risk-factors-grid').innerHTML = RISK.factorCards.map(f => `
    <div class="risk-factor-card">
      <div class="rfc-icon">${f.icon}</div>
      <div class="rfc-name">${f.name}</div>
      <div class="rfc-value" style="color:${f.color}">${f.value}</div>
      <div class="rfc-status" style="color:${f.color}">${f.status}</div>
    </div>`).join('');
  document.getElementById('protective-factors').innerHTML = RISK.protective.map(p => `<div class="trait-item"><span>${p}</span></div>`).join('');
  document.getElementById('intervention-list').innerHTML = RISK.interventions.map(a => `
    <div class="action-item"><span class="action-priority ${a.priority}">${a.priority.toUpperCase()}</span><div class="action-text"><div class="action-title">${a.title}</div><div class="action-desc">${a.desc}</div></div></div>`).join('');
}

function updateRiskAssessment() {
  const btn = document.querySelector('[onclick="updateRiskAssessment()"]');
  btn.textContent = '🔄 Updating...'; btn.disabled = true;
  setTimeout(() => { btn.textContent = '🔄 Update Assessment'; btn.disabled = false; renderRisk(); }, 1500);
}

// ---- ADAPTIVE TEST ----
const QUESTIONS = {
  math: [
    { q: 'If f(x) = x² + 3x - 10, find f(2)', opts: ['0', '5', '8', '12'], ans: 0, exp: 'f(2) = 4 + 6 - 10 = 0' },
    { q: 'The derivative of sin(x) is:', opts: ['cos(x)', '−cos(x)', '−sin(x)', 'tan(x)'], ans: 0, exp: 'd/dx[sin(x)] = cos(x)' },
    { q: 'What is ∫ 2x dx?', opts: ['x²+C', '2x²+C', 'x+C', 'x²'], ans: 0, exp: '∫ 2x dx = x² + C by power rule' },
    { q: 'If log₂(x) = 5, then x =', opts: ['32', '10', '25', '16'], ans: 0, exp: '2⁵ = 32' },
    { q: 'The sum of interior angles of a pentagon:', opts: ['540°', '360°', '720°', '480°'], ans: 0, exp: '(5-2)×180 = 540°' },
    { q: 'Solve: 3x + 7 = 22', opts: ['5', '7', '3', '4'], ans: 0, exp: '3x = 15, x = 5' },
    { q: 'What is sin(90°)?', opts: ['1', '0', '-1', '0.5'], ans: 0, exp: 'sin(90°) = 1' },
    { q: 'The LCM of 12 and 18 is:', opts: ['36', '24', '48', '72'], ans: 0, exp: 'LCM(12,18) = 36' },
    { q: '√144 = ?', opts: ['12', '11', '13', '14'], ans: 0, exp: '12² = 144' },
    { q: 'What is 15% of 200?', opts: ['30', '25', '35', '20'], ans: 0, exp: '200 × 0.15 = 30' },
  ],
  physics: [
    { q: "Newton's 2nd Law states F = ?", opts: ['ma', 'mv', 'm/a', 'm+a'], ans: 0, exp: 'Force = mass × acceleration' },
    { q: 'Unit of electric current:', opts: ['Ampere', 'Volt', 'Ohm', 'Watt'], ans: 0, exp: 'SI unit of current is Ampere' },
    { q: 'Speed of light (approx) in m/s:', opts: ['3×10⁸', '3×10⁶', '3×10¹⁰', '3×10⁴'], ans: 0, exp: 'c ≈ 3×10⁸ m/s' },
    { q: 'Work done = ?', opts: ['F × d', 'F / d', 'F + d', 'F - d'], ans: 0, exp: 'Work = Force × displacement' },
    { q: 'The SI unit of pressure:', opts: ['Pascal', 'Newton', 'Joule', 'Watt'], ans: 0, exp: 'Pressure is measured in Pascals (Pa)' },
  ],
  cs: [
    { q: 'Time complexity of Binary Search:', opts: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'], ans: 0, exp: 'Binary search halves the search space each step' },
    { q: 'Which data structure uses FIFO?', opts: ['Queue', 'Stack', 'Tree', 'Graph'], ans: 0, exp: 'Queue follows First-In First-Out' },
    { q: 'What does OOP stand for?', opts: ['Object Oriented Programming', 'Open Oriented Programming', 'Object Operational Processing', 'None'], ans: 0, exp: 'OOP = Object Oriented Programming' },
    { q: 'A linked list node contains:', opts: ['Data + Pointer', 'Only Data', 'Only Pointer', 'Index + Data'], ans: 0, exp: 'Each node stores data and pointer to next' },
    { q: 'Which sorting is O(n log n) average?', opts: ['Merge Sort', 'Bubble Sort', 'Selection Sort', 'Insertion Sort'], ans: 0, exp: 'Merge Sort is O(n log n) average' },
  ],
  chemistry: [
    { q: 'Atomic number of Carbon:', opts: ['6', '8', '12', '14'], ans: 0, exp: 'Carbon has 6 protons, so atomic number = 6' },
    { q: 'Water chemical formula:', opts: ['H₂O', 'HO₂', 'H₂O₂', 'HO'], ans: 0, exp: 'Water = H₂O (2 hydrogen, 1 oxygen)' },
    { q: 'Which is a noble gas?', opts: ['Argon', 'Sodium', 'Chlorine', 'Oxygen'], ans: 0, exp: 'Argon (Ar) is a noble gas in Group 18' },
    { q: 'pH of pure water at 25°C:', opts: ['7', '6', '8', '4'], ans: 0, exp: 'Pure water is neutral with pH = 7' },
    { q: 'Unit of atomic mass:', opts: ['amu', 'g', 'kg', 'mol'], ans: 0, exp: 'Atomic mass is measured in atomic mass units (amu)' },
  ],
};

let testState = { active: false, questions: [], current: 0, answers: [], score: 0, timer: null, elapsed: 0, selected: null, answered: false };

function renderTestSetup() {
  document.getElementById('test-history-list').innerHTML = AppState.testHistory.map(h => `
    <div class="history-item">
      <div><div style="font-weight:600">${h.subject}</div><div style="font-size:11px;color:var(--text-muted)">${h.date} • ${h.questions}Q</div></div>
      <div class="history-score" style="color:${getColor(h.score)}">${h.score}%</div>
    </div>`).join('');
  document.querySelectorAll('.diff-btn').forEach(b => b.addEventListener('click', function () { document.querySelectorAll('.diff-btn').forEach(x => x.classList.remove('active')); this.classList.add('active'); }));
}

function startTest() {
  const subj = document.getElementById('test-subject').value;
  const count = parseInt(document.getElementById('q-count').value);
  const pool = QUESTIONS[subj] || QUESTIONS.math;

  // Filter out used questions
  let available = pool.filter((_, i) => !AppState.usedQuestions[subj]?.includes(i));

  // If pool exhausted for this subject, reset
  if (available.length < count) {
    AppState.usedQuestions[subj] = [];
    available = pool;
  }

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const selectedBatch = shuffled.slice(0, Math.min(count, shuffled.length));

  // Track indices being used in this session to mark as used later
  const usedIndices = selectedBatch.map(q => pool.indexOf(q));

  testState = {
    active: true,
    subject: subj,
    poolIndices: usedIndices,
    questions: selectedBatch,
    current: 0,
    answers: [],
    score: 0,
    elapsed: 0,
    selected: null,
    answered: false
  };
  document.getElementById('test-setup-panel').classList.add('hidden');
  document.getElementById('test-results-panel').classList.add('hidden');
  document.getElementById('test-active-panel').classList.remove('hidden');
  clearInterval(testState.timer);
  testState.timer = setInterval(() => { testState.elapsed++; const m = String(Math.floor(testState.elapsed / 60)).padStart(2, '0'); const s = String(testState.elapsed % 60).padStart(2, '0'); document.getElementById('test-timer').textContent = `⏱️ ${m}:${s}`; }, 1000);
  renderQuestion();
}

function renderQuestion() {
  const q = testState.questions[testState.current];
  const tot = testState.questions.length;
  const pct = ((testState.current) / tot) * 100;
  document.getElementById('test-q-counter').textContent = `Question ${testState.current + 1} of ${tot}`;
  document.getElementById('test-progress-fill').style.width = pct + '%';
  document.getElementById('q-meta').innerHTML = `<span>Q${testState.current + 1}</span><span>Adaptive Mode</span>`;
  document.getElementById('question-text').textContent = q.q;
  document.getElementById('question-options').innerHTML = q.opts.map((o, i) => `<button class="option-btn" id="opt-${i}" onclick="selectOption(${i})"><span class="option-letter">${'ABCD'[i]}</span>${o}</button>`).join('');
  document.getElementById('question-feedback').className = 'question-feedback hidden';
  document.getElementById('submit-answer-btn').disabled = true;
  testState.selected = null; testState.answered = false;
}

function selectOption(i) {
  if (testState.answered) return;
  testState.selected = i;
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('opt-' + i).classList.add('selected');
  document.getElementById('submit-answer-btn').disabled = false;
}

function submitAnswer() {
  if (testState.answered || testState.selected === null) return;
  testState.answered = true;
  const q = testState.questions[testState.current];
  const correct = testState.selected === q.ans;
  if (correct) testState.score++;
  document.querySelectorAll('.option-btn').forEach((b, i) => { if (i === q.ans) b.classList.add('correct'); else if (i === testState.selected && !correct) b.classList.add('wrong'); });
  const fb = document.getElementById('question-feedback');
  fb.className = 'question-feedback ' + (correct ? 'correct' : 'wrong');
  fb.textContent = (correct ? '✅ Correct! ' : '❌ Incorrect. ') + q.exp;
  document.getElementById('submit-answer-btn').textContent = 'Next Question →';
  document.getElementById('submit-answer-btn').onclick = nextQuestion;
}

function nextQuestion() {
  testState.current++;
  document.getElementById('submit-answer-btn').textContent = 'Submit Answer';
  document.getElementById('submit-answer-btn').onclick = submitAnswer;
  if (testState.current >= testState.questions.length) { showResults(); return; }
  renderQuestion();
}

function skipQuestion() {
  testState.answers.push(null); testState.current++;
  if (testState.current >= testState.questions.length) { showResults(); return; }
  renderQuestion();
}

function showResults() {
  clearInterval(testState.timer);
  document.getElementById('test-active-panel').classList.add('hidden');
  document.getElementById('test-results-panel').classList.remove('hidden');
  const pct = Math.round((testState.score / testState.questions.length) * 100);
  drawRing('results-ring', pct, getColor(pct), 180);
  document.getElementById('results-score-pct').textContent = pct + '%';
  document.getElementById('results-score-pct').style.color = getColor(pct);
  document.getElementById('results-grade').textContent = getGrade(pct);
  document.getElementById('results-title').textContent = pct >= 75 ? 'Great Work! 🎉' : pct >= 55 ? 'Good Effort 💪' : 'Keep Practicing 📚';
  document.getElementById('results-stats-row').innerHTML = `
    <div class="result-stat"><div class="result-stat-val" style="color:#43D9B6">${testState.score}</div><div class="result-stat-label">Correct</div></div>
    <div class="result-stat"><div class="result-stat-val" style="color:#FF6584">${testState.questions.length - testState.score}</div><div class="result-stat-label">Wrong</div></div>
    <div class="result-stat"><div class="result-stat-val" style="color:#FFB347">${Math.floor(testState.elapsed / 60)}m ${testState.elapsed % 60}s</div><div class="result-stat-label">Time</div></div>`;
  document.getElementById('results-insight').textContent = pct >= 75 ? '🎯 Excellent! Your understanding of this topic is solid.' : pct >= 55 ? '📈 Good progress! Focus on the wrong answers below to boost your score.' : '💡 Needs more practice. Review the explanations carefully and try again.';
  document.getElementById('answers-review-list').innerHTML = testState.questions.map((q, i) => {
    const ua = testState.answers[i]; const correct = ua === q.ans;
    return `<div class="answer-review-item ${correct ? 'correct' : 'wrong'}"><div class="answer-qtext">${i + 1}. ${q.q}</div><div class="answer-meta">${correct ? '✅ Correct' : '❌ Wrong'} — Correct: ${q.opts[q.ans]}</div><div class="answer-exp">${q.exp}</div></div>`;
  }).join('');

  // Save to history
  const historyItem = {
    subject: testState.subject,
    score: pct,
    total: testState.questions.length,
    date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  API.saveTestResult(historyItem).then(saved => {
    AppState.testHistory.unshift(saved);

    // Mark questions as used
    if (!AppState.usedQuestions[testState.subject]) AppState.usedQuestions[testState.subject] = [];
    testState.poolIndices.forEach(idx => {
      if (!AppState.usedQuestions[testState.subject].includes(idx)) {
        AppState.usedQuestions[testState.subject].push(idx);
      }
    });

    // Sync with backend
    API.updateUser({ usedQuestions: AppState.usedQuestions });
  });
}

function reviewAnswers() { document.getElementById('results-review-panel').scrollIntoView({ behavior: 'smooth' }); }
function resetTest() { document.getElementById('test-results-panel').classList.add('hidden'); document.getElementById('test-setup-panel').classList.remove('hidden'); renderTestSetup(); }

// ---- PLANNER ----
const subColors = { 'Mathematics': '#6C63FF', 'Physics': '#FF6584', 'CS': '#43D9B6', 'Chemistry': '#FFB347' };
const customColors = ['#9b59b6', '#e67e22', '#1abc9c', '#e74c3c', '#34495e', '#f1c40f', '#00bcd4', '#e91e63'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);

function renderPlanner() {
  document.getElementById('planner-week').innerHTML = days.map(d => `
    <div class="planner-day ${d === today ? 'today' : ''}">
      <div class="planner-day-header">${d}${d === today ? ' ★' : ''}</div>
      <div class="planner-sessions" id="sessions-${d}">
        ${(AppState.plannerSessions[d] || []).map((s, idx) => `
          <div class="planner-session" style="background:${s.c}22;color:${s.c};border:1px solid ${s.c}44;position:relative;padding-right:24px;">
            ${s.s}
            <span class="material-symbols-outlined session-remove" style="position:absolute;top:50%;right:4px;transform:translateY(-50%);font-size:14px;cursor:pointer;opacity:0.6;transition:opacity 0.2s" onclick="removeSession('${d}', ${idx})" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6" title="Remove Session">close</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

async function removeSession(day, index) {
  if (AppState.plannerSessions[day]) {
    await API.deletePlannerSession(day, index);
    AppState.plannerSessions[day].splice(index, 1);
    renderPlanner();
  }
}


async function addSession() {
  const s = document.getElementById('add-subject').value.trim() || 'Study Session';
  const d = document.getElementById('add-day').value.slice(0, 3);
  const dur = document.getElementById('add-duration').value;

  const color = customColors[Math.floor(Math.random() * customColors.length)];

  const updatedPlanner = await API.addPlannerSession(d, { s: `${s} (${dur}m)`, c: color });
  AppState.plannerSessions[d] = updatedPlanner.sessions;

  renderPlanner();
  document.getElementById('add-subject').value = '';
}


function regeneratePlan() {
  const btn = document.querySelector('[onclick="regeneratePlan()"]');
  btn.textContent = '🤖 Generating...'; btn.disabled = true;
  setTimeout(() => { btn.textContent = '🤖 Regenerate Plan'; btn.disabled = false; }, 1200);
}

// ---- ANALYTICS ----
function renderAnalytics() {
  drawBarChart(); drawMasteryChart(); renderSubjectsDeep(); drawHeatmap();
}

function drawBarChart() {
  const c = document.getElementById('study-hours-chart'); if (!c) return;
  const ctx = c.getContext('2d');
  c.height = 200;
  const data = [2.5, 3, 1.5, 4, 2, 5, 3.5];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const W = c.width, H = c.height, pad = 40, bw = 30;
  ctx.clearRect(0, 0, W, H);
  const max = Math.max(...data);
  const barsTotal = data.length;
  const gap = (W - pad * 2 - bw * barsTotal) / (barsTotal - 1);
  data.forEach((v, i) => {
    const x = pad + i * (bw + gap), barH = (v / max) * (H - 60), y = H - 30 - barH;
    const g = ctx.createLinearGradient(0, y, 0, H - 30); g.addColorStop(0, '#6C63FF'); g.addColorStop(1, '#FF6584');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, bw, barH, 4); ctx.fill();
    ctx.fillStyle = 'rgba(240,242,255,0.7)'; ctx.font = '11px Inter'; ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + bw / 2, H - 10); ctx.fillText(v + 'h', x + bw / 2, y - 6);
  });
}

function drawMasteryChart() {
  const c = document.getElementById('mastery-chart'); if (!c) return;
  const ctx = c.getContext('2d'); c.height = 200;
  const weeks = ['W1', 'W2', 'W3', 'W4'];
  const lines = [
    { data: [65, 70, 76, 82], color: '#6C63FF', label: 'Math' },
    { data: [58, 60, 63, 65], color: '#FF6584', label: 'Physics' },
    { data: [80, 85, 89, 91], color: '#43D9B6', label: 'CS' },
    { data: [45, 48, 52, 55], color: '#FFB347', label: 'Chem' },
  ];
  const W = c.width, H = c.height, pad = 40;
  ctx.clearRect(0, 0, W, H);
  const xStep = (W - pad * 2) / (weeks.length - 1);
  lines.forEach(line => {
    ctx.beginPath();
    line.data.forEach((v, i) => { const x = pad + i * xStep, y = H - pad - (v / 100) * (H - pad * 2); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.strokeStyle = line.color; ctx.lineWidth = 2.5; ctx.stroke();
    line.data.forEach((v, i) => { const x = pad + i * xStep, y = H - pad - (v / 100) * (H - pad * 2); ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = line.color; ctx.fill(); });
  });
  weeks.forEach((w, i) => { ctx.fillStyle = 'rgba(240,242,255,0.5)'; ctx.font = '11px Inter'; ctx.textAlign = 'center'; ctx.fillText(w, pad + i * xStep, H - 10); });
}

function renderSubjectsDeep() {
  document.getElementById('analytics-subjects').innerHTML = AppState.subjects.map(s => `
    <div class="analytics-subject-row">
      <div class="asub-name">${s.icon} ${s.name}</div>
      <div class="asub-bars">
        <div class="asub-bar-row"><span class="asub-label">Mastery</span><div class="asub-bar"><div class="asub-fill" style="width:${s.mastery}%;background:${s.color}"></div></div><span style="font-size:12px;font-weight:700;color:${s.color}">${s.mastery}%</span></div>
        <div class="asub-bar-row"><span class="asub-label">Hours</span><div class="asub-bar"><div class="asub-fill" style="width:${s.hours / 15 * 100}%;background:${s.color}88"></div></div><span style="font-size:12px;color:var(--text-muted)">${s.hours}h</span></div>
      </div>
    </div>`).join('');
}

function drawHeatmap() {
  const c = document.getElementById('heatmap-canvas'); if (!c) return;
  const ctx = c.getContext('2d');
  const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const data = [
    [1, 2, 0, 1, 0, 0, 4, 5, 3], [0, 1, 0, 2, 1, 0, 3, 5, 4],
    [2, 0, 1, 0, 2, 1, 5, 4, 2], [1, 1, 0, 1, 0, 0, 3, 5, 3],
    [0, 2, 1, 0, 1, 0, 4, 5, 2], [3, 2, 1, 2, 3, 4, 5, 4, 3], [2, 1, 0, 1, 2, 3, 4, 3, 1],
  ];
  const cw = Math.floor((c.width - 60) / (hours.length)), ch = 18;
  ctx.clearRect(0, 0, c.width, c.height);
  data.forEach((row, di) => {
    ctx.fillStyle = 'rgba(240,242,255,0.5)'; ctx.font = '11px Inter'; ctx.textAlign = 'right';
    ctx.fillText(dayNames[di], 28, di * ch + ch / 2 + 4 + 10);
    row.forEach((v, hi) => {
      const x = 40 + hi * cw, y = di * ch + 8;
      const alpha = v / 5;
      ctx.fillStyle = `rgba(108,99,255,${alpha})`;
      ctx.beginPath(); ctx.roundRect(x, y, cw - 3, ch - 3, 3); ctx.fill();
    });
  });
  hours.forEach((h, i) => { ctx.fillStyle = 'rgba(240,242,255,0.4)'; ctx.font = '10px Inter'; ctx.textAlign = 'center'; ctx.fillText(h, 40 + i * cw + cw / 2, c.height - 2); });
}

// ---- AI CHAT (PROFESSIONAL) ----

function renderMD(text) {
  return text
    .replace(/^## (.+)$/gm, '<div class="md-h2">$1</div>')
    .replace(/^### (.+)$/gm, '<div class="md-h3">$1</div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>')
    .replace(/^[•\-] (.+)$/gm, '<div class="md-bullet"><span class="md-dot"></span><span>$1</span></div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div class="md-numbered"><span class="md-num">$1</span><span>$2</span></div>')
    .replace(/\n{2,}/g, '<div class="md-spacer"></div>')
    .replace(/\n/g, '<br>');
}

function renderMDInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');
}

function getTimestamp() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const CHAT_KB = [
  {
    tags: ['newton', 'law', 'motion', 'physics', 'force', 'acceleration', 'thermo', 'thermodynamics'],
    followups: ["Newton's 1st Law", "Newton's 3rd Law", "Practice Physics problems"],
    r: "### Newton's Second Law of Motion 🍎\n\nNewton's Second Law is a fundamental principle in mechanics. It states that the **acceleration** of an object is directly proportional to the **net force** acting on it and inversely proportional to its **mass**.\n\n**The Formula:**\n`F = m × a`  (Force = Mass × Acceleration)\n\n**Professional Breakdown:**\n1.  **Force (F):** Measured in Newtons (N). It's the 'push' or 'pull'.\n2.  **Mass (m):** Measured in Kilograms (kg). It's the object's resistance to change in motion.\n3.  **Acceleration (a):** Measured in m/s². It's how fast the velocity is changing.\n\n**Example:** If you push a 10kg cart with a force of 50N, its acceleration will be `50 / 10 = 5 m/s²`.\n\n*Would you like a more complex problem to solve together?*"
  },
  {
    tags: ['dna', 'genetics', 'biology', 'structure', 'nucleotide'],
    followups: ["How does DNA replication work?", "What are base pairs?", "Tell me about RNA"],
    r: "### DNA: The Blueprint of Life 🧬\n\nDeoxyribonucleic acid (DNA) is the molecule that carries genetic instructions for the development and functioning of all known living organisms.\n\n**Structure:**\n• **Double Helix:** Two strands winding around each other like a twisted ladder.\n• **Nucleotides:** The building blocks, consisting of a sugar, a phosphate group, and a nitrogenous base.\n• **Base Pairs:** Adenine (A) pairs with Thymine (T), and Cytosine (C) pairs with Guanine (G).\n\n**Key Insight:** The specific sequence of these bases is what forms the genetic code — similar to how 0s and 1s form binary code in computers.\n\n*I can explain the replication process if you're interested!*"
  },
  {
    tags: ['algebra', 'equation', 'math', 'linear', 'solve'],
    followups: ["Quadratic equations?", "How to factorize?", "Practice Algebra"],
    r: "### Solving Linear Equations 📐\n\nLinear equations are the foundation of Algebra. The goal is always to **isolate the variable** (usually `x`).\n\n**Standard Form:** `ax + b = c`\n\n**Step-by-Step Methodology:**\n1.  **Simplify:** Combine like terms on both sides.\n2.  **Inverse Operations:** Move constants to one side by adding or subtracting.\n3.  **Isolate:** Divide or multiply to solve for `x`.\n\n**Example:**\n`2x + 10 = 20`\n`2x = 10` (Subtract 10)\n`x = 5` (Divide by 2)\n\n*Check your work by plugging 5 back into the original equation! Shall we try a harder one?*"
  },
  {
    tags: ['chemistry', 'organic', 'reaction', 'bond', 'atom', 'ph', 'acid', 'base', 'periodic', 'element', 'mole'],
    followups: ['Chemical bonding types?', 'Laws of thermochemistry?', 'How to remember the periodic table?'],
    r: "## Chemistry — Academic Overview 🧪\n\nChemistry bridges the gap between physics and biology. With a current mastery of **55%**, we have a great opportunity for growth here.\n\n**The 'Big Ideas':**\n• **Atomic Theory:** Protons, Neutrons, & Electron Orbitals (s, p, d, f).\n• **The Mole Concept:** Stoichiometry is the 'accounting' of chemistry.\n• **Chemical Bonding:** Ionic, Covalent, and Metallic — understanding electron sharing is key to predicting reactions.\n\n⚠️ **Mentor Priority:** I recommend we start with **Chemical Bonding**. Once you master electron behavior, Organic Chemistry becomes a series of logical puzzles rather than things to memorize."
  },
  {
    tags: ['study', 'focus', 'pomodoro', 'technique', 'memory', 'learn faster'],
    followups: ['How does spaced repetition work?', 'What is the Feynman technique?', 'How to take better notes?'],
    r: "## Academic Mastery Techniques 🧠\n\nSpecifically for a **Visual-Kinesthetic** learner like you, linear re-reading is the least effective method. Instead, try:\n\n1.  **Active Recall:** Close the book. Write or sketch everything you remember. This forces 'neural consolidation'.\n2.  **Spaced Repetition:** Review at 1, 3, 7, and 14 days to beat the forgetting curve.\n3.  **The Feynman Technique:** Try explaining the concept to me as if I'm a beginner. If you struggle to simplify it, you haven't fully mastered the logic yet.\n\n*Would you like me to quiz you on a specific topic?*"
  },
  {
    tags: ['calculus', 'derivative', 'integral', 'differentiation', 'integration', 'limit', 'chain rule'],
    followups: ['Explain the chain rule', 'Integration by parts', 'How do limits work?'],
    r: "## Calculus — Core Concepts\n\n**Differentiation** finds the rate of change:\n`d/dx[xⁿ] = n·xⁿ⁻¹`\n\n**Integration** finds the area under a curve:\n`∫xⁿ dx = xⁿ⁺¹/(n+1) + C`\n\n**Key Rules:**\n• Power Rule: d/dx[xⁿ] = nxⁿ⁻¹\n• Chain Rule: d/dx[f(g(x))] = f'(g(x)) · g'(x)\n• Product Rule: d/dx[u·v] = u'v + uv'\n• Quotient Rule: d/dx[u/v] = (u'v − uv')/v²\n\n💡 Your Study DNA says you learn best visually — try graphing f(x) and f'(x) together on Desmos so you can see derivatives as slopes in real time!"
  }
];

const FALLBACK = [
  "That's an insightful point! From an academic perspective, it's often helpful to look at the underlying principles first. Could you clarify which specific part of this topic you'd like me to dive into?",
  "Certainly! As your academic companion, I'm happy to help. Let's start by identifying the core concept here. Are you looking for a theoretical explanation or a practical application?"
];

let chatInit = false;
let fallbackIdx = 0;

function renderChat() {
  if (!chatInit) {
    AppState.chatMessages = [];
    const hour = new Date().getHours();
    const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    AppState.chatMessages.push({
      role: 'bot',
      text: `## ${g}, ${AppState.student.name.split(' ')[0]}! 👋\n\nI'm **PathWise AI** — your personal academic mentor, available 24/7.\n\n**Your Profile at a Glance:**\n• 🧬 Study DNA: Visual-Kinesthetic Learner\n• 📊 Exam Readiness: 78% (Good) — let's push it higher\n• ⚠️ Focus Areas: Chemistry (55%), Physics (65%)\n• 🔥 Study Streak: ${AppState.streak} days — incredible consistency!\n\n**I can help you with:**\n• Concept explanations across Math, Physics, CS, Chemistry\n• Study strategies personalized to your DNA\n• Exam prep plans tailored to your weak areas\n• Career guidance aligned with your strengths\n\n**What would you like to work on today?**`,
      ts: getTimestamp(),
      followups: ["Explain Thermodynamics", "My exam prep plan", "I need motivation 💙", "Career guidance for me"],
    });
    chatInit = true;
  }
  renderMessages();
  renderSuggestionBar();
}

function renderSuggestionBar() {
  const chips = ["Newton's Laws of Motion", "Study plan for Chemistry", "I feel overwhelmed 😔", "Explain Data Structures", "Best study techniques", "Career guidance", "Exam strategy"];
  document.getElementById('chat-suggestions').innerHTML = chips.map(s =>
    `<button class="suggestion-chip" onclick="sendSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`
  ).join('');
}

function renderMessages() {
  const el = document.getElementById('chat-messages');
  el.innerHTML = AppState.chatMessages.map(m => {
    const isBot = m.role === 'bot';
    const content = isBot ? renderMD(m.text) : m.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const followupHtml = (isBot && m.followups && m.followups.length)
      ? `<div class="chat-followups">${m.followups.map(f => `<button class="followup-chip" onclick="sendSuggestion('${f.replace(/'/g, "\\'")}')">&crarr; ${f}</button>`).join('')}</div>`
      : '';
    return `<div class="chat-msg ${m.role}">
      <div class="chat-avatar">${isBot ? '🤖' : AppState.student.initials}</div>
      <div class="chat-msg-body">
        <div class="chat-bubble">${content}</div>
        ${followupHtml}
        <div class="chat-ts">${m.ts || ''}</div>
      </div>
    </div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

function showTyping() {
  const el = document.getElementById('chat-messages');
  const id = 'typing-' + Date.now();
  el.insertAdjacentHTML('beforeend',
    `<div class="chat-msg bot" id="${id}">
      <div class="chat-avatar">🤖</div>
      <div class="chat-msg-body">
        <div class="chat-bubble typing-bubble">
          <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
        </div>
      </div>
    </div>`);
  el.scrollTop = el.scrollHeight;
  return id;
}

function sendSuggestion(s) { document.getElementById('chat-input').value = s; processMessage(); }

async function processMessage() {
  const input = document.getElementById('chat-input');
  const txt = input.value.trim();
  if (!txt) return;

  const userMsg = { role: 'user', text: txt, ts: getTimestamp() };
  await API.saveChatMessage(userMsg);
  AppState.chatMessages.push(userMsg);
  input.value = '';
  renderMessages();
  input.disabled = true;
  const sendBtn = document.querySelector('.chat-send-btn');
  if (sendBtn) sendBtn.disabled = true;

  const typId = showTyping();
  const lower = txt.toLowerCase();

  // Professional Delay (Simulating Reasoning)
  setTimeout(async () => {
    document.getElementById(typId)?.remove();

    let resp = '';
    let followups = [];

    // 1. Syllabus Context Logic
    if (lower.includes('syllabus') || lower.includes('learned') || lower.includes('topics')) {
      if (extractedSyllabus && extractedSyllabus.length > 0) {
        const topicNames = extractedSyllabus.map(t => t.name).join(', ');
        resp = `### Your Professional Syllabus Roadmap 🗺️\n\nI've analyzed your curriculum. Based on our extraction, your core focus areas are: **${topicNames}**.\n\n**Strategy Recommendation:** \nAs a Visual-Kinesthetic learner, I suggest we dive into **${extractedSyllabus[0].name}** using diagrams or practice simulations. \n\n*Would you like me to create a 7-day mastery plan for this syllabus?*`;
        followups = ["Create study plan", `Explain ${extractedSyllabus[0].name}`, "Quiz me on this"];
      } else {
        resp = "I don't see an active syllabus in our workspace yet. If you paste your syllabus text in the **Syllabus AI** section, I can provide specific guidance, roadmaps, and resources tailored to your curriculum! shall we go there?";
        followups = ["Take me to Syllabus AI", "How does it work?"];
      }
    }
    // 2. Academic KB Search (Better Matching)
    else {
      const match = CHAT_KB.find(r => r.tags.some(k => lower.includes(k)));
      if (match) {
        const botMsg = { role: 'bot', text: match.r, ts: getTimestamp(), followups: match.followups };
        await API.saveChatMessage(botMsg);
        AppState.chatMessages.push(botMsg);
        finishChat();
      } else {
        // 3. Dynamic Knowledge Fetch (Wikipedia API)
        fetchDynamicAnswer(txt).then(async dynamicText => {
          const botMsg = {
            role: 'bot',
            text: dynamicText,
            ts: getTimestamp(),
            followups: [`More about that`, "Related Topics", "Quiz me on this"]
          };
          await API.saveChatMessage(botMsg);
          AppState.chatMessages.push(botMsg);
          finishChat();
        }).catch(async () => {
          // Fallback if API fails
          let resp = FALLBACK[fallbackIdx++ % FALLBACK.length];
          let followups = ['Explain Newton\'s Laws', 'Study DNA advice', 'Help me with Math'];
          const botMsg = { role: 'bot', text: resp, ts: getTimestamp(), followups };
          await API.saveChatMessage(botMsg);
          AppState.chatMessages.push(botMsg);
          finishChat();
        });
        return; // Prevent synchronous finishChat
      }
    }
  }, 1000);

  function finishChat() {
    renderMessages();
    input.disabled = false;
    const sendBtn = document.querySelector('.chat-send-btn');
    if (sendBtn) sendBtn.disabled = false;
    input.focus();
  }
}

async function fetchDynamicAnswer(query) {
  try {
    // Extract key terms (basic NLP simulation)
    const searchTerms = query.replace(/what is|explain|tell me about|how to/gi, '').trim();
    if (!searchTerms) throw new Error("Empty Query");

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerms)}&utf8=&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.query && searchData.query.search.length > 0) {
      const topResult = searchData.query.search[0];
      const pageId = topResult.pageid;
      const title = topResult.title;

      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${pageId}&format=json&origin=*`;
      const extractRes = await fetch(extractUrl);
      const extractData = await extractRes.json();

      const extract = extractData.query.pages[pageId].extract;

      // Extract just the first two sentences for a concise overview
      const overview = `${extract.split('.')[0] + '.'} ${extract.split('.')[1] ? extract.split('.')[1] + '.' : ''}`;
      return `### ${title} 📚\n\n${overview}\n\n*Source: Wikipedia*`;
    } else {
      throw new Error("No results");
    }
  } catch (e) {
    console.error("Dynamic fetch failed:", e);
    return "I couldn't find a highly accurate academic source for that specific query right now. Could you try rephrasing it, or perhaps start with a broader topic like **Physics** or **Computer Science**?";
  }
}


async function clearChat() {
  await API.clearChat();
  chatInit = false;
  AppState.chatMessages = [];
  renderChat();
}

// ---- SYLLABUS AI ----
let extractedSyllabus = [];

// Curated high-quality engineering video map
// Each key is a keyword match; each value is list of { title, id, channel } objects
const ENGINEERING_VIDEOS = {
  // Mathematics
  calculus: [{ title: 'Calculus – Essence of Calculus', id: 'WUvTyaaNkzM', ch: '3Blue1Brown' }, { title: 'Calculus Full Course', id: 'HfACrKJ_Y2w', ch: 'freeCodeCamp' }],
  integration: [{ title: 'Calculus – Essence of Calculus', id: 'WUvTyaaNkzM', ch: '3Blue1Brown' }, { title: 'Calculus Full Course', id: 'HfACrKJ_Y2w', ch: 'freeCodeCamp' }],
  parts: [{ title: 'Calculus – Essence of Calculus', id: 'WUvTyaaNkzM', ch: '3Blue1Brown' }, { title: 'Calculus Full Course', id: 'HfACrKJ_Y2w', ch: 'freeCodeCamp' }],
  algebra: [{ title: 'Algebra Basics Full Course', id: 'grnP3mduZkM', ch: 'Khan Academy' }, { title: 'Linear Algebra Visualized', id: 'fNk_zzaMoSs', ch: '3Blue1Brown' }],
  trigonometry: [{ title: 'Trigonometry – Full Course', id: 'g8VCsFNEhXU', ch: 'freeCodeCamp' }, { title: 'Unit Circle Explained', id: 'ZffZvSH285c', ch: 'Khan Academy' }],
  statistics: [{ title: 'Statistics Full Course', id: 'xxpc-HPKN28', ch: 'freeCodeCamp' }, { title: 'Probability Explained', id: 'uzkc-qNVoOk', ch: '3Blue1Brown' }],
  differential: [{ title: 'Differential Equations Overview', id: 'p_di4Zn4wz4', ch: 'Khan Academy' }, { title: 'Solving ODEs', id: '6o7b9yyhH7c', ch: 'MIT OpenCourseWare' }],
  // Physics
  kinematics: [{ title: 'Kinematics in 1D Explained', id: 'MAS6mBRZZXA', ch: 'The Organic Chemistry Tutor' }, { title: 'Projectile Motion', id: 'aY8z2qO44WA', ch: 'Khan Academy' }],
  newton: [{ title: "Newton's Laws Explained", id: 'kKKM8Y-u7ds', ch: 'CrashCourse' }, { title: 'Forces & Newton', id: 'NYq2078_xqc', ch: 'Khan Academy' }],
  thermodynamics: [{ title: 'Thermodynamics Full Lecture', id: 'lt6KkG2NNJQ', ch: 'Khan Academy' }, { title: 'Laws of Thermodynamics', id: 'n0CjPv5ULXs', ch: 'CrashCourse' }],
  laws: [{ title: 'Thermodynamics Full Lecture', id: 'lt6KkG2NNJQ', ch: 'Khan Academy' }, { title: 'Laws of Thermodynamics', id: 'n0CjPv5ULXs', ch: 'CrashCourse' }],
  electromagnetism: [{ title: 'Electromagnetism Overview', id: 'MC0DO7f9pDg', ch: 'MIT OpenCourseWare' }, { title: 'Electric Fields Explained', id: 'mdulzEfD3vw', ch: 'Khan Academy' }],
  optics: [{ title: 'Optics – Light & Lenses', id: 'oh4fYzoC-zs', ch: 'Khan Academy' }, { title: 'Wave Optics', id: '7U5d7KrZH5A', ch: 'CrashCourse' }],
  waves: [{ title: 'Wave Motion Explained', id: 'Rbuhdo0AZDU', ch: 'Khan Academy' }, { title: 'Standing Waves', id: 'no7ZPPqtZEg', ch: 'MIT OpenCourseWare' }],
  quantum: [{ title: 'Quantum Mechanics Intro', id: 'p7bzE1E5PMY', ch: 'PBS Space Time' }, { title: 'Wave-Particle Duality', id: 'J1yIApZtLos', ch: 'CrashCourse' }],
  // Computer Science
  programming: [{ title: 'Programming Basics for Beginners', id: 'zOjov-2OZ0E', ch: 'freeCodeCamp' }, { title: 'CS50 – Intro to CS', id: 'YoXxevp1WRQ', ch: 'Harvard CS50' }],
  data: [{ title: 'Data Structures Full Course', id: 'RBSGKlAvoiM', ch: 'freeCodeCamp' }, { title: 'Big-O Notation', id: 'Mo4vesaut8g', ch: 'CS Dojo' }],
  algorithm: [{ title: 'Algorithms & Data Structures', id: 'BBpAmxU_NQo', ch: 'freeCodeCamp' }, { title: 'Sorting Algorithms Visualized', id: 'kPRA0W1kECg', ch: 'MIT OpenCourseWare' }],
  oop: [{ title: 'OOP Concepts Explained', id: 'pTB0EiLXUC8', ch: 'Programming with Mosh' }, { title: 'Object-Oriented Design', id: '1ONhXmQuWFQ', ch: 'freeCodeCamp' }],
  database: [{ title: 'SQL & Databases Full Course', id: 'HXV3zeQKqGY', ch: 'freeCodeCamp' }, { title: 'Database Design', id: 'ztHopE5Wnpc', ch: 'Lucidchart' }],
  network: [{ title: 'Computer Networking Full Course', id: 'qiQR5rTSshw', ch: 'freeCodeCamp' }, { title: 'How the Internet Works', id: '7_LPdttKXPc', ch: 'Code.org' }],
  operating: [{ title: 'OS Concepts Full Course', id: 'dOiA2npjFJ0', ch: 'freeCodeCamp' }, { title: 'How OS Works', id: '26QPDBe-NB8', ch: 'CrashCourse' }],
  machine: [{ title: 'Machine Learning Full Course', id: 'NWONeJKn9Kc', ch: 'freeCodeCamp' }, { title: 'Neural Networks Explained', id: 'aircAruvnKk', ch: '3Blue1Brown' }],
  // Chemistry
  atomic: [{ title: 'Atomic Structure Explained', id: 'FAmGaaBMBKo', ch: 'Khan Academy' }, { title: 'Electron Configuration', id: 'YURReI6OJsg', ch: 'The Organic Chemistry Tutor' }],
  bonding: [{ title: 'Chemical Bonding Overview', id: 'QXT4OLQX3FI', ch: 'Khan Academy' }, { title: 'Ionic vs Covalent Bonds', id: 'yTiLOBKirpw', ch: 'CrashCourse' }],
  organic: [{ title: 'Organic Chemistry Full Course', id: 'bSMx0NS0xe8', ch: 'The Organic Chemistry Tutor' }, { title: 'Reaction Mechanisms', id: 'tUFHNMlG5X4', ch: 'Khan Academy' }],
  equilibrium: [{ title: 'Chemical Equilibrium', id: 'jhoOAiHVpmU', ch: 'Khan Academy' }, { title: 'Le Chatelier Principle', id: '_DF9hYUGKkk', ch: 'CrashCourse' }],
  // Engineering Core
  circuit: [{ title: 'Circuit Theory Full Course', id: 'OGa_b26eK2c', ch: 'freeCodeCamp' }, { title: 'Ohms Law and Kirchhoff', id: 'F_vLWkkNd6A', ch: 'The Organic Chemistry Tutor' }],

  signal: [{ title: 'Signals and Systems', id: 'KJnAy6hzetw', ch: 'MIT OpenCourseWare' }, { title: 'Fourier Transform Explained', id: 'spUNpyF58BY', ch: '3Blue1Brown' }],
  control: [{ title: 'Control Systems Engineering', id: 'Pi7l8mMjYVE', ch: 'Brian Douglas' }, { title: 'PID Controllers', id: 'UR0hOmeDUZA', ch: 'Brian Douglas' }],
  fluid: [{ title: 'Fluid Mechanics Full Course', id: 'F10q5sCPbAk', ch: 'MIT OpenCourseWare' }, { title: 'Bernoulli Equation', id: 'DW4rItB_8OE', ch: 'The Organic Chemistry Tutor' }],

  material: [{ title: 'Materials Science Overview', id: 'xxx_uCZC-Po', ch: 'MIT OpenCourseWare' }, { title: 'Stress & Strain', id: 'aQf6Q8HKO-I', ch: 'The Organic Chemistry Tutor' }],
};

function findCuratedVideos(topicName) {
  const lower = topicName.toLowerCase();
  for (const [key, videos] of Object.entries(ENGINEERING_VIDEOS)) {
    if (lower.includes(key)) return videos;
  }
  return null;
}

const SUBJECT_RESOURCE_LIBRARY = {
  physics: {
    images: [
      'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    ],
    videos: [
      { id: 'h69_InYV96A', title: 'Why is Relativity so Hard?', author: 'Veritasium' },
      { id: 'kKKM8Y-u7ds', title: 'Statics: Crash Course Physics #13', author: 'CrashCourse' }
    ]
  },
  chemistry: {
    images: [
      'https://images.unsplash.com/photo-1532187878418-9710f4492215?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1628113315911-d102ec465a36?auto=format&fit=crop&q=80&w=800'
    ],
    videos: [
      { id: 'rdMv80o9BEY', title: 'The Periodic Table', author: 'TED-Ed' },
      { id: 'QnQe0xW_JY4', title: 'What is an Atom?', author: 'Kurzgesagt' }
    ]
  },
  biology: {
    images: [
      'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800'
    ],
    videos: [
      { id: '8IlzKri08t0', title: 'The Cell', author: 'Amoeba Sisters' },
      { id: '4K9S7lX-9Xw', title: 'DNA Structure', author: 'Bozeman Science' }
    ]
  },
  generic: {
    images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800'],
    videos: [{ id: '9O6E-t23b90', title: 'How to Learn Anything', author: 'Ali Abdaal' }],
    notes: [
      'Break complex topics into smaller logical chunks.',
      'Use the Feynman Technique: explain it simply to someone else.',
      'Create mind maps to visualize connections between concepts.',
      'Do active recall instead of passive reading.'
    ]
  }
};

const REVISION_NOTES = {
  physics: [
    '**Newton\'s 1st Law:** Objects at rest stay at rest unless acted on by a force.',
    '**Newton\'s 2nd Law (F=ma):** Force is the rate of change of momentum.',
    '**Energy Conservation:** Energy cannot be created or destroyed, only transformed.',
    '**Work Done:** Calculated as Force × Displacement in the direction of force.',
    '**Thermodynamics:** 1st Law is energy conservation; 2nd Law involves Entropy (disorder).'
  ],
  chemistry: [
    '**Periodic Trends:** Atomic radius decreases across a period, increases down a group.',
    '**The Mole:** 1 mole = 6.022 × 10²³ particles (Avogadro\'s number).',
    '**pH Scale:** pH < 7 is acidic, pH > 7 is basic, pH = 7 is neutral.',
    '**Chemical Bonds:** Ionic (electron transfer) vs Covalent (electron sharing).',
    '**Redox:** Reduction is gain of electrons, Oxidation is loss of electrons.'
  ],
  biology: [
    '**Cell Theory:** All living things are made of cells; cells come from pre-existing cells.',
    '**DNA Structure:** Double helix composed of sugars, phosphates, and nitrogenous bases.',
    '**Mitosis vs Meiosis:** Mitosis creates identical cells; Meiosis creates gametes.',
    '**Homeostasis:** Maintenance of a stable internal environment in organisms.',
    '**Evolution:** Natural selection acts on existing variation in a population.'
  ],
  math: [
    '**Calculus:** Derivatives find rates of change; Integrals find areas.',
    '**Algebra:** When solving equations, whatever you do to one side, do to the other.',
    '**Trigonometry:** SOH CAH TOA (Sine=Opp/Hyp, Cos=Adj/Hyp, Tan=Opp/Adj).',
    '**Logarithms:** Log is the inverse of exponentiation. log_b(x)=y means b^y=x.',
    '**Statistics:** Mean is average, Median is middle, Mode is most frequent.'
  ]
};

function renderSyllabusAI() {
  const inputContainer = document.getElementById('syllabus-input-container');
  const resultsContainer = document.getElementById('syllabus-results-container');

  if (extractedSyllabus.length === 0) {
    inputContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    document.getElementById('syllabus-text-input').value = '';
  } else {
    inputContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    renderExtractedTopics();
  }
}

async function clearSyllabus() {
  await API.clearSyllabus();
  extractedSyllabus = [];
  renderSyllabusAI();
}

function processRealSyllabus() {
  const text = document.getElementById('syllabus-text-input').value;
  if (!text.trim()) return;

  const overlay = document.getElementById('syllabus-processing');
  overlay.classList.remove('hidden');

  setTimeout(async () => {
    overlay.classList.add('hidden');
    const topics = parseSyllabusText(text);
    extractedSyllabus = await API.saveSyllabusBulk(topics);
    renderSyllabusAI();
  }, 2000);
}

function parseSyllabusText(text) {
  // Turn commas into newlines to handle inline lists properly (e.g., "Physics, Chemistry, Biology")
  const processedText = text.replace(/,/g, '\n');
  const lines = processedText.split('\n');
  const topics = [];
  const topicRegex = /^(Unit|Chapter|Section|\d+[\.\)])\s*(.+)$/i;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const match = trimmed.match(topicRegex);
    if (match) {
      const name = match[2].trim();
      topics.push({
        id: `topic-${index}`,
        name: name,
        subject: detectSubject(name) // Prioritize name
      });
    } else if (trimmed.length > 8 && trimmed.length < 60) {
      topics.push({
        id: `topic-${index}`,
        name: trimmed,
        subject: detectSubject(trimmed)
      });
    }
  });

  return topics.slice(0, 10);
}

function detectSubject(name) {
  const text = name.toLowerCase();
  // Physics keywords
  if (text.match(/physics|thermo|quantum|mechanics|optics|light|force|energy|motion|wave/)) return 'physics';
  // Chemistry keywords
  if (text.match(/chemistry|acid|base|molecular|compound|reaction|orbital|organic|bond/)) return 'chemistry';
  // Biology keywords
  if (text.match(/biology|cell|dna|evolution|organism|protein|virus|genetics|anatomy/)) return 'biology';
  return 'generic';
}

function renderExtractedTopics() {
  const list = document.getElementById('syllabus-topic-list');
  list.innerHTML = extractedSyllabus.map((t, idx) => `
    <div class="topic-item" onclick="selectTopic('${t.id}')" data-id="${t.id}">
      <span class="material-symbols-outlined" style="font-size:18px">account_tree</span>
      <span>${t.name}</span>
    </div>
  `).join('');

  if (extractedSyllabus.length) selectTopic(extractedSyllabus[0].id);
}

let currentTopicForGen = '';

function selectTopic(id) {
  document.querySelectorAll('.topic-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
  const topic = extractedSyllabus.find(t => t.id === id);
  if (!topic) return;
  currentTopicForGen = topic.name;

  document.getElementById('current-topic-name').innerText = topic.name;

  // Reset Shorts section to default generation button
  const shortsContainer = document.getElementById('topic-shorts');
  shortsContainer.innerHTML = `
    <div class="card-tonal p-24 text-center d-flex flex-column align-items-center" style="gap:16px; width:100%;">
      <div class="ai-gen-icon">✨</div>
      <div>
        <h4 style="margin-bottom:8px;">Instant AI Video Breakdown</h4>
        <p style="font-size:12px; color:var(--text-3);">Need a faster explanation? AI will generate a 15-second visual summary for this topic.</p>
      </div>
      <button class="btn-filled" id="btn-generate-short" onclick="generateShortVideo()">Generate Explainer Short</button>
    </div>
  `;

  // Render Revision Notes & Dynamic Explanation
  const notesContainer = document.getElementById('topic-notes');
  const genericNotes = [
    'Break complex topics into smaller logical chunks.',
    'Use the Feynman Technique: explain it simply to someone else.',
    'Create mind maps to visualize connections between concepts.',
    'Do active recall instead of passive reading.'
  ];
  const notes = REVISION_NOTES[topic.subject] || genericNotes;

  notesContainer.innerHTML = `
    <div id="dynamic-explainer" style="margin-bottom: 16px; font-size: 14px; color: var(--text-2);">
      <div class="spinner" style="width: 16px; height: 16px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 8px;"></div>
      <em>Fetching encyclopedic overview...</em>
    </div>
    <ul class="notes-list">
      ${notes.map(note => `<li>${renderMDInline(note)}</li>`).join('')}
    </ul>
  `;

  // Fetch true dynamic explanation based on the topic
  fetchDynamicAnswer(topic.name).then(explanation => {
    const explainerDiv = document.getElementById('dynamic-explainer');
    const notesUl = notesContainer.querySelector('.notes-list');
    if (explainerDiv && notesUl) {
      // Strip Markdown for syllabus presentation
      let cleanText = explanation.replace(/###.*📚\n\n/, '').replace(/\n\n\*Source: Wikipedia\*/, '').replace(/\*\*/g, '');
      explainerDiv.innerHTML = `<strong>Topic Overview:</strong> ${cleanText}`;

      // Extract 3 dynamic facts for the bulleted lists
      const sentences = cleanText.split('. ').filter(s => s.trim().length > 10).slice(0, 3);
      if (sentences.length > 0) {
        notesUl.innerHTML = sentences.map(s => `<li>${s.trim()}${s.endsWith('.') ? '' : '.'}</li>`).join('');
      }
    }
  });


  // Render Images (Dynamic Unsplash via keyword)
  const imgGrid = document.getElementById('topic-images');
  const imageUrl = `https://source.unsplash.com/400x225/?${encodeURIComponent(topic.subject)},${encodeURIComponent(topic.name)}`;
  imgGrid.innerHTML = `
    <div class="resource-card">
      <img src="${imageUrl}" class="resource-thumb" alt="Reference" onerror="this.src='https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800'">
      <div class="resource-info">
        <div class="resource-title">Concept Visualization</div>
        <div class="resource-meta">
          <span class="material-symbols-outlined" style="font-size:14px">image</span>
          AI-Fetched Visual
        </div>
      </div>
    </div>
  `;

  // Render Videos — curated high-quality engineering videos, fallback to YouTube search
  const vidGrid = document.getElementById('topic-videos');
  const curated = findCuratedVideos(topic.name);

  if (curated) {
    // Show curated high-quality channel videos as clickable embed cards
    vidGrid.innerHTML = curated.map(v => `
      <div class="resource-card" onclick="playVideo('${v.id}')">
        <div class="resource-thumb-container">
          <img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg"
               class="resource-thumb" alt="${v.title}"
               onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400&h=225';this.style.filter='brightness(0.6)'">
          <div class="play-overlay"><span class="material-symbols-outlined">play_circle</span></div>
        </div>
        <div class="resource-info">
          <div class="resource-title">${v.title}</div>
          <div class="resource-meta">
            <span class="material-symbols-outlined" style="font-size:14px">subscriptions</span>
            ${v.ch}
          </div>
        </div>
      </div>`).join('');
  } else {
    // Fallback: dynamic YouTube search for unrecognized topics
    const queries = [
      { title: `${topic.name} – Full Tutorial`, q: `${topic.name} full tutorial explained engineering` },
      { title: `${topic.name} – Animated Explainer`, q: `${topic.name} animation easy explained` }
    ];
    vidGrid.innerHTML = queries.map(query => `
      <div class="resource-card" onclick="playSearchVideo('${encodeURIComponent(query.q)}')">
        <div class="resource-thumb-container">
          <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400&h=225" class="resource-thumb" style="filter:brightness(0.6)" alt="Video">
          <div class="play-overlay"><span class="material-symbols-outlined">play_circle</span></div>
        </div>
        <div class="resource-info">
          <div class="resource-title">${query.title}</div>
          <div class="resource-meta">
            <span class="material-symbols-outlined" style="font-size:14px">smart_display</span>
            YouTube Search
          </div>
        </div>
      </div>`).join('');
  }
}

function playSearchVideo(encodedQuery) {
  const modal = document.getElementById('video-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const iframe = document.getElementById('video-iframe');
  const loader = document.getElementById('video-loader');

  // Embed YouTube Search directly to play top viewed result on the topic
  iframe.src = `https://www.youtube.com/embed?listType=search&list=${encodedQuery}&autoplay=1`;
  modal.classList.remove('hidden');
  backdrop.classList.remove('hidden');
  loader.classList.remove('hidden');

  iframe.onload = () => {
    loader.classList.add('hidden');
  };
}

function playVideo(id, start = 0, end = 0) {
  const modal = document.getElementById('video-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const iframe = document.getElementById('video-iframe');
  const loader = document.getElementById('video-loader');

  let url = `https://www.youtube.com/embed/${id}?autoplay=1`;
  if (start) url += `&start=${start}`;
  if (end) url += `&end=${end}`;

  iframe.src = url;
  modal.classList.remove('hidden');
  backdrop.classList.remove('hidden');
  loader.classList.remove('hidden');

  iframe.onload = () => {
    loader.classList.add('hidden');
  };
}

function generateShortVideo() {
  const modal = document.getElementById('gen-modal');
  const bar = document.getElementById('gen-progress');
  const status = document.getElementById('gen-status');
  const backdrop = document.getElementById('modal-backdrop');

  if (!modal || !status || !bar) return;

  modal.classList.remove('hidden');
  backdrop.classList.remove('hidden');
  bar.style.width = '0%';

  const steps = [
    { p: 25, s: 'Analyzing syllabus context...' },
    { p: 55, s: 'Synthesizing core visualizations...' },
    { p: 85, s: 'Encoding high-impact segments...' },
    { p: 100, s: 'Generation complete!' }
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(interval);
      setTimeout(() => {
        modal.classList.add('hidden');
        // Finalize UI state in the workspace
        const shortsContainer = document.getElementById('topic-shorts');
        const curated = findCuratedVideos(currentTopicForGen);
        const vidId = curated ? curated[0].id : 'bSMx0NS0xe8';

        shortsContainer.innerHTML = `
          <div class="shorts-grid" style="width:100%;">
            <div class="resource-card short-player" onclick="playVideo('${vidId}', 15, 30)">
              <div class="resource-thumb-container">
                <img src="https://i.ytimg.com/vi/${vidId}/mqdefault.jpg" class="resource-thumb" alt="AI Generated Short">
                <div class="play-overlay"><span class="material-symbols-outlined">play_circle</span></div>
                <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.7); color:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700;">15s EXPLAINER</div>
              </div>
              <div class="resource-info">
                <div class="resource-title">✨ AI Explainer: ${currentTopicForGen}</div>
                <div class="resource-meta">Generated for your Study DNA</div>
              </div>
            </div>
          </div>
        `;

        // Auto-play the short
        playVideo(vidId, 15, 30);
      }, 500);
      return;
    }
    bar.style.width = steps[i].p + '%';
    status.innerText = steps[i].s;
    i++;
  }, 700);
}


function closeVideo() {
  const modal = document.getElementById('video-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const iframe = document.getElementById('video-iframe');

  modal.classList.add('hidden');
  backdrop.classList.add('hidden');
  iframe.src = '';
}

// ---- SETTINGS ----
function openSettings() {
  document.getElementById('settings-name').value = AppState.student.name;
  document.getElementById('settings-stream').value = AppState.student.stream || 'Engineering (B.Tech)';
  document.getElementById('settings-year').value = AppState.student.year || 'First Year';
  document.getElementById('settings-goal').value = AppState.student.goal || '';
  document.getElementById('settings-modal').classList.remove('hidden');
  document.getElementById('modal-backdrop').classList.remove('hidden');
}
function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
  document.getElementById('modal-backdrop').classList.add('hidden');
}
async function saveSettings() {
  const name = document.getElementById('settings-name').value || 'Student';
  const stream = document.getElementById('settings-stream').value;
  const year = document.getElementById('settings-year').value;
  const goal = document.getElementById('settings-goal').value;

  const updatedUser = await API.updateUser({ name, stream, year, goal });

  AppState.student = {
    name: updatedUser.name,
    initials: updatedUser.initials,
    stream: updatedUser.stream,
    year: updatedUser.year,
    goal: updatedUser.goal
  };

  document.getElementById('nav-student-name').textContent = name;
  document.getElementById('nav-avatar').textContent = AppState.student.initials;
  document.getElementById('dash-student-name').textContent = name.split(' ')[0];

  closeSettings();
  renderDashboard();
}

// Initial Load
document.addEventListener('DOMContentLoaded', initApp);
function setTheme(mode) {
  document.body.classList.toggle('light-mode', mode === 'light');
  document.getElementById('theme-dark').classList.toggle('active', mode === 'dark');
  document.getElementById('theme-light').classList.toggle('active', mode === 'light');
}

// ---- INIT ----
window.addEventListener('DOMContentLoaded', () => {
  // Set today's date
  const d = new Date();
  const dateEl = document.getElementById('today-date');
  if (dateEl) dateEl.textContent = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  // Streak
  document.getElementById('streak-counter').textContent = AppState.streak + ' Day Streak';
  navigateTo('dashboard');
});
