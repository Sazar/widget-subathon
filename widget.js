/* =============================================
   SUBATHON WIDGET v2.1 — Logique
   Compatible StreamElements
   ============================================= */

const DEFAULT = {
  initialTime:    3600,
  timePerSub:     300,
  timePerResub:   180,
  timePerGift:    300,
  timePerDono:    60,
  timePerDonoPer: 5,
  timePerBits:    30,
  timePerBitsPer: 100,
  timePerFollow:  15,
  goalEnabled:    true,
  goalType:       'sub',
  goalTarget:     50,
  subEnabled:     true,
  resubEnabled:   true,
  giftEnabled:    true,
  donoEnabled:    true,
  bitsEnabled:    true,
  followEnabled:  true,
  widgetWidth:    '520px',
  accent:         '#e84118',
  accentDark:     '#b83010',
  boxBg:          'rgba(12,12,20,0.82)',
  boxBorder:      '#e84118',
  timerBg:        '#e84118',
  timerText:      '#ffffff',
  goalBg:         'rgba(12,12,20,0.90)',
  goalBorder:     '#e84118',
  goalText:       '#ffffff',
  infoBg:         '#e84118',
  infoText:       '#ffffff',
  glow:           'rgba(232,65,24,0.45)',
};

// Sanitize : retourne un entier propre depuis n'importe quelle valeur (supprime virgules, espaces, etc.)
function safeInt(val, fallback) {
  if (val === undefined || val === null || val === '') return fallback;
  // Remplace virgule par point, puis parseInt tronque la partie décimale
  const cleaned = String(val).replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? fallback : n;
}

function safeFloat(val, fallback) {
  if (val === undefined || val === null || val === '') return fallback;
  const cleaned = String(val).replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? fallback : n;
}

function cfg(key) {
  if (typeof fieldData !== 'undefined' && fieldData[key] !== undefined && fieldData[key] !== '') {
    return fieldData[key];
  }
  return DEFAULT[key];
}

let timeLeft      = 0;
let running       = false;
let goalCurrent   = 0;
let goalTarget    = 1;
let timerInterval = null;

const elTimer      = document.getElementById('timerDisplay');
const elAlertBox   = document.getElementById('alertBox');
const elAlertType  = document.getElementById('alertType');
const elAlertName  = document.getElementById('alertName');
const elInfoBox    = document.getElementById('infoBox');
const elInfoText   = document.getElementById('infoBoxText');
const elGoalBox    = document.getElementById('goalBox');
const elGoalCur    = document.getElementById('goalCurrent');
const elGoalTgt    = document.getElementById('goalTarget');
const elGoalUnit   = document.getElementById('goalUnit');

function init() {
  applyColors();

  // Temps initial — lecture propre avec safeInt
  timeLeft = safeInt(cfg('initialTime'), DEFAULT.initialTime);

  // Goal
  goalTarget  = safeFloat(cfg('goalTarget'), DEFAULT.goalTarget);
  goalCurrent = 0;
  elGoalUnit.textContent = goalUnitLabel();
  elGoalTgt.textContent  = goalTarget;
  elGoalCur.textContent  = 0;
  elGoalBox.style.display = cfg('goalEnabled') ? '' : 'none';

  updateTimerDisplay();
  startTimer();
}

function goalUnitLabel() {
  const t = cfg('goalType');
  if (t === 'dono') return '\u20ac';
  if (t === 'bits') return 'bits';
  return 'subs';
}

function applyColors() {
  const r = document.documentElement;
  const map = {
    '--widget-width': cfg('widgetWidth'),
    '--accent':       cfg('accent'),
    '--accent-dark':  cfg('accentDark'),
    '--box-bg':       cfg('boxBg'),
    '--box-border':   cfg('boxBorder'),
    '--timer-bg':     cfg('timerBg'),
    '--timer-text':   cfg('timerText'),
    '--goal-bg':      cfg('goalBg'),
    '--goal-border':  cfg('goalBorder'),
    '--goal-text':    cfg('goalText'),
    '--info-bg':      cfg('infoBg'),
    '--info-text':    cfg('infoText'),
    '--glow':         cfg('glow'),
    '--text-accent':  cfg('accent'),
  };
  for (const [k, v] of Object.entries(map)) {
    if (v) r.style.setProperty(k, v);
  }
}

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
      elTimer.style.color = '#ffffff99';
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
    String(h).padStart(2, '0') + ':' +
    String(m).padStart(2, '0') + ':' +
    String(s).padStart(2, '0');
}

function showInfoBox(seconds) {
  const label = formatTimeLabel(seconds);
  elInfoText.textContent = '+' + label;
  elInfoBox.classList.remove('pop');
  void elInfoBox.offsetWidth;
  elInfoBox.classList.add('pop');
}

function formatTimeLabel(s) {
  if (s < 60)   return s + 's';
  if (s < 3600) return Math.round(s / 60) + ' min';
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h + 'h' + (m ? m + 'min' : '');
}

const TYPE_LABELS = {
  sub:    'Nouvel Abonn\u00e9',
  resub:  'R\u00e9abonnement',
  gift:   'Gift Sub',
  dono:   'Nouveau Don',
  bits:   'Cheers',
  follow: 'Nouveau Follow',
};

function showAlert(type, name, extra) {
  elAlertType.textContent = TYPE_LABELS[type] || type;
  elAlertName.textContent = extra ? name + ' - ' + extra : name;
  elAlertBox.classList.remove('flash');
  void elAlertBox.offsetWidth;
  elAlertBox.classList.add('flash');
}

function addGoal(amount) {
  goalCurrent = Math.min(goalTarget, goalCurrent + amount);
  elGoalCur.textContent = goalCurrent;
}

window.addEventListener('onEventReceived', function(obj) {
  const data     = obj.detail.event;
  const listener = obj.detail.listener;

  if (listener === 'subscriber-latest') {
    if (!cfg('subEnabled')) return;
    const isGift  = !!data.isgift;
    const isResub = !isGift && parseInt(data.amount) > 1;
    const type    = isGift ? 'gift' : (isResub ? 'resub' : 'sub');
    const uname   = data.displayName || data.name || 'Anonyme';
    let secsToAdd = 0;
    let extra     = null;

    if (type === 'gift') {
      if (!cfg('giftEnabled')) return;
      const count = safeInt(data.amount, 1);
      secsToAdd   = count * safeInt(cfg('timePerGift'), DEFAULT.timePerGift);
      extra       = 'x' + count;
      if (cfg('goalType') === 'sub') addGoal(count);
    } else if (type === 'resub') {
      if (!cfg('resubEnabled')) return;
      secsToAdd     = safeInt(cfg('timePerResub'), DEFAULT.timePerResub);
      const months  = safeInt(data.amount, 1);
      extra         = 'x' + months;
      if (cfg('goalType') === 'sub') addGoal(1);
    } else {
      secsToAdd     = safeInt(cfg('timePerSub'), DEFAULT.timePerSub);
      const tier    = data.tier ? 'Tier ' + Math.round(parseInt(data.tier) / 1000) : null;
      extra         = tier;
      if (cfg('goalType') === 'sub') addGoal(1);
    }
    addTime(secsToAdd);
    showInfoBox(secsToAdd);
    showAlert(type, uname, extra);
  }

  if (listener === 'tip-latest') {
    if (!cfg('donoEnabled')) return;
    const amount    = safeFloat(data.amount, 0);
    const perUnit   = safeFloat(cfg('timePerDonoPer'), DEFAULT.timePerDonoPer);
    const secsEach  = safeInt(cfg('timePerDono'), DEFAULT.timePerDono);
    const tranches  = Math.floor(amount / perUnit);
    const secsToAdd = tranches * secsEach;
    const uname     = data.username || 'Anonyme';
    if (secsToAdd > 0) addTime(secsToAdd);
    if (cfg('goalType') === 'dono') addGoal(amount);
    showInfoBox(secsToAdd || 0);
    showAlert('dono', uname, amount + '\u20ac');
  }

  if (listener === 'cheer-latest') {
    if (!cfg('bitsEnabled')) return;
    const bits      = safeInt(data.amount, 0);
    const perUnit   = safeInt(cfg('timePerBitsPer'), DEFAULT.timePerBitsPer);
    const secsEach  = safeInt(cfg('timePerBits'), DEFAULT.timePerBits);
    const tranches  = Math.floor(bits / perUnit);
    const secsToAdd = tranches * secsEach;
    const uname     = data.displayName || data.name || 'Anonyme';
    if (secsToAdd > 0) addTime(secsToAdd);
    if (cfg('goalType') === 'bits') addGoal(bits);
    showInfoBox(secsToAdd || 0);
    showAlert('bits', uname, bits + ' bits');
  }

  if (listener === 'follower-latest') {
    if (!cfg('followEnabled')) return;
    const secsToAdd = safeInt(cfg('timePerFollow'), DEFAULT.timePerFollow);
    const uname     = data.displayName || data.name || 'Anonyme';
    addTime(secsToAdd);
    showInfoBox(secsToAdd);
    showAlert('follow', uname, null);
  }
});

// onWidgetLoad est déclenché par SE avec fieldData déjà injecté
window.addEventListener('onWidgetLoad', function(obj) {
  // SE passe les fields dans obj.detail.fieldData — on les récupère ici
  if (obj && obj.detail && obj.detail.fieldData) {
    window.fieldData = obj.detail.fieldData;
  }
  init();
});

// Fallback dev local (sans SE)
if (typeof fieldData === 'undefined') {
  window.fieldData = {};
  init();
}
