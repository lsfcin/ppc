# SPECS — PPC Tool

## Data Model

### Discipline
```js
{
  id:            string,          // stable id (e.g. 'new-101')
  name:          string,
  period:        number,          // 1–N semester column
  hours:         number,          // total = teoria.hours + pratica.hours + extensao.hours
  teoria:        { hours: number, nucleus: string },  // an hour-group id, never the Extensão group
  pratica:       { hours: number, nucleus: string },
  extensao:      { hours: number, nucleus: 'III' },  // always the Extensão group
  prerequisites: string[],        // ids of disciplines required in earlier periods
  department:    string,          // one of state.departments
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
  nucleus: string,   // hour-group id
  locked:  boolean,  // true → name not editable; color still editable
}
```

### Hour group
`{ id, label, locked? }`. Defaults are the MEC nuclei I–IV (`groups.js`); `III` is the Extensão group, locked,
and receives every `extensao.hours`. New groups get `g-<n>`. A group cannot be deleted while a discipline
allocates hours to it, a category points to it, or an enabled rule filters by it.

### Rule
```js
{ id, fixed?, each?, scope: 'course'|'period'|'discipline',
  filter: { kind: 'all'|'category'|'group'|'department'|'theme'|'name', value },
  measure: 'hours'|'weekly'|'count'|'ead', op: 'min'|'max'|'multiple', value: number, unit: 'h'|'%',
  label, detail }
```
`unit: '%'` = percent of total course hours including atividades autônomas. A group filter counts only the
hours allocated to that group. `each` (fixed only) checks every listed filter value on its own.

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
  departments:         string[],   // dropdown list; old JSON → defaults ∪ departments in use
  groups:              HourGroup[],
  customRules:         Rule[],     // user-built, shown on top, newest first, deletable (ids r-<n>)
}
```

---

## Constraints

`buildConstraints(app)` in `constraints/panel.js` returns custom rules (newest first), then the fixed list in id order.
Code-only checks: cw1 (EaD warning), c1 (CH total ≥ 3200h), c6 (autônomas ≥ 120h), c11 (prerequisites earlier).
Every other fixed check is a Rule in `constraints/fixed-rules.js`, evaluated by `evaluateRule` in `constraints/rules.js` — the same
engine the "Criar restrição" builder writes to: c2/c3/c5 group ≥ N h, c4 Extensão ≥ 10%, c7 ≤ 28h/sem per
period, c8 multiple of 15h, c9 EaD ≤ 40%, c10 ten mandatory names (`each`), c12 no EaD in groups IV/III,
ct1–ct12 ≥ 2 disciplines per transversal theme. `tests/rules.test.js` pins the verdicts.

Name filters match substrings, except a term ending in a number ("Psicologia I") must not run on into a longer one.

---

## UI Behaviors

### Grid
- N period columns (default 9, up to 15); each header shows disc count, total hours, h/sem, prática, extensão.
- Discipline cards drag between columns via SortableJS; drop updates `d.period` and `d.order`.
- Card shows: hours chip (top-left pill), T/P/E breakdown (top-right), name, prereq names, department tag (bottom-right).
- Per-period "+" button adds a blank discipline and opens the edit modal.

### Edit Modal
- **Name** — locked when category is Optativa.
- **Department** — list from state; last option "＋ Novo departamento…" prompts for an acronym (case-insensitive dedupe).
- **Período** — dropdown.
- **Elective mode** (category = Optativa): single CH Total field + nucleus selector; prereqs, transversal themes, and skipWeekly hidden.
- **Normal mode**: Teoria / Prática / Extensão hour inputs with per-component nucleus selectors; total validated as multiple of 15.
- **Categoria / Cor** — dropdown filters to categories matching current nucleus usage; changing to Optativa auto-sets name and clears prereqs/tags.
- **Pré-requisitos** — checkbox list of other non-elective disciplines.
- **Temas Transversais** — one checkbox per theme whose constraint is enabled; section hidden when none is.
- **EaD %** — always visible; blocks save if nucleus IV or extensão > 0.

### Rule Builder
- "＋ Criar restrição" between the panel title and the list opens `#rule-modal`: Em cada · Considerando (+ qual) · Medir · Regra · Valor.
- Only valid combinations are offered (`MEASURES_BY_SCOPE`, `OPS_BY_MEASURE`; % only for course hours). A live sentence previews the rule and is the default title.
- Custom rows get "deletar" under "ver lei".

### Image Export
- "Gerar PNG" beside "Gerar PDF" (`html-to-image`). Renders a clone stripped of Alpine attributes, buttons and sidebar.

### Categories Modal
- Top section edits hour groups (add, rename, delete). Below, it lists all categories with color picker (11 swatches), editable label (locked for built-ins), nucleus selector (locked for built-ins).
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
