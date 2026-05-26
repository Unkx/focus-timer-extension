// Background Service Worker - Focus Timer

let timerState = {
  phase: 'idle', // 'idle' | 'work' | 'break'
  timeLeft: 0,
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
  blockedSites: [],
  isRunning: false,
  startTime: null,
  totalTime: 0
};

let currentRulesId = 100; // Starting ID for dynamic rules

// Load state from storage on startup
chrome.storage.local.get(['timerState'], (result) => {
  if (result.timerState) {
    timerState = { ...timerState, ...result.timerState };
    // If timer was running when extension reloaded, recalculate
    if (timerState.isRunning && timerState.startTime) {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      timerState.timeLeft = Math.max(0, timerState.totalTime - elapsed);
      if (timerState.timeLeft === 0) {
        phaseComplete();
      }
    }
  }
  // Apply blocking rules if in work phase
  if (timerState.phase === 'work' && timerState.blockedSites.length > 0) {
    applyBlockingRules();
  }
});

// Save state to storage
function saveState() {
  chrome.storage.local.set({ timerState });
}

// Notify popup of state change
function broadcastState() {
  chrome.runtime.sendMessage({ type: 'STATE_UPDATE', state: timerState }).catch(() => {});
}

// Extract domain from URL
function extractDomain(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .split('/')[0];
}

// Apply blocking rules
async function applyBlockingRules() {
  if (!timerState.blockedSites || timerState.blockedSites.length === 0) {
    return;
  }

  const rules = [];
  let ruleId = currentRulesId;

  for (const site of timerState.blockedSites) {
    const domain = extractDomain(site);
    if (!domain) continue;

    rules.push({
      id: ruleId++,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { extensionPath: "/blocked.html" }
      },
      condition: {
        urlFilter: `*://*.${domain}/*`,
        resourceTypes: ["main_frame"]
      }
    });

    // Also block the domain without subdomain
    rules.push({
      id: ruleId++,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { extensionPath: "/blocked.html" }
      },
      condition: {
        urlFilter: `*://${domain}/*`,
        resourceTypes: ["main_frame"]
      }
    });
  }

  try {
    // Remove all existing dynamic rules first
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(rule => rule.id);
    
    if (existingIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds
      });
    }
    
    // Add new rules
    if (rules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
      currentRulesId = ruleId;
    }
    
    console.log(`Blocking rules applied for ${timerState.blockedSites.length} sites`);
  } catch (e) {
    console.error('Error applying rules:', e);
  }
}

// Remove all blocking rules
async function removeBlockingRules() {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(rule => rule.id);
    
    if (existingIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds
      });
      console.log('All blocking rules removed');
    }
  } catch (e) {
    console.error('Error removing rules:', e);
  }
}

// Phase complete handler
function phaseComplete() {
  timerState.isRunning = false;
  timerState.startTime = null;
  timerState.totalTime = 0;

  if (timerState.phase === 'work') {
    // Work done -> Start break, unblock sites
    timerState.phase = 'break';
    timerState.timeLeft = timerState.breakDuration;
    timerState.totalTime = timerState.breakDuration;
    removeBlockingRules();
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🎉 Time for a break!',
      message: `Great job! You have ${Math.floor(timerState.breakDuration / 60)} minutes of break. Sites are now unblocked.`,
      priority: 2
    });

    // Auto-start break
    startTimer();
  } else if (timerState.phase === 'break') {
    // Break done -> back to idle, reapply blocks
    timerState.phase = 'idle';
    timerState.timeLeft = 0;
    timerState.totalTime = 0;
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '💪 Time to get back to work!',
      message: 'Break is over. Sites have been blocked again. Time to focus!',
      priority: 2
    });
  }

  saveState();
  broadcastState();
}

// Start timer
function startTimer() {
  if (timerState.phase === 'idle') {
    timerState.phase = 'work';
    timerState.timeLeft = timerState.workDuration;
    timerState.totalTime = timerState.workDuration;
    applyBlockingRules();
  } else if (timerState.phase === 'break') {
    timerState.totalTime = timerState.breakDuration;
  } else if (timerState.phase === 'work') {
    timerState.totalTime = timerState.workDuration;
  }

  timerState.isRunning = true;
  timerState.startTime = Date.now();

  // Clear existing alarm
  chrome.alarms.clear('timerTick');
  chrome.alarms.create('timerTick', { periodInMinutes: 1/60 }); // Every second

  saveState();
  broadcastState();
}

// Stop/pause timer
function stopTimer() {
  timerState.isRunning = false;
  timerState.startTime = null;
  chrome.alarms.clear('timerTick');
  saveState();
  broadcastState();
}

// Reset timer
function resetTimer() {
  timerState.phase = 'idle';
  timerState.isRunning = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  timerState.startTime = null;
  chrome.alarms.clear('timerTick');
  removeBlockingRules();
  saveState();
  broadcastState();
}

// Alarm tick handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timerTick' && timerState.isRunning && timerState.startTime) {
    const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
    const newTimeLeft = Math.max(0, timerState.totalTime - elapsed);

    if (newTimeLeft !== timerState.timeLeft) {
      timerState.timeLeft = newTimeLeft;
      
      if (timerState.timeLeft === 0) {
        chrome.alarms.clear('timerTick');
        phaseComplete();
      } else {
        saveState();
        broadcastState();
      }
    }
  }
});

// Message handler from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_STATE':
      sendResponse({ state: timerState });
      break;

    case 'START':
      startTimer();
      sendResponse({ ok: true });
      break;

    case 'STOP':
      stopTimer();
      sendResponse({ ok: true });
      break;

    case 'RESET':
      resetTimer();
      sendResponse({ ok: true });
      break;

    case 'SET_SETTINGS':
      const wasWorkPhase = timerState.phase === 'work';
      const wasIdle = timerState.phase === 'idle';
      
      timerState.workDuration = message.workDuration;
      timerState.breakDuration = message.breakDuration;
      timerState.blockedSites = message.blockedSites || [];
      
      // Update timeLeft based on current phase
      if (timerState.phase === 'work' && !timerState.isRunning) {
        timerState.timeLeft = timerState.workDuration;
      } else if (timerState.phase === 'break' && !timerState.isRunning) {
        timerState.timeLeft = timerState.breakDuration;
      }
      
      // Re-apply blocking rules if in work phase
      if (timerState.phase === 'work') {
        applyBlockingRules();
      } else {
        removeBlockingRules();
      }
      
      saveState();
      broadcastState();
      sendResponse({ ok: true });
      break;
      
    case 'APPLY_BLOCKING':
      applyBlockingRules();
      sendResponse({ ok: true });
      break;
  }
  return true;
});