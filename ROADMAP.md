# ROADMAP — PPC Tool

> ⚠️ **CHECK THIS FIRST: is this project finished?** Lucas believes it is but is not certain
> (2026-07-29). The file was emptied by commit `d8fbb07` ("clean up roadmap") and then deleted from
> the working tree without being committed — revived here from git. **Decide the project's status
> before doing any work: if done, say so on this line and stop maintaining the file. If not, the
> open items are below.**

## Status check — last known backlog vs. what now exists

The last non-empty roadmap (`e9398d7`) held items 6-15. Cross-checked against the current file map
in [CONTEXT.md](CONTEXT.md) — **most appear shipped**, which is consistent with `d8fbb07` clearing
the list on purpose:

| # | Item | Evidence it shipped |
|---|------|---------------------|
| 6 | Undo button + `ctrl+z` | `history.js` — undo/redo history stack |
| 7 | Constraints panel to the left, collapsed 90° bar | `constraints.css` — "constraint sidebar and main content area layout" |
| 8 | Print / Gerar PDF button, fixed button order | `style.css` carries print styles |
| 9 | Fix hour constraints (`>=` not `=`, Núcleo III as 10%) | `constraints.js` — `buildConstraints`, `buildConstraintSummary` |
| 10-11 | Legend colour reuse + reordering | `e9398d7` message: "legend reorder" |
| 13 | Per-discipline content tags for the transversal contents | `transversal-themes.js` — the 12 MEC cross-cutting themes |
| 14 | Edit categories / colours | `categories.js` + `partials/categories-modal.js` |
| 15 | Always load from JSON, no hardcoded grid | `CONTEXT.md` § Stack: `grade-curricular.json` default |

**Unresolved:** item 12 — the `Pré-requisitos` button did nothing, and Lucas already marked the
prerequisite arrows as *desired, not essential, ditch if troublesome*. Either the button works now
or it should be removed rather than left dead. That is the one thing to look at.

## Notes

- Constraint source of truth is MEC legislation, not this tool — see [CONTEXT.md](CONTEXT.md)
  § Source Material for the citations and PDFs.
- Deployed from `main` via GitHub Pages, root directory.
