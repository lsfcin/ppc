// Constraint engine: evaluates one rule (scope · filter · measure · op · value) against the curriculum
const RULE_SCOPES   = { course: 'No curso', period: 'Em cada período', discipline: 'Em cada disciplina' }
const RULE_MEASURES = { hours: 'carga horária', weekly: 'carga semanal', count: 'nº de disciplinas', ead: '% EaD' }
const RULE_OPS      = { min: 'no mínimo', max: 'no máximo', multiple: 'múltiplo de' }

// A group filter counts only the hours a discipline allocates to that group
function groupHours(d, groups) {
  return (groups.includes(d.teoria.nucleus)    ? d.teoria.hours   : 0)
       + (groups.includes(d.pratica.nucleus)   ? d.pratica.hours  : 0)
       + (groups.includes(EXTENSION_GROUP)     ? d.extensao.hours : 0)
}

function asList(value) { return Array.isArray(value) ? value : [value] }

// A term ending in a number ("Psicologia I") must not run on into a longer one ("Psicologia II")
function nameMatches(name, term) {
  const t = String(term).toLowerCase().trim()
  if (!/\s([ivx]+|\d+)$/.test(t)) return name.toLowerCase().includes(t)
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`${escaped}(?![\\p{L}\\p{N}])`, 'iu').test(name)
}

function filterMatcher(app, filter) {
  const values = asList(filter.value)
  switch (filter.kind) {
    case 'category': {
      const colors = app.categories.filter(c => values.includes(c.id)).map(c => c.value)
      return d => colors.includes(d.color)
    }
    case 'group':      return d => groupHours(d, values) > 0
    case 'department': return d => values.includes(d.department)
    case 'theme':      return d => values.some(t => (d.tags ?? []).includes(t))
    case 'name':       return d => values.some(n => nameMatches(d.name, n))
    default:           return () => true
  }
}

function ruleHours(d, filter) {
  return filter.kind === 'group' ? groupHours(d, asList(filter.value)) : d.hours
}

function measure(rule, ds) {
  const hours = d => ruleHours(d, rule.filter)
  switch (rule.measure) {
    case 'count':  return ds.length
    case 'weekly': return ds.reduce((s, d) => s + (d.skipWeekly ? 0 : hours(d)), 0) / 15
    case 'ead': {
      const total = ds.reduce((s, d) => s + hours(d), 0)
      const ead   = ds.reduce((s, d) => s + hours(d) * ((d.eadPercent ?? 0) / 100), 0)
      return total === 0 ? 0 : ead / total * 100
    }
    default: return ds.reduce((s, d) => s + hours(d), 0)
  }
}

function ruleLimit(app, rule) {
  return rule.unit === '%' ? Math.ceil(app.totalHours() * rule.value / 100) : rule.value
}

function passes(rule, m, limit) {
  const v = Math.round(m * 1e6) / 1e6
  if (rule.op === 'max')      return v <= limit
  if (rule.op === 'multiple') return limit > 0 && v % limit === 0
  return v >= limit
}

function formatMeasure(rule, m) {
  if (rule.measure === 'count')  return `${m} disciplina${m === 1 ? '' : 's'}`
  if (rule.measure === 'weekly') return `${m.toFixed(1)}h/sem`
  if (rule.measure === 'ead')    return `${m.toFixed(1)}% EaD`
  return `${m}h`
}

// "each" rules check every listed value on its own (fixed c10: each mandatory name present)
function evaluateEach(app, rule, limit) {
  const failing = asList(rule.filter.value).filter(v => {
    const ds = app.disciplines.filter(filterMatcher(app, { ...rule.filter, value: v }))
    return !passes(rule, measure(rule, ds), limit)
  })
  return { ok: failing.length === 0, value: failing.length === 0 ? 'Todas presentes' : `Ausentes: ${failing.join(', ')}` }
}

function evaluateCourse(app, rule, limit) {
  const m      = measure(rule, app.disciplines.filter(filterMatcher(app, rule.filter)))
  const target = rule.unit === '%'
    ? ` — ${RULE_OPS[rule.op]} ${limit}h (${rule.value}% de ${app.totalHours()}h)`
    : ` (${RULE_OPS[rule.op]} ${formatMeasure(rule, rule.value)})`
  return { ok: passes(rule, m, limit), value: `Atual: ${formatMeasure(rule, m)}${target}` }
}

function evaluateParts(app, rule, limit) {
  const match = filterMatcher(app, rule.filter)
  const parts = rule.scope === 'period'
    ? Array.from({ length: app.numPeriods }, (_, i) => ({ name: app.ordinals[i], ds: app.disciplinesIn(i + 1).filter(match) }))
    : app.disciplines.filter(match).map(d => ({ name: d.name, ds: [d] }))
  const failing = parts
    .map(p => ({ ...p, m: measure(rule, p.ds) }))
    .filter(p => !passes(rule, p.m, limit))
    .map(p => rule.scope === 'period' ? `${p.name} (${formatMeasure(rule, p.m)})` : p.name)
  const allOk = rule.scope === 'period' ? 'Todos os períodos dentro da regra' : 'Todas as disciplinas em conformidade'
  return { ok: failing.length === 0, value: failing.length === 0 ? allOk : `Fora da regra: ${failing.join(', ')}` }
}

function evaluateRule(app, rule) {
  const limit  = ruleLimit(app, rule)
  const result = rule.each              ? evaluateEach(app, rule, limit)
               : rule.scope === 'course' ? evaluateCourse(app, rule, limit)
               :                           evaluateParts(app, rule, limit)
  return { id: rule.id, label: rule.label, detail: rule.detail ?? '', custom: !rule.fixed, detailOpen: false, ...result }
}
