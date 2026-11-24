import { mkdirSync, writeFileSync } from 'node:fs'

// As fontes descrevem recursos públicos. Todos os números abaixo são fictícios.
const reference = '2026-11-24T15:00:00.000Z'
const expiresAt = '2026-11-24T15:02:00.000Z'
const source = (title, url, supports) => ({
  title,
  url,
  supports,
  checkedOn: '2026-11-24',
})
const metric = (id, label, value, unit = 'registros') => ({
  id,
  label,
  value,
  unit,
  period: '2026-10',
  basis: 'project_demo',
})
const sources = {
  solides: source(
    'Sólides — API de Gestão',
    'https://gestaoapidocs.solides.com.br/',
    'Ficha do colaborador, cargos, departamentos e autenticação por token.',
  ),
  omie: source(
    'Omie — catálogo de APIs',
    'https://developer.omie.com.br/service-list/',
    'Cadastros, departamentos, contas a pagar e movimentos financeiros.',
  ),
  flash: source(
    'Flash — manual de integração',
    'https://docs.api.flashapp.services/',
    'Cadastro, consulta, convites e exclusão de colaboradores.',
  ),
  vixting: source(
    'Vixting — saúde ocupacional',
    'https://www.vixting.com.br/gestao-de-saude-ocupacional/',
    'Agendamentos, ASOs e acompanhamento de atestados e absenteísmo; contrato de API não validado.',
  ),
  clude: source(
    'Clude — plataforma corporativa',
    'https://clude.com.br/clude/',
    'Benefícios e gestão de saúde corporativa; contrato público de API não validado.',
  ),
  sulamerica: source(
    'SulAmérica — movimentação de beneficiários',
    'https://www.sulamerica.com.br/saude/0073_0001_0297_cond_gerais_fit.pdf',
    'Inclusão/exclusão cadastral de beneficiários; referência de processo, sem validar contrato ou API da empresa.',
  ),
  wellhub: source(
    'Wellhub — gestão e indicadores de programas',
    'https://wellhub.com/pt-br/blog/beneficios-e-programas-de-bem-estar/portais-de-bem-estar-corporativo/',
    'Elegibilidade, movimentações e indicadores de cadastro; referência conceitual, sem validar API.',
  ),
  porto: source(
    'Porto — seguro de vida empresarial',
    'https://venda.portoseguro.com.br/seguro-de-vida-para-empresas',
    'Oferta de seguro de vida empresarial; sem contrato público de API validado.',
  ),
  alura: source(
    'Alura — relatório de licenças',
    'https://suporte-empresas.alura.com.br/relat%C3%B3rio-de-licen%C3%A7as',
    'Licenças, cursos e última atividade; exportação CSV/XLS; API condicionada ao plano, sem confirmar acesso da empresa.',
  ),
  senai: source(
    'SENAI-SP — orientações de matrícula',
    'https://www.sp.senai.br/unidade/bauru/duvidas-e-orientacoes',
    'Inscrição, matrícula e documentação; processo varia por unidade, sem contrato público de API validado.',
  ),
  sharepoint: source(
    'Microsoft Graph — arquivos e bibliotecas',
    'https://learn.microsoft.com/en-us/graph/api/resources/driveitem',
    'Arquivos e pastas de bibliotecas do SharePoint.',
  ),
  graph: source(
    'Microsoft Graph — limitação de requisições',
    'https://learn.microsoft.com/graph/throttling',
    'HTTP 429 e Retry-After; não confundir limitação com queda do fornecedor.',
  ),
  sindpd: source(
    'Sindpd — atendimento',
    'https://sindpd.org.br/atendimento/',
    'Canais de atendimento; fila de e-mails é uma proposta local, não uma API do sindicato.',
  ),
  mail: source(
    'Microsoft Graph — recurso message',
    'https://learn.microsoft.com/en-us/graph/api/resources/message',
    'Mensagens em caixas de e-mail; fornecedor de e-mail da empresa não confirmado.',
  ),
  autentique: source(
    'Autentique — webhooks',
    'https://docs.autentique.com.br/api/integration-basics/webhooks',
    'Eventos de documentos e assinaturas, entrega HTTPS/JSON; eventos podem chegar duplicados ou fora de ordem.',
  ),
  onfly: source(
    'Onfly — integração por API',
    'https://lp.onfly.com.br/ajuda/como-integrar-a-api-da-onfly',
    'Despesas, relatórios, colaboradores e centros de custo; acesso depende de plano e credenciais.',
  ),
  agent: source(
    'Google — Gemini Enterprise',
    'https://docs.cloud.google.com/gemini/enterprise/docs',
    'Plataforma de agentes e conectores; os quatro nós e seus contadores são definidos pelo projeto.',
  ),
  frontend: source(
    'Google — Web Vitals',
    'https://web.dev/articles/vitals',
    'LCP, INP e CLS são indicadores de experiência, avaliados no percentil 75; não são latência p95 da API.',
  ),
}
const apps = [
  {
    id: 'solides',
    refs: ['solides'],
    method: 'documented_api',
    base: 180,
    metrics: [
      metric('employees', 'Colaboradores na base fictícia', 120),
      metric('departments', 'Departamentos', 4),
      metric('pending', 'Atualizações pendentes', 2),
    ],
  },
  {
    id: 'omie',
    refs: ['omie'],
    method: 'documented_api',
    base: 460,
    failures: 1,
    health: 'degraded',
    metrics: [
      metric('expenses', 'Despesas na competência', 360),
      metric('reconciled', 'Despesas conciliadas', 357),
      metric('pending', 'Despesas a conciliar', 3),
    ],
  },
  {
    id: 'agent',
    refs: ['agent'],
    method: 'project_simulation',
    base: 900,
    failures: 1,
    health: 'degraded',
    metrics: [
      metric('runs', 'Execuções fictícias', 24),
      metric('completed', 'Execuções concluídas', 23),
      metric('failed', 'Execuções com falha', 1),
    ],
  },
  {
    id: 'frontend',
    refs: ['frontend'],
    method: 'project_simulation',
    base: 90,
    metrics: [
      metric('lcp', 'LCP p75 simulado', 1840, 'ms'),
      metric('inp', 'INP p75 simulado', 128, 'ms'),
      metric('cls', 'CLS p75 simulado', 0.04, 'índice'),
    ],
  },
  {
    id: 'saude',
    refs: ['sulamerica', 'wellhub'],
    method: 'manual_export',
    metrics: [
      metric('insured', 'Beneficiários SulAmérica', 120),
      metric('eligible', 'Elegíveis Wellhub', 120),
      metric('registered', 'Cadastrados Wellhub', 84),
    ],
    note: 'Contadores administrativos de duas fontes distintas. Nenhum dado clínico ou uso individual é simulado.',
  },
  {
    id: 'porto-seguro',
    refs: ['porto'],
    method: 'manual_export',
    metrics: [
      metric('insured', 'Vidas na relação fictícia', 120),
      metric('pending', 'Movimentações pendentes', 2),
    ],
    note: 'Somente seguro de vida, conforme o escopo local. Nenhum contrato de API da empresa foi confirmado.',
  },
  {
    id: 'flash',
    refs: ['flash'],
    method: 'documented_api',
    base: 220,
    reason: 'auth_error',
    health: 'unknown',
    metrics: [
      metric('registered', 'Cadastros na última base fictícia', 115),
      metric('pending', 'Convites pendentes', 5),
    ],
    note: 'Cenário de token recusado. Os contadores pertencem ao arquivo demonstrativo, não à tentativa de consulta.',
  },
  {
    id: 'vixting',
    refs: ['vixting'],
    method: 'project_simulation',
    base: 290,
    integration: 'paused',
    metrics: [
      metric('admissions', 'Admissões acompanhadas', 8),
      metric('certificates', 'Atestados recebidos', 14),
      metric('pending', 'Documentos pendentes', 2),
    ],
    note: 'Saúde do adaptador fictício e integração pausada são independentes. Ponto → Sólides segue proposta local, sem contrato validado.',
  },
  {
    id: 'clude',
    refs: ['clude'],
    method: 'manual_export',
    metrics: [
      metric('registered', 'Cadastros administrativos', 116),
      metric('pending', 'Cadastros pendentes', 4),
    ],
  },
  {
    id: 'alura',
    refs: ['alura'],
    method: 'manual_export',
    metrics: [
      metric('assigned', 'Licenças atribuídas', 76),
      metric('available', 'Licenças disponíveis', 4),
      metric('requests', 'Solicitações à administração', 3),
    ],
    note: 'Mantida a restrição do fluxo da equipe: solicitação de licença por e-mail. Não há automação direta habilitada.',
  },
  {
    id: 'senai',
    refs: ['senai'],
    method: 'manual_export',
    metrics: [
      metric('forms', 'Formulários recebidos', 12),
      metric('enrolled', 'Matrículas confirmadas', 9),
      metric('pending', 'Formulários em análise', 3),
    ],
    note: 'Processo em análise. Os números não comprovam matrícula ou API da unidade usada pela empresa.',
  },
  {
    id: 'sharepoint',
    refs: ['sharepoint', 'graph'],
    method: 'documented_api',
    base: 380,
    failures: 15,
    health: 'unavailable',
    metrics: [
      metric('documents', 'Documentos previstos para backup', 48),
      metric('backedUp', 'Backups concluídos', 36),
      metric('pending', 'Backups pendentes', 12),
    ],
    note: 'Falha do destino fictício de backup; não indica incidente real no Microsoft 365.',
  },
  {
    id: 'sindpd',
    refs: ['sindpd', 'mail'],
    method: 'email_workflow',
    metrics: [
      metric('queued', 'Mensagens na fila proposta', 6),
      metric('sent', 'Envios simulados', 4),
      metric('pending', 'Mensagens pendentes', 2),
    ],
    note: 'Nenhum e-mail foi enviado. Fluxo local proposto; não existe API do Sindpd confirmada.',
  },
  {
    id: 'email-solides',
    refs: ['mail', 'solides'],
    method: 'email_workflow',
    metrics: [
      metric('received', 'Mensagens de fornecedores', 25),
      metric('mapped', 'Mensagens mapeadas', 23),
      metric('pending', 'Mensagens a revisar', 2),
    ],
    note: 'Padizzi, Limpeza, VT Privado, Seguros e Ourho: origens informadas no projeto. Mapeamento de campos ainda proposto.',
  },
  {
    id: 'autentique',
    refs: ['autentique'],
    method: 'documented_api',
    base: 250,
    health: 'maintenance',
    metrics: [
      metric('documents', 'Documentos criados', 48),
      metric('signed', 'Documentos concluídos', 41),
      metric('pending', 'Documentos aguardando assinatura', 7),
    ],
    note: 'Manutenção ilustrativa do adaptador; não representa aviso oficial do fornecedor.',
  },
  {
    id: 'onfly',
    refs: ['onfly'],
    method: 'documented_api',
    base: 340,
    metrics: [
      metric('expenses', 'Despesas de viagem e hospedagem', 240),
      metric('travel', 'Lançamentos de viagem', 120),
      metric('lodging', 'Lançamentos de hospedagem', 120),
    ],
    note: 'Origem das duas despesas Onfly por colaborador na competência da base financeira fictícia.',
  },
]
const observations = apps.map((app) => {
  const measured = app.base !== undefined
  const failed = app.reason ? 60 : (app.failures ?? 0)
  const samples = measured
    ? Array.from({ length: 60 }, (_, i) => ({
        durationMs: i >= 60 - failed ? 5000 : app.base + (i % 10) * 12,
        ok: i < 60 - failed,
      }))
    : []
  const durations = samples.map((s) => s.durationMs).sort((a, b) => a - b)
  const histogram = [...new Set(durations)].map((durationMs) => ({
    durationMs,
    count: durations.filter((v) => v === durationMs).length,
  }))
  const hasMetrics = measured && !app.reason && app.health !== 'maintenance'
  return {
    systemId: app.id,
    health: app.health ?? (measured ? 'available' : 'unknown'),
    integrationState:
      app.integration ?? (measured ? 'enabled' : 'not_configured'),
    reason: app.reason ?? (measured ? null : 'not_configured'),
    source: measured
      ? 'Adaptador fictício local · sem requisições ao fornecedor'
      : 'Arquivo administrativo fictício · sem coleta técnica',
    observedAt: measured ? reference : null,
    expiresAt: measured ? expiresAt : null,
    windowSeconds: measured ? 3600 : null,
    metrics: {
      availabilityPercent: hasMetrics ? ((60 - failed) / 60) * 100 : null,
      latencyP95Ms: hasMetrics ? durations[Math.ceil(60 * 0.95) - 1] : null,
      errorRatePercent: hasMetrics ? (failed / 60) * 100 : null,
    },
    lastHttpStatus: measured ? (app.reason ? 401 : failed ? 503 : 200) : null,
    lastCheckDurationMs: measured ? samples.at(-1).durationMs : null,
    demo: {
      collectionMethod: app.method,
      note:
        app.note ??
        'Exemplo local; acesso real e contrato da empresa não foram confirmados.',
      officialReferences: app.refs.map((id) => sources[id]),
      businessMetrics: app.metrics,
      checks: measured
        ? {
            total: 60,
            successful: 60 - failed,
            failed,
            durationHistogram: histogram,
            percentileMethod: 'nearest-rank',
            periodStart: '2026-11-24T14:00:00.000Z',
            periodEnd: reference,
          }
        : null,
    },
  }
})
const snapshot = {
  schemaVersion: 1,
  mode: 'demo',
  generatedAt: reference,
  provenance: {
    organizationContext: '2RPnet / Inovanet',
    synthetic: true,
    description:
      'Funcionalidades baseadas em fontes oficiais. Todos os valores, incidentes, estados e execuções são fictícios; não são telemetria pública coletada nem dados reais da empresa.',
    businessPeriod: '2026-10',
    metricDefinitions: {
      availabilityPercent:
        '100 × verificações bem-sucedidas / total de verificações fictícias.',
      errorRatePercent:
        '100 × verificações com falha / total de verificações fictícias.',
      latencyP95Ms:
        'Percentil 95 pelo método nearest-rank de todas as durações fictícias, incluindo falhas.',
      businessMetrics:
        'Indicadores administrativos do cenário, definidos pelo projeto a partir dos recursos descritos nas fontes; não são nomes de campos oficiais.',
    },
  },
  observations,
  execution: {
    id: 'DEMO-EXEC-0042',
    startedAt: '2026-11-24T14:59:58.000Z',
    expiresAt,
    state: 'failed',
    steps: [
      { stepId: 'trigger', state: 'completed', durationMs: 35 },
      { stepId: 'rh', state: 'completed', durationMs: 188 },
      { stepId: 'finance', state: 'failed', durationMs: 1800 },
      { stepId: 'consolidation', state: 'skipped', durationMs: null },
    ],
  },
}
const directory = new URL('../src/data/mocks/', import.meta.url)
mkdirSync(directory, { recursive: true })
writeFileSync(
  new URL('connected-apps.json', directory),
  JSON.stringify(snapshot, null, 2) + '\n',
)
console.log(
  `JSON demonstrativo gerado: ${observations.length} alvos, referência fixa ${reference}.`,
)
