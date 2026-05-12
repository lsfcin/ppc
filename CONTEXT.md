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
  hours: number,          // total (must be multiple of 15)
  teoria: number,
  pratica: number,
  extensao: number,       // subset of hours (not additive — no double-counting)
  nucleus: 'I'|'II'|'III'|'IV'|'autonoma'|'optativa',
  prerequisites: id[],
  department: string,     // DC, DED, DM, DL, DLCH, …
  color: string,          // visual category key
  isElective: boolean,
  isEAD: boolean,
}
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
- (possibly) **Floating UI** or native `<dialog>` — discipline edit modal

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
- **Edit modal** — click any card to edit name, hours split (teoria/prática/extensão), nucleus, prerequisites, department, EaD flag
- **Add / delete disciplines** — per-period or globally
- **Constraint panel** — always-visible sidebar or footer with live green/red checks for all 11 constraints
- **Export/Import JSON** — serialize the full state so configurations can be saved and shared
- **Print/Export HTML** — regenerate the original visual design for presentation purposes
