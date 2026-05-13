const TRANSVERSAL_THEMES = [
  { id: 'ambiental',
    label: 'Educação Ambiental e Direitos Humanos',
    detail: 'Resolução CEPE/UFRPE Nº 744/2024, §4º: "Os temas Educação ambiental e Direitos humanos são obrigatórios para as Licenciaturas [...] e poderão ser abordados de modo transversal e interdisciplinar."' },
  { id: 'diversidade',
    label: 'Diversidades, Ed. Inclusiva e Direitos Socioeducativos',
    detail: 'Resolução CEPE/UFRPE Nº 744/2024, §5º: "Nos cursos de Licenciatura é obrigatório: II - como componentes curriculares ou temas transversais: a) diversidade de gênero e sexualidade; b) diversidade religiosa; c) diversidade de faixa geracional; d) educação inclusiva; e) direitos educacionais de adolescentes e jovens em cumprimento de medidas socioeducativas e gestão educacional." BNCC (Base Nacional Comum Curricular) também enfatiza esses temas."' },
  { id: 'violencia',
    label: 'Prevenção da Violência (Criança, Adolescente e Mulher)',
    detail: 'LDB (Lei nº 9.394/1996), §9º: "Conteúdos relativos aos direitos humanos e à prevenção de todas as formas de violência contra a criança, o adolescente e a mulher serão incluídos, como temas transversais, nos currículos."' },
  { id: 'feminino',
    label: 'Experiências, Perspectivas e Conquistas Femininas',
    detail: 'LDB (Lei nº 9.394/1996) e Resolução CNE/CP Nº 4/2024: "as abordagens devem incluir aspectos da história, ciência, artes e cultura a partir das experiências e perspectivas femininas" e "múltiplas formas de participação e atuação das mulheres na sociedade brasileira, bem como de conhecimentos, valores e atitudes orientados à prevenção e combate a todas as formas de violência contra a mulher."' },
  { id: 'afro',
    label: 'História e Cultura Afro-Brasileira, Indígena e Combate ao Racismo',
    detail: 'Resolução CNE/CP Nº 4/2024: "das relações étnico-raciais estabelecidas na sociedade brasileira [...] e que garantam a apropriação dos conhecimentos relativos à história e cultura africana, afrobrasileira e dos povos originários do Brasil, bem como de valores e atitudes orientados à desconstruir e combater todas as expressões do racismo." Nota: a UFRPE exige a disciplina específica de Relações Étnico-Raciais, mas as diretrizes exigem que o combate ao racismo seja transversalizado nas práticas educativas.' },
]

const MANDATORY_NAMES = [
  'Educação das Relações Étnico-Raciais', 'Libras', 'Produção de Texto',
  'Fundamentos da Educação', 'Educação Brasileira', 'Didática',
  'Psicologia I', 'Psicologia II', 'Metodologia do Ensino', 'Estágio',
]

function buildConstraints(app) {
  const { disciplines: ds, atividadesAutonomas, ordinals } = app
  const nh  = n => app.nucleusHours(n)
  const tot = app.disciplineHours()
  const ead = ds.reduce((s, d) => s + d.hours * ((d.eadPercent ?? 0) / 100), 0)

  const periodOver = []
  for (let p = 1; p <= app.numPeriods; p++) {
    const w = app.disciplinesIn(p).reduce((s, d) => s + (d.skipWeekly ? 0 : d.hours), 0) / 15
    if (w > 28) periodOver.push(`${ordinals[p-1]} (${w.toFixed(1)}h/sem)`)
  }

  const nonMult = ds.filter(d => d.hours % 15 !== 0).map(d => d.name)

  const preqViol = []
  ds.forEach(d => {
    d.prerequisites.forEach(pid => {
      const pre = app.byId(pid)
      if (pre && pre.period >= d.period)
        preqViol.push(`${d.name} ← ${pre.name}`)
    })
  })

  const missingMandatory = MANDATORY_NAMES.filter(m =>
    !ds.some(d => d.name.toLowerCase().includes(m.toLowerCase()))
  )

  const totalH = tot + atividadesAutonomas
  const minN3  = Math.ceil(totalH * 0.10)

  return [
    { id:'c1',  label:'CH Total ≥ 3200h',
      ok: totalH >= 3200,
      value: `Atual: ${totalH}h (disciplinas ${tot}h + autônomas ${atividadesAutonomas}h)`,
      detail: 'Resolução CNE/CP Nº 4/2024, §1º: "Os cursos terão, no mínimo, 3.200 horas."',
      detailOpen: false },
    { id:'c2',  label:'Núcleo I ≥ 880h (Formação Geral)',
      ok: nh('I') >= 880,
      value: `Atual: ${nh('I')}h`,
      detail: 'Resolução CNE/CP Nº 4/2024, §1º, I: "880 horas dedicadas às atividades de formação geral."',
      detailOpen: false },
    { id:'c3',  label:'Núcleo II ≥ 1600h (Conhecimentos Específicos)',
      ok: nh('II') >= 1600,
      value: `Atual: ${nh('II')}h`,
      detail: 'Resolução CNE/CP Nº 4/2024, §1º, II: "1.600 horas dedicadas ao estudo de aprofundamento de conhecimentos específicos."',
      detailOpen: false },
    { id:'c4',  label:`Núcleo III ≥ ${minN3}h (Extensão — 10% de ${totalH}h)`,
      ok: nh('III') >= minN3,
      value: `Atual: ${nh('III')}h — mínimo ${minN3}h. ESO e TCC excluídos da contagem de extensão.`,
      detail: 'CNE/CP Nº 4/2024, §1º, III: mínimo de 10% da CH total em atividades acadêmicas de extensão. §6º: presencial obrigatório. CEPE/UFRPE 924/2025: ESO, TCC e PFC não contabilizam para extensão.',
      detailOpen: false },
    { id:'c5',  label:'Núcleo IV ≥ 400h (Estágio Supervisionado)',
      ok: nh('IV') >= 400,
      value: `Atual: ${nh('IV')}h`,
      detail: 'Resolução CNE/CP Nº 4/2024, §1º, IV: "400 horas dedicadas ao estágio curricular supervisionado." §5º: "deve ser realizado integralmente de forma presencial."',
      detailOpen: false },
    { id:'c6',  label:'Atividades Autônomas ≥ 120h',
      ok: atividadesAutonomas >= 120,
      value: `Atual: ${atividadesAutonomas}h`,
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "Nos cursos de Licenciatura, a parcela de carga horária prevista para atividades autônomas deverá alcançar, no mínimo, 120h."',
      detailOpen: false },
    { id:'c7',  label:'Carga semanal ≤ 28h/sem por período (noturno)',
      ok: periodOver.length === 0,
      value: periodOver.length === 0
        ? 'Todos os períodos dentro do limite'
        : `Acima do limite: ${periodOver.join(', ')}`,
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "O maior valor da carga horária discente semanal é: III - 28 horas em cursos noturnos." Convenção: 15 semanas por semestre. Disciplinas marcadas como "Excluir do limite semanal" (ESO, TCC) não entram no cômputo.',
      detailOpen: false },
    { id:'c8',  label:'CH de cada disciplina é múltiplo de 15h',
      ok: nonMult.length === 0,
      value: nonMult.length === 0
        ? 'Todas as disciplinas em conformidade'
        : `Violação: ${nonMult.join(', ')}`,
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "A carga horária total do componente curricular é sempre múltipla de 15 horas."',
      detailOpen: false },
    { id:'c9',  label:'EaD ≤ 40% da CH total',
      ok: tot === 0 || (ead / tot) <= 0.40,
      value: `CH EaD: ${Math.round(ead)}h / CH total: ${tot}h = ${tot > 0 ? (ead / tot * 100).toFixed(1) : 0}%`,
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "poderão ser ofertados componentes curriculares a distância [...] desde que esta oferta não ultrapasse 40% da carga horária total do curso."',
      detailOpen: false },
    { id:'c10', label:'Disciplinas obrigatórias presentes (10 nominadas)',
      ok: missingMandatory.length === 0,
      value: missingMandatory.length === 0
        ? 'Todas presentes'
        : `Ausentes: ${missingMandatory.join(', ')}`,
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "Nos cursos de Licenciatura é obrigatório: a) Ed. das Relações Étnico-Raciais; b) Libras; c) Produção de Texto Acadêmico; d) Fundamentos da Educação; e) Educação Brasileira; f) Didática; g) Psicologia I; h) Psicologia II; i) Metodologia de Ensino; j) ESO."',
      detailOpen: false },
    { id:'c11', label:'Pré-requisitos em períodos anteriores',
      ok: preqViol.length === 0,
      value: preqViol.length === 0
        ? 'Nenhuma violação'
        : `Violações: ${preqViol.join('; ')}`,
      detail: 'Pré-requisito deve estar alocado em período anterior ao da disciplina que o exige.',
      detailOpen: false },
    ...TRANSVERSAL_THEMES.map((theme, i) => {
      const count = ds.filter(d => (d.tags ?? []).includes(theme.id)).length
      return {
        id: `ct${i + 1}`,
        label: `[Transversal] ${theme.label}`,
        ok: count >= 2,
        value: count === 0 ? 'Nenhuma disciplina contempla este tema (mínimo: 2)'
             : count === 1 ? '1 disciplina contempla este tema (mínimo: 2)'
             :               `${count} disciplinas contemplam este tema`,
        detail: theme.detail,
        detailOpen: false,
      }
    }),
  ]
}

function buildConstraintSummary(app) {
  const disabled = app.disabledConstraints ?? []
  const cs   = buildConstraints(app).filter(c => !disabled.includes(c.id))
  const ok   = cs.filter(c => c.ok).length
  const fail = cs.length - ok
  return `<span class="badge-ok">${ok} ok</span>`
    + (fail > 0 ? ` <span class="badge-fail">${fail} falha${fail > 1 ? 's' : ''}</span>` : '')
}
