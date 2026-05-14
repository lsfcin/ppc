const PALETTE = ['salmon','blue','cyan','green','gray','purple','orange','yellow']

function ppc() {
  return {
    disciplines:          [],
    atividadesAutonomas:  275,
    numPeriods:           9,
    ordinals:             ['1º','2º','3º','4º','5º','6º','7º','8º','9º','10º','11º','12º','13º','14º','15º'],
    editing:              null,
    editingId:            null,
    constraintOpen:       false,
    title:    'Proposta para a grade de LC',
    subtitle: 'Licenciatura em Computação — arraste disciplinas entre períodos para experimentar a grade.',
    categories: [
      { value:'salmon', label:'Formação docente', nucleus:'I',   locked: true },
      { value:'blue',   label:'Computação',        nucleus:'II'  },
      { value:'cyan',   label:'Mat. / Computação', nucleus:'II'  },
      { value:'green',  label:'Matemática',         nucleus:'II'  },
      { value:'gray',   label:'Optativa',           nucleus:'II',  locked: true },
      { value:'purple', label:'Extensão',           nucleus:'III', locked: true },
      { value:'orange', label:'Estágio',            nucleus:'IV',  locked: true },
    ],
    _stagingCategories: null,
    _nextId:              100,
    _dragAnchor:          null,
    _history:             [],
    _future:              [],
    disabledConstraints:  [],

    // ── Bootstrap ─────────────────────────────────────────────────────────────
    async init() {
      // 1. Restore from browser storage (survives reloads)
      const saved = localStorage.getItem('ppc-state')
      if (saved) {
        try { this._applyState(JSON.parse(saved)) } catch {}
      }
      // 2. Fetch default grade (works on HTTPS / GitHub Pages; silent on file://)
      if (this.disciplines.length === 0) {
        try {
          const res = await fetch('grade-curricular.json')
          if (res.ok) this._applyState(await res.json())
        } catch {}
      }
      // 3. Set up sortable + reactive auto-save watchers
      this.$nextTick(() => {
        this.initSortable()
        this.$watch('atividadesAutonomas', () => this.saveProgress())
        this.$watch('title',               () => this.saveProgress())
        this.$watch('subtitle',            () => this.saveProgress())
      })
    },

    _applyState(state) {
      if (state.disciplines) {
        this.disciplines = state.disciplines
        const periods = [...new Set(this.disciplines.map(d => d.period))]
        periods.forEach(p => {
          const pd = this.disciplines.filter(d => d.period === p)
          if (pd.some(d => d.order == null)) pd.forEach((d, i) => { d.order = i })
        })
      }
      if (state.numPeriods          != null) this.numPeriods          = state.numPeriods
      if (state.atividadesAutonomas != null) this.atividadesAutonomas = state.atividadesAutonomas
      if (state.categories) {
        this.categories = state.categories
        const LOCKED = { salmon: true, gray: true, purple: true, orange: true }
        this.categories.forEach(c => { if (LOCKED[c.value]) c.locked = true })
      }
      if (state.title)                       this.title               = state.title
      if (state.subtitle)                    this.subtitle            = state.subtitle
      if (state.disabledConstraints)         this.disabledConstraints = state.disabledConstraints
      this._nextId = Math.max(99, ...this.disciplines.map(d => parseInt(d.id.split('-').pop()) || 0)) + 1
    },

    saveProgress() {
      localStorage.setItem('ppc-state', JSON.stringify({
        disciplines:          this.disciplines,
        atividadesAutonomas:  this.atividadesAutonomas,
        numPeriods:           this.numPeriods,
        categories:           this.categories,
        title:                this.title,
        subtitle:             this.subtitle,
        disabledConstraints:  this.disabledConstraints,
      }))
    },

    toggleConstraint(id) {
      const idx = this.disabledConstraints.indexOf(id)
      if (idx === -1) this.disabledConstraints.push(id)
      else            this.disabledConstraints.splice(idx, 1)
      this.saveProgress()
    },

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

    // ── Card chip ─────────────────────────────────────────────────────────────
    hrsChip(d) {
      const parts = []
      if (d.teoria.hours   > 0) parts.push(`T${d.teoria.hours}`)
      if (d.pratica.hours  > 0) parts.push(`P${d.pratica.hours}`)
      if (d.extensao.hours > 0) parts.push(`E${d.extensao.hours}`)
      const breakdown = parts.join(' ')
      const mode = d.eadPercent > 0 ? `${d.eadPercent}% ead` : 'presencial'
      const suffix = breakdown ? `${breakdown} | ${mode}` : mode
      return `${d.hours}h<span style="font-weight:400"> | ${suffix}</span>`
    },

    // ── Card body text ────────────────────────────────────────────────────────
    cardMeta(d) {
      const parts = []
      if (d.prerequisites.length > 0) {
        const names = d.prerequisites.map(id => this.byId(id)?.name ?? id)
        parts.push(`Pré-req.: ${names.join(', ')}`)
      }
      return parts.join(' · ')
    },

    // ── Undo ─────────────────────────────────────────────────────────────────
    _snapshot() {
      return {
        disciplines:         JSON.parse(JSON.stringify(this.disciplines)),
        atividadesAutonomas: this.atividadesAutonomas,
      }
    },

    _pushHistory() {
      this._history.push(this._snapshot())
      if (this._history.length > 50) this._history.shift()
      this._future = []
    },

    undo() {
      if (this._history.length === 0) return
      this._future.push(this._snapshot())
      const prev = this._history.pop()
      this.disciplines         = prev.disciplines
      this.atividadesAutonomas = prev.atividadesAutonomas
      this.$nextTick(() => this.initSortable())
      this.saveProgress()
    },

    redo() {
      if (this._future.length === 0) return
      this._history.push(this._snapshot())
      const next = this._future.pop()
      this.disciplines         = next.disciplines
      this.atividadesAutonomas = next.atividadesAutonomas
      this.$nextTick(() => this.initSortable())
      this.saveProgress()
    },

    printPDF() { window.print() },

    // ── Add discipline ────────────────────────────────────────────────────────
    addDiscipline(period) {
      this._pushHistory()
      const id = 'new-' + (this._nextId++)
      this.disciplines.push({
        id, name: 'Nova disciplina', period, hours: 60,
        teoria:   { hours: 60, nucleus: 'II' },
        pratica:  { hours: 0,  nucleus: 'II' },
        extensao: { hours: 0,  nucleus: 'III' },
        prerequisites: [], department: 'DC',
        color: 'blue', isElective: false, eadPercent: 0, skipWeekly: false, tags: [],
        order: this.disciplines.filter(d => d.period === period).length,
      })
      this.saveProgress()
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
      this._pushHistory()
      const idx = this.disciplines.findIndex(d => d.id === this.editingId)
      if (idx !== -1) {
        this.editing.hours = this.editing.teoria.hours + this.editing.pratica.hours + this.editing.extensao.hours
        this.editing.tags  = this.editing.tags ?? []
        this.editing.isElective = this.isOptativaColor(this.editing.color)
        this.disciplines[idx] = this.editing
      }
      this.closeModal()
      this.saveProgress()
    },

    deleteEditing() {
      this._pushHistory()
      this.disciplines = this.disciplines.filter(d => d.id !== this.editingId)
      this.disciplines.forEach(d => {
        d.prerequisites = d.prerequisites.filter(pid => pid !== this.editingId)
      })
      this.closeModal()
      this.saveProgress()
    },

    hoursInvalid() {
      if (!this.editing) return false
      const t = this.editing.teoria.hours + this.editing.pratica.hours + this.editing.extensao.hours
      return t <= 0 || t % 15 !== 0
    },

    hoursWarning() {
      if (!this.editing) return ''
      const t = this.editing.teoria.hours + this.editing.pratica.hours + this.editing.extensao.hours
      if (t <= 0)       return 'total deve ser maior que zero'
      if (t % 15 !== 0) return `${t}h não é múltiplo de 15`
      return ''
    },

    transversalThemes() { return TRANSVERSAL_THEMES },

    toggleTag(id) {
      if (!this.editing) return
      if (!this.editing.tags) this.editing.tags = []
      const idx = this.editing.tags.indexOf(id)
      if (idx === -1) this.editing.tags.push(id)
      else            this.editing.tags.splice(idx, 1)
    },

    otherDisciplines() {
      if (!this.editingId) return []
      return this.disciplines
        .filter(d => d.id !== this.editingId && !d.isElective)
        .sort((a, b) => a.period - b.period || a.name.localeCompare(b.name))
    },

    togglePrereq(id) {
      if (!this.editing) return
      const idx = this.editing.prerequisites.indexOf(id)
      if (idx === -1) this.editing.prerequisites.push(id)
      else            this.editing.prerequisites.splice(idx, 1)
    },

    availableCategories() {
      if (!this.editing) return this.categories
      const used = new Set()
      if (this.editing.teoria.hours   > 0) used.add(this.editing.teoria.nucleus)
      if (this.editing.pratica.hours  > 0) used.add(this.editing.pratica.nucleus)
      if (this.editing.extensao.hours > 0) used.add('III')
      if (used.size === 0) return this.categories
      return this.categories.filter(c => used.has(c.nucleus))
    },

    fixColor() {
      if (!this.editing) return
      const avail = this.availableCategories()
      if (!avail.some(c => c.value === this.editing.color))
        this.editing.color = avail[0]?.value ?? 'blue'
    },

    isOptativaColor(colorVal) {
      return !!this.categories.find(c => c.value === colorVal && c.label === 'Optativa')
    },

    onColorChange() {
      if (!this.editing) return
      if (this.isOptativaColor(this.editing.color)) {
        this.editing.name = 'Optativa'
        this.editing.isElective = true
      } else {
        this.editing.isElective = false
      }
    },

    // ── Categories modal ──────────────────────────────────────────────────────
    openCategoriesModal() {
      this._stagingCategories = JSON.parse(JSON.stringify(this.categories))
      document.getElementById('categories-modal').showModal()
    },

    saveCategoriesModal() {
      this._pushHistory()
      this.categories = this._stagingCategories
      this._stagingCategories = null
      document.getElementById('categories-modal').close()
      this.saveProgress()
    },

    closeCategoriesModal() {
      this._stagingCategories = null
      document.getElementById('categories-modal').close()
    },

    addStagingCategory() {
      const used  = new Set(this._stagingCategories.map(c => c.value))
      const color = PALETTE.find(c => !used.has(c)) ?? 'blue'
      this._stagingCategories.push({ value: color, label: 'Nova categoria', nucleus: 'II' })
    },

    deleteStagingCategory(idx) { this._stagingCategories.splice(idx, 1) },

    inUseCount(value) { return this.disciplines.filter(d => d.color === value).length },

    // ── Period management ─────────────────────────────────────────────────────
    addPeriod() {
      this._pushHistory()
      this.numPeriods++
      this.$nextTick(() => this.initSortable())
      this.saveProgress()
    },

    removeLastPeriod() {
      if (this.numPeriods <= 1) return
      if (this.disciplines.some(d => d.period === this.numPeriods)) return
      this._pushHistory()
      this.numPeriods--
      this.saveProgress()
    },

    // ── Export / Import ───────────────────────────────────────────────────────
    exportJSON() {
      const defaultName = `grade-${new Date().toISOString().slice(0, 10)}.json`
      const name = prompt('Nome do arquivo:', defaultName)
      if (name === null) return
      const payload = JSON.stringify({ disciplines: this.disciplines, atividadesAutonomas: this.atividadesAutonomas, numPeriods: this.numPeriods, categories: this.categories, title: this.title, subtitle: this.subtitle }, null, 2)
      const a = Object.assign(document.createElement('a'), {
        href:     URL.createObjectURL(new Blob([payload], { type: 'application/json' })),
        download: name.endsWith('.json') ? name : name + '.json',
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
          this._pushHistory()
          this._applyState(JSON.parse(e.target.result))
          this.$nextTick(() => this.initSortable())
          this.saveProgress()
        } catch { alert('JSON inválido') }
      }
      reader.readAsText(file)
      evt.target.value = ''
    },

    // ── Drag-and-drop ─────────────────────────────────────────────────────────
    initSortable() {
      const self = this
      for (let p = 1; p <= self.numPeriods; p++) {
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

            self._pushHistory()

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
            self.saveProgress()
          },
        })
      }
    },
  }
}
