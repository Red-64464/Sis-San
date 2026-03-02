# 📚 Mémoire du Projet — Maths Interactif (SIS SANAA)

> Dernière mise à jour : 2 mars 2026 — Module Factorisation créé (7 onglets interactifs)

---

## 🗂️ Structure du projet

```
SIS SANAA/
├── index.html                          ← Page d'accueil (hub des matières)
├── MEMOIRE.md                          ← Ce fichier
├── vecteurs/
│   └── vecteurs_interactifs.html       ← Module vecteurs complet
└── factorisation/
    └── factorisation.html              ← Module factorisation (7 onglets)
```

---

## 🏠 index.html — Page d'accueil

### Ce qu'on a fait

- Refonte complète du design (suppression du jargon technique visible par l'élève)
- Supprimé : barre de pills "Objectif / Méthode / Astuce", panneau "Mode d'emploi", organisation de fichiers, bouton "Aller directement aux vecteurs"
- Ajouté : 4 cartes de matières avec **glow coloré** par matière, hover animé, tags visuels, bouton plein avec gradient
- Lien vers Vecteurs corrigé → `vecteurs/vecteurs_interactifs.html`
- "Prochain chapitre" remplace "Ajouter un chapitre" — grisé et désactivé pour l'élève

### Couleurs par matière

| Matière       | Couleur             | Classe CSS    |
| ------------- | ------------------- | ------------- |
| Vecteurs      | `#00f5c3` vert néon | `.m-vecteurs` |
| Factorisation | `#ff6b6b` rouge     | `.m-facto`    |
| Matrices      | `#ffd93d` jaune     | `.m-matrices` |
| Prochain      | `#a78bfa` violet    | `.m-coming`   |

### Liens actuels

- **Vecteurs** → `vecteurs/vecteurs_interactifs.html` ✅
- **Factorisation** → `factorisation/factorisation.html` ✅
- **Matrices** → `matrices/matrices.html` ⏳ (pas encore créé)

---

## 📐 vecteurs/vecteurs_interactifs.html — Module Vecteurs

### Onglets disponibles (10 au total)

| Onglet                     | data-tab        | Théorie couverte                                        |
| -------------------------- | --------------- | ------------------------------------------------------- |
| 📐 Vecteur de base         | `vecteur`       | Partie 1 — C'est quoi un vecteur                        |
| 🔗 Colinéaires             | `colineaire`    | Partie 8 — Colinéarité (déterminant)                    |
| ➕ Addition / Soustraction | `addition`      | Partie 2 — Addition + Soustraction (toggle)             |
| 📏 Norme                   | `norme`         | Norme, angle, Pythagore                                 |
| 🧪 Bac à sable             | `sandbox`       | Origines libres, drag 3 modes                           |
| 🧮 Calcul de coords        | `calcul`        | Parties 6 & 7 — Coordonnées, AB⃗, +, −, ·               |
| 👥 Représentants           | `representants` | Partie 1 — Représentants d'un vecteur                   |
| ✖️ × Scalaire              | `scalaire`      | Partie 3 — Multiplication par un scalaire + Vecteur nul |
| 📐 Figures                 | `figures`       | Partie 5 — Triangle (Chasles) + Parallélogramme         |
| ⚖️ Propriétés              | `proprietes`    | Partie 4 — Commutativité, Associativité, Distributivité |

---

### 🧪 Bac à sable — détails importants

Chaque vecteur du bac à sable a cette structure :

```js
{ ox: 0, oy: 0, x: 4, y: 2, name: "u⃗", color: "#00f5c3" }
```

- `ox, oy` = coordonnées de l'**origine** (point de départ de la flèche)
- `x, y` = **composantes** du vecteur (Δx, Δy)
- La **pointe** est à `(ox+x, oy+y)`

**3 modes de drag sur le canvas :**

1. ● **Pointe** (cercle plein) → change `x` et `y` (composantes)
2. ○ **Origine** (cercle creux) → change `ox` et `oy` (déplace le départ)
3. — **Corps** (clic sur le trait) → déplace tout le vecteur (`ox`, `oy` bougent ensemble)

**Paneau :** sliders séparés pour Origine (ox, oy) et Composantes (Δx, Δy)  
**Infos affichées :** coordonnées, norme, pointe absolue, angle  
**Max :** 8 vecteurs simultanés  
**Constantes :**

```js
const SANDBOX_COLORS = [
  "#00f5c3",
  "#ff6b6b",
  "#ffd93d",
  "#a78bfa",
  "#ff9f43",
  "#54a0ff",
  "#ff6b9d",
  "#5f27cd",
];
const SANDBOX_NAMES = ["u⃗", "v⃗", "w⃗", "t⃗", "a⃗", "b⃗", "c⃗", "d⃗"];
```

> **Dernière mise à jour : 2 mars 2026**  
> Corrections drag + fluidité + Propriétés canvas actif

---

### 🧮 Calcul de coords — détails importants

- **Pas de repère** — le canvas est caché (`layout-full` masque `.canvas-zone`)
- Saisie directe des nombres : `A⃗ ( ___ , ___ )` et `B⃗ ( ___ , ___ )` — champs `<input type="number">`
- **4 opérations** (1 à la fois, boutons) :

| Clé   | Libellé | Couleur   | Formule                        |
| ----- | ------- | --------- | ------------------------------ |
| `AB`  | AB⃗     | `#ffd93d` | `(Bx−Ax, By−Ay)`               |
| `ApB` | A⃗+B⃗   | `#a78bfa` | `(Ax+Bx, Ay+By)`               |
| `AmB` | A⃗−B⃗   | `#ff9f43` | `(Ax−Bx, Ay−By)`               |
| `dot` | A⃗·B⃗   | `#54a0ff` | `Ax×Bx + Ay×By` → **scalaire** |

- Schéma visuel style cours avec flèches empilées (fonction `buildSchema`)
- Pour le produit scalaire : note explicite que le résultat est **un nombre, pas un vecteur**

---

### Architecture JS clé

```
state = {
  tab, v1, u, v, a, b, n,        ← tabs classiques
  addMode: 'add' | 'sub',         ← toggle addition/soustraction
  sandbox: [...],                  ← bac à sable
  calcul: { A, B, op },            ← calcul coords
  representants: { x, y },         ← représentants
  scalaire: { ox, oy, x, y, k },  ← multiplication scalaire (origine libre)
  figures: { type, tri:{A,B,C}, para:{A,B,D} },
  proprietes: { a:{x,y}, b:{x,y}, c:{x,y}, k }, ← propriétés algébriques
}
```

**Tous les vecteurs classiques ont des origines libres :**

```js
v1: { ox, oy, x, y }  // vecteur de base
u, v: { ox, oy, x, y }  // colinéaire
a, b: { ox, oy, x, y }  // addition
n: { ox, oy, x, y }     // norme
scalaire: { ox, oy, x, y, k }  // scalaire
```

**Paramètres critiques du drag :**

- `eps = 2.0` unités math (zone de clic généreuse, ~50px à scale normal)
- `snap = Math.round(v * 4) / 4` = pas de 0.25 (fluide)
- `stdDrag3(obj, mx, my, eps)` = helper pour tip/origin/body
- Curseur `grab` au survol, `grabbing` pendant le drag

```
draw()            → dispatch vers drawTab*()
renderPanel()     → dispatch vers renderPanel*()
                   + toggle .layout-full pour calcul ET proprietes
applyDrag()       → modes: tip / origin / body / rep / fig_vertex
getVectorForTab() → détection du drag par tab + mode
stdDrag3()        → helper 3-mode: tip < eps, origin < eps, body < eps*0.7
updatePanelValues() → sync sliders pendant drag (sans recréer le DOM)
buildSchema()     → génère le schéma visuel HTML pour calcul
```

### Drag modes complets

| mode         | Tab                                                     | Action                                           |
| ------------ | ------------------------------------------------------- | ------------------------------------------------ |
| `tip`        | vecteur, colineaire, addition, norme, scalaire, sandbox | change les composantes (Δx, Δy) — origine libre  |
| `origin`     | vecteur, colineaire, addition, norme, scalaire, sandbox | déplace le point de départ (ox, oy)              |
| `body`       | vecteur, colineaire, addition, norme, scalaire, sandbox | déplace tout le vecteur                          |
| `rep`        | representants                                           | tire les 3 représentants (composantes partagées) |
| `fig_vertex` | figures                                                 | déplace un sommet A/B/C ou A/B/D                 |

> Le `prop_tip` mode a été supprimé — Propriétés utilise layout-full (pas de canvas).

---

### 👥 Représentants — détails

- 3 origines fixes : `(-4,-2)`, `(0,0)`, `(2,1)`
- Même vecteur (x,y) depuis les 3 origines
- Sliders pour x/y + drag des pointes
- Pédagogie : "un vecteur n'est pas attaché à un point de départ"

### ✖️ Multiplication scalaire — détails

State : `scalaire: { x, y, k }`

- Slider k de -3 à 3 (pas 0.25)
- v⃗ en vert, k×v⃗ en couleur dynamique :
  - k > 1 → jaune (allongé)
  - 0 < k < 1 → orange (réduit)
  - k < 0 → rouge (inversé)
  - k = 0 → gris (vecteur nul)
- ‖k×v⃗‖ = |k| × ‖v⃗‖ affiché
- **Vecteur nul intégré** dans ce tab (cas k=0)

### 📐 Figures — détails

State : `figures: { type, tri:{A,B,C}, para:{A,B,D} }`

**Triangle** :

- 3 sommets draggables (A vert, B rouge, C jaune)
- Affiche AB⃗, BC⃗, CA⃗
- Formule de Chasles : AB⃗ + BC⃗ + CA⃗ = 0⃗
- Relation : AB⃗ + BC⃗ = AC⃗

**Parallélogramme** :

- A, B, D draggables → C calculé automatiquement : `C = B + D - A`
- Montre AB⃗ = DC⃗, AD⃗ = BC⃗ (côtés opposés égaux)
- Diagonale : AC⃗ = AB⃗ + AD⃗

### ⚖️ Propriétés algébriques — détails

Canvas **caché** (layout-full) : pas de repère interactif, uniquement des sliders + texte.  
Affichage des vecteurs en texte stylé : `a⃗ (2, 1)`, `b⃗ (1, 3.5)`, `c⃗ (-1, 2)` avec couleurs.  
7 sliders dans le panel en grille 2 colonnes : ax, ay | bx, by | cx, cy | k (pleine largeur)  
Labels des sliders : `ax`, `ay`, `bx`, `by`, `cx`, `cy`, `k` (texte simple, pas d'unicode)

5 cartes interactives en **grille 2×3** :

1. **Commutativité** : a⃗ + b⃗ = b⃗ + a⃗ (valeurs live)
2. **Associativité** : (a⃗+b⃗)+c⃗ = a⃗+(b⃗+c⃗)
3. **Distributivité** : k(a⃗+b⃗) = ka⃗ + kb⃗
4. **Vecteur nul** : a⃗ + 0⃗ = a⃗
5. **Vecteur opposé** : a⃗ + (−a⃗) = 0⃗

### ➕ Addition / Soustraction — mise à jour

Toggle `addMode: 'add' | 'sub'` dans le panel.

- Addition : flèche jaune, parallélogramme dessiné
- Soustraction : flèche orange, a⃗ − b⃗ = a⃗ + (−b⃗)

---

## 📋 À faire / idées futures

### Pages manquantes (liens dans index.html → 404 si cliqués)

- [ ] Créer `factorisation/factorisation.html`
- [ ] Créer `matrices/matrices.html`

### Améliorations vecteurs

- [ ] Onglet **Vecteur unitaire** (v⃗ / ‖v⃗‖)
- [ ] Figures régulières (hexagone, carré avec vecteurs)
- [ ] Nommer les vecteurs dans le bac à sable (champ texte)
- [ ] Mode sombre / clair toggle

### Théorie vecteurs couverte ✅

- [x] Partie 1 — C'est quoi un vecteur (onglet Vecteur de base)
- [x] Partie 1 — Représentants (onglet 👥 Représentants)
- [x] Partie 1 — Vecteur nul (intégré dans ✖️ Scalaire + Propriétés)
- [x] Partie 2 — Addition + Soustraction (onglet ➕, toggle)
- [x] Partie 3 — Multiplication scalaire (onglet ✖️)
- [x] Partie 4 — Propriétés algébriques (onglet ⚖️)
- [x] Partie 5 — Figures (Triangle + Parallélogramme, onglet 📐)
- [x] Partie 6 — Coordonnées d'un vecteur (onglet 🧮)
- [x] Partie 7 — Calcul avec coordonnées (onglet 🧮)
- [x] Partie 8 — Colinéarité (onglet 🔗)

---

## 🎨 Charte graphique globale

```css
--bg: #070712 /* fond principal */ --panel: #0e0e20 /* fond des cartes */
  --border: #1c1c38 /* bordures */ --text: #eeeeff /* texte principal */
  --muted: #5858a0 /* texte secondaire */ /* Couleurs accent */ --green: #00f5c3
  --red: #ff6b6b --yellow: #ffd93d --purple: #a78bfa;
```

**Polices :** `Lexend` (texte) + `Space Mono` (formules, coordonnées)

---

## 🔢 factorisation/factorisation.html — Module Factorisation

### Architecture

- **Fichier unique** HTML/CSS/JS (~800 lignes)
- **Pas de canvas** — tout est en HTML pur (layout-full partout)
- **Accent :** `--accent: #ff6b6b` (rouge)
- **7 onglets** progressifs (① à ⑦)

### Onglets disponibles (7 au total)

| Onglet        | data-tab         | Contenu                                        |
| ------------- | ---------------- | ---------------------------------------------- |
| ① Distribuer  | `distributivite` | a(b+c) = ab + ac, dev ↔ fact, exercices        |
| ② Puissances  | `puissances`     | 6 règles avec exemples numériques live         |
| ③ Facteur C.  | `facteur`        | Extraction FC step-by-step, 5 niveaux, QCM     |
| ④ Identités   | `identites`      | (a+b)², (a−b)², (a+b)(a−b), reconnaissance     |
| ⑤ Binômes     | `binomes`        | Différence de carrés a²−b² = (a+b)(a−b)        |
| ⑥ Trinômes    | `trinomes`       | Discriminant Δ, racines, factorisation, exos Δ |
| ⑦ Quadrinômes | `quadrinomes`    | Regroupement par paires, 5 exemples guidés     |

### Fonctionnalités transversales

- **Mode Démonstration** — sliders pour les coefficients, expression colorée, step-by-step animé (étapes ① ② ③ ④, apparition CSS transition)
- **Mode "À toi !"** — exercices : saisie nombre (distributivité, trinômes), QCM (facteur commun, identités)
- **Score tracking** — `🔥 Série : N | ✅ ok / total` par onglet
- **Couleurs des termes** — `.c-r` (rouge), `.c-g` (vert), `.c-y` (jaune), `.c-p` (violet) pour tracer d'où vient chaque morceau
- **buildSteps()** — helper réutilisable pour le step-by-step animé dans tous les onglets

### State

```js
state = {
  tab: "distributivite",
  distributivite: { a, b, c, dir:"dev"|"fact", step, mode:"demo"|"exercice", ex, score },
  puissances: { x, n, m },
  facteur: { level:0..4, step, mode, ex, score },
  identites: { a, b, type:"carre_plus"|"carre_moins"|"diff_carres", step, mode, ex, score },
  binomes: { a, b, step },
  trinomes: { a, b, c, step, mode, ex, score },
  quadrinomes: { level:0..4, step },
}
```

### Banques d'exercices

- **FC_BANK** (5 niveaux démo) + **FC_EX_BANK** (7 QCM)
- **ID_EX_BANK** (13 expressions à reconnaître)
- **QUAD_BANK** (5 quadrinômes guidés)
- **Trinômes** : générés algorithmiquement à partir de racines entières aléatoires
- **Distributivité** : générés aléatoirement (a, b, c entiers)
