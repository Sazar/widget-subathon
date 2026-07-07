/* =============================================
   SUBATHON WIDGET v4.2
   NOUVEAUTÉS :
   - Effet burst quand une barre de goal est atteinte
   - Mode X2 : !x2on [durée] / !x2off
     · Multiplie ×2 tous les temps ajoutés
     · Badge doré centré en haut de l'alert box quand actif
     · Lié à cmdEnabled : si les commandes sont désactivées, !x2on/!x2off ne fonctionnent pas
     · Pas de préfixe dans le texte de l'alerte
   - Info box : +temps visible pendant 6s, rotation stoppée puis redémarrée proprement
   - Alert box rotation : 'Nouveau' -> 'Dernier' lors du rappel cyclique
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
  cmdX2On:        'x2on',
  cmdX2Off:       'x2off',
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
  cascadeHoldSecs: 10,
  gbar1Enabled:  false, gbar1Label:  'Objectif subs',  gbar1Type:  'sub',  gbar1Target:  100,  gbar1Color:  '#e84118',
  gbar2Enabled:  false, gbar2Label:  'Objectif tips',  gbar2Type:  'dono', gbar2Target:  500,  gbar2Color:  '#e84118',
  gbar3Enabled:  false, gbar3Label:  'Objectif bits',  gbar3Type:  'bits', gbar3Target:  10000, gbar3Color: '#e84118',
  gbar4Enabled:  false, gbar4Label:  'Objectif 4',     gbar4Type:  'sub',  gbar4Target:  200,  gbar4Color:  '#e84118',
  gbar5Enabled:  false, gbar5Label:  'Objectif 5',     gbar5Type:  'sub',  gbar5Target:  300,  gbar5Color:  '#e84118',
  gbar6Enabled:  false, gbar6Label:  'Objectif 6',     gbar6Type:  'sub',  gbar6Target:  400,  gbar6Color:  '#e84118',
  gbar7Enabled:  false, gbar7Label:  'Objectif 7',     gbar7Type:  'sub',  gbar7Target:  500,  gbar7Color:  '#e84118',
  gbar8Enabled:  false, gbar8Label:  'Objectif 8',     gbar8Type:  'sub',  gbar8Target:  600,  gbar8Color:  '#e84118',
  gbar9Enabled:  false, gbar9Label:  'Objectif 9',     gbar9Type:  'sub',  gbar9Target:  700,  gbar9Color:  '#e84118',
  gbar10Enabled: false, gbar10Label: 'Objectif 10',    gbar10Type: 'sub',  gbar10Target: 800,  gbar10Color: '#e84118',
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

const SK_TIME  = 'sa_time';
const SK_RUN   = 'sa_run';
const SK_INIT  = 'sa_init';
const SK_STAMP = 'sa_stamp';
const SK_GBAR  = function(n) { return 'sa_gbar' + n; };

const RELOAD_WINDOW_MS = 5 * 60 * 1000;
const MAX_BARS    = 10;
const MAX_VISIBLE = 3;

let CASCADE_HOLD_MS = 10000;

/* =============================================
   MODE X2
   ============================================= */
let x2Active = false;
let x2Timer  = null;

function setX2(active) {
  x2Active = active;
  const badge = document.getElementById('x2Badge');
  if (!badge) return;
  if (active) {
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
    if (x2Timer) { clearTimeout(x2Timer); x2Timer = null; }
  }
}

function applyX2(seconds) {
  return x2Active ? seconds * 2 : seconds;
}

function storeSet(key, val) {
  if (typeof SE_API !== 'undefined') SE_API.store.set(key, val);
}
function storeSave() {
  storeSet(SK_TIME,  timeLeft);
  storeSet(SK_RUN,   running ? 1 : 0);
  storeSet(SK_INIT,  parseTimeField(cfg('initialTime')));
  storeSet(SK_STAMP, Date.now());
}
function storeLoad(cb) {
  if (typeof SE_API === 'undefined') { cb(null, null, null, null); return; }
  SE_API.store.get(SK_TIME, function(t) {
    SE_API.store.get(SK_RUN, function(r) {
      SE_API.store.get(SK_INIT, function(i) {
        SE_API.store.get(SK_STAMP, function(s) {
          function toInt(v) {
            if (v === null || v === undefined || v === '') return null;
            const n = parseInt(v, 10);
            return isNaN(n) ? null : n;
          }
          cb(toInt(t), toInt(r), toInt(i), toInt(s));
        });
      });
    });
  });
}
function storeLoadGbar(n, cb) {
  if (typeof SE_API === 'undefined') { cb(null); return; }
  SE_API.store.get(SK_GBAR(n), function(v) {
    if (v === null || v === undefined || v === '') { cb(null); return; }
    const f = parseFloat(v);
    cb(isNaN(f) ? null : f);
  });
}
function storeSaveGbar(n, val) {
  storeSet(SK_GBAR(n), val);
}

function safeInt(val, fb) {
  if (val === undefined || val === null || val === '') return fb;
  const n = parseInt(String(val).replace(/[^0-9\-]/g,''), 10);
  return isNaN(n) ? fb : n;
}
function safeFloat(val, fb) {
  if (val === undefined || val === null || val === '') return fb;
  const n = parseFloat(String(val).replace(/,/g,'.').replace(/[^0-9.\-]/g,''));
  return isNaN(n) ? fb : n;
}
function cfg(key) {
  if (typeof fieldData !== 'undefined' && fieldData !== null &&
      fieldData[key] !== undefined && fieldData[key] !== null && fieldData[key] !== '')
    return fieldData[key];
  return DEFAULT[key];
}
function cfgBool(key) {
  const v = cfg(key);
  if (typeof v === 'boolean') return v;
  if (v === 'true'  || v === '1' || v === 1) return true;
  if (v === 'false' || v === '0' || v === 0) return false;
  return Boolean(DEFAULT[key]);
}
function hexToRgba(hex, opacity) {
  const h = (hex||'#000000').replace('#','');
  const r = parseInt(h.substring(0,2),16);
  const g = parseInt(h.substring(2,4),16);
  const b = parseInt(h.substring(4,6),16);
  const a = Math.round(Math.min(100,Math.max(0,opacity)))/100;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
function parseTimeField(val) {
  const s = String(val||'').trim();
  if (!s) return 0;
  const full = s.match(/^(\d+):(\d{1,2}):(\d{1,2})$/);
  if (full) return parseInt(full[1],10)*3600+parseInt(full[2],10)*60+parseInt(full[3],10);
  const short = s.match(/^(\d+):(\d{1,2})$/);
  if (short) return parseInt(short[1],10)*60+parseInt(short[2],10);
  const n = parseInt(s,10);
  return isNaN(n)?0:n;
}

function tierSeconds(prefix, tierRaw) {
  const t = String(tierRaw||'').toLowerCase();
  if (t === 'prime') return safeInt(cfg(prefix + 'Prime'), DEFAULT[prefix + 'Prime'] || 300);
  const n = safeInt(tierRaw, 1000);
  if (n >= 3000) return safeInt(cfg(prefix + 'T3'), DEFAULT[prefix + 'T3'] || 900);
  if (n >= 2000) return safeInt(cfg(prefix + 'T2'), DEFAULT[prefix + 'T2'] || 600);
  return safeInt(cfg(prefix + 'T1'), DEFAULT[prefix + 'T1'] || 300);
}

function tierLabel(tierRaw) {
  const t = String(tierRaw||'').toLowerCase();
  if (t==='prime') return 'Prime';
  const n = safeInt(tierRaw,1000);
  if (n>=3000) return 'T3';
  if (n>=2000) return 'T2';
  return 'T1';
}

function secsToLabel(s) {
  if (!s || s <= 0) return '0s';
  if (s < 60)   return s + 's';
  if (s < 3600) return Math.round(s / 60) + 'min';
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h + 'h' + (m ? m + 'min' : '');
}

// ===== ETAT =====
let timeLeft      = -1;
let running       = false;
let goalCurrent   = 0;
let goalTarget    = 1;
let timerInterval = null;
let safeCurrent   = 3600;

const gbarCurrent = {};
for (let i = 1; i <= MAX_BARS; i++) gbarCurrent[i] = 0;

let gbarOrder        = [];
let gbarWindowStart  = 0;
let gbarCascadeLocked = false;

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

function gbarEl(n, id) { return document.getElementById('gbar'+n+'-'+id); }

// ===== GÉNÉRATION DYNAMIQUE DES BARRES =====
function buildGbarDOM() {
  const container = document.getElementById('goalBarsContainer');
  if (!container) return;
  container.innerHTML = '';
  for (let n = 1; n <= MAX_BARS; n++) {
    const wrap = document.createElement('div');
    wrap.className = 'goal-bar-wrap';
    wrap.id = 'gbar' + n;
    wrap.style.display = 'none';
    wrap.innerHTML =
      '<div class="goal-bar-header">' +
        '<span class="goal-bar-label" id="gbar' + n + '-label">Objectif ' + n + '</span>' +
        '<span class="goal-bar-count">' +
          '<span id="gbar' + n + '-cur">0</span>' +
          '<span class="goal-bar-sep">/</span>' +
          '<span id="gbar' + n + '-tgt">100</span>' +
        '</span>' +
      '</div>' +
      '<div class="goal-bar-track">' +
        '<div class="goal-bar-fill" id="gbar' + n + '-fill"></div>' +
      '</div>';
    container.appendChild(wrap);
  }
}

// ===== COULEUR PAR BARRE =====
function applyGbarColor(n) {
  const fill = gbarEl(n, 'fill');
  if (!fill) return;
  const color = String(cfg('gbar'+n+'Color') || DEFAULT['gbar'+n+'Color'] || cfg('accent') || '#e84118');
  fill.style.background = color;
  fill.style.boxShadow  = '0 0 8px ' + color + '88';
  fill.style.setProperty('--bar-color', color);
}

/* =============================================
   EFFET GOAL ATTEINT
   ============================================= */
const gbarBurstDone = {};

function triggerGoalReached(n) {
  if (gbarBurstDone[n]) return;
  gbarBurstDone[n] = true;

  const wrap = document.getElementById('gbar' + n);
  if (!wrap) return;

  const color = String(cfg('gbar'+n+'Color') || DEFAULT['gbar'+n+'Color'] || cfg('accent') || '#e84118');
  wrap.style.setProperty('--bar-color', color);

  wrap.classList.remove('goal-reached');
  void wrap.offsetWidth;
  wrap.classList.add('goal-reached');

  setTimeout(function() {
    wrap.classList.remove('goal-reached');
  }, 1400);
}

// ===== CASCADE =====
function refreshCascade(animate) {
  if (!gbarOrder.length) return;
  for (let i = 0; i < gbarOrder.length; i++) {
    const n    = gbarOrder[i];
    const wrap = document.getElementById('gbar' + n);
    if (!wrap) continue;
    const inWindow = (i >= gbarWindowStart && i < gbarWindowStart + MAX_VISIBLE);
    if (inWindow) {
      if (wrap.style.display === 'none') {
        wrap.style.display = '';
        wrap.classList.remove('dimmed');
        if (animate) {
          wrap.classList.remove('slide-in');
          void wrap.offsetWidth;
          wrap.classList.add('slide-in');
        }
      }
    } else {
      wrap.style.display = 'none';
      wrap.classList.remove('slide-in', 'dimmed');
    }
  }
}

function checkCascadeAdvance() {
  if (gbarCascadeLocked) return;
  if (!gbarOrder.length) return;
  const headIdx = gbarWindowStart;
  if (headIdx >= gbarOrder.length) return;
  const headN  = gbarOrder[headIdx];
  const target = safeFloat(cfg('gbar'+headN+'Target'), 100);
  if (gbarCurrent[headN] < target) return;

  if (gbarWindowStart + 1 >= gbarOrder.length) return;

  gbarCascadeLocked = true;
  const headWrap = document.getElementById('gbar' + headN);

  if (headWrap) headWrap.classList.add('dimmed');

  setTimeout(function() {
    if (headWrap) {
      headWrap.classList.remove('dimmed');
      headWrap.classList.add('slide-out');
    }
    setTimeout(function() {
      if (headWrap) {
        headWrap.style.display = 'none';
        headWrap.classList.remove('slide-out');
      }
      gbarWindowStart = Math.min(gbarWindowStart + 1, gbarOrder.length);
      gbarCascadeLocked = false;
      refreshCascade(true);
    }, 500);
  }, CASCADE_HOLD_MS);
}

// ===== INIT BARRES =====
function initGbars() {
  gbarOrder        = [];
  gbarWindowStart  = 0;
  gbarCascadeLocked = false;

  for (let n = 1; n <= MAX_BARS; n++) {
    gbarBurstDone[n] = false;
    const wrap = document.getElementById('gbar' + n);
    if (wrap) { wrap.style.display = 'none'; wrap.classList.remove('dimmed','slide-out','goal-reached'); }
    if (!cfgBool('gbar'+n+'Enabled')) continue;

    gbarOrder.push(n);
    gbarEl(n,'label').textContent = String(cfg('gbar'+n+'Label') || 'Objectif '+n);
    gbarEl(n,'tgt').textContent   = safeFloat(cfg('gbar'+n+'Target'), 100);
    applyGbarColor(n);

    ;(function(idx) {
      storeLoadGbar(idx, function(saved) {
        gbarCurrent[idx] = (saved !== null && saved >= 0) ? saved : 0;
        updateGbar(idx);
      });
    })(n);
  }

  setTimeout(function() {
    gbarWindowStart = 0;
    for (let i = 0; i < gbarOrder.length; i++) {
      const n      = gbarOrder[i];
      const target = safeFloat(cfg('gbar'+n+'Target'), 100);
      if (gbarCurrent[n] >= target && i < gbarOrder.length - MAX_VISIBLE) {
        gbarWindowStart = i + 1;
      } else {
        break;
      }
    }
    gbarWindowStart = Math.min(gbarWindowStart, Math.max(0, gbarOrder.length - MAX_VISIBLE));
    refreshCascade(false);
  }, 800);
}

function updateGbar(n) {
  const wrap = document.getElementById('gbar'+n);
  if (!wrap) return;
  const target = safeFloat(cfg('gbar'+n+'Target'), 100);
  const cur    = gbarCurrent[n];
  const pct    = Math.min(100, (cur / target) * 100);
  gbarEl(n,'cur').textContent = Number.isInteger(cur) ? cur : cur.toFixed(2);
  const fill = gbarEl(n,'fill');
  fill.style.width = pct + '%';
  if (pct >= 100) {
    fill.classList.add('complete');
    triggerGoalReached(n);
    setTimeout(checkCascadeAdvance, 700);
  } else {
    fill.classList.remove('complete');
  }
}

function addToGbar(type, amount) {
  for (let n = 1; n <= MAX_BARS; n++) {
    if (!cfgBool('gbar'+n+'Enabled')) continue;
    const btype = String(cfg('gbar'+n+'Type') || 'sub');
    if (btype !== type) continue;
    const target = safeFloat(cfg('gbar'+n+'Target'), 100);
    gbarCurrent[n] = Math.min(target, gbarCurrent[n] + amount);
    updateGbar(n);
    storeSaveGbar(n, gbarCurrent[n]);
  }
}

// ===== QUEUE D'ALERTES =====
const QUEUE_GAP  = 2000;
const eventQueue = [];
let   queueBusy  = false;
let   lastFired  = 0;

function enqueueEvent(payload) { eventQueue.push(payload); drainQueue(); }
function drainQueue() {
  if (queueBusy || !eventQueue.length) return;
  const wait = Math.max(0, QUEUE_GAP - (Date.now() - lastFired));
  queueBusy = true;
  setTimeout(function() {
    fireEvent(eventQueue.shift());
    lastFired  = Date.now();
    queueBusy  = false;
    drainQueue();
  }, wait);
}
function fireEvent(payload) {
  const type       = payload.type;
  const name       = payload.name;
  const months     = payload.months;
  const topTier    = payload.topTier;
  const secsToAdd  = payload.secsToAdd;
  const goalAdd    = payload.goalAdd;
  const infoSecs   = payload.infoSecs;
  const gbarType   = payload.gbarType;
  const gbarAmount = payload.gbarAmount;

  if (secsToAdd)              addTime(secsToAdd);
  if (goalAdd)                addGoal(goalAdd);
  if (gbarType && gbarAmount) addToGbar(gbarType, gbarAmount);
  showInfoBox(infoSecs || 0);
  showAlert(type, name, months, topTier, true, false);
  lastEventState = {type: type, name: name, months: months, topTier: topTier};
  startIdleCycle();
}

function buildIdleText() {
  const parts=[];
  if (cfgBool('subEnabled')||cfgBool('resubEnabled')||cfgBool('giftEnabled')) parts.push('Subs');
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
const IDLE_DELAY = 60000, CYCLE_DELAY = 20000;
let lastEventState = null, idleTimer = null, cycleInterval = null, cycleShowIdle = true;
function resetIdleCycle() {
  if (idleTimer)     { clearTimeout(idleTimer);      idleTimer = null; }
  if (cycleInterval) { clearInterval(cycleInterval); cycleInterval = null; }
}
function startIdleCycle() {
  resetIdleCycle();
  if (!lastEventState) return;
  idleTimer = setTimeout(function() {
    setIdle();
    cycleInterval = setInterval(function() {
      cycleShowIdle = !cycleShowIdle;
      if (cycleShowIdle) setIdle();
      else {
        const s = lastEventState;
        /* isRepeat = true : affiche 'Dernier' au lieu de 'Nouveau' */
        showAlert(s.type, s.name, s.months, s.topTier, false, true);
      }
    }, CYCLE_DELAY);
  }, IDLE_DELAY);
}

let activeSlot = elSlotA, inactiveSlot = elSlotB;
let flipLocked = false, rotationIndex = 0;
let rotationInterval = null;
/* infoBoxPending : si un 2e event arrive pendant l'affichage du +temps,
   on stocke les secondes pour relancer showInfoBox dès la fin du délai courant */
let infoBoxPending  = null;
let infoBoxTimeout  = null;

const INFO_BOX_HOLD_MS = 6000; /* durée d'affichage du +temps */

function formatTimeLabel(s) {
  if (s < 60)   return s + 's';
  if (s < 3600) return Math.round(s / 60) + ' min';
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return h + 'h' + (m ? m + 'min' : '');
}

function buildRotationSlides() {
  return [
    'T1 +'   + formatTimeLabel(safeInt(cfg('timePerSubT1'),    DEFAULT.timePerSubT1)),
    'T2 +'   + formatTimeLabel(safeInt(cfg('timePerSubT2'),    DEFAULT.timePerSubT2)),
    'T3 +'   + formatTimeLabel(safeInt(cfg('timePerSubT3'),    DEFAULT.timePerSubT3)),
    'Prime +' + formatTimeLabel(safeInt(cfg('timePerSubPrime'), DEFAULT.timePerSubPrime)),
  ];
}

function flipTo(text, animate) {
  if (animate && flipLocked) return;
  inactiveSlot.textContent = text;
  if (!animate) {
    activeSlot.classList.remove('active','flip-out','flip-in');
    inactiveSlot.classList.remove('flip-out','flip-in');
    inactiveSlot.classList.add('active');
    var tmp = activeSlot; activeSlot = inactiveSlot; inactiveSlot = tmp;
    return;
  }
  flipLocked = true;
  activeSlot.classList.remove('active'); activeSlot.classList.add('flip-out');
  inactiveSlot.classList.remove('flip-out'); inactiveSlot.classList.add('flip-in');
  setTimeout(function() {
    activeSlot.classList.remove('flip-out');
    inactiveSlot.classList.remove('flip-in'); inactiveSlot.classList.add('active');
    var tmp = activeSlot; activeSlot = inactiveSlot; inactiveSlot = tmp;
    flipLocked = false;
  }, 320);
}

/* stopRotation / resumeRotation : pause complète de l'intervalle */
function stopRotation() {
  if (rotationInterval) { clearInterval(rotationInterval); rotationInterval = null; }
}
function resumeRotation() {
  stopRotation();
  /* on attend 5s avant le premier tick pour ne pas écraser immédiatement */
  rotationInterval = setInterval(function() {
    const slides = buildRotationSlides();
    rotationIndex = rotationIndex % slides.length;
    flipTo(slides[rotationIndex], true);
    rotationIndex = (rotationIndex + 1) % slides.length;
  }, 5000);
}

function startRotation() {
  stopRotation();
  rotationIndex = 0;
  const slides = buildRotationSlides();
  flipTo(slides[0], false); rotationIndex = 1;
  resumeRotation();
}

/* =============================================
   INFO BOX — affiche +temps et gèle la rotation
   pendant INFO_BOX_HOLD_MS, puis reprend.
   Si un nouvel event arrive entre-temps, on
   repart pour un nouveau cycle complet.
   ============================================= */
function showInfoBox(seconds) {
  /* annuler un éventuel timer en cours */
  if (infoBoxTimeout) { clearTimeout(infoBoxTimeout); infoBoxTimeout = null; }

  /* stopper la rotation pour toute la durée */
  stopRotation();

  flipTo('+' + formatTimeLabel(seconds), true);
  elInfoBox.classList.remove('pop'); void elInfoBox.offsetWidth; elInfoBox.classList.add('pop');

  infoBoxTimeout = setTimeout(function() {
    infoBoxTimeout = null;
    /* si un 2e event est arrivé pendant l'affichage, on l'enchaîne */
    if (infoBoxPending !== null) {
      const pending = infoBoxPending;
      infoBoxPending = null;
      showInfoBox(pending);
      return;
    }
    /* sinon on reprend la rotation normalement */
    resumeRotation();
  }, INFO_BOX_HOLD_MS);
}

function loadFont(fontName) {
  if (fontName === 'Rajdhani') return;
  const q = GOOGLE_FONTS[fontName]; if (!q) return;
  if (document.querySelector('link[data-font="' + fontName + '"]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.setAttribute('data-font', fontName);
  l.href = 'https://fonts.googleapis.com/css2?family=' + q + '&display=swap';
  document.head.appendChild(l);
}
function applyGlobalFont() {
  const f = String(cfg('widgetFont') || DEFAULT.widgetFont);
  loadFont(f);
  document.documentElement.style.setProperty('--widget-font', "'" + f + "', 'Rajdhani', sans-serif");
}
function applyAlertStyle() { elAlertName.dataset.eventSize = safeInt(cfg('alertFontSize'), DEFAULT.alertFontSize) + 'px'; }
function applyTimerSize()   { elTimer.style.fontSize = safeInt(cfg('timerFontSize'), DEFAULT.timerFontSize) + 'px'; }
function applyColors() {
  const root   = document.documentElement;
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
  for (const k in map) { if (map[k]) root.style.setProperty(k, map[k]); }
  elAlertBox.style.background = boxBg;
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  running = true; elTimer.style.color = '';
  timerInterval = setInterval(function() {
    if (timeLeft > 0) { timeLeft--; updateTimerDisplay(); storeSave(); }
    else { running = false; clearInterval(timerInterval); timerInterval = null; elTimer.style.color = '#ffffff99'; storeSave(); }
  }, 1000);
}
function pauseTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  running = false; storeSave();
}
function addTime(seconds) {
  if (cfgBool('lockOnZero') && timeLeft <= 0) return;
  if (timeLeft < 0) timeLeft = 0;
  timeLeft += seconds;
  const mx = parseTimeField(cfg('maxTime'));
  if (mx > 0 && timeLeft > mx) timeLeft = mx;
  if (!running && timeLeft > 0) startTimer();
  elTimer.classList.remove('pulse'); void elTimer.offsetWidth; elTimer.classList.add('pulse');
  setTimeout(function() { elTimer.classList.remove('pulse'); }, 450);
  updateTimerDisplay(); storeSave();
}
function removeTime(seconds) {
  timeLeft = Math.max(0, timeLeft - seconds);
  elTimer.classList.remove('pulse'); void elTimer.offsetWidth; elTimer.classList.add('pulse');
  setTimeout(function() { elTimer.classList.remove('pulse'); }, 450);
  updateTimerDisplay(); storeSave();
  if (timeLeft <= 0) { running = false; if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } elTimer.style.color = '#ffffff99'; }
}
function addGoal(amount) { goalCurrent = Math.min(goalTarget, goalCurrent + amount); elGoalCur.textContent = goalCurrent; }
function updateTimerDisplay() {
  if (timeLeft < 0) { elTimer.textContent = '--:--:--'; return; }
  const tl = Math.max(0, timeLeft);
  elTimer.textContent =
    String(Math.floor(tl / 3600)).padStart(2,'0') + ':' +
    String(Math.floor((tl % 3600) / 60)).padStart(2,'0') + ':' +
    String(tl % 60).padStart(2,'0');
}
function goalUnitLabel() { const t = cfg('goalType'); return t==='dono'?'€':t==='bits'?'bits':'subs'; }

/* =============================================
   ALERT BOX
   isRepeat = true  → rappel cyclique → 'Dernier'
   isRepeat = false → nouvel event    → 'Nouveau'
   ============================================= */
function showAlert(type, name, months, topTier, flash, isRepeat) {
  elAlertName.classList.remove('idle');
  elAlertName.style.fontSize = elAlertName.dataset.eventSize || '42px';

  var prefix = isRepeat ? 'Dernier' : 'Nouveau';
  var topLine = '';
  if      (type === 'sub')    topLine = prefix + ' Sub'    + (topTier ? ' ' + topTier : '');
  else if (type === 'resub')  topLine = (isRepeat ? 'Dernier' : '') + ' Réabonnement' + (topTier ? ' ' + topTier : '');
  else if (type === 'gift')   topLine = (isRepeat ? 'Dernier' : '') + ' Gift Sub'    + (topTier ? ' ' + topTier : '');
  else if (type === 'dono')   topLine = prefix + ' Don';
  else if (type === 'bits')   topLine = (isRepeat ? 'Derniers' : '') + ' Cheers';
  else if (type === 'follow') topLine = prefix + ' Follow';
  else                        topLine = type;

  /* Nettoyage des doubles espaces si le préfixe est vide */
  topLine = topLine.replace(/^\s+/, '').replace(/  +/g, ' ');

  elAlertType.textContent = topLine;

  var bottomLine = name || 'Anonyme';
  if (months !== null && months !== undefined) {
    bottomLine = (name || 'Anonyme') + ' - ' + months;
  }
  elAlertName.textContent = bottomLine;

  if (flash) {
    elAlertBox.classList.remove('flash');
    void elAlertBox.offsetWidth;
    elAlertBox.classList.add('flash');
  }
}

/* =============================================
   INIT
   ============================================= */
function init(fd) {
  if (fd) window.fieldData = fd;

  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  running = false;

  CASCADE_HOLD_MS = safeInt(cfg('cascadeHoldSecs'), DEFAULT.cascadeHoldSecs) * 1000;

  buildGbarDOM();
  applyGlobalFont(); applyColors(); applyAlertStyle(); applyTimerSize();
  goalTarget = safeFloat(cfg('goalTarget'), DEFAULT.goalTarget);
  elGoalUnit.textContent  = goalUnitLabel();
  elGoalTgt.textContent   = goalTarget;
  elGoalBox.style.display = cfgBool('goalEnabled') ? '' : 'none';
  setIdle();
  startRotation();
  initGbars();

  const rawInitial = cfg('initialTime');
  const parsed     = parseTimeField(rawInitial);
  safeCurrent      = parsed > 0 ? parsed : 3600;

  timeLeft = safeCurrent;
  elTimer.style.color = '';
  updateTimerDisplay();

  if (cfgBool('autoStart') && safeCurrent > 0) {
    startTimer();
  } else {
    storeSave();
  }

  const now = Date.now();
  storeLoad(function(savedTime, savedRun, savedInit, savedStamp) {
    const elapsed       = (savedStamp !== null) ? (now - savedStamp) : Infinity;
    const isRecent      = elapsed < RELOAD_WINDOW_MS;
    const hasSave       = savedTime !== null && savedTime >= 0;
    const initUnchanged = hasSave && savedInit !== null && savedInit === safeCurrent;

    if (isRecent && hasSave && initUnchanged) {
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      running  = false;
      timeLeft = savedTime;
      updateTimerDisplay();
      if (savedTime <= 0) {
        elTimer.style.color = '#ffffff99';
        storeSave();
      } else if (savedRun === 0) {
        storeSave();
      } else {
        startTimer();
      }
    }
  });
}

window.addEventListener('onWidgetLoad', function(obj) {
  const fd = obj && obj.detail && obj.detail.fieldData ? obj.detail.fieldData : undefined;
  init(fd);
});

let _fallbackDone = false;
setTimeout(function() {
  if (!_fallbackDone) { _fallbackDone = true; init(undefined); }
}, 1500);
window.addEventListener('onWidgetLoad', function() { _fallbackDone = true; });

let _lastEventId = null;

window.addEventListener('onEventReceived', function(obj) {
  const listener = obj.detail.listener;

  if (listener === 'message') {
    if (!cfgBool('cmdEnabled')) return;

    const data = obj.detail.event.data;
    const msg  = String(data.text||'').trim();

    if (cfgBool('cmdModOnly')) {
      const isMod = !!(data.tags && data.tags.mod === '1');
      const isBc  = (data.badges||[]).some(function(b) { return b.type === 'broadcaster'; });
      if (!isMod && !isBc) return;
    }

    const prefix = String(cfg('cmdPrefix')||'!').trim();
    if (!msg.startsWith(prefix)) return;

    const parts = msg.slice(prefix.length).trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts[1] || '';

    const al = {
      start:      String(cfg('cmdStart')      || DEFAULT.cmdStart).toLowerCase(),
      stop:       String(cfg('cmdStop')       || DEFAULT.cmdStop).toLowerCase(),
      reset:      String(cfg('cmdReset')      || DEFAULT.cmdReset).toLowerCase(),
      settime:    String(cfg('cmdSetTime')    || DEFAULT.cmdSetTime).toLowerCase(),
      addtime:    String(cfg('cmdAddTime')    || DEFAULT.cmdAddTime).toLowerCase(),
      removetime: String(cfg('cmdRemoveTime') || DEFAULT.cmdRemoveTime).toLowerCase(),
      x2on:       String(cfg('cmdX2On')       || DEFAULT.cmdX2On).toLowerCase(),
      x2off:      String(cfg('cmdX2Off')      || DEFAULT.cmdX2Off).toLowerCase(),
    };

    if (cmd === al.start)  { if (!running && timeLeft > 0) { startTimer(); storeSave(); } return; }
    if (cmd === al.stop)   { pauseTimer(); return; }
    if (cmd === al.reset)  { pauseTimer(); timeLeft = safeCurrent; updateTimerDisplay(); storeSave(); startTimer(); return; }
    if (cmd === al.settime    && arg) { const s = parseTimeField(arg); if (s > 0) { timeLeft = s; updateTimerDisplay(); storeSave(); if (!running) startTimer(); } return; }
    if (cmd === al.addtime    && arg) { const s = parseTimeField(arg); if (s > 0) addTime(s);    return; }
    if (cmd === al.removetime && arg) { const s = parseTimeField(arg); if (s > 0) removeTime(s); return; }

    if (cmd === al.x2on) {
      if (x2Timer) { clearTimeout(x2Timer); x2Timer = null; }
      setX2(true);
      if (arg) {
        const duration = parseTimeField(arg);
        if (duration > 0) {
          x2Timer = setTimeout(function() { setX2(false); }, duration * 1000);
        }
      }
      return;
    }

    if (cmd === al.x2off) {
      setX2(false);
      return;
    }

    return;
  }

  const data    = obj.detail.event;
  const eventId = listener + '_' + (data._id||data.name||'') + '_' + (data.amount||'');
  if (eventId === _lastEventId) return;
  _lastEventId = eventId;
  setTimeout(function() { if (_lastEventId === eventId) _lastEventId = null; }, 3000);

  // ===== SUB =====
  if (listener === 'subscriber-latest') {
    const isGift  = !!(data.gifted || data.isgift);
    const tierRaw = data.tier || 1000;
    const uname   = data.displayName || data.name || 'Anonyme';
    const months  = safeInt(data.months, 0) || safeInt(data.streak, 0) || 1;
    const tLabel  = tierLabel(tierRaw);

    if (isGift) {
      if (!cfgBool('giftEnabled')) return;
      const gifter  = data.gifter || data.sender || uname;
      const rawSecs = tierSeconds('timePerGift', tierRaw);
      const secs    = applyX2(rawSecs);
      enqueueEvent({ type: 'gift', name: gifter, months: '+' + secsToLabel(secs), topTier: tLabel, secsToAdd: secs, goalAdd: 1, infoSecs: secs, gbarType: 'sub', gbarAmount: 1 });
    } else if (safeInt(data.months, 0) > 1 || data.streak) {
      if (!cfgBool('resubEnabled')) return;
      const rawSecs = tierSeconds('timePerResub', tierRaw);
      const secs    = applyX2(rawSecs);
      enqueueEvent({ type: 'resub', name: uname, months: 'x' + months, topTier: tLabel, secsToAdd: secs, goalAdd: 1, infoSecs: secs, gbarType: 'sub', gbarAmount: 1 });
    } else {
      if (!cfgBool('subEnabled')) return;
      const rawSecs = tierSeconds('timePerSub', tierRaw);
      const secs    = applyX2(rawSecs);
      enqueueEvent({ type: 'sub', name: uname, months: 'x' + months, topTier: tLabel, secsToAdd: secs, goalAdd: 1, infoSecs: secs, gbarType: 'sub', gbarAmount: 1 });
    }
    return;
  }

  // ===== DON =====
  if (listener === 'tip-latest') {
    if (!cfgBool('donoEnabled')) return;
    const uname   = data.displayName || data.name || 'Anonyme';
    const amount  = safeFloat(data.amount, 0);
    const per     = safeFloat(cfg('timePerDonoPer'), DEFAULT.timePerDonoPer);
    const rawSecs = per > 0 ? Math.floor(amount / per) * safeInt(cfg('timePerDono'), DEFAULT.timePerDono) : 0;
    const secs    = applyX2(rawSecs);
    enqueueEvent({ type: 'dono', name: uname, months: amount > 0 ? amount + '€' : null, topTier: null, secsToAdd: secs, goalAdd: amount, infoSecs: secs, gbarType: 'dono', gbarAmount: amount });
    return;
  }

  // ===== BITS =====
  if (listener === 'cheer-latest') {
    if (!cfgBool('bitsEnabled')) return;
    const uname   = data.displayName || data.name || 'Anonyme';
    const amount  = safeInt(data.amount, 0);
    const per     = safeFloat(cfg('timePerBitsPer'), DEFAULT.timePerBitsPer);
    const rawSecs = per > 0 ? Math.floor(amount / per) * safeInt(cfg('timePerBits'), DEFAULT.timePerBits) : 0;
    const secs    = applyX2(rawSecs);
    enqueueEvent({ type: 'bits', name: uname, months: amount > 0 ? amount + ' bits' : null, topTier: null, secsToAdd: secs, goalAdd: amount, infoSecs: secs, gbarType: 'bits', gbarAmount: amount });
    return;
  }

  // ===== FOLLOW =====
  if (listener === 'follower-latest') {
    if (!cfgBool('followEnabled')) return;
    const uname   = data.displayName || data.name || 'Anonyme';
    const rawSecs = safeInt(cfg('timePerFollow'), DEFAULT.timePerFollow);
    const secs    = applyX2(rawSecs);
    enqueueEvent({ type: 'follow', name: uname, months: null, topTier: null, secsToAdd: secs, goalAdd: 0, infoSecs: secs, gbarType: 'follow', gbarAmount: 1 });
    return;
  }
});
