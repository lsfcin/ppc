// Hour groups (formerly MEC nuclei I–IV): defaults, merging on load, lookup, and staging in the categories modal
const EXTENSION_GROUP = 'III'
const DEFAULT_GROUPS  = [
  { id: 'I',   label: 'Núcleo I' },
  { id: 'II',  label: 'Núcleo II' },
  { id: 'III', label: 'Núcleo III', locked: true },
  { id: 'IV',  label: 'Núcleo IV' },
]

function mergeGroups(list, disciplines, categories) {
  const merged = list.map(g => ({ ...g }))
  const used   = [
    ...disciplines.flatMap(d => [d.teoria.nucleus, d.pratica.nucleus]),
    ...categories.map(c => c.nucleus),
  ]
  used.forEach(id => { if (id && !merged.some(g => g.id === id)) merged.push({ id, label: id }) })
  if (!merged.some(g => g.id === EXTENSION_GROUP)) merged.push({ ...DEFAULT_GROUPS[2] })
  merged.find(g => g.id === EXTENSION_GROUP).locked = true
  return merged
}

function ppcGroups() {
  return {
    _stagingGroups: null,

    extensionGroup()  { return EXTENSION_GROUP },
    groupLabel(id)    { return this.groups.find(g => g.id === id)?.label ?? id },
    teachingGroups()  { return this.groups.filter(g => g.id !== EXTENSION_GROUP) },
    defaultGroup()    { return this.teachingGroups()[0]?.id ?? EXTENSION_GROUP },
    groupIndex(id)    { const i = this.groups.findIndex(g => g.id === id); return i === -1 ? 99 : i },

    groupInUse(id) {
      return this.disciplines.some(d =>
          (d.teoria.hours  > 0 && d.teoria.nucleus  === id) ||
          (d.pratica.hours > 0 && d.pratica.nucleus === id))
        || this._stagingCategories?.some(c => c.nucleus === id)
        || this.ruleUsesGroup(id)
    },

    addStagingGroup() {
      const n = Math.max(0, ...this._stagingGroups.map(g => parseInt(g.id.replace('g-', '')) || 0)) + 1
      this._stagingGroups.push({ id: `g-${n}`, label: 'Novo grupo' })
    },

    deleteStagingGroup(idx) { this._stagingGroups.splice(idx, 1) },
  }
}
