const PALETTE = ['salmon','blue','cyan','green','gray','purple','orange','yellow','pink','red','sapphire']

function ppc() {
  return {
    disciplines:         [],
    atividadesAutonomas: 275,
    numPeriods:          9,
    ordinals:            ['1º','2º','3º','4º','5º','6º','7º','8º','9º','10º','11º','12º','13º','14º','15º'],
    constraintOpen:      false,
    title:    'Proposta para a grade de LC',
    subtitle: 'Licenciatura em Computação — arraste disciplinas entre períodos para experimentar a grade.',
    categories: [
      { id:'cat-1', value:'salmon', label:'Formação docente', nucleus:'I',   locked: true },
      { id:'cat-2', value:'blue',   label:'Computação',        nucleus:'II'  },
      { id:'cat-3', value:'cyan',   label:'Mat. / Computação', nucleus:'II'  },
      { id:'cat-4', value:'green',  label:'Matemática',         nucleus:'II'  },
      { id:'cat-5', value:'gray',   label:'Optativa',           nucleus:'II',  locked: true },
      { id:'cat-6', value:'purple', label:'Extensão',           nucleus:'III', locked: true },
      { id:'cat-7', value:'orange', label:'Estágio',            nucleus:'IV',  locked: true },
    ],
    _nextCatId: 8,
    _nextId:    100,
    disabledConstraints: [],

    async init() {
      const saved = localStorage.getItem('ppc-state')
      if (saved) { try { this._applyState(JSON.parse(saved)) } catch {} }
      if (this.disciplines.length === 0) {
        try {
          const res = await fetch('grade-curricular.json')
          if (res.ok) this._applyState(await res.json())
        } catch {}
      }
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
        const maxId = Math.max(0, ...this.categories.map(c => parseInt(c.id?.replace('cat-','')) || 0))
        let nextId = maxId + 1
        this.categories.forEach(c => { if (!c.id) c.id = `cat-${nextId++}` })
        this._nextCatId = nextId
        const LOCKED_LABELS = new Set(['Formação docente', 'Optativa', 'Extensão', 'Estágio'])
        this.categories.forEach(c => { if (LOCKED_LABELS.has(c.label)) c.locked = true })
      }
      if (state.title)               this.title               = state.title
      if (state.subtitle)            this.subtitle            = state.subtitle
      if (state.disabledConstraints) this.disabledConstraints = state.disabledConstraints
      this._nextId = Math.max(99, ...this.disciplines.map(d => parseInt(d.id.split('-').pop()) || 0)) + 1
    },

    saveProgress() {
      localStorage.setItem('ppc-state', JSON.stringify({
        disciplines: this.disciplines, atividadesAutonomas: this.atividadesAutonomas,
        numPeriods: this.numPeriods, categories: this.categories,
        title: this.title, subtitle: this.subtitle, disabledConstraints: this.disabledConstraints,
      }))
    },

    toggleConstraint(id) {
      const idx = this.disabledConstraints.indexOf(id)
      if (idx === -1) this.disabledConstraints.push(id)
      else            this.disabledConstraints.splice(idx, 1)
      this.saveProgress()
    },

    disciplinesIn(p) { return this.disciplines.filter(d => d.period === p).sort((a,b) => (a.order??0)-(b.order??0)) },
    byId(id)         { return this.disciplines.find(d => d.id === id) },
    disciplineHours(){ return this.disciplines.reduce((s, d) => s + d.hours, 0) },
    totalHours()     { return this.disciplineHours() + this.atividadesAutonomas },

    nucleusHours(n) {
      return this.disciplines.reduce((s, d) => {
        if (n === 'III') return s + d.extensao.hours
        return s + (d.teoria.nucleus === n ? d.teoria.hours : 0) + (d.pratica.nucleus === n ? d.pratica.hours : 0)
      }, 0)
    },

    periodMeta(p) {
      const ds = this.disciplinesIn(p)
      const h  = ds.reduce((s, d) => s + d.hours, 0)
      const pr = ds.reduce((s, d) => s + d.pratica.hours, 0)
      const ex = ds.reduce((s, d) => s + d.extensao.hours, 0)
      return `${ds.length} disc. &bull; ${h}h &bull; ${(h/15).toFixed(1)}h/sem<br>Prática: ${pr}h &bull; Extensão: ${ex}h`
    },

    hrsChip(d)      { return `${d.hours}h ${d.eadPercent > 0 ? d.eadPercent + '% ead' : 'presencial'}` },
    hrsBreakdown(d) {
      const parts = []
      if (d.teoria.hours   > 0) parts.push(`T:${d.teoria.hours}`)
      if (d.pratica.hours  > 0) parts.push(`P:${d.pratica.hours}`)
      if (d.extensao.hours > 0) parts.push(`E:${d.extensao.hours}`)
      return parts.join(' ')
    },
    cardMeta(d) {
      if (!d.prerequisites.length) return ''
      return d.prerequisites.map(id => this.byId(id)?.name ?? id).join(', ')
    },

    constraints()       { return buildConstraints(this) },
    constraintSummary() { return buildConstraintSummary(this) },
    printPDF()          { window.print() },

    ...ppcDisciplines(),
    ...ppcCategories(),
    ...ppcHistory(),
    ...ppcSortable(),
  }
}
