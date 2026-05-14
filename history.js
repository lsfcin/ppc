function ppcHistory() {
  return {
    _history: [], _future: [],

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
  }
}
