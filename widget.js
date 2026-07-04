/* =============================================
   SUBATHON WIDGET v2.34
   Ajout Prime Sub + Prime Resub
   ============================================= */

const DEFAULT = {
  initialTime:      3600,
  timePerSubT1:     300,
  timePerSubT2:     600,
  timePerSubT3:     900,
  timePerSubPrime:  300,
  timePerResubT1:   180,
  timePerResubT2:   360,
  timePerResubT3:   540,
  timePerResubPrime:180,
  timePerGiftT1:    300,
  timePerGiftT2:    600,
  timePerGiftT3:    900,
  timePerDono:      60,
  timePerDonoPer:   5,
  timePerBits:      30,
  timePerBitsPer:   100,
  timePerFollow:    15,
  subEnabled:     true,
  resubEnabled:   true,
  giftEnabled:    true,
  donoEnabled:    true,
  bitsEnabled:    true,
  followEnabled:  true,
  goalEnabled:    true,
  goalType:       'sub',
  goalTarget:     50,
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

let _initialized = false;

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

/* Détermine le temps à ajouter selon le tier
   Twitch envoie tier = 1000/2000/3000 ou "Prime" */
function tierSeconds(prefix, tierRaw) {
  const t = String(tierRaw || '').toLowerCase();
  if (t === 'prime') return safeInt(cfg(prefix + 'Prime'), DEFAULT[prefix + 'Prime']);
  const n = safeInt(tierRaw, 1000);
  if (n >= 3000) return safeInt(cfg(prefix + 'T3'), DEFAULT[prefix + 'T3']);
  if (n >= 2000) return safeInt(cfg(prefix + 'T2'), DEFAULT[prefix + 'T2']);
  return safeInt(cfg(prefix + 'T1'), DEFAULT[prefix + 'T1']);
}

function tierLabel(tierRaw) {
  const t = String(tierRaw || '').toLowerCase();
  if (t === 'prime') return 'Prime';
  const n = safeInt(tierRaw, 1000);
  if (n >= 3000) return 'T3';
  if (n >= 2000) return 'T2';
  return 'T1';
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
const elSlotA     = document.getElementById('infoSlotA');
const elSlotB     = document.getElementById('infoSlotB');
const elGoalBox   = document.getElementById('goalBox');
const elGoalCur   = document.getElementById('goalCurrent');
const elGoalTgt   = document.getElementById('goalTarget');
const elGoalUnit  = document.getElementById('goalUnit');

function buildIdleText() {
  const parts = [];
  if (cfg('subEnabled') || cfg('resubEnabled') || cfg('giftEnabled')) parts.push('Subs');
  if (cfg('donoEnabled'))   parts.push('Tips');
  if (cfg('bitsEnabled'))   parts.push('Bits');
  if (cfg('followEnabled')) parts.push('Follow');
  return parts.length ? parts.join('/') : 'Subathon';
}

/* ===== FLIP ROTATOR ===== */
let activeSlot     = elSlotA;
let inactiveSlot   = elSlotB;
let flipLocked     = false;
let rotationLocked = false;
let rotationIndex  = 0;
let rotationInterval = null;
let lastEventSecs  = null;

function formatTimeLabel(s) {
  if (s < 60)   return s + 's';
  if (s < 3600) return Math.round(s / 60) + ' min';
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h + 'h' + (m ? m + 'min' : '');
}

function buildRotationSlides() {
  const t1    = safeInt(cfg('timePerSubT1'),    DEFAULT.timePerSubT1);
  const t2    = safeInt(cfg('timePerSubT2'),    DEFAULT.timePerSubT2);
  const t3    = safeInt(cfg('timePerSubT3'),    DEFAULT.timePerSubT3);
  const prime = safeInt(cfg('timePerSubPrime'), DEFAULT.timePerSubPrime);
  const slides = [
    'T1 +'     + formatTimeLabel(t1),
    'T2 +'     + formatTimeLabel(t2),
    'T3 +'     + formatTimeLabel(t3),
    'Prime +' + formatTimeLabel(prime),
  ];
  if (lastEventSecs !== null) slides.push('+' + formatTimeLabel(lastEventSecs));
  return slides;
}

function flipTo(text, animate) {
  if (animate && flipLocked) return;
  inactiveSlot.textContent = text;

  if (!animate) {
    activeSlot.classList.remove('active', 'flip-out', 'flip-in');
    inactiveSlot.classList.remove('flip-out', 'flip-in');
    inactiveSlot.classList.add('active');
    [activeSlot, inactiveSlot] = [inactiveSlot, activeSlot];
    return;
  }

  flipLocked = true;
  activeSlot.classList.remove('active');
  activeSlot.classList.add('flip-out');
  inactiveSlot.classList.remove('flip-out');
  inactiveSlot.classList.add('flip-in');

  setTimeout(() => {
    activeSlot.classList.remove('flip-out');
    inactiveSlot.classList.remove('flip-in');
    inactiveSlot.classList.add('active');
    [activeSlot, inactiveSlot] = [inactiveSlot, activeSlot];
    flipLocked = false;
  }, 320);
}

function rotationTick() {
  if (rotationLocked) return;
  const slides = buildRotationSlides();
  rotationIndex = rotationIndex % slides.length;
  flipTo(slides[rotationIndex], true);
  rotationIndex = (rotationIndex + 1) % slides.length;
}

function startRotation() {
  if (rotationInterval) clearInterval(rotationInterval);
  rotationIndex  = 0;
  rotationLocked = false;
  const slides = buildRotationSlides();
  flipTo(slides[0], false);
  rotationIndex = 1;
  rotationInterval = setInterval(rotationTick, 5000);
}

function showInfoBox(seconds) {
  lastEventSecs  = seconds;
  rotationLocked = true;
  rotationIndex  = 0;
  flipTo('+' + formatTimeLabel(seconds), true);
  elInfoBox.classList.remove('pop');
  void elInfoBox.offsetWidth;
  elInfoBox.classList.add('pop');
  setTimeout(() => { rotationLocked = false; }, 6000);
}

/* ===== FONT & STYLES ===== */
function loadFont(fontName) {
  if (fontName === 'Rajdhani') return;
  const query = GOOGLE_FONTS[fontName];
  if (!query) return;
  if (document.querySelector(`link[data-font="${fontName}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.setAttribute('data-font', fontName);
  link.href = `https://fonts.googleapis.com/css2?family=${query}&display=swap`;
  document.head.appendChild(link);
}

function applyGlobalFont() {
  const font = String(cfg('widgetFont') || DEFAULT.widgetFont);
  loadFont(font);
  document.documentElement.style.setProperty('--widget-font', `'${font}', 'Rajdhani', sans-serif`);
}

function applyAlertStyle() {
  const fontSize = safeInt(cfg('alertFontSize'), DEFAULT.alertFontSize);
  elAlertName.style.fontSize = fontSize + 'px';
}

function applyTimerSize() {
  const size = safeInt(cfg('timerFontSize'), DEFAULT.timerFontSize);
  elTimer.style.fontSize = size + 'px';
}

function init() {
  if (_initialized) return;
  _initialized = true;

  applyGlobalFont();
  applyColors();
  applyAlertStyle();
  applyTimerSize();

  timeLeft    = safeInt(cfg('initialTime'), DEFAULT.initialTime);
  goalTarget  = safeFloat(cfg('goalTarget'), DEFAULT.goalTarget);
  goalCurrent = 0;

  elGoalUnit.textContent  = goalUnitLabel();
  elGoalTgt.textContent   = goalTarget;
  elGoalCur.textContent   = 0;
  elGoalBox.style.display = cfg('goalEnabled') ? '' : 'none';

  elAlertType.textContent = buildIdleText();
  elAlertName.textContent = 'Pour ajouter du temps';

  updateTimerDisplay();
  startTimer();
  startRotation();
}

function goalUnitLabel() {
  const t = cfg('goalType');
  if (t === 'dono') return '€';
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

const TYPE_LABELS = {
  sub:    'Nouvel Abonné',
  resub:  'Réabonnement',
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

/* ===== EVENTS ===== */
let _lastEventId = null;

window.addEventListener('onEventReceived', function(obj) {
  const data     = obj.detail.event;
  const listener = obj.detail.listener;

  const eventId = listener + '_' + (data._id || data.name || '') + '_' + (data.amount || data.months || '');
  if (eventId === _lastEventId) return;
  _lastEventId = eventId;
  setTimeout(() => { if (_lastEventId === eventId) _lastEventId = null; }, 3000);

  if (listener === 'subscriber-latest') {
    if (!cfg('subEnabled')) return;
    const isGift  = !!data.isgift;
    const isResub = !isGift && safeInt(data.months, 1) > 1;
    const tierRaw = data.tier || 1000;
    const uname   = data.displayName || data.name || 'Anonyme';
    let secsToAdd = 0;
    let type      = 'sub';
    let extra     = tierLabel(tierRaw);

    if (isGift) {
      if (!cfg('giftEnabled')) return;
      type = 'gift';
      const count = safeInt(data.amount, 1);
      /* Les gifts ne sont pas Prime, on utilise le tier normal */
      const t = safeInt(tierRaw, 1000);
      const key = t >= 3000 ? 'timePerGiftT3' : t >= 2000 ? 'timePerGiftT2' : 'timePerGiftT1';
      secsToAdd = count * safeInt(cfg(key), DEFAULT[key]);
      extra     = 'x' + count + ' ' + tierLabel(tierRaw);
      if (cfg('goalType') === 'sub') addGoal(count);
    } else if (isResub) {
      if (!cfg('resubEnabled')) return;
      type      = 'resub';
      secsToAdd = tierSeconds('timePerResub', tierRaw);
      extra     = 'Mois ' + safeInt(data.months, 1) + ' • ' + tierLabel(tierRaw);
      if (cfg('goalType') === 'sub') addGoal(1);
    } else {
      secsToAdd = tierSeconds('timePerSub', tierRaw);
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
    showAlert('dono', uname, amount + '€');
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

setTimeout(() => { if (!_initialized) init(); }, 500);
