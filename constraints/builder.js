// Rule builder modal: draft rule, valid choice combinations, Portuguese preview sentence, save and delete
const MEASURES_BY_SCOPE = { course: ['hours', 'count', 'ead'], period: ['hours', 'weekly', 'count', 'ead'], discipline: ['hours', 'ead'] }
const OPS_BY_MEASURE    = { hours: ['min', 'max', 'multiple'], weekly: ['min', 'max'], count: ['min', 'max'], ead: ['min', 'max'] }
const RULE_FILTERS      = { all: 'todas as disciplinas', category: 'a categoria', group: 'o grupo', department: 'o departamento', theme: 'o tema', name: 'o nome contém' }

const blankRule = () => ({
  scope: 'course', filter: { kind: 'all', value: '' }, measure: 'hours', op: 'min', value: 0, unit: 'h', label: '', detail: '',
})

function ppcRuleBuilder() {
  return {
    ruleDraft: null,

    openRuleModal() {
      this.ruleDraft = blankRule()
      document.getElementById('rule-modal').showModal()
    },

    closeRuleModal() {
      this.ruleDraft = null
      document.getElementById('rule-modal').close()
    },

    ruleMeasures() { return MEASURES_BY_SCOPE[this.ruleDraft.scope] },
    ruleOps()      { return OPS_BY_MEASURE[this.ruleDraft.measure] },
    rulePercentAllowed() {
      const r = this.ruleDraft
      return r.scope === 'course' && r.measure === 'hours' && r.op !== 'multiple'
    },

    // Keeps the draft inside the valid combinations after any choice changes
    normalizeRuleDraft() {
      const r = this.ruleDraft
      if (!this.ruleMeasures().includes(r.measure)) r.measure = this.ruleMeasures()[0]
      if (!this.ruleOps().includes(r.op))           r.op      = this.ruleOps()[0]
      if (!this.rulePercentAllowed())               r.unit    = 'h'
      const options = this.ruleFilterOptions()
      if (options && !options.some(o => o.id === r.filter.value)) r.filter.value = options[0]?.id ?? ''
    },

    ruleFilterOptions() {
      switch (this.ruleDraft.filter.kind) {
        case 'category':   return this.categories.map(c => ({ id: c.id, label: c.label }))
        case 'group':      return this.groups.map(g => ({ id: g.id, label: g.label }))
        case 'department': return this.departments.map(d => ({ id: d, label: d }))
        case 'theme':      return TRANSVERSAL_THEMES.map(t => ({ id: t.id, label: t.label }))
        default:           return null
      }
    },

    ruleValueText(r) {
      if (r.unit === '%')          return `${r.value}% da CH total (com atividades autônomas)`
      if (r.measure === 'ead')     return `${r.value}% EaD`
      if (r.measure === 'weekly')  return `${r.value}h/sem`
      if (r.measure === 'count')   return `${r.value} disciplina${r.value === 1 ? '' : 's'}`
      return `${r.value}h`
    },

    ruleFilterText(r) {
      const option = this.ruleFilterOptions()?.find(o => o.id === r.filter.value)
      if (r.filter.kind === 'all')  return ''
      if (r.filter.kind === 'name') return `, nas disciplinas cujo nome contém "${r.filter.value}"`
      if (r.filter.kind === 'group') return `, nas horas do grupo ${option?.label ?? r.filter.value}`
      return `, nas disciplinas com ${RULE_FILTERS[r.filter.kind]} ${option?.label ?? r.filter.value}`
    },

    ruleSentence() {
      const r = this.ruleDraft
      return `${RULE_SCOPES[r.scope]}${this.ruleFilterText(r)}, ${RULE_MEASURES[r.measure]} ${RULE_OPS[r.op]} ${this.ruleValueText(r)}.`
    },

    ruleDraftInvalid() {
      const r = this.ruleDraft
      if (!r || !(r.value >= 0)) return true
      if (r.op === 'multiple' && !(r.value > 0)) return true
      return r.filter.kind !== 'all' && !String(r.filter.value).trim()
    },

    saveRule() {
      if (this.ruleDraftInvalid()) return
      const n = Math.max(0, ...this.customRules.map(r => parseInt(r.id.replace('r-', '')) || 0)) + 1
      this.customRules.push({
        ...JSON.parse(JSON.stringify(this.ruleDraft)),
        id: `r-${n}`, label: this.ruleDraft.label.trim() || this.ruleSentence(),
      })
      this.closeRuleModal()
      this.saveProgress()
    },

    deleteRule(id) {
      this.customRules         = this.customRules.filter(r => r.id !== id)
      this.disabledConstraints = this.disabledConstraints.filter(c => c !== id)
      this.saveProgress()
    },

    // An enabled rule filtering by the group blocks its deletion
    ruleUsesGroup(id) {
      return [...fixedRules(), ...this.customRules].some(r =>
        !this.disabledConstraints.includes(r.id) && r.filter.kind === 'group' && asList(r.filter.value).includes(id))
    },
  }
}
