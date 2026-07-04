/* =============================================
   SUBATHON WIDGET — Logique principale
   Compatible StreamElements
   ============================================= */

// ── CONFIG PAR DÉFAUT (écrasée par les champs SE) ──────────────────────────
const DEFAULT = {
  initialTime: 3600,
  timePerSub:    300,
  timePerResub:  180,
  timePerGift:   300,
  timePerDono:   60,
  timePerDonoPer: 5,
  timePerBits:   30,
  timePerBitsPer: 100,
  timePerFollow: 15,
  goalEnabled: true,
  goalLabel: 'Objectif Subs',
  goalType: 'sub',
  goalTarget: 50,
  subEnabled:    true,
  resubEnabled:  true,
  giftEnabled:   true,
  donoEnabled:   true,
  bitsEnabled:   true,
  followEnabled: true,
  timerFontSize: '72px',
  widgetWidth: '420px',
  timerBg: 'rgba(10,10,20,0.85)',
  timerBorder: '#7c3aed',
  timerText: '#ffffff',
  timerLabelColor: '#a78bfa',
  goalBg: 'rgba(10,10,20,0.80)',
  goalBorder: '#7c3aed',
  goalBarFill: 'linear-gradient(90deg,#7c3aed,#c026d3)',
  goalText: '#ffffff',
  eventBg: 'rgba(10,10,20,0.82)',
  eventBorder: '#7c3aed',
  eventText: '#ffffff',
  eventAccent: '#a78bfa',
  eventAddColor: '#4ade80',
  glowColor: 'rgba(124,58,237,0.55)',
};

function cfg(key) {
  if (typeof fieldData !== 'undefined' && fieldData[key] !== undefined && fieldData[key] !== '') {
    return fieldData[key];
  }
  return DEFAULT[key];
}

// ── ÉTAT ─────────────────────────────────────────────────────────────────────
let timeLeft = 0;
let running  = false;
let goalCurrent = 0;
let goalTarget  = 1;
let timerInterval = null;

// ── DOM ───────────────────────────────────────────────────────────────────────
const elTimer    = document.getElementById('timerDisplay');
const elFeed     = document.getElementById('eventFeed');
const elGoalBox  = document.getElementById('goalBox');
const elGoalBar  = document.getElementById('goalBarFill');
const elGoalCur  = document.getElementById('goalCurrent');
const elGoalTgt  = document.getElementById('goalTarget');
const elGoalLbl  = document.getElementById('goalLabel');
const elGoalUnit = document.getElementById('goalUnit');

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  applyColors();
  timeLeft   = parseInt(cfg('initialTime')) || 3600;
  goalTarget = parseFloat(cfg('goalTarget')) || 50;
  goalCurrent = 0;
  elGoalLbl.textContent  = cfg('goalLabel') || 'Objectif';
  elGoalTgt.textContent  = goalTarget;
  elGoalUnit.textContent = goalUnitLabel();
  elGoalBox.style.display = cfg('goalEnabled') ? '' : 'none';
  updateTimerDisplay();
  updateGoalBar();
  startTimer();
}

function goalUnitLabel() {
  const t = cfg('goalType');
  if (t === 'dono')  return '€';
  if (t === 'bits')  return 'bits';
  return 'subs';
}

function applyColors() {
  const root = document.documentElement;
  const map = {
    '--timer-font-size':   cfg('timerFontSize'),
    '--widget-width':      cfg('widgetWidth'),
    '--timer-bg':          cfg('timerBg'),
    '--timer-border':      cfg('timerBorder'),
    '--timer-text':        cfg('timerText'),
    '--timer-label-color': cfg('timerLabelColor'),
    '--goal-bg':           cfg('goalBg'),
    '--goal-border':       cfg('goalBorder'),
    '--goal-bar-fill':     cfg('goalBarFill'),
    '--goal-text':         cfg('goalText'),
    '--event-bg':          cfg('eventBg'),
    '--event-border':      cfg('eventBorder'),
    '--event-text':        cfg('eventText'),
    '--event-accent':      cfg('eventAccent'),
    '--event-add-color':   cfg('eventAddColor'),
    '--glow-color':        cfg('glowColor'),
  };
  for (const [k,v] of Object.entries(map)) {
    if (v) root.style.setProperty(k, v);
  }
}

// ── TIMER ─────────────────────────────────────────────────────────────────────
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  running = true;
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      running = false;
      clearInterval(timerInterval);
      elTimer.style.color = '#ef4444';
    }
  }, 1000);
}

function addTime(seconds) {
  timeLeft += seconds;
  if (!running && timeLeft > 0) startTimer();
  elTimer.classList.remove('pulse');
  void elTimer.offsetWidth;
  elTimer.classList.add('pulse');
  setTimeout(() => elTimer.classList.remove('pulse'), 450);
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  elTimer.textContent =
    String(h).padStart(2,'0') + ':' +
    String(m).padStart(2,'0') + ':' +
    String(s).padStart(2,'0');
}

// ── GOAL BAR ──────────────────────────────────────────────────────────────────
function updateGoalBar() {
  const pct = Math.min(100, (goalCurrent / goalTarget) * 100);
  elGoalBar.style.width = pct + '%';
  elGoalCur.textContent = goalCurrent;
  elGoalTgt.textContent = goalTarget;
  if (pct >= 100) {
    elGoalBar.style.boxShadow = '0 0 20px #4ade80, 0 0 40px #4ade80';
  }
}

function addGoal(amount) {
  goalCurrent = Math.min(goalTarget, goalCurrent + amount);
  updateGoalBar();
}

// ── EVENT FEED ────────────────────────────────────────────────────────────────
const ICONS = {
  sub: '🌟', resub: '⭐', gift: '🎁',
  dono: '💰', bits: '💎', follow: '❤️'
};

function showEvent(type, name, amount, timeAdded) {
  const item = document.createElement('div');
  item.className = 'event-item';
  const typeLabels = {
    sub: 'Abonnement', resub: 'R\u00e9abonnement', gift: 'Gift Sub',
    dono: 'Don', bits: 'Bits', follow: 'Follow'
  };
  item.innerHTML = `
    <div class="event-icon">${ICONS[type] || '\uD83D\uDD14'}</div>
    <div class="event-info">
      <div class="event-name">${escHtml(name)}</div>
      <div class="event-type">${typeLabels[type] || type}${amount ? ' \u00b7 ' + amount : ''}</div>
    </div>
    <div class="event-add">+${formatTime(timeAdded)}</div>
  `;
  elFeed.prepend(item);
  const items = elFeed.querySelectorAll('.event-item');
  if (items.length > 3) {
    const last = items[items.length - 1];
    last.classList.add('fade-out');
    setTimeout(() => last.remove(), 400);
  }
  setTimeout(() => {
    item.classList.add('fade-out');
    setTimeout(() => item.remove(), 400);
  }, 8000);
}

function formatTime(s) {
  if (s < 60)   return s + 's';
  if (s < 3600) return Math.round(s/60) + 'min';
  const h = Math.floor(s/3600);
  const m = Math.round((s%3600)/60);
  return h + 'h' + (m ? m + 'min' : '');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── STREAMELEMENTS EVENTS ─────────────────────────────────────────────────────
window.addEventListener('onEventReceived', function(obj) {
  const data = obj.detail.event;
  const listener = obj.detail.listener;

  if (listener === 'subscriber-latest') {
    if (!cfg('subEnabled')) return;
    const isGift  = data.isgift;
    const isResub = data.gifted === false && parseInt(data.amount) > 1;
    const type = isGift ? 'gift' : (isResub ? 'resub' : 'sub');
    let secsToAdd = 0;
    if (type === 'gift') {
      const count = parseInt(data.amount) || 1;
      secsToAdd = count * (parseInt(cfg('timePerGift')) || DEFAULT.timePerGift);
      if (cfg('goalType') === 'sub') addGoal(count);
    } else if (type === 'resub') {
      if (!cfg('resubEnabled')) return;
      secsToAdd = parseInt(cfg('timePerResub')) || DEFAULT.timePerResub;
      if (cfg('goalType') === 'sub') addGoal(1);
    } else {
      secsToAdd = parseInt(cfg('timePerSub')) || DEFAULT.timePerSub;
      if (cfg('goalType') === 'sub') addGoal(1);
    }
    addTime(secsToAdd);
    showEvent(type, data.displayName || data.name, null, secsToAdd);
  }

  if (listener === 'tip-latest') {
    if (!cfg('donoEnabled')) return;
    const amount  = parseFloat(data.amount) || 0;
    const perUnit = parseFloat(cfg('timePerDonoPer')) || DEFAULT.timePerDonoPer;
    const secsEach = parseInt(cfg('timePerDono')) || DEFAULT.timePerDono;
    const tranches = Math.floor(amount / perUnit);
    const secsToAdd = tranches * secsEach;
    if (secsToAdd > 0) addTime(secsToAdd);
    if (cfg('goalType') === 'dono') addGoal(amount);
    showEvent('dono', data.username, amount + '\u20ac', secsToAdd || 0);
  }

  if (listener === 'cheer-latest') {
    if (!cfg('bitsEnabled')) return;
    const bits    = parseInt(data.amount) || 0;
    const perUnit = parseInt(cfg('timePerBitsPer')) || DEFAULT.timePerBitsPer;
    const secsEach = parseInt(cfg('timePerBits')) || DEFAULT.timePerBits;
    const tranches = Math.floor(bits / perUnit);
    const secsToAdd = tranches * secsEach;
    if (secsToAdd > 0) addTime(secsToAdd);
    if (cfg('goalType') === 'bits') addGoal(bits);
    showEvent('bits', data.displayName || data.name, bits + ' bits', secsToAdd || 0);
  }

  if (listener === 'follower-latest') {
    if (!cfg('followEnabled')) return;
    const secsToAdd = parseInt(cfg('timePerFollow')) || DEFAULT.timePerFollow;
    addTime(secsToAdd);
    showEvent('follow', data.displayName || data.name, null, secsToAdd);
  }
});

window.addEventListener('onWidgetLoad', function(obj) {
  init();
});

if (typeof fieldData === 'undefined') {
  window.fieldData = {};
  init();
}
