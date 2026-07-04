# 🎮 Widget Subathon — StreamElements

Widget de **Subathon / Mégathon** pour Twitch, compatible **StreamElements** et **OBS** (Browser Source).  
Design inspiré du style Volkner : **Alert Box** grande au centre, **Goal Box** en haut à droite (chiffres uniquement), **Info Box** en haut à gauche (temps ajouté), **Timer** petit en bas à droite.

---

## 🗺 Layout du widget

```
┌─────────────────────────────────────────────┐
│  [+5 min]              [$1500/2000 subs]     │
│                                              │
│         New Tier 1 Subscriber                │
│              volkner - x12                   │
│                                              │
│                              [01:23:45]      │
└─────────────────────────────────────────────┘
   ①  Info Box            ② Goal Box
   ③  Alert Box (centre)  ④ Timer (bas droite)
```

---

## ✨ Fonctionnalités

| Zone | Description |
|---|---|
| ① **Info Box** | Badge rouge en haut gauche — affiche le temps ajouté par l'événement (ex: `+5 min`) |
| ② **Goal Box** | Haut droite — affiche `valeur actuelle / objectif` sans barre, en chiffres |
| ③ **Alert Box** | Centre dominant — affiche le type d'événement + le pseudo + quantité (ex: `volkner - x12`) |
| ④ **Timer** | Petit badge rouge en bas droite — compte à rebours `HH:MM:SS` |

---

## 📁 Fichiers

```
widget-subathon/
├── widget.html     ← Structure HTML du widget
├── style.css       ← Styles visuels (thème rouge/noir)
├── widget.js       ← Logique : timer, events, goal
├── fields.json     ← Champs de config StreamElements
└── README.md       ← Ce fichier
```

---

## 🚀 Installation dans StreamElements

### Étape 1 — Créer le widget

1. Connecte-toi sur [streamelements.com](https://streamelements.com)
2. Va dans **Overlays** → **New Overlay** (ou édite un overlay existant)
3. Clique sur **Add Widget** → **Custom Widget**

### Étape 2 — Coller les fichiers

| Onglet SE | Fichier à coller |
|---|---|
| **HTML** | Contenu de `widget.html` |
| **CSS** | Contenu de `style.css` |
| **JS** | Contenu de `widget.js` |
| **Fields** | Contenu de `fields.json` |

> ⚠️ Copie **tout le contenu** de chaque fichier.

### Étape 3 — Configurer via les Fields

Une fois les fichiers collés, clique sur **Done** puis ouvre les paramètres du widget (⚙️).  
Tous les champs sont configurables sans toucher au code.

### Étape 4 — Ajouter dans OBS

1. Dans OBS, ajoute une **Browser Source**
2. Colle l'URL de ton overlay StreamElements
3. Taille recommandée : **520 × 230 px**
4. Coche **"Refresh browser when scene becomes active"**

---

## ⚙️ Paramètres disponibles

### ⏱ Timer

| Champ | Description | Défaut |
|---|---|---|
| `initialTime` | Temps de départ (secondes) | `3600` (1h) |
| `widgetWidth` | Largeur totale du widget | `520px` |

### 🌟 Subs

| Champ | Description | Défaut |
|---|---|---|
| `subEnabled` | Activer les subs | ✅ |
| `timePerSub` | Secondes par nouveau sub | `300` (5 min) |
| `resubEnabled` | Activer les resubs | ✅ |
| `timePerResub` | Secondes par resub | `180` (3 min) |
| `giftEnabled` | Activer les gift subs | ✅ |
| `timePerGift` | Secondes par gift sub (× nombre) | `300` (5 min) |

### 💰 Dons / Tips

| Champ | Description | Défaut |
|---|---|---|
| `donoEnabled` | Activer les dons | ✅ |
| `timePerDono` | Secondes par tranche | `60` (1 min) |
| `timePerDonoPer` | Tranche en € | `5` (5€ = +1 min) |

**Exemple :** Don de 15€ → 3 × 60s = **+3 minutes**

### 💎 Bits / Cheers

| Champ | Description | Défaut |
|---|---|---|
| `bitsEnabled` | Activer les bits | ✅ |
| `timePerBits` | Secondes par tranche | `30` |
| `timePerBitsPer` | Tranche de bits | `100` (100 bits = +30s) |

**Exemple :** 500 bits → 5 × 30s = **+2min30**

### ❤️ Follows

| Champ | Description | Défaut |
|---|---|---|
| `followEnabled` | Activer les follows | ✅ |
| `timePerFollow` | Secondes par follow | `15` |

### 🎯 Goal Box

| Champ | Description | Défaut |
|---|---|---|
| `goalEnabled` | Afficher la goal box | ✅ |
| `goalType` | Type : `sub`, `dono`, `bits` | `sub` |
| `goalTarget` | Objectif cible | `50` |

### 🎨 Couleurs

| Champ | Description | Défaut |
|---|---|---|
| `accent` | Couleur accent principale | `#e84118` (rouge-orange) |
| `accentDark` | Accent foncé | `#b83010` |
| `boxBg` | Fond Alert Box | `rgba(12,12,20,0.88)` |
| `boxBorder` | Bordure Alert Box | `#e84118` |
| `timerBg` | Fond Timer | `#e84118` |
| `timerText` | Texte Timer | `#ffffff` |
| `goalBg` | Fond Goal Box | `rgba(12,12,20,0.90)` |
| `goalBorder` | Bordure Goal Box | `#e84118` |
| `infoBg` | Fond Info Box | `#e84118` |
| `glow` | Couleur lueür | `rgba(232,65,24,0.45)` |

---

## 🧩 Fonctionnement technique

- Le widget écoute les événements **StreamElements** via `onEventReceived`
- **Info Box** : badge en haut gauche qui affiche le temps ajouté à chaque event (animation pop)
- **Alert Box** : affiche le dernier événement avec type (`New Tier 1 Subscriber`) + `pseudo - xN` — animation flash
- **Goal Box** : affiche `valeur/objectif` en chiffres uniquement, sans barre de progression
- **Timer** : petit badge rouge bas droite, count-down JS, animation pulse quand le temps augmente
- Configuration via `fieldData` (injecté par SE) avec fallback sur les valeurs par défaut

---

## 🔄 Changelog

### v2.0.0 — 2026-07-04
- 🎨 Refonte complète du layout — inspiré du style Volkner
- ① Info Box : badge "+X min" haut gauche avec animation pop
- ② Goal Box : chiffres uniquement (sans barre), haut droite
- ③ Alert Box : grande zone centrale avec type + pseudo + quantité
- ④ Timer : petit badge compact, bas droite
- Thème rouge-noir par défaut (accent `#e84118`)
- Suppression de l'ancien event feed scroll

### v1.0.0 — 2026-07-04
- Version initiale (timer + event feed + goal bar)

---

## 📝 Notes

- **Dons** : uniquement via **StreamElements Tip Page**
- **Bits** : Cheers Twitch détectés automatiquement
- **Taille OBS recommandée** : 520 × 230 px
- **Refresh manuel** : le timer repart de `initialTime` à chaque refresh
