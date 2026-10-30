# Montagrade — PPC (Projeto Pedagógico de Curso) grid tool
> Interactive browser tool for drafting a UFRPE course curriculum grid; LC is the default grid
> goal: none

## Purpose
Interactive browser tool for drafting a course curriculum grid, driven by MEC requirements. Built for
Licenciatura em Computação (LC/DC/UFRPE); since the PREG meeting of 2026-10-29 it serves any UFRPE course:
departments and hour groups are editable, fixed constraints can be disabled, and new ones built.
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
GitHub Pages, `main` branch, root directory — `lsfcin.github.io/ppc`.
Mirror without the login in the URL: `ufrpe.pages.dev/montagrade` (Cloudflare Pages project `ufrpe`, direct upload — a push does NOT update it).
Redeploy after each push: `git archive HEAD index.html '*.js' '*.css' grade-curricular.json partials constraints` into `<dir>/montagrade/`, then the deploy line in [`core/tools/links/SPECS.md`](../../core/tools/links/SPECS.md) with `<project>` = `ufrpe`.

<!-- routing:start -->
## Routing

| File | Interface | API | Description |
|------|-----------|-----|-------------|
| [`ISSUES.md`](ISSUES.md) | — | — | What is currently untrue that we know about in this repo: hand-written issues first, every measured number inside its own generated block. |
| [`ROADMAP.md`](ROADMAP.md) | — | — | Montagrade — Roadmap |
| [`SPECS.md`](SPECS.md) | — | — | SPECS — PPC Tool |
| [`app.js`](app.js) | [`app.d.ts`](app.d.ts) | `ppc` | Alpine root component: curriculum state, initialization, queries, and display helpers |
| [`categories.js`](categories.js) | [`categories.d.ts`](categories.d.ts) | `ppcCategories` | Category modal state, period CRUD, and curriculum import/export |
| [`constraints/builder.js`](constraints/builder.js) | — | `ppcRuleBuilder` | Rule builder modal: draft rule, valid choice combinations, Portuguese preview sentence, save and delete |
| [`constraints/fixed-rules.js`](constraints/fixed-rules.js) | — | `fixedRules` | Fixed rules: the MEC/UFRPE Licenciatura constraints expressed as engine rules (data, not code) |
| [`constraints/panel.css`](constraints/panel.css) | — | — | Constraint sidebar and main content area layout |
| [`constraints/panel.js`](constraints/panel.js) | — | `codeChecks`, `fixedRank`, `buildConstraints`, `buildConstraintSummary` | Constraint panel list: code-only checks (cw1, c1, c6, c11), fixed and custom rules, and the summary |
| [`constraints/rules.js`](constraints/rules.js) | — | `groupHours`, `asList`, `filterMatcher`, `ruleHours`, `measure` | Constraint engine: evaluates one rule (scope · filter · measure · op · value) against the curriculum |
| [`departments.js`](departments.js) | [`departments.d.ts`](departments.d.ts) | `findDepartment`, `mergeDepartments`, `ppcDepartments` | Department list: defaults, merging on load, and the "new department" dropdown choice |
| [`disciplines.js`](disciplines.js) | [`disciplines.d.ts`](disciplines.d.ts) | `ppcDisciplines` | Discipline CRUD, elective flags, and category and theme assignments |
| [`grade-curricular.json`](grade-curricular.json) | — | — | ← add first-line comment |
| [`groups.js`](groups.js) | [`groups.d.ts`](groups.d.ts) | `mergeGroups`, `ppcGroups` | Hour groups (formerly MEC nuclei I–IV): defaults, merging on load, lookup, and staging in the categories modal |
| [`history.js`](history.js) | [`history.d.ts`](history.d.ts) | `ppcHistory` | Undo/redo history stack for curriculum state changes |
| [`image-export.js`](image-export.js) | [`image-export.d.ts`](image-export.d.ts) | `cleanClone`, `ppcImageExport` | PNG and SVG download of the page, without toolbar, add buttons and the constraint sidebar |
| [`index.html`](index.html) | — | — | Curriculum grid shell: mounts header, period columns, footer, and all partials |
| [`jsconfig.json`](jsconfig.json) | — | — | ← add first-line comment |
| [`modal.css`](modal.css) | — | — | Edit and categories dialog styles |
| [`partials/categories-modal.js`](partials/categories-modal.js) | [`partials/categories-modal.d.ts`](partials/categories-modal.d.ts) | — | Categories and period management dialog HTML |
| [`partials/constraint-panel.js`](partials/constraint-panel.js) | [`partials/constraint-panel.d.ts`](partials/constraint-panel.d.ts) | — | Constraint sidebar HTML panel |
| [`partials/edit-modal.js`](partials/edit-modal.js) | [`partials/edit-modal.d.ts`](partials/edit-modal.d.ts) | — | Edit discipline dialog HTML, injected synchronously before Alpine initializes |
| [`partials/rule-modal.js`](partials/rule-modal.js) | [`partials/rule-modal.d.ts`](partials/rule-modal.d.ts) | — | Rule builder dialog HTML: four choices and a value, read back as one Portuguese sentence |
| [`sortable.js`](sortable.js) | [`sortable.d.ts`](sortable.d.ts) | `ppcSortable` | SortableJS integration for drag-and-drop between period columns |
| [`style.css`](style.css) | — | — | Base layout, curriculum grid, discipline cards, footer, and print styles |
| [`tests/harness.js`](tests/harness.js) | [`tests/harness.d.ts`](tests/harness.d.ts) | `loadContext`, `readGrade`, `makeApp`, `panel` | Loads the browser scripts into a Node vm context and builds a ppc() app from a grade JSON |
| [`tests/rules.test.js`](tests/rules.test.js) | [`tests/rules.test.d.ts`](tests/rules.test.d.ts) | — | Engine, fixed-rule equivalence, departments, hour groups and custom rules — run with `make verify-full` |
| [`transversal-themes.js`](transversal-themes.js) | [`transversal-themes.d.ts`](transversal-themes.d.ts) | — | TRANSVERSAL_THEMES: the 12 MEC cross-cutting curriculum themes (stable constant) |
<!-- routing:end -->
