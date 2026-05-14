# PPC — Projeto Pedagógico de Curso (LC/UFRPE)

## Purpose
Interactive browser tool for experimenting with the curriculum redesign of
Licenciatura em Computação (LC/DC/UFRPE), driven by MEC requirements.
Users can move disciplines, change hours, and get real-time constraint feedback.

## Stakeholders
- Lucas Figueiredo (vice-coordinator, LC/DC/UFRPE) — project lead
- DC faculty — experimenters
- MEC compliance — legal source for all constraints

## Source Material
`Academy/administration/coordenação de LC/novo PPC/`
- `Nova Grade — Licenciatura em Computação.html` — initial visual proposal
- `Restrições Curriculares Atualizado.md` — legal constraints with citations
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

## Files
```
Code/ppc/
  index.html              ← shell: header, grid, footer, mounts for partials
  app.js                  ← Alpine component: core state, init, queries, display helpers
  disciplines.js          ← discipline CRUD, elective/category logic
  categories.js           ← category modal, period management, import/export
  history.js              ← undo/redo
  sortable.js             ← drag-and-drop (SortableJS wiring)
  constraints.js          ← constraint checks (buildConstraints, buildConstraintSummary)
  transversal-themes.js   ← TRANSVERSAL_THEMES constant (12 themes)
  style.css               ← base, grid, cards, footer, legend, print
  modal.css               ← all dialog/modal styles
  constraints.css         ← constraint sidebar + main layout
  grade-curricular.json   ← default curriculum loaded on first visit
  partials/
    edit-modal.js         ← edit dialog HTML (injected before Alpine starts)
    categories-modal.js   ← categories dialog HTML
    constraint-panel.js   ← constraint sidebar HTML
  CONTEXT.md              ← this file
  SPECS.md                ← data model, constraints, UI behavior contracts
```

## Deployment
GitHub Pages, `main` branch, root directory.
