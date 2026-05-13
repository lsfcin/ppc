const CATEGORIES = [
  { value: 'salmon', label: 'Formação docente',  nuclei: ['I'] },
  { value: 'blue',   label: 'Computação',         nuclei: ['II'] },
  { value: 'cyan',   label: 'Mat. / Computação',  nuclei: ['II'] },
  { value: 'green',  label: 'Matemática',          nuclei: ['II'] },
  { value: 'gray',   label: 'Optativa',            nuclei: ['II'] },
  { value: 'purple', label: 'Extensão / Projeto',  nuclei: ['III'] },
  { value: 'orange', label: 'Estágio',             nuclei: ['IV'] },
]

function ppc() {
  return {
    disciplines:          JSON.parse(JSON.stringify(DISCIPLINES_DATA)),
    atividadesAutonomas:  275,
    ordinals:             ['1º','2º','3º','4º','5º','6º','7º','8º','9º'],
    editing:              null,
    editingId:            null,
    constraintOpen:       false,
    showArrows:           false,
    _nextId:              100,
    _dragAnchor:          null,

    // ── Queries ───────────────────────────────────────────────────────────────
    disciplinesIn(p)  { return this.disciplines.filter(d => d.period === p).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) },
    byId(id)          { return this.disciplines.find(d => d.id === id) },

    // ── Computed totals ───────────────────────────────────────────────────────
    disciplineHours() { return this.disciplines.reduce((s, d) => s + d.hours, 0) },
    totalHours()      { return this.disciplineHours() + this.atividadesAutonomas },

    nucleusHours(n) {
      return this.disciplines.reduce((s, d) => {
        if (n === 'III') return s + d.extensao.hours
        return s
          + (d.teoria.nucleus  === n ? d.teoria.hours  : 0)
          + (d.pratica.nucleus === n ? d.pratica.hours : 0)
      }, 0)
    },

    // ── Period header text ────────────────────────────────────────────────────
    periodMeta(p) {
      const ds  = this.disciplinesIn(p)
      const h   = ds.reduce((s, d) => s + d.hours, 0)
      const pr  = ds.reduce((s, d) => s + d.pratica.hours, 0)
      const ex  = ds.reduce((s, d) => s + d.extensao.hours, 0)
      return `${ds.length} disc. &bull; ${h}h &bull; ${(h / 15).toFixed(1)}h/sem<br>Prática: ${pr}h &bull; Extensão: ${ex}h`
    },

    // ── Card body text ────────────────────────────────────────────────────────
    cardMeta(d) {
      const parts = []
      if (d.teoria.hours   > 0) parts.push(`Teoria: ${d.teoria.hours}h`)
      if (d.pratica.hours  > 0) parts.push(`Prática: ${d.pratica.hours}h`)
      if (d.extensao.hours > 0) parts.push(`Extensão: ${d.extensao.hours}h`)
      if (d.prerequisites.length > 0) {
        const names = d.prerequisites.map(id => this.byId(id)?.name ?? id)
        parts.push(`Pré-req.: ${names.join(', ')}`)
      }
      return parts.join(' · ')
    },

    // ── Add discipline ────────────────────────────────────────────────────────
    addDiscipline(period) {
      const id = 'new-' + (this._nextId++)
      this.disciplines.push({
        id, name: 'Nova disciplina', period, hours: 60,
        teoria:   { hours: 60, nucleus: 'II' },
        pratica:  { hours: 0,  nucleus: 'II' },
        extensao: { hours: 0,  nucleus: 'III' },
        prerequisites: [], department: 'DC',
        color: 'blue', isElective: false, eadPercent: 0,
        order: this.disciplines.filter(d => d.period === period).length,
      })
      this.$nextTick(() => this.openModal(id))
    },

    // ── Constraints (delegated to constraints.js) ─────────────────────────────
    constraints()       { return buildConstraints(this) },
    constraintSummary() { return buildConstraintSummary(this) },

    // ── Edit modal ────────────────────────────────────────────────────────────
    openModal(id) {
      const d = this.byId(id)
      if (!d) return
      this.editingId = id
      this.editing   = JSON.parse(JSON.stringify(d))
      document.getElementById('edit-modal').showModal()
    },

    closeModal() {
      this.editing   = null
      this.editingId = null
      document.getElementById('edit-modal').close()
    },

    saveEditing() {
      if (this.hoursInvalid()) return
      const idx = this.disciplines.findIndex(d => d.id === this.editingId)
      if (idx !== -1) {
        this.editing.hours = this.editing.teoria.hours + this.editing.pratica.hours + this.editing.extensao.hours
        this.disciplines[idx] = this.editing
      }
      this.closeModal()
    },

    deleteEditing() {
      this.disciplines = this.disciplines.filter(d => d.id !== this.editingId)
      this.disciplines.forEach(d => {
        d.prerequisites = d.prerequisites.filter(pid => pid !== this.editingId)
      })
      this.closeModal()
    },

    hoursInvalid() {
      if (!this.editing) return false
      const t = this.editing.teoria.hours + this.editing.pratica.hours + this.editing.extensao.hours
      return t <= 0 || t % 15 !== 0
    },

    hoursWarning() {
      if (!this.editing) return ''
      const t = this.editing.teoria.hours + this.editing.pratica.hours + this.editing.extensao.hours
      if (t <= 0)      return 'total deve ser maior que zero'
      if (t % 15 !== 0) return `${t}h não é múltiplo de 15`
      return ''
    },

    otherDisciplines() {
      if (!this.editingId) return []
      return this.disciplines
        .filter(d => d.id !== this.editingId)
        .sort((a, b) => a.period - b.period || a.name.localeCompare(b.name))
    },

    togglePrereq(id) {
      if (!this.editing) return
      const idx = this.editing.prerequisites.indexOf(id)
      if (idx === -1) this.editing.prerequisites.push(id)
      else            this.editing.prerequisites.splice(idx, 1)
    },

    availableCategories() {
      if (!this.editing) return CATEGORIES
      const used = new Set()
      if (this.editing.teoria.hours   > 0) used.add(this.editing.teoria.nucleus)
      if (this.editing.pratica.hours  > 0) used.add(this.editing.pratica.nucleus)
      if (this.editing.extensao.hours > 0) used.add('III')
      if (used.size === 0) return CATEGORIES
      return CATEGORIES.filter(c => c.nuclei.some(n => used.has(n)))
    },

    fixColor() {
      if (!this.editing) return
      const avail = this.availableCategories()
      if (!avail.some(c => c.value === this.editing.color))
        this.editing.color = avail[0]?.value ?? 'blue'
    },

    // ── Arrow overlay ─────────────────────────────────────────────────────────
    toggleArrows() {
      this.showArrows = !this.showArrows
      if (this.showArrows) this.$nextTick(() => this._drawArrows())
    },

    _drawArrows() {
      const g = document.getElementById('arrows-g')
      if (!g) return
      const wrap     = document.getElementById('grid-wrap')
      const wrapRect = wrap.getBoundingClientRect()
      const lanes    = {}

      this.disciplines.forEach(d => {
        d.prerequisites.forEach(pid => {
          const pre   = this.byId(pid)
          const srcEl = wrap.querySelector(`[data-id="${pid}"]`)
          const dstEl = wrap.querySelector(`[data-id="${d.id}"]`)
          if (!pre || !srcEl || !dstEl) return
          const key = `${pre.period}-${d.period}`
          if (!lanes[key]) lanes[key] = []
          lanes[key].push({ srcR: srcEl.getBoundingClientRect(), dstR: dstEl.getBoundingClientRect() })
        })
      })

      let paths = ''
      Object.values(lanes).forEach(group => {
        group.forEach(({ srcR, dstR }, i) => {
          const spread = (i - (group.length - 1) / 2) * 12
          const x1 = srcR.right  - wrapRect.left
          const y1 = (srcR.top + srcR.bottom) / 2 - wrapRect.top + spread
          const x2 = dstR.left   - wrapRect.left
          const y2 = (dstR.top + dstR.bottom) / 2 - wrapRect.top + spread
          const cx = (x1 + x2) / 2
          paths += `<path class="prereq-arrow" d="M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}"/>`
        })
      })
      g.innerHTML = paths
    },

    // ── Export / Import ───────────────────────────────────────────────────────
    exportJSON() {
      const blob = new Blob(
        [JSON.stringify({ disciplines: this.disciplines, atividadesAutonomas: this.atividadesAutonomas }, null, 2)],
        { type: 'application/json' }
      )
      const a    = Object.assign(document.createElement('a'), {
        href:     URL.createObjectURL(blob),
        download: `grade-lc-${new Date().toISOString().slice(0, 10)}.json`,
      })
      a.click()
      URL.revokeObjectURL(a.href)
    },

    importJSON(evt) {
      const file = evt.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const state = JSON.parse(e.target.result)
          if (state.disciplines) {
            this.disciplines = state.disciplines
            for (let p = 1; p <= 9; p++) {
              const pd = this.disciplines.filter(d => d.period === p)
              if (pd.some(d => d.order == null)) pd.forEach((d, i) => { d.order = i })
            }
          }
          if (state.atividadesAutonomas != null) this.atividadesAutonomas = state.atividadesAutonomas
          this._nextId = Math.max(...this.disciplines.map(d => parseInt(d.id.split('-').pop()) || 0)) + 1
          this.$nextTick(() => {
            this.initSortable()
            if (this.showArrows) this._drawArrows()
          })
        } catch { alert('JSON inválido') }
      }
      reader.readAsText(file)
      evt.target.value = ''
    },

    // ── Drag-and-drop ─────────────────────────────────────────────────────────
    initSortable() {
      const self = this
      for (let p = 1; p <= 9; p++) {
        const el = document.getElementById(`period-${p}`)
        if (!el || el._sortable) continue
        el._sortable = Sortable.create(el, {
          group: 'disciplines', animation: 0,
          draggable: '.course',
          ghostClass: 'sortable-ghost', dragClass: 'sortable-drag',

          onStart(evt) {
            // Capture the sibling that follows the dragged item so we can revert
            // the DOM after the drop and let Alpine be the sole DOM mover.
            const courses = [...evt.from.querySelectorAll('[data-id]')]
            self._dragAnchor = courses[evt.oldIndex + 1] || null
          },

          onEnd(evt) {
            const newPeriod = parseInt(evt.to.id.replace('period-', ''))
            const oldPeriod = parseInt(evt.from.id.replace('period-', ''))
            if (isNaN(newPeriod) || isNaN(oldPeriod)) return

            // 1. Revert SortableJS's DOM move so Alpine reconciles from a clean state.
            evt.from.insertBefore(evt.item, self._dragAnchor)

            // 2. Update the data using evt indices (no DOM reading needed).
            const movedId = evt.item.dataset.id

            if (newPeriod === oldPeriod) {
              const periodDiscs = self.disciplines
                .filter(d => d.period === newPeriod)
                .sort((a, b) => a.order - b.order)
              const from = periodDiscs.findIndex(d => d.id === movedId)
              periodDiscs.splice(evt.newIndex, 0, periodDiscs.splice(from, 1)[0])
              periodDiscs.forEach((d, i) => { d.order = i })
            } else {
              const dstDiscs = self.disciplines
                .filter(d => d.period === newPeriod)
                .sort((a, b) => a.order - b.order)
              const movedDisc = self.disciplines.find(d => d.id === movedId)
              if (!movedDisc) return
              self.disciplines
                .filter(d => d.period === oldPeriod && d.id !== movedId)
                .sort((a, b) => a.order - b.order)
                .forEach((d, i) => { d.order = i })
              movedDisc.period = newPeriod
              dstDiscs.splice(evt.newIndex, 0, movedDisc)
              dstDiscs.forEach((d, i) => { d.order = i })
            }

            // 3. Replace array reference so Alpine re-renders into the new order.
            self.disciplines = [...self.disciplines]
          },
        })
      }
    },
  }
}
