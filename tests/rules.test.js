// Engine, fixed-rule equivalence, departments, hour groups and custom rules — run with `make verify-full`
const test   = require('node:test')
const assert = require('node:assert/strict')
const { makeApp, readGrade, panel, plain } = require('./harness.js')

const failing = app => panel(app).filter(c => !c.ok).map(c => c.id)

// The panel's verdicts before the engine migration (2026-10-30 snapshot)
test('default grid keeps its verdicts: only Núcleo I fails', () => {
  assert.deepEqual(failing(makeApp().app), ['c2'])
})

test('stressed grid keeps its verdicts', () => {
  const s  = readGrade()
  const ds = s.disciplines
  ds[0].eadPercent = 50
  ds.find(d => d.teoria.nucleus === 'IV').eadPercent = 20
  ds.find(d => d.extensao.hours > 0).eadPercent = 10
  ds[1].hours = 50; ds[1].teoria.hours = 50
  ds.filter(d => /libras/i.test(d.name)).forEach(d => { d.name = 'X' })
  ds.filter(d => d.period === 2).forEach(d => { d.period = 1 })
  ds.forEach(d => { d.tags = (d.tags ?? []).filter(t => t !== 'ambiental') })
  s.atividadesAutonomas = 10
  assert.deepEqual(failing(makeApp(s).app), ['c1', 'c2', 'c6', 'c7', 'c8', 'c10', 'c11', 'c12', 'ct1'])
})

test('builder rules reproduce the fixed ones', () => {
  const { app } = makeApp()
  const pairs = [
    ['c3', { scope: 'course', filter: { kind: 'group', value: 'II' }, measure: 'hours', op: 'min', value: 1600, unit: 'h' }],
    ['c4', { scope: 'course', filter: { kind: 'group', value: 'III' }, measure: 'hours', op: 'min', value: 10, unit: '%' }],
    ['c7', { scope: 'period', filter: { kind: 'all' }, measure: 'weekly', op: 'max', value: 28, unit: 'h' }],
    ['c8', { scope: 'discipline', filter: { kind: 'all' }, measure: 'hours', op: 'multiple', value: 15, unit: 'h' }],
    ['c9', { scope: 'course', filter: { kind: 'all' }, measure: 'ead', op: 'max', value: 40, unit: 'h' }],
    ['ct1', { scope: 'course', filter: { kind: 'theme', value: 'ambiental' }, measure: 'count', op: 'min', value: 2, unit: 'h' }],
  ]
  pairs.forEach(([id, rule], i) => app.customRules.push({ ...rule, id: `r-${i + 1}`, label: id }))
  const byId = Object.fromEntries(panel(app).map(c => [c.id, c]))
  pairs.forEach(([id], i) => assert.equal(byId[`r-${i + 1}`].ok, byId[id].ok, id))
})

test('custom rules go on top, newest first, and delete cleanly', () => {
  const { app } = makeApp()
  app.customRules.push({ id: 'r-1', scope: 'course', filter: { kind: 'department', value: 'DC' },
    measure: 'hours', op: 'min', value: 50, unit: '%', label: 'DC ≥ 50%' })
  app.customRules.push({ id: 'r-2', scope: 'course', filter: { kind: 'all' },
    measure: 'count', op: 'max', value: 1, unit: 'h', label: 'no máximo 1' })
  assert.deepEqual(panel(app).slice(0, 2).map(c => [c.id, c.ok]), [['r-2', false], ['r-1', true]])
  app.disabledConstraints.push('r-2')
  app.deleteRule('r-2')
  assert.equal(panel(app)[0].id, 'r-1')
  assert.ok(!app.disabledConstraints.includes('r-2'))
})

test('old JSON without departments or groups loads with defaults and unknown values kept', () => {
  const s = readGrade()
  delete s.departments; delete s.groups
  s.disciplines[0].department = 'DQ'
  const { app } = makeApp(s)
  assert.ok(app.departments.includes('DQ') && app.departments.includes('Outro'))
  assert.deepEqual(plain(app.groups.map(g => g.id)), ['I', 'II', 'III', 'IV'])
  assert.equal(app.addDepartment(' dq '), 'DQ')
})

test('a group in use cannot be deleted; a disabled rule releases it', () => {
  const { app } = makeApp()
  app.groups.push({ id: 'g-1', label: 'Novo grupo' })
  assert.ok(!app.groupInUse('g-1'))
  assert.ok(app.groupInUse('IV'))
  app.customRules.push({ id: 'r-1', scope: 'course', filter: { kind: 'group', value: 'g-1' },
    measure: 'hours', op: 'min', value: 0, unit: 'h', label: 'g' })
  assert.ok(app.groupInUse('g-1'))
  app.disabledConstraints.push('r-1')
  assert.ok(!app.groupInUse('g-1'))
})

test('builder keeps only valid combinations', () => {
  const { app } = makeApp()
  app.ruleDraft = { scope: 'discipline', filter: { kind: 'department', value: '' },
    measure: 'count', op: 'multiple', value: 15, unit: '%', label: '', detail: '' }
  app.normalizeRuleDraft()
  assert.deepEqual([app.ruleDraft.measure, app.ruleDraft.op, app.ruleDraft.unit, app.ruleDraft.filter.value],
    ['hours', 'multiple', 'h', 'DC'])
  assert.equal(app.ruleSentence(), 'Em cada disciplina, nas disciplinas com o departamento DC, carga horária múltiplo de 15h.')
})
