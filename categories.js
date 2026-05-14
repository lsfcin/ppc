function ppcCategories() {
  return {
    _stagingCategories: null,

    openCategoriesModal() {
      this._stagingCategories = JSON.parse(JSON.stringify(this.categories))
      document.getElementById('categories-modal').showModal()
    },

    saveCategoriesModal() {
      this._pushHistory()
      const colorMap = {}
      this._stagingCategories.forEach(cat => {
        const orig = this.categories.find(c => c.id === cat.id)
        if (orig && orig.value !== cat.value) colorMap[orig.value] = cat.value
      })
      if (Object.keys(colorMap).length)
        this.disciplines.forEach(d => { if (colorMap[d.color]) d.color = colorMap[d.color] })
      const order = { I: 0, II: 1, III: 2, IV: 3 }
      this.categories = this._stagingCategories.sort((a, b) => (order[a.nucleus] ?? 9) - (order[b.nucleus] ?? 9))
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
      const id    = `cat-${this._nextCatId++}`
      this._stagingCategories.push({ id, value: color, label: 'Nova categoria', nucleus: 'II' })
    },

    deleteStagingCategory(idx) { this._stagingCategories.splice(idx, 1) },
    inUseCount(value)          { return this.disciplines.filter(d => d.color === value).length },

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

    exportJSON() {
      const defaultName = `grade-${new Date().toISOString().slice(0, 10)}.json`
      const name = prompt('Nome do arquivo:', defaultName)
      if (name === null) return
      const payload = JSON.stringify({
        disciplines: this.disciplines, atividadesAutonomas: this.atividadesAutonomas,
        numPeriods: this.numPeriods, categories: this.categories,
        title: this.title, subtitle: this.subtitle,
      }, null, 2)
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
  }
}
