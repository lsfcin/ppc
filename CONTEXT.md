# PPC — Projeto Pedagógico de Curso (LC/UFRPE)

## Purpose
Interactive browser-based tool for redesigning the curriculum (grade curricular) of the
Licenciatura em Computação (LC) at Departamento de Computação (DC) / UFRPE.

Built to support the mandatory PPC revision driven by MEC requirements (Resolução CNE/CP Nº 4/2024
and UFRPE internal regulations). Allows coordinators and faculty to experiment with the curriculum
structure and get real-time feedback on which legal/institutional constraints are satisfied or violated.

## Stakeholders
- Lucas Figueiredo (vice-coordinator, LC/DC/UFRPE) — project lead
- DC faculty — may experiment with different configurations
- MEC compliance — all constraints derived from official legal sources (see source documents)

## Source Material
Reference documents live at:
`Academy/administration/coordenação de LC/novo PPC/`

Key files:
- `Nova Grade — Licenciatura em Computação.html` — current visual proposal for the new grade
- `Restrições Curriculares Atualizado.md` — full list of legal constraints with official citations
- `Documentos/` — PDFs of the underlying legal resolutions (CNE/CP 4/2024, CEPE/UFRPE 744/2024, etc.)

## Domain Model

### Discipline
```
{
  id: string,
  name: string,
  period: 1–9,           // semester placement
  hours: number,          // total (must be multiple of 15); equals teoria+pratica+extensao
  teoria:  { hours: number, nucleus: 'I'|'II' },
  pratica: { hours: number, nucleus: 'I'|'II' },
  extensao:{ hours: number, nucleus: 'III' },   // always III — legislation forbids double-counting
  // nucleus on the card as a whole = derived display color; no single-nucleus field
  prerequisites: id[],
  department: string,     // DC, DED, DM, DL, DLCH, …
  color: string,          // visual category key (defaults from teoria.nucleus)
  isElective: boolean,
  isEAD: boolean,
}
// Default when creating a discipline: teoria.nucleus = II, pratica.nucleus = II, extensao = 0h.
// UI shows the single-nucleus shortcut; "advanced" toggle reveals per-component nucleus selectors.
```

### Constraints (from Restrições Curriculares Atualizado.md)
| # | Rule | Target |
|---|------|--------|
| 1 | Total CH ≥ 3200h | Sum of all nuclei |
| 2 | Núcleo I = exactly 880h | Formação Geral |
| 3 | Núcleo II = exactly 1600h | Conhecimentos Específicos |
| 4 | Núcleo III = exactly 320h extensão (no ESO/TCC overlap) | Extensão |
| 5 | Núcleo IV = exactly 400h | Estágio Supervisionado |
| 6 | Atividades Autônomas ≥ 120h | Extracurricular |
| 7 | Weekly hours per period ≤ 28h (noturno) | Each period |
| 8 | All discipline hours are multiples of 15h | Each discipline |
| 9 | EaD ≤ 40% of total CH | Whole course |
| 10 | Mandatory disciplines present (list of 10 named) | Whole course |
| 11 | Prerequisites respected (prereq in earlier period) | Each discipline |

## Architecture
Single-file HTML application — no build step, no npm, no server. Users open `index.html` in a browser.
Deployed to GitHub Pages for zero-setup sharing.

### Libraries (via CDN, pinned versions)
- **Alpine.js** — reactive state and templating
- **SortableJS** — drag-and-drop between period columns
- native `<dialog>` — discipline edit modal (no extra dependency)

### Files
```
Code/ppc/
  index.html        ← the entire app (data + UI + logic)
  CONTEXT.md        ← this file
  README.md         ← minimal: what it is, how to open, GitHub Pages link
```

## Deployment
GitHub Pages on the `main` branch, root directory.
URL shared with faculty for zero-setup experimentation (browser only).

## Key Behaviors
- **WYSIWYG grid** — 9 columns (periods), discipline cards draggable between columns
- **Prerequisites** — stored as `id[]`; shown as text on the card ("Pré-req.: X, Y");
  assigned via searchable multi-select in the edit modal;
  toggle button overlays bezier-curve arrows on the grid (left→right, prereq→dependent),
  staggered vertically per column-pair to avoid full overlap — if rendering proves too messy the
  toggle is removed; extensão is always Núcleo III (read-only in modal)
- **Edit modal** — click any card: name, full hours split (teoria/prática/extensão with per-component
  nucleus selector; default single-nucleus shortcut, "advanced" toggle reveals per-component selectors);
  prerequisites multi-select; department; EaD flag
- **Nucleus allocation** — teoria and prática each carry a nucleus (I or II); extensão always III;
  card color = visual proxy derived from the nucleus of the larger component
- **Add / delete disciplines** — per-period add button; delete button on each card
- **Constraint panel** — collapsible panel anchored to the bottom; each constraint expandable to show
  detail and legal citation; displays current value vs. required for numeric constraints
- **Weekly hours convention** — 60h discipline / 15 weeks = 4h/week;
  period weekly total = sum(discipline.hours) / 15; limit 28h/week (noturno)
- **Atividades Autônomas** — separate numeric input outside the grid; must be ≥ 120h
- **Export/Import JSON** — full state serialization for saving and sharing configurations
- **Print/Export HTML** — regenerate the original static visual design for presentation
