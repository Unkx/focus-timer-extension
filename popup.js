// Popup JS - Focus Timer

const CIRCUMFERENCE = 2 * Math.PI * 80; // r=80

let state = null;
let localSites = [];

// DOM refs
const timerDisplay = document.getElementById('timerDisplay');
const timerSub = document.getElementById('timerSub');
const phaseBadge = document.getElementById('phaseBadge');
const ringProgress = document.getElementById('ringProgress');
const logoDot = document.getElementById('logoDot');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const workStat = document.getElementById('workStat');
const breakStat = document.getElementById('breakStat');
const blockedInfo = document.getElementById('blockedInfo');
const blockedCount = document.getElementById('blockedCount');
const settingsBtn = document.getElementById('settingsBtn');
const mainView = document.getElementById('mainView');
const settingsPanel = document.getElementById('settingsPanel');
const workInput = document.getElementById('workInput');
const breakInput = document.getElementById('breakInput');
const siteInput = document.getElementById('siteInput');
const addSiteBtn = document.getElementById('addSiteBtn');
const siteList = document.getElementById('siteList');
const saveBtn = document.getElementById('saveBtn');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateUI(s) {
  state = s;

  // Timer display
  timerDisplay.textContent = formatTime(s.timeLeft);

  // Ring progress
  const total = s.phase === 'break' ? s.breakDuration : (s.phase === 'work' ? s.workDuration : s.workDuration);
  const progress = total > 0 ? 1 - (s.timeLeft / total) : 0;
  const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
  ringProgress.style.strokeDashoffset = offset;
  ringProgress.style.strokeDasharray = CIRCUMFERENCE;

  // Phase-based styling
  ringProgress.className = 'ring-progress ' + (s.phase === 'idle' ? 'idle' : s.phase);
  logoDot.className = 'logo-dot ' + (s.phase === 'idle' ? '' : s.phase);

  if (s.phase === 'work') {
    phaseBadge.textContent = '💼 Work Time';
    phaseBadge.className = 'phase-badge work';
    timerSub.textContent = 'Focus';
    startStopBtn.className = 'btn btn-primary';
  } else if (s.phase === 'break') {
    phaseBadge.textContent = '☕ Break Time';
    phaseBadge.className = 'phase-badge break';
    timerSub.textContent = 'Rest';
    startStopBtn.className = 'btn btn-primary break';
  } else {
    phaseBadge.textContent = '⏳ Ready';
    phaseBadge.className = 'phase-badge';
    timerSub.textContent = 'Work';
    timerDisplay.textContent = formatTime(s.workDuration);
    startStopBtn.className = 'btn btn-primary';
  }

  // Start/stop button
  startStopBtn.textContent = s.isRunning ? 'Pause' : (s.phase === 'idle' ? 'Start' : 'Resume');

  // Stats
  workStat.textContent = Math.floor(s.workDuration / 60) + ' min';
  breakStat.textContent = Math.floor(s.breakDuration / 60) + ' min';

  // Blocked sites info
  if (s.blockedSites && s.blockedSites.length > 0 && s.phase === 'work') {
    blockedInfo.classList.remove('hidden');
    blockedCount.textContent = `${s.blockedSites.length} ${s.blockedSites.length === 1 ? 'site blocked' : 'sites blocked'}`;
  } else {
    blockedInfo.classList.add('hidden');
  }
}

// Get initial state
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
  if (response && response.state) {
    updateUI(response.state);
    // Populate settings
    workInput.value = Math.floor(response.state.workDuration / 60);
    breakInput.value = Math.floor(response.state.breakDuration / 60);
    localSites = [...(response.state.blockedSites || [])];
    renderSiteList();
  }
});

// Listen for state updates from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'STATE_UPDATE') {
    updateUI(message.state);
  }
});

// Controls
startStopBtn.addEventListener('click', () => {
  if (!state) return;
  if (state.isRunning) {
    chrome.runtime.sendMessage({ type: 'STOP' });
  } else {
    chrome.runtime.sendMessage({ type: 'START' });
  }
});

resetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'RESET' });
});

// Settings toggle
settingsBtn.addEventListener('click', () => {
  const isOpen = settingsPanel.classList.contains('open');
  if (isOpen) {
    settingsPanel.classList.remove('open');
    mainView.style.display = 'block';
    settingsBtn.style.color = '';
  } else {
    settingsPanel.classList.add('open');
    mainView.style.display = 'none';
    settingsBtn.style.color = 'var(--accent-idle)';
  }
});

// Site management
function renderSiteList() {
  siteList.innerHTML = '';
  if (localSites.length === 0) {
    siteList.innerHTML = '<div style="font-size:11px;color:var(--text-muted);padding:6px 2px;">No blocked sites. Add below.</div>';
    return;
  }
  localSites.forEach((site, i) => {
    const item = document.createElement('div');
    item.className = 'site-item';
    item.innerHTML = `
      <span class="site-item-text">${escapeHtml(site)}</span>
      <button class="site-remove" data-index="${i}" title="Remove">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    item.querySelector('.site-remove').addEventListener('click', () => {
      localSites.splice(i, 1);
      renderSiteList();
    });
    siteList.appendChild(item);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function addSite() {
  let val = siteInput.value.trim().toLowerCase();
  if (!val) return;
  // Normalize
  val = val.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  if (!val) return;
  if (!localSites.includes(val)) {
    localSites.push(val);
    renderSiteList();
  }
  siteInput.value = '';
  siteInput.focus();
}

addSiteBtn.addEventListener('click', addSite);
siteInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addSite();
  }
});

// Save settings
saveBtn.addEventListener('click', () => {
  const workMin = parseInt(workInput.value) || 25;
  const breakMin = parseInt(breakInput.value) || 5;

  chrome.runtime.sendMessage({
    type: 'SET_SETTINGS',
    workDuration: workMin * 60,
    breakDuration: breakMin * 60,
    blockedSites: localSites
  }, () => {
    // Visual feedback
    saveBtn.textContent = '✓ Saved!';
    saveBtn.style.background = 'var(--accent-break)';
    setTimeout(() => {
      saveBtn.textContent = 'Save settings';
      saveBtn.style.background = '';
      settingsPanel.classList.remove('open');
      mainView.style.display = 'block';
      settingsBtn.style.color = '';
    }, 1000);

    // Refresh state display
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (response && response.state) updateUI(response.state);
    });
  });
});