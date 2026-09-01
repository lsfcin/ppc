# PPC — Projeto Pedagógico de Curso (LC/UFRPE)
> Interactive browser tool for experimenting with LC/UFRPE curriculum redesign
> goal: none

## Purpose
Interactive browser tool for experimenting with the curriculum redesign of
Licenciatura em Computação (LC/DC/UFRPE), driven by MEC requirements.
Users can move disciplines, change hours, and get real-time constraint feedback.

## Stakeholders
- Lucas Figueiredo (vice-coordinator, LC/DC/UFRPE) — project lead
- DC faculty — experimenters
- MEC compliance — legal source for all constraints

## Source Material
`academy/administration/coordenacao-lc/novo-ppc-bcc/`
- `Nova Grade — Licenciatura em Computação.html` — initial visual proposal
- `restricoes-curriculares-atualizado.md` — legal constraints with citations
- `Documentos/` — PDFs (CNE/CP 4/2024, CEPE/UFRPE 744/2024, CEPE/UFRPE 924/2025)

## Stack
No build step. Open `index.html` via a local server or GitHub Pages.
On `file://` the edit modals still work (partials injected synchronously via JS).
The default grade (`grade-curricular.json`) requires HTTP — silently skipped on `file://`.

| Library | Source | Role |
|---------|--------|------|
| Alpine.js | CDN (pinned) | Reactive state + templating |
| SortableJS | CDN (pinned) | Drag-and-drop between period columns |
| `<dialog>` | Native | Edit and categories modals |

## Deployment
GitHub Pages, `main` branch, root directory.

<!-- routing:start -->
## Routing

| File | Interface | API | Description |
|------|-----------|-----|-------------|
| [`ISSUES.md`](ISSUES.md) | — | — | What is currently untrue that we know about in this repo: hand-written issues first, every measured number inside its own generated block. |
| [`ROADMAP.md`](ROADMAP.md) | — | — | ROADMAP — PPC Tool |
| [`SPECS.md`](SPECS.md) | — | — | SPECS — PPC Tool |
| [`app.js`](app.js) | [`app.d.ts`](app.d.ts) | `ppc` | Alpine root component: curriculum state, initialization, queries, and display helpers |
| [`categories.js`](categories.js) | [`categories.d.ts`](categories.d.ts) | `ppcCategories` | Category modal state, period CRUD, and curriculum import/export |
| [`constraints.css`](constraints.css) | — | — | Constraint sidebar and main content area layout |
| [`constraints.js`](constraints.js) | [`constraints.d.ts`](constraints.d.ts) | `buildConstraints`, `buildConstraintSummary` | MEC constraint validation checks and constraint summary builder |
| [`disciplines.js`](disciplines.js) | [`disciplines.d.ts`](disciplines.d.ts) | `ppcDisciplines` | Discipline CRUD, elective flags, and category and theme assignments |
| [`history.js`](history.js) | [`history.d.ts`](history.d.ts) | `ppcHistory` | Undo/redo history stack for curriculum state changes |
| [`index.html`](index.html) | — | — | Curriculum grid shell: mounts header, period columns, footer, and all partials |
| [`modal.css`](modal.css) | — | — | Edit and categories dialog styles |
| [`partials/categories-modal.js`](partials/categories-modal.js) | — | — | Categories and period management dialog HTML |
| [`partials/constraint-panel.js`](partials/constraint-panel.js) | — | — | Constraint sidebar HTML panel |
| [`partials/edit-modal.js`](partials/edit-modal.js) | — | — | Edit discipline dialog HTML, injected synchronously before Alpine initializes |
| [`sortable.js`](sortable.js) | [`sortable.d.ts`](sortable.d.ts) | `ppcSortable` | SortableJS integration for drag-and-drop between period columns |
| [`style.css`](style.css) | — | — | Base layout, curriculum grid, discipline cards, footer, and print styles |
| [`transversal-themes.js`](transversal-themes.js) | [`transversal-themes.d.ts`](transversal-themes.d.ts) | — | TRANSVERSAL_THEMES: the 12 MEC cross-cutting curriculum themes (stable constant) |
<!-- routing:end -->
