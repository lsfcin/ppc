function ppcDisciplines() {
  return {
    editing: null, editingId: null,

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
        this.editing.isElective = this.isOptativaColor(this.editing.color)
        if (this.editing.isElective) {
          this.editing.pratica       = { hours: 0, nucleus: 'II' }
          this.editing.extensao      = { hours: 0, nucleus: 'III' }
          this.editing.prerequisites = []
          this.editing.tags          = []
          this.editing.skipWeekly    = false
        }
        this.editing.hours = this.editing.teoria.hours + this.editing.pratica.hours + this.editing.extensao.hours
        this.editing.tags  = this.editing.tags ?? []
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

    onElectiveNucleusChange(nucleus) {
      if (!this.editing) return
      const match = this.categories.find(c => c.nucleus === nucleus && c.label !== 'Optativa')
      if (match) this.editing.color = match.value
      this.onColorChange()
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
        this.editing.name       = 'Optativa'
        this.editing.isElective = true
        const total      = this.editing.teoria.hours + this.editing.pratica.hours + this.editing.extensao.hours
        const prevNucleus = this.editing.teoria.nucleus || 'II'
        this.editing.teoria       = { hours: total || 60, nucleus: prevNucleus }
        this.editing.pratica      = { hours: 0, nucleus: 'II' }
        this.editing.extensao     = { hours: 0, nucleus: 'III' }
        this.editing.prerequisites = []
        this.editing.tags         = []
        this.editing.skipWeekly   = false
      } else {
        this.editing.isElective = false
      }
    },
  }
}
