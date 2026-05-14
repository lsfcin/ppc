function ppcSortable() {
  return {
    _dragAnchor: null,

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
            const courses = [...evt.from.querySelectorAll('[data-id]')]
            self._dragAnchor = courses[evt.oldIndex + 1] || null
          },

          onEnd(evt) {
            const newPeriod = parseInt(evt.to.id.replace('period-', ''))
            const oldPeriod = parseInt(evt.from.id.replace('period-', ''))
            if (isNaN(newPeriod) || isNaN(oldPeriod)) return

            self._pushHistory()
            evt.from.insertBefore(evt.item, self._dragAnchor)

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

            self.disciplines = [...self.disciplines]
            self.saveProgress()
          },
        })
      }
    },
  }
}
