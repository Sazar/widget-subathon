# 🎮 Widget Subathon — StreamElements

Widget de **Subathon / Mégathon** pour Twitch, compatible **StreamElements** et **OBS** (Browser Source).  
Il affiche un **timer à rebours**, une **barre de progression (goal box)**, et un **feed d'événements** qui montre en temps réel les subs, dons, bits et follows — ainsi que le temps qu'ils ajoutent.

---

## ✨ Fonctionnalités

| Fonctionnalité | Détail |
|---|---|
| ⏱ **Timer configurable** | Temps initial réglable, compte à rebours en temps réel |
| 🌟 **Subs** | Nouveaux subs, resubs et gift subs — chacun ajoute un temps paramétrable |
| 💰 **Dons / Tips** | Ajout de temps proportionnel au montant donné (tranche configurable) |
| 💎 **Bits / Cheers** | Ajout de temps par tranche de bits (ex : 30s / 100 bits) |
| ❤️ **Follows** | Ajout de temps par follow |
| 🎯 **Goal Box** | Barre de progression avec objectif en Subs, Dons ou Bits |
| 📢 **Feed d'événements** | Affiche chaque événement avec nom, type et temps ajouté |
| 🎨 **Personnalisation complète** | Couleurs, tailles, timing — tout via les champs StreamElements |

---

## 📁 Fichiers

```
widget-subathon/
├── widget.html     ← Structure HTML du widget
├── style.css       ← Styles visuels (thème violet/néon)
├── widget.js       ← Logique : timer, events, goal bar
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

Dans l'éditeur du Custom Widget, tu trouveras 4 onglets :

| Onglet | Fichier à coller |
|---|---|
| **HTML** | Contenu de `widget.html` |
| **CSS** | Contenu de `style.css` |
| **JS** | Contenu de `widget.js` |
| **Fields** | Contenu de `fields.json` |

> ⚠️ Copie **tout le contenu** de chaque fichier, y compris les balises HTML dans l'onglet HTML.

### Étape 3 — Configurer via les Fields

Une fois les fichiers collés, clique sur **Done** puis ouvre les paramètres du widget (icône engrenage).  
Tu verras tous les champs configurables classés par catégorie.

### Étape 4 — Ajouter dans OBS

1. Dans OBS, ajoute une **Browser Source**
2. Colle l'URL de ton overlay StreamElements
3. Règle la taille sur **420 × 380** px (ou adapte selon ta mise en scène)
4. Coche **"Shutdown source when not visible"** et **"Refresh browser when scene becomes active"**

---

## ⚙️ Paramètres disponibles

### ⏱ Timer

| Champ | Description | Défaut |
|---|---|---|
| `initialTime` | Temps de départ du timer (en secondes) | `3600` (1h) |
| `timerFontSize` | Taille de la police du timer | `72px` |
| `widgetWidth` | Largeur totale du widget | `420px` |

### 🌟 Subs

| Champ | Description | Défaut |
|---|---|---|
| `subEnabled` | Activer les subs | ✅ |
| `timePerSub` | Secondes ajoutées par nouveau sub | `300` (5 min) |
| `resubEnabled` | Activer les resubs | ✅ |
| `timePerResub` | Secondes ajoutées par resub | `180` (3 min) |
| `giftEnabled` | Activer les gift subs | ✅ |
| `timePerGift` | Secondes ajoutées par gift sub (× nombre de gifts) | `300` (5 min) |

### 💰 Dons / Tips

| Champ | Description | Défaut |
|---|---|---|
| `donoEnabled` | Activer les dons | ✅ |
| `timePerDono` | Secondes ajoutées par tranche de don | `60` (1 min) |
| `timePerDonoPer` | Tranche de don en € | `5` (5€ = +1 min) |

**Exemple :** Don de 15€ → 3 tranches × 60s = **+3 minutes**

### 💎 Bits / Cheers

| Champ | Description | Défaut |
|---|---|---|
| `bitsEnabled` | Activer les bits | ✅ |
| `timePerBits` | Secondes ajoutées par tranche de bits | `30` |
| `timePerBitsPer` | Tranche de bits | `100` (100 bits = +30s) |

**Exemple :** 500 bits → 5 tranches × 30s = **+2 minutes 30**

### ❤️ Follows

| Champ | Description | Défaut |
|---|---|---|
| `followEnabled` | Activer les follows | ✅ |
| `timePerFollow` | Secondes ajoutées par follow | `15` |

### 🎯 Goal Box

| Champ | Description | Défaut |
|---|---|---|
| `goalEnabled` | Afficher la goal box | ✅ |
| `goalLabel` | Titre affiché | `Objectif Subs` |
| `goalType` | Type de goal : `sub`, `dono`, `bits` | `sub` |
| `goalTarget` | Objectif à atteindre | `50` |

### 🎨 Couleurs

Toutes les couleurs sont personnalisables depuis les Fields :

- Fond, bordure et texte du **timer**
- Fond, bordure, barre de progression du **goal box**
- Fond, bordure, texte, accent des **événements**
- Couleur du **temps ajouté** (vert par défaut)
- Couleur du **glow/néon** (violet par défaut)

> Les fonds acceptent la notation `rgba()` pour la transparence.  
> La barre de progression accepte un **gradient CSS** complet.

---

## 🧩 Fonctionnement technique

- Le widget écoute les événements **StreamElements** via `window.addEventListener('onEventReceived', ...)`
- La configuration est lue depuis `fieldData` (injecté par SE) avec fallback sur les valeurs par défaut
- Le timer tourne côté client (JS `setInterval`)
- Le feed d'événements affiche les 3 derniers événements, avec animation d'entrée/sortie
- Compatible **Twitch** uniquement pour les dons (StreamElements doit être la plateforme de dons)

---

## 🔄 Changelog

### v1.0.0 — 2026-07-04
- 🎉 Version initiale
- Timer avec compte à rebours
- Support Subs, Resubs, Gift Subs, Dons, Bits, Follows
- Goal Box (Subs / Dons / Bits)
- Feed d'événements animé (3 derniers)
- Personnalisation complète via Fields StreamElements
- Thème néon violet par défaut

---

## 📝 Notes

- **Dons uniquement via StreamElements** : pour que les dons soient détectés, tu dois utiliser SE comme processeur de dons (StreamElements Tip Page).
- **Bits** : les Cheers Twitch sont détectés automatiquement.
- **Refresh manuel** : le timer repart depuis la valeur `initialTime` à chaque refresh de la page. Pour persister entre sessions, note le temps restant et mets à jour `initialTime` manuellement.

---

## 👤 Auteur

Widget créé pour la communauté Twitch francophone.  
Pour toute modification ou personnalisation supplémentaire, ouvrez une issue sur ce repo.
