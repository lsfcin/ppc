// Department list: defaults, merging on load, and the "new department" dropdown choice
const DEFAULT_DEPARTMENTS = ['DC', 'DED', 'DM', 'DL', 'DLCH', 'Outro']
const NEW_DEPARTMENT      = '__new__'

function findDepartment(list, name) {
  const key = name.trim().toLowerCase()
  return list.find(dep => dep.toLowerCase() === key)
}

function mergeDepartments(list, disciplines) {
  const merged = []
  ;[...list, ...disciplines.map(d => d.department)].forEach(dep => {
    if (dep && !findDepartment(merged, dep)) merged.push(dep.trim())
  })
  return merged
}

function ppcDepartments() {
  return {
    addDepartment(name) {
      const existing = findDepartment(this.departments, name)
      if (existing) return existing
      this.departments.push(name.trim())
      this.saveProgress()
      return name.trim()
    },

    pickDepartment(select) {
      if (select.value !== NEW_DEPARTMENT) { this.editing.department = select.value; return }
      const name = prompt('Sigla do novo departamento:')?.trim()
      if (name) this.editing.department = this.addDepartment(name)
      this.$nextTick(() => { select.value = this.editing.department })
    },
  }
}
