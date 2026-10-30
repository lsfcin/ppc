// Fixed rules: the MEC/UFRPE Licenciatura constraints expressed as engine rules (data, not code)
const MANDATORY_NAMES = [
  'Educação das Relações Étnico-Raciais', 'Libras', 'Produção de Texto',
  'Fundamentos da Educação', 'Educação Brasileira', 'Didática',
  'Psicologia I', 'Psicologia II', 'Metodologia do Ensino', 'Estágio',
]

const groupMin = (id, group, hours, label, detail) => ({
  id, fixed: true, scope: 'course', filter: { kind: 'group', value: group },
  measure: 'hours', op: 'min', value: hours, unit: 'h', label, detail,
})

function fixedRules() {
  return [
    groupMin('c2', 'I', 880, 'Núcleo I ≥ 880h (Formação Geral)',
      'Resolução CNE/CP Nº 4/2024, §1º, I: "880 horas dedicadas às atividades de formação geral."'),
    groupMin('c3', 'II', 1600, 'Núcleo II ≥ 1600h (Conhecimentos Específicos)',
      'Resolução CNE/CP Nº 4/2024, §1º, II: "1.600 horas dedicadas ao estudo de aprofundamento de conhecimentos específicos."'),
    { ...groupMin('c4', EXTENSION_GROUP, 10, 'Núcleo III ≥ 10% da CH total (Extensão)',
      'CNE/CP Nº 4/2024, §1º, III: mínimo de 10% da CH total em atividades acadêmicas de extensão. §6º: presencial obrigatório. CEPE/UFRPE 924/2025: ESO, TCC e PFC não contabilizam para extensão.'),
      unit: '%' },
    groupMin('c5', 'IV', 400, 'Núcleo IV ≥ 400h (Estágio Supervisionado)',
      'Resolução CNE/CP Nº 4/2024, §1º, IV: "400 horas dedicadas ao estágio curricular supervisionado." §5º: "deve ser realizado integralmente de forma presencial."'),
    { id: 'c7', fixed: true, scope: 'period', filter: { kind: 'all' }, measure: 'weekly', op: 'max', value: 28, unit: 'h',
      label: 'Carga semanal ≤ 28h/sem por período (noturno)',
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "O maior valor da carga horária discente semanal é: III - 28 horas em cursos noturnos." Convenção: 15 semanas por semestre. Disciplinas marcadas como "Excluir do limite semanal" (ESO, TCC) não entram no cômputo.' },
    { id: 'c8', fixed: true, scope: 'discipline', filter: { kind: 'all' }, measure: 'hours', op: 'multiple', value: 15, unit: 'h',
      label: 'CH de cada disciplina é múltiplo de 15h',
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "A carga horária total do componente curricular é sempre múltipla de 15 horas."' },
    { id: 'c9', fixed: true, scope: 'course', filter: { kind: 'all' }, measure: 'ead', op: 'max', value: 40, unit: 'h',
      label: 'EaD ≤ 40% da CH total',
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "poderão ser ofertados componentes curriculares a distância [...] desde que esta oferta não ultrapasse 40% da carga horária total do curso."' },
    { id: 'c10', fixed: true, each: true, scope: 'course', filter: { kind: 'name', value: MANDATORY_NAMES },
      measure: 'count', op: 'min', value: 1, unit: 'h',
      label: 'Disciplinas obrigatórias presentes (10 nominadas)',
      detail: 'Resolução CEPE/UFRPE Nº 744/2024: "Nos cursos de Licenciatura é obrigatório: a) Ed. das Relações Étnico-Raciais; b) Libras; c) Produção de Texto Acadêmico; d) Fundamentos da Educação; e) Educação Brasileira; f) Didática; g) Psicologia I; h) Psicologia II; i) Metodologia de Ensino; j) ESO."' },
    { id: 'c12', fixed: true, scope: 'discipline', filter: { kind: 'group', value: ['IV', EXTENSION_GROUP] },
      measure: 'ead', op: 'max', value: 0, unit: 'h',
      label: 'EaD proibido em Estágio e Extensão (presencialidade obrigatória)',
      detail: 'Resolução CEPE/UFRPE Nº 744/2024, §5º: "O estágio curricular supervisionado deve ser realizado, integralmente, de forma presencial tanto nos cursos presenciais quanto nos cursos ofertados na modalidade a distância." §6º: "As 320 horas destinadas às atividades de extensão devem ser realizadas, integralmente, de forma presencial."' },
    ...TRANSVERSAL_THEMES.map((theme, i) => ({
      id: themeConstraintId(i), fixed: true, scope: 'course', filter: { kind: 'theme', value: theme.id },
      measure: 'count', op: 'min', value: 2, unit: 'h',
      label: `[ transversal | multidisciplinar ]\n ${theme.label}`, detail: theme.detail,
    })),
  ]
}
