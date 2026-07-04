/* =============================================
   SUBATHON WIDGET v2.12 — Logique
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
  widgetFont:     'Rajdhani',
  alertFontSize:  42,
  timerFontSize:  36,
  widgetWidth:    '520px',
  accent:         '#e84118',
  boxBgColor:     '#0e0e14',
  boxBgOpacity:   82,
  timerBg:        '#e84118',
  timerText:      '#ffffff',
  goalBgColor:    '#0c0c14',
  goalBgOpacity:  90,
  goalText:       '#ffffff',
  infoBg:         '#e84118',
  infoText:       '#ffffff',
  glowColor:      '#e84118',
  glowOpacity:    45,
};

const GOOGLE_FONTS = {
  'Exo 2':            'Exo+2:ital,wght@0,400;0,600;0,700;0,800;1,400',
  'Oswald':           'Oswald:wght@400;600;700',
  'Bebas Neue':       'Bebas+Neue',
  'Anton':            'Anton',
  'Barlow Condensed': 'Barlow+Condensed:wght@400;600;700;800',
  'Teko':             'Teko:wght@400;500;600;700',
  'Russo One':        'Russo+One',
  'Orbitron':         'Orbitron:wght@400;700;800',
  'Play':             'Play:wght@400;700',
};

function safeInt(val, fallback) {
  if (val === undefined || val === null || val === '') return fallback;
  const n = parseInt(String(val).replace(/,/g, '.').replace(/[^0-9.\-]/g, ''), 10);
  return isNaN(n) ? fallback : n;
}

function safeFloat(val, fallback) {
  if (val === undefined || val === null || val === '') return fallback;
  const n = parseFloat(String(val).replace(/,/g, '.').replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? fallback : n;
}

function cfg(key) {
  if (typeof fieldData !== 'undefined' && fieldData[key] !== undefined && fieldData[key] !== '') {
    return fieldData[key];
  }
  return DEFAULT[key];
}

function hexToRgba(hex, opacity) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const a = Math.round(Math.min(100, Math.max(0, opacity))) / 100;
  return `rgba(${r},${g},${b},${a})`;
}

let timeLeft      = 0;
let running       = false;
let goalCurrent   = 0;
let goalTarget    = 1;
let timerInterval = null;

const elTimer     = document.getElementById('timerDisplay');
const elAlertBox  = document.getElementById('alertBox');
const elAlertType = document.getElementById('alertType');
const elAlertName = document.getElementById('alertName');
const elInfoBox   = document.getElementById('infoBox');
const elInfoText  = document.getElementById('infoBoxText');
const elGoalBox   = document.getElementById('goalBox');
const elGoalCur   = document.getElementById('goalCurrent');
const elGoalTgt   = document.getElementById('goalTarget');
const elGoalUnit  = document.getElementById('goalUnit');

// Charge une Google Font dynamiquement (Rajdhani est dans le HTML de base)
function loadFont(fontName) {
  if (fontName === 'Rajdhani') return; // déjà chargée dans widget.html
  const query = GOOGLE_FONTS[fontName];
  if (!query) return;
  if (document.querySelector(`link[data-font="${fontName}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.setAttribute('data-font', fontName);
  link.href = `https://fonts.googleapis.com/css2?family=${query}&display=swap`;
  document.head.appendChild(link);
}

// Applique la police globale à TOUTES les box via CSS variable
function applyGlobalFont() {
  const font = String(cfg('widgetFont') || DEFAULT.widgetFont);
  loadFont(font);
  document.documentElement.style.setProperty('--widget-font', `'${font}', 'Rajdhani', sans-serif`);
}

function applyAlertStyle() {
  const fontSize = safeInt(cfg('alertFontSize'), DEFAULT.alertFontSize);
  elAlertName.style.fontSize = fontSize + 'px';
  // La famille est gérée par --widget-font via CSS
}

function applyTimerSize() {
  const size = safeInt(cfg('timerFontSize'), DEFAULT.timerFontSize);
  elTimer.style.fontSize = size + 'px';
}

function init() {
  applyGlobalFont();
  applyColors();
  applyAlertStyle();
  applyTimerSize();

  timeLeft = safeInt(cfg('initialTime'), DEFAULT.initialTime);

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

  const boxBg  = hexToRgba(cfg('boxBgColor'),  safeInt(cfg('boxBgOpacity'),  DEFAULT.boxBgOpacity));
  const goalBg = hexToRgba(cfg('goalBgColor'), safeInt(cfg('goalBgOpacity'), DEFAULT.goalBgOpacity));
  const glow   = hexToRgba(cfg('glowColor'),   safeInt(cfg('glowOpacity'),   DEFAULT.glowOpacity));

  const map = {
    '--widget-width': cfg('widgetWidth'),
    '--accent':       cfg('accent'),
    '--text-accent':  cfg('accent'),
    '--timer-bg':     cfg('timerBg'),
    '--timer-text':   cfg('timerText'),
    '--goal-bg':      goalBg,
    '--goal-text':    cfg('goalText'),
    '--info-bg':      cfg('infoBg'),
    '--info-text':    cfg('infoText'),
    '--glow':         glow,
  };
  for (const [k, v] of Object.entries(map)) {
    if (v) r.style.setProperty(k, v);
  }
  elAlertBox.style.background = boxBg;
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
  elInfoText.textContent = '+' + formatTimeLabel(seconds);
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
      secsToAdd   = safeInt(cfg('timePerResub'), DEFAULT.timePerResub);
      extra       = 'x' + safeInt(data.amount, 1);
      if (cfg('goalType') === 'sub') addGoal(1);
    } else {
      secsToAdd = safeInt(cfg('timePerSub'), DEFAULT.timePerSub);
      extra     = data.tier ? 'Tier ' + Math.round(parseInt(data.tier) / 1000) : null;
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
    const secsToAdd = Math.floor(amount / perUnit) * secsEach;
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
    const secsToAdd = Math.floor(bits / perUnit) * secsEach;
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

window.addEventListener('onWidgetLoad', function(obj) {
  if (obj && obj.detail && obj.detail.fieldData) {
    window.fieldData = obj.detail.fieldData;
  }
  init();
});

if (typeof fieldData === 'undefined') {
  window.fieldData = {};
  init();
}
