# SPECS — PPC Tool

## Data Model

### Discipline
```js
{
  id:           string,       // stable UUID
  name:         string,
  period:       1–9,          // semester column in the grid
  hours:        number,       // total; must equal teoria.hours + pratica.hours + extensao.hours
  teoria:       { hours: number, nucleus: 'I' | 'II' },
  pratica:      { hours: number, nucleus: 'I' | 'II' },
  extensao:     { hours: number, nucleus: 'III' },  // nucleus always III — no double-counting
  prerequisites: string[],   // ids of disciplines that must be in an earlier period
  department:   string,      // DC | DED | DM | DL | DLCH | …
  color:        string,      // CSS class key; visual proxy for nucleus (see Color Map)
  isElective:   boolean,
  isEAD:        boolean,
}
```

**Defaults on create:** `teoria.nucleus = 'II'`, `pratica.nucleus = 'II'`, `extensao.hours = 0`.

**Color map (nucleus → card color):**
| Color key | Meaning |
|-----------|---------|
| `yellow`  | Formação docente (Núcleo I) |
| `blue`    | Computação (Núcleo II) |
| `cyan`    | Mat. / Computação (Núcleo II) |
| `green`   | Matemática (Núcleo II) |
| `purple`  | Extensão / Projeto (Núcleo III) |
| `orange`  | Estágio (Núcleo IV) |
| `salmon`  | Métodos / TCC |
| `gray`    | Optativa |

Card color is derived from the nucleus of the component with the most hours.
If the user sets different nuclei per component, the color selector becomes manual.

### App State
```js
{
  disciplines:          Discipline[],
  atividadesAutonomas:  number,   // hours; constraint: ≥ 120
  showArrows:           boolean,  // prerequisite arrow overlay toggle
  constraintPanelOpen:  boolean,
}
```

---

## Constraints

All constraints are pure functions over `AppState`. Each returns `{ ok: boolean, current, required, detail }`.

| # | Rule | Computation |
|---|------|-------------|
| 1 | Total CH ≥ 3200h | sum(d.hours) + atividadesAutonomas |
| 2 | Núcleo I = 880h | sum of teoria.hours where teoria.nucleus='I' + pratica.hours where pratica.nucleus='I' |
| 3 | Núcleo II = 1600h | same pattern for nucleus='II' |
| 4 | Núcleo III = 320h | sum(d.extensao.hours); ESO and TCC disciplines excluded |
| 5 | Núcleo IV = 400h | sum(d.hours) for ESO disciplines |
| 6 | Atividades Autônomas ≥ 120h | atividadesAutonomas |
| 7 | Weekly hours ≤ 28h per period | sum(d.hours where d.period=p) / 15 for each p |
| 8 | All hours multiples of 15h | every d.hours % 15 === 0 |
| 9 | EaD ≤ 40% of total CH | sum(d.hours where d.isEAD) / sum(d.hours) |
| 10 | Mandatory disciplines present | name-match against fixed list of 10 (see below) |
| 11 | Prerequisites in earlier period | prereq.period < d.period for all prereq ids |

**Mandatory discipline list (constraint #10):**
Educação das Relações Étnico-Raciais, Libras, Produção de Texto Acadêmico,
Fundamentos da Educação, Educação Brasileira: legislação organização e políticas,
Didática, Psicologia I, Psicologia II, Metodologia de Ensino (conteúdo específico), ESO.

---

## UI Behaviors

### Grid
- 9 period columns; each column shows total hours, weekly hours, prática total, extensão total in its header.
- Discipline cards are draggable between columns via SortableJS; drop updates `d.period`.
- Each card shows: hours badge, name, full split (Teoria Xh · Prática Xh · Extensão Xh), prerequisite names, department tag.
- Per-period "+" button opens a blank edit modal.
- Delete button on each card removes the discipline (no confirmation — JSON export provides undo capability).

### Edit Modal (`<dialog>`)
- Fields: name, department, isElective, isEAD.
- Hours section: total hours input + teoria/prática/extensão breakdown. Live validation: teoria+prática+extensão must equal total.
- Nucleus section: default shows a single nucleus selector that applies to teoria and prática together. "Configuração avançada" toggle reveals per-component selectors (teoria.nucleus, pratica.nucleus independently). extensão.nucleus is always III and read-only.
- Prerequisites: searchable multi-select listing all other disciplines by name; selecting one adds its id to `d.prerequisites`.
- Color: auto-derived from nucleus of largest component; overridable via color picker if components split across nuclei.

### Prerequisite Arrow Overlay
- Toggle button in the toolbar shows/hides an SVG overlay covering the full grid.
- One bezier curve per prerequisite relationship, drawn from right-center of prereq card to left-center of dependent card.
- Multiple arrows between the same pair of period columns are vertically staggered.
- Arrows recompute on every state change via `getBoundingClientRect()`.
- If visual result is unacceptably cluttered after implementation, the toggle is removed entirely.

### Constraint Panel
- Sticky bar at the bottom of the page; collapsed by default (shows pass/fail badge count only).
- Expanding reveals all 11 constraints as rows: name, current value, required value, ✓/✗ status.
- Each row is further expandable to show the legal citation from `Restrições Curriculares Atualizado.md`.

### Atividades Autônomas
- Numeric input field in the page header area (outside the grid).
- Feeds directly into constraint #6.

### Export / Import
- **Export JSON**: `JSON.stringify(AppState)` → file download.
- **Import JSON**: `<input type="file">` → parse → replace state.
- **Export HTML**: reconstruct the original static visual design (matching the source HTML) as a downloadable file.

---

## Weekly Hours Convention
A 60h discipline spans a 15-week semester → 4h/week.
Period weekly total = `sum(d.hours for d in period) / 15`.
Constraint #7 flags any period where this exceeds 28h.
