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
Single-file HTML app — no build step, no npm. Open `index.html` in a browser.
Deployed to GitHub Pages for zero-setup sharing.

| Library | Source | Role |
|---------|--------|------|
| Alpine.js | CDN (pinned) | Reactive state + templating |
| SortableJS | CDN (pinned) | Drag-and-drop between period columns |
| `<dialog>` | Native | Edit modal |

## Files
```
Code/ppc/
  index.html   ← entire app (data + UI + logic)
  CONTEXT.md   ← this file
  SPECS.md     ← data model, constraints, UI behavior contracts
```

## Deployment
GitHub Pages, `main` branch, root directory.
