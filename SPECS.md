# SPECS — PPC Tool

## Data Model

### Discipline
```js
{
  id:            string,          // stable id (e.g. 'new-101')
  name:          string,
  period:        number,          // 1–N semester column
  hours:         number,          // total = teoria.hours + pratica.hours + extensao.hours
  teoria:        { hours: number, nucleus: 'I'|'II'|'IV' },
  pratica:       { hours: number, nucleus: 'I'|'II'|'IV' },
  extensao:      { hours: number, nucleus: 'III' },  // nucleus always III
  prerequisites: string[],        // ids of disciplines required in earlier periods
  department:    string,          // DC | DED | DM | DL | DLCH | Outro
  color:         string,          // CSS class key matching a category value
  isElective:    boolean,         // true when category label === 'Optativa'
  eadPercent:    number,          // 0–100; % of hours delivered remotely
  skipWeekly:    boolean,         // exclude from weekly-hours constraint (ESO, TCC)
  tags:          string[],        // transversal theme ids
  order:         number,          // display order within the period column
}
```

**Defaults on create:** `teoria = {hours:60, nucleus:'II'}`, `pratica/extensao hours = 0`.

### Category
```js
{
  id:      string,   // stable (e.g. 'cat-1') — never changes even if color changes
  value:   string,   // CSS class key (e.g. 'blue', 'salmon') — can change
  label:   string,   // display name; locked for 4 built-ins
  nucleus: 'I'|'II'|'III'|'IV',
  locked:  boolean,  // true → name not editable; color still editable
}
```

**Locked categories (name fixed):** Formação docente (I), Optativa (II), Extensão (III), Estágio (IV).

### App State
```js
{
  disciplines:         Discipline[],
  categories:          Category[],
  numPeriods:          number,
  atividadesAutonomas: number,     // hours; constraint: ≥ 120
  title:               string,
  subtitle:            string,
  constraintOpen:      boolean,
  disabledConstraints: string[],   // constraint ids toggled off by the user
}
```

---

## Constraints

All constraints are computed by `buildConstraints(app)` in `constraints.js`.
Each returns `{ id, label, ok, value, detail, warn?, detailOpen }`.

| id  | Rule | Note |
|-----|------|------|
| cw1 | EaD — aviso sobre TDIC/AVA obrigatório | warn only; shown when any EaD > 0 |
| c1  | CH Total ≥ 3200h | disciplines + atividadesAutonomas |
| c2  | Núcleo I ≥ 880h | teoria/prática hours where nucleus='I' |
| c3  | Núcleo II ≥ 1600h | teoria/prática hours where nucleus='II' |
| c4  | Núcleo III ≥ 10% da CH total | extensao.hours; ESO/TCC excluded |
| c5  | Núcleo IV ≥ 400h | teoria/prática hours where nucleus='IV' |
| c6  | Atividades Autônomas ≥ 120h | atividadesAutonomas |
| c7  | Carga semanal ≤ 28h/sem por período | sum(hours)/15; skipWeekly excluded |
| c8  | CH de cada disciplina é múltiplo de 15h | d.hours % 15 === 0 |
| c9  | EaD ≤ 40% da CH total | sum(hours * eadPercent/100) / sum(hours) |
| c10 | 10 disciplinas obrigatórias presentes | name-match against fixed list |
| c11 | Pré-requisitos em períodos anteriores | prereq.period < d.period |
| c12 | EaD proibido em Estágio e Extensão | nucleus IV or extensao.hours > 0 → eadPercent must be 0 |
| ct1–ct12 | Temas transversais (≥ 2 disciplinas por tema) | d.tags includes theme.id |

**Mandatory discipline list (c10):**
Educação das Relações Étnico-Raciais, Libras, Produção de Texto,
Fundamentos da Educação, Educação Brasileira, Didática,
Psicologia I, Psicologia II, Metodologia do Ensino, Estágio.

---

## UI Behaviors

### Grid
- N period columns (default 9, up to 15); each header shows disc count, total hours, h/sem, prática, extensão.
- Discipline cards drag between columns via SortableJS; drop updates `d.period` and `d.order`.
- Card shows: hours chip (top-left pill), T/P/E breakdown (top-right), name, prereq names, department tag (bottom-right).
- Per-period "+" button adds a blank discipline and opens the edit modal.

### Edit Modal
- **Name** — locked when category is Optativa.
- **Department / Período** — free dropdowns.
- **Elective mode** (category = Optativa): single CH Total field + nucleus selector; prereqs, transversal themes, and skipWeekly hidden.
- **Normal mode**: Teoria / Prática / Extensão hour inputs with per-component nucleus selectors; total validated as multiple of 15.
- **Categoria / Cor** — dropdown filters to categories matching current nucleus usage; changing to Optativa auto-sets name and clears prereqs/tags.
- **Pré-requisitos** — checkbox list of other non-elective disciplines.
- **Temas Transversais** — 12 theme checkboxes (from `transversal-themes.js`).
- **EaD %** — always visible; blocks save if nucleus IV or extensão > 0.

### Categories Modal
- Lists all categories with color picker (11 swatches), editable label (locked for built-ins), nucleus selector (locked for built-ins).
- Saving remaps `d.color` on all disciplines atomically (single-pass) to prevent chained-swap corruption.
- Auto-sorts categories by nucleus order on save.

### Constraint Panel
- Sticky sidebar (left of content area); collapsed to 36px by default.
- Expanding shows all constraints as rows with ✓/✗/⚠ status, current value, and expandable legal citation.
- Each constraint has a toggle pill to disable it (stored in `disabledConstraints`).

### Undo / Redo
- Ctrl+Z / Ctrl+Y (or Ctrl+Shift+Z); up to 50 steps.
- Snapshots `disciplines` + `atividadesAutonomas` only (categories/periods not tracked).

### Import / Export
- **Export JSON**: prompts for filename, downloads full app state.
- **Import JSON**: file picker, replaces full state via `_applyState`.
- Format identical to `grade-curricular.json` (same top-level keys).

### Weekly Hours Convention
A 60h discipline in a 15-week semester → 4h/week.
Period weekly total = `sum(d.hours for d in period, excluding skipWeekly) / 15`.
Constraint c7 flags any period exceeding 28h/week (noturno limit).
