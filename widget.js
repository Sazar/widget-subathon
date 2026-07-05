/* =============================================
   SUBATHON WIDGET v2.7
   ============================================= */

const DEFAULT = {
  initialTime:      '01:00:00',
  maxTime:          '00:00:00',
  autoStart:        true,
  lockOnZero:       false,
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
  cmdEnabled:     true,
  cmdPrefix:      '!',
  cmdStart:       'start',
  cmdStop:        'stop',
  cmdReset:       'reset',
  cmdSetTime:     'settime',
  cmdAddTime:     'addtime',
  cmdRemoveTime:  'removetime',
  cmdModOnly:     true,
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

/* =============================================
   PERSISTANCE
   Double stockage : SE_API.store (live) +
   localStorage (editeur + fallback)
   ============================================= */
const SK_TIME    = 'subathon_timeLeft';
const SK_RUNNING = 'subathon_running';
const SK_INIT    = 'subathon_initialSecs';

function lsSet(key, val) {
  try { localStorage.setItem(key, String(val)); } catch(e) {}
}
function lsGet(key) {
  try {
    const v = localStorage.getItem(key);
    return (v !== null && v !== '') ? v : null;
  } catch(e) { return null; }
}

function storeSave() {
  const initSecs = parseTimeField(cfg('initialTime')) || 3600;
  // localStorage — toujours disponible
  lsSet(SK_TIME,    timeLeft);
  lsSet(SK_RUNNING, running ? 1 : 0);
  lsSet(SK_INIT,    initSecs);
  // SE_API.store — live uniquement
  if (typeof SE_API !== 'undefined') {
    SE_API.store.set(SK_TIME,    timeLeft);
    SE_API.store.set(SK_RUNNING, running ? 1 : 0);
    SE_API.store.set(SK_INIT,    initSecs);
  }
}

/*
  storeLoad lit SE_API.store en priorité.
  Si vide (cas éditeur), retombe sur localStorage.
  callback(savedTime, savedRunning, savedInitSecs)
*/
function storeLoad(callback) {
  function fromLS() {
    const t = lsGet(SK_TIME);
    const r = lsGet(SK_RUNNING);
    const i = lsGet(SK_INIT);
    callback(
      t !== null ? parseInt(t, 10) : null,
      r !== null ? parseInt(r, 10) : null,
      i !== null ? parseInt(i, 10) : null
    );
  }

  if (typeof SE_API === 'undefined') { fromLS(); return; }

  SE_API.store.get(SK_TIME, function(t) {
    SE_API.store.get(SK_RUNNING, function(r) {
      SE_API.store.get(SK_INIT, function(i) {
        const seT = (t !== null && t !== undefined && t !== '') ? parseInt(t, 10) : null;
        const seR = (r !== null && r !== undefined && r !== '') ? parseInt(r, 10) : null;
        const seI = (i !== null && i !== undefined && i !== '') ? parseInt(i, 10) : null;

        if (seT !== null && !isNaN(seT)) {
          // SE_API.store a des données valides
          callback(seT, seR, seI);
        } else {
          // SE_API.store vide (editeur) → localStorage
          fromLS();
        }
      });
    });
  });
}

/* =============================================
   UTILS
   ============================================= */
function safeInt(val, fallback) {
  if (val === undefined || val === null || val === '') return fallback;
  const n = parseInt(String(val).replace(/,/g, '.').replace(/[^0-9\-]/g, ''), 10);
  return isNaN(n) ? fallback : n;
}
function safeFloat(val, fallback) {
  if (val === undefined || val === null || val === '') return fallback;
  const n = parseFloat(String(val).replace(/,/g, '.').replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? fallback : n;
}
function cfgBool(key) {
  const v = cfg(key);
  if (typeof v === 'boolean') return v;
  if (v === 'true'  || v === '1' || v === 1) return true;
  if (v === 'false' || v === '0' || v === 0) return false;
  return !!DEFAULT[key];
}
function cfg(key) {
  if (typeof fieldData !== 'undefined' && fieldData[key] !== undefined && fieldData[key] !== '')
    return fieldData[key];
  return DEFAULT[key];
}
function hexToRgba(hex, opacity) {
  const h = (hex || '#000000').replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const a = Math.round(Math.min(100, Math.max(0, opacity))) / 100;
  return `rgba(${r},${g},${b},${a})`;
}
function parseTimeField(val) {
  const s = String(val || '').trim();
  if (!s) return 0;
  const full = s.match(/^(\d+):(\d{1,2}):(\d{1,2})$/);
  if (full) return parseInt(full[1], 10) * 3600 + parseInt(full[2], 10) * 60 + parseInt(full[3], 10);
  const short = s.match(/^(\d+):(\d{1,2})$/);
  if (short) return parseInt(short[1], 10) * 60 + parseInt(short[2], 10);
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}
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

/* =============================================
   STATE
   ============================================= */
let timeLeft      = -1;
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

/* =============================================
   EVENT QUEUE
   ============================================= */
const QUEUE_GAP  = 2000;
const eventQueue = [];
let   queueBusy  = false;
let   lastFired  = 0;

function enqueueEvent(payload) {
  eventQueue.push(payload);
  drainQueue();
}
function drainQueue() {
  if (queueBusy || eventQueue.length === 0) return;
  const now  = Date.now();
  const wait = Math.max(0, QUEUE_GAP - (now - lastFired));
  queueBusy = true;
  setTimeout(() => {
    const payload = eventQueue.shift();
    fireEvent(payload);
    lastFired = Date.now();
    queueBusy = false;
    drainQueue();
  }, wait);
}
function fireEvent({ type, name, bottomExtra, topTier, secsToAdd, goalAdd, infoSecs }) {
  if (secsToAdd) addTime(secsToAdd);
  if (goalAdd)   addGoal(goalAdd);
  showInfoBox(infoSecs || 0);
  showAlert(type, name, bottomExtra, topTier, true);
  lastEventState = { type, name, bottomExtra, topTier };
  startIdleCycle();
}

/* ===== IDLE ===== */
function buildIdleText() {
  const parts = [];
  if (cfgBool('subEnabled') || cfgBool('resubEnabled') || cfgBool('giftEnabled')) parts.push('Subs');
  if (cfgBool('donoEnabled'))   parts.push('Tips');
  if (cfgBool('bitsEnabled'))   parts.push('Bits');
  if (cfgBool('followEnabled')) parts.push('Follow');
  return parts.length ? parts.join('/') : 'Subathon';
}
function setIdle() {
  elAlertType.textContent = buildIdleText();
  elAlertName.textContent = 'Pour ajouter du temps';
  elAlertName.classList.add('idle');
  elAlertName.style.fontSize = '';
}

const IDLE_DELAY  = 60 * 1000;
const CYCLE_DELAY = 20 * 1000;
let lastEventState  = null;
let idleTimer       = null;
let cycleInterval   = null;
let cycleShowIdle   = true;

function resetIdleCycle() {
  if (idleTimer)     { clearTimeout(idleTimer);      idleTimer     = null; }
  if (cycleInterval) { clearInterval(cycleInterval); cycleInterval = null; }
}
function startIdleCycle() {
  resetIdleCycle();
  if (!lastEventState) return;
  idleTimer = setTimeout(() => {
    cycleShowIdle = true;
    setIdle();
    cycleInterval = setInterval(() => {
      cycleShowIdle = !cycleShowIdle;
      if (cycleShowIdle) setIdle();
      else {
        const { type, name, bottomExtra, topTier } = lastEventState;
        showAlert(type, name, bottomExtra, topTier, false);
      }
    }, CYCLE_DELAY);
  }, IDLE_DELAY);
}

/* ===== FLIP ROTATOR ===== */
let activeSlot       = elSlotA;
let inactiveSlot     = elSlotB;
let flipLocked       = false;
let rotationLocked   = false;
let rotationIndex    = 0;
let rotationInterval = null;
let lastEventSecs    = null;

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
    'T1 +'    + formatTimeLabel(t1),
    'T2 +'    + formatTimeLabel(t2),
    'T3 +'    + formatTimeLabel(t3),
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
  elAlertName.dataset.eventSize = safeInt(cfg('alertFontSize'), DEFAULT.alertFontSize) + 'px';
}
function applyTimerSize() {
  elTimer.style.fontSize = safeInt(cfg('timerFontSize'), DEFAULT.timerFontSize) + 'px';
}
function applyColors() {
  const root  = document.documentElement;
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
    if (v) root.style.setProperty(k, v);
  }
  elAlertBox.style.background = boxBg;
}

/* =============================================
   TIMER
   ============================================= */
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  running = true;
  elTimer.style.color = '';
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
      storeSave();
    } else {
      running = false;
      clearInterval(timerInterval);
      timerInterval = null;
      elTimer.style.color = '#ffffff99';
      storeSave();
    }
  }, 1000);
}
function pauseTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  running = false;
  storeSave();
}
function addTime(seconds) {
  if (cfgBool('lockOnZero') && timeLeft <= 0) return;
  timeLeft = Math.max(0, timeLeft) + seconds;
  const maxSecs = parseTimeField(cfg('maxTime'));
  if (maxSecs > 0 && timeLeft > maxSecs) timeLeft = maxSecs;
  if (!running && timeLeft > 0) startTimer();
  elTimer.classList.remove('pulse');
  void elTimer.offsetWidth;
  elTimer.classList.add('pulse');
  setTimeout(() => elTimer.classList.remove('pulse'), 450);
  updateTimerDisplay();
  storeSave();
}
function removeTime(seconds) {
  timeLeft = Math.max(0, timeLeft - seconds);
  elTimer.classList.remove('pulse');
  void elTimer.offsetWidth;
  elTimer.classList.add('pulse');
  setTimeout(() => elTimer.classList.remove('pulse'), 450);
  updateTimerDisplay();
  storeSave();
  if (timeLeft <= 0) {
    running = false;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    elTimer.style.color = '#ffffff99';
  }
}
function addGoal(amount) {
  goalCurrent = Math.min(goalTarget, goalCurrent + amount);
  elGoalCur.textContent = goalCurrent;
}
function updateTimerDisplay() {
  if (timeLeft < 0) return;
  const tl = Math.max(0, timeLeft);
  const h  = Math.floor(tl / 3600);
  const m  = Math.floor((tl % 3600) / 60);
  const s  = tl % 60;
  elTimer.textContent =
    String(h).padStart(2, '0') + ':' +
    String(m).padStart(2, '0') + ':' +
    String(s).padStart(2, '0');
}
function goalUnitLabel() {
  const t = cfg('goalType');
  if (t === 'dono') return '€';
  if (t === 'bits') return 'bits';
  return 'subs';
}

/* ===== ALERT ===== */
const TYPE_LABELS = {
  dono:   'Nouveau Don',
  bits:   'Cheers',
  follow: 'Nouveau Follow',
};
function showAlert(type, name, bottomExtra, topTier, flash = true) {
  elAlertName.classList.remove('idle');
  elAlertName.style.fontSize = elAlertName.dataset.eventSize || '42px';
  if (topTier) {
    const baseLabel = type === 'sub'   ? 'Nouveau Sub'
                    : type === 'resub' ? 'Réabonnement'
                    : type === 'gift'  ? 'Gift Sub'
                    : (TYPE_LABELS[type] || type);
    elAlertType.textContent = baseLabel + ' ' + topTier;
  } else {
    elAlertType.textContent = TYPE_LABELS[type] || type;
  }
  elAlertName.textContent = bottomExtra ? name + ' - ' + bottomExtra : name;
  if (flash) {
    elAlertBox.classList.remove('flash');
    void elAlertBox.offsetWidth;
    elAlertBox.classList.add('flash');
  }
}

/* =============================================
   INIT
   Appelé à chaque onWidgetLoad (rechargement iframe)
   ============================================= */
function init(fd) {
  if (fd) window.fieldData = fd;

  applyGlobalFont();
  applyColors();
  applyAlertStyle();
  applyTimerSize();

  goalTarget  = safeFloat(cfg('goalTarget'), DEFAULT.goalTarget);
  goalCurrent = 0;
  elGoalUnit.textContent  = goalUnitLabel();
  elGoalTgt.textContent   = goalTarget;
  elGoalCur.textContent   = 0;
  elGoalBox.style.display = cfgBool('goalEnabled') ? '' : 'none';

  setIdle();
  startRotation();

  // Arrête le timer en cours éventuellement actif
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  running  = false;
  timeLeft = -1;

  const currentInitSecs = parseTimeField(cfg('initialTime')) || 3600;

  storeLoad(function(savedTime, savedRunning, savedInitSecs) {
    const hasSave     = savedTime !== null && !isNaN(savedTime) && savedTime >= 0;
    const initChanged = hasSave && savedInitSecs !== null && !isNaN(savedInitSecs) && savedInitSecs !== currentInitSecs;

    if (hasSave && !initChanged) {
      // Restauration après rechargement (sauvegarde paramètre SE)
      timeLeft = savedTime;
      updateTimerDisplay();
      if (savedTime > 0 && savedRunning === 1) {
        startTimer();
      } else {
        elTimer.style.color = savedTime <= 0 ? '#ffffff99' : '';
        storeSave();
      }
    } else {
      // Premier lancement OU temps initial modifié
      timeLeft = currentInitSecs;
      updateTimerDisplay();
      elTimer.style.color = '';
      if (cfgBool('autoStart') && timeLeft > 0) {
        startTimer();
      } else {
        storeSave();
      }
    }
  });
}

/* =============================================
   onWidgetLoad
   ============================================= */
window.addEventListener('onWidgetLoad', function(obj) {
  const fd = obj && obj.detail && obj.detail.fieldData ? obj.detail.fieldData : undefined;
  init(fd);
});

// Fallback si onWidgetLoad ne se déclenche pas
setTimeout(() => { if (timeLeft === -1) init(undefined); }, 1000);

/* =============================================
   CHAT COMMANDS & EVENTS
   ============================================= */
let _lastEventId = null;

window.addEventListener('onEventReceived', function(obj) {
  const listener = obj.detail.listener;

  if (listener === 'message') {
    if (!cfgBool('cmdEnabled')) return;
    const data   = obj.detail.event.data;
    const msg    = String(data.text || '').trim();
    const badges = data.badges || [];
    if (cfgBool('cmdModOnly')) {
      const isMod         = !!(data.tags && data.tags.mod === '1');
      const isBroadcaster = badges.some(b => b.type === 'broadcaster');
      if (!isMod && !isBroadcaster) return;
    }
    const prefix = String(cfg('cmdPrefix') || '!').trim();
    if (!msg.startsWith(prefix)) return;
    const parts = msg.slice(prefix.length).trim().split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const arg   = parts[1] || '';
    const al = {
      start:      String(cfg('cmdStart')      || DEFAULT.cmdStart).toLowerCase(),
      stop:       String(cfg('cmdStop')       || DEFAULT.cmdStop).toLowerCase(),
      reset:      String(cfg('cmdReset')      || DEFAULT.cmdReset).toLowerCase(),
      settime:    String(cfg('cmdSetTime')    || DEFAULT.cmdSetTime).toLowerCase(),
      addtime:    String(cfg('cmdAddTime')    || DEFAULT.cmdAddTime).toLowerCase(),
      removetime: String(cfg('cmdRemoveTime') || DEFAULT.cmdRemoveTime).toLowerCase(),
    };
    if (cmd === al.start) { if (!running && timeLeft > 0) { startTimer(); storeSave(); } return; }
    if (cmd === al.stop)  { pauseTimer(); return; }
    if (cmd === al.reset) {
      pauseTimer();
      timeLeft = parseTimeField(cfg('initialTime')) || 3600;
      updateTimerDisplay();
      storeSave();
      startTimer();
      return;
    }
    if (cmd === al.settime && arg) {
      const s = parseTimeField(arg);
      if (s > 0) { timeLeft = s; updateTimerDisplay(); storeSave(); if (!running) startTimer(); }
      return;
    }
    if (cmd === al.addtime    && arg) { const s = parseTimeField(arg); if (s > 0) addTime(s);    return; }
    if (cmd === al.removetime && arg) { const s = parseTimeField(arg); if (s > 0) removeTime(s); return; }
    return;
  }

  /* --- Subs / tips / bits / follows --- */
  const data    = obj.detail.event;
  const eventId = listener + '_' + (data._id || data.name || '') + '_' + (data.amount || '');
  if (eventId === _lastEventId) return;
  _lastEventId = eventId;
  setTimeout(() => { if (_lastEventId === eventId) _lastEventId = null; }, 3000);

  if (listener === 'subscriber-latest') {
    if (!cfgBool('subEnabled')) return;
    const isGift  = !!(data.gifted || data.isgift);
    const tierRaw = data.tier || 1000;
    const uname   = data.displayName || data.name || 'Anonyme';
    const tier    = tierLabel(tierRaw);
    const totalMonths = isGift ? 0 : safeInt(data.amount, 0);
    const isResub     = !isGift && totalMonths > 1;
    let secsToAdd = 0, type = 'sub', bottomExtra = totalMonths >= 1 ? 'x' + totalMonths : null, goalAdd = null;
    if (isGift) {
      if (!cfgBool('giftEnabled')) return;
      type = 'gift';
      const count = safeInt(data.amount, 1);
      const t     = safeInt(tierRaw, 1000);
      const key   = t >= 3000 ? 'timePerGiftT3' : t >= 2000 ? 'timePerGiftT2' : 'timePerGiftT1';
      secsToAdd   = count * safeInt(cfg(key), DEFAULT[key]);
      bottomExtra = 'x' + count;
      if (cfg('goalType') === 'sub') goalAdd = count;
    } else if (isResub) {
      if (!cfgBool('resubEnabled')) return;
      type = 'resub';
      secsToAdd = tierSeconds('timePerResub', tierRaw);
      if (cfg('goalType') === 'sub') goalAdd = 1;
    } else {
      secsToAdd = tierSeconds('timePerSub', tierRaw);
      if (cfg('goalType') === 'sub') goalAdd = 1;
    }
    enqueueEvent({ type, name: uname, bottomExtra, topTier: tier, secsToAdd, goalAdd, infoSecs: secsToAdd });
  }

  if (listener === 'tip-latest') {
    if (!cfgBool('donoEnabled')) return;
    const amount    = safeFloat(data.amount, 0);
    const secsToAdd = Math.floor(amount / safeFloat(cfg('timePerDonoPer'), DEFAULT.timePerDonoPer))
                      * safeInt(cfg('timePerDono'), DEFAULT.timePerDono);
    const uname = data.username || 'Anonyme';
    enqueueEvent({ type: 'dono', name: uname, bottomExtra: amount + '€', topTier: null, secsToAdd,
      goalAdd: cfg('goalType') === 'dono' ? amount : null, infoSecs: secsToAdd });
  }

  if (listener === 'cheer-latest') {
    if (!cfgBool('bitsEnabled')) return;
    const bits      = safeInt(data.amount, 0);
    const secsToAdd = Math.floor(bits / safeInt(cfg('timePerBitsPer'), DEFAULT.timePerBitsPer))
                      * safeInt(cfg('timePerBits'), DEFAULT.timePerBits);
    const uname = data.displayName || data.name || 'Anonyme';
    enqueueEvent({ type: 'bits', name: uname, bottomExtra: bits + ' bits', topTier: null, secsToAdd,
      goalAdd: cfg('goalType') === 'bits' ? bits : null, infoSecs: secsToAdd });
  }

  if (listener === 'follower-latest') {
    if (!cfgBool('followEnabled')) return;
    const secsToAdd = safeInt(cfg('timePerFollow'), DEFAULT.timePerFollow);
    const uname = data.displayName || data.name || 'Anonyme';
    enqueueEvent({ type: 'follow', name: uname, bottomExtra: null, topTier: null, secsToAdd,
      goalAdd: null, infoSecs: secsToAdd });
  }
});
