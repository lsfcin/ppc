// Constraint panel list: code-only checks (cw1, c1, c6, c11), fixed and custom rules, and the summary
function codeChecks(app) {
  const { disciplines: ds, atividadesAutonomas } = app
  const tot    = app.disciplineHours()
  const totalH = tot + atividadesAutonomas

  const preqViol = []
  ds.forEach(d => {
    d.prerequisites.forEach(pid => {
      const pre = app.byId(pid)
      if (pre && pre.period >= d.period)
        preqViol.push(`${d.name} ← ${pre.name}`)
    })
  })

  return [
    ...(ds.some(d => (d.eadPercent ?? 0) > 0) ? [{
      id: 'cw1', warn: true, ok: true,
      label: 'Uso Obrigatório de TDIC e AVAs em EaD',
      value: 'O PPC e o Plano de Ensino de cada componente EaD devem prever TDIC, AVA institucional, material didático específico, equipe multidisciplinar, tutoria e experiência docente em EaD.',
      detail: 'Resolução CEPE/UFRPE Nº 744/2024, Art. 26: "Os cursos de graduação presenciais com oferta de carga horária a distância (parcial ou integral) deverão prever, no PPC e no Plano de Ensino do componente curricular, as estratégias e práticas de ensino-aprendizagem mediadas pelas TDIC, bem como o uso do ambiente virtual institucional, produção de material didático específico, equipe multidisciplinar, tutoria e experiência do corpo docente em Educação a Distância para alcançar os objetivos pedagógicos e atender ao Instrumento de Avaliação dos Cursos de Graduação e o Referencial de Qualidade da Educação a Distância."',
      detailOpen: false,
    }] : []),
    { id:'c1',  label:'CH Total ≥ 3200h',
      ok: totalH >= 3200,
      value: `Atual: ${totalH}h (disciplinas ${tot}h + autônomas ${atividadesAutonomas}h)`,
      detail: 'Resolução CNE/CP Nº 4/2024, §1º: "Os cursos terão, no mínimo, 3.200 horas."',
      detailOpen: false },
    { id:'c6',  label:'Atividades Autônomas ≥ 120h',
      ok: atividadesAutonomas >= 120,
      value: `Atual: ${atividadesAutonomas}h`,
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "Nos cursos de Licenciatura, a parcela de carga horária prevista para atividades autônomas deverá alcançar, no mínimo, 120h."',
      detailOpen: false },
    { id:'c11', label:'Pré-requisitos em períodos anteriores',
      ok: preqViol.length === 0,
      value: preqViol.length === 0
        ? 'Nenhuma violação'
        : `Violações: ${preqViol.join('; ')}`,
      detail: 'Pré-requisito deve estar alocado em período anterior ao da disciplina que o exige.',
      detailOpen: false },
  ]
}

// cw1 first, then c1..c12 by number, then ct1..ct12 — the order the panel always had
function fixedRank(id) {
  if (id === 'cw1') return 0
  const n = parseInt(id.replace(/^\D+/, ''))
  return id.startsWith('ct') ? 100 + n : n
}

function buildConstraints(app) {
  const fixed  = [...codeChecks(app), ...fixedRules().map(r => evaluateRule(app, r))]
    .sort((a, b) => fixedRank(a.id) - fixedRank(b.id))
  const custom = [...app.customRules].reverse().map(r => evaluateRule(app, r))
  return [...custom, ...fixed]
}

function buildConstraintSummary(app) {
  const disabled = app.disabledConstraints ?? []
  const cs   = buildConstraints(app).filter(c => !disabled.includes(c.id) && !c.warn)
  const ok   = cs.filter(c => c.ok).length
  const fail = cs.length - ok
  return `<span class="badge-ok">${ok} ok</span>`
    + (fail > 0 ? ` <span class="badge-fail">${fail} falha${fail > 1 ? 's' : ''}</span>` : '')
}
