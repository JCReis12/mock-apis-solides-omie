import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const plan = JSON.parse(
  readFileSync(new URL('./demonstracao-apps.json', import.meta.url), 'utf8'),
)
const apply = process.argv[2] === '--apply'
if (process.argv[2] && !['--apply', '--plan'].includes(process.argv[2]))
  throw new Error('Use --plan ou --apply.')
if (
  plan.repository !== 'Jukamargo/frontend-pi-gestao-de-custos' ||
  plan.projectOwner !== 'Jukamargo' ||
  plan.projectNumber !== 2
)
  throw new Error('Destino inesperado.')
const ghPath = `${root}artifacts/tools/github-cli/bin/gh.exe`
const gh = existsSync(ghPath) ? ghPath : 'gh'
function command(...args) {
  try {
    return execFileSync(gh, args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 45000,
    }).trim()
  } catch {
    throw new Error(
      `Falha no GitHub CLI (${args.slice(0, 2).join(' ')}). A operação foi interrompida sem repetição automática; confira autenticação/rede e execute --plan antes de retomar.`,
    )
  }
}
const json = (...args) => JSON.parse(command(...args))
const listIssues = () =>
  json(
    'issue',
    'list',
    '--repo',
    plan.repository,
    '--state',
    'all',
    '--limit',
    '1000',
    '--json',
    'number,title,body,state,url,labels',
  )
const listItems = () => {
  const result = json(
    'project',
    'item-list',
    '2',
    '--owner',
    plan.projectOwner,
    '--limit',
    '1000',
    '--format',
    'json',
  )
  if (result.items.length !== result.totalCount)
    throw new Error('Listagem do Project incompleta.')
  return result
}
const issues = listIssues()
const project = json(
  'project',
  'view',
  '2',
  '--owner',
  plan.projectOwner,
  '--format',
  'json',
)
if (!project.readme?.includes('<!-- gestao-de-custos-kanban-project -->'))
  throw new Error('O quadro não contém o marcador esperado.')
const fields = json(
  'project',
  'field-list',
  '2',
  '--owner',
  plan.projectOwner,
  '--format',
  'json',
)
const statusField = fields.fields.find((field) => field.name === 'Status')
const items = listItems()
const marker = (id) => `<!-- gestao-de-custos-demo:${id} -->`
const findCard = (card, values = issues) => {
  const matches = values.filter(
    (issue) =>
      issue.body?.includes(marker(card.id)) ||
      issue.title.startsWith(`[${card.id}]`),
  )
  if (matches.length > 1) throw new Error(`Cartões duplicados: ${card.id}.`)
  return matches[0]
}
for (const entry of [...plan.cards, ...plan.existingUpdates]) {
  if (
    entry.status &&
    !statusField?.options.some((option) => option.name === entry.status)
  )
    throw new Error(`Status ausente: ${entry.status}.`)
  if (entry.number && !issues.some((issue) => issue.number === entry.number))
    throw new Error(`Issue #${entry.number} ausente.`)
}
for (const card of plan.cards) {
  findCard(card)
  for (const path of card.files)
    if (!existsSync(`${root}${path}`))
      throw new Error(`Arquivo ausente: ${path}.`)
}
const snapshot = JSON.parse(
  readFileSync(`${root}src/data/mocks/connected-apps.json`, 'utf8'),
)
if (
  snapshot.mode !== 'demo' ||
  !snapshot.provenance.synthetic ||
  snapshot.observations.length !== 16
)
  throw new Error('JSON demonstrativo inválido.')
const directory = `${root}artifacts/kanban-demo/`
mkdirSync(directory, { recursive: true })
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
writeFileSync(
  `${directory}${timestamp}-before.json`,
  JSON.stringify({ project, fields, items, issues }, null, 2) + '\n',
)
const prepared = []
for (const card of plan.cards) {
  const body = `${marker(card.id)}\n\n${card.description}\n\n## Situação\n\n- Status no Project: **${card.status}**.\n- Escopo: front-end demonstrativo.\n- Implementação e testes no workspace local; código ainda sem publicação nesta atualização do quadro.\n- Responsável e prazo: a definir pela equipe.\n- Referência: solicitação de 24/11/2026, sem acesso às APIs reais.\n\n## Critérios técnicos verificados localmente\n\n${card.acceptance.map((item) => `- [x] ${item}`).join('\n')}\n\n## Aceite\n\n- [ ] Revisar a entrega com a equipe e registrar o aceite.\n- [ ] Publicar o código validado na branch/ambiente acordado antes de encerrar.\n\n## Arquivos da entrega local\n\n${card.files.map((path) => `- \`${path}\``).join('\n')}\n\nValidação local: 19 testes de dados, três testes de interface responsiva, lint e build. A coleta real, o chatbot e as permissões externas são acompanhados nas issues #121, #123, #124, #129 e #131; não são concluídos por esta demonstração.\n`
  const path = `${directory}${card.id}.md`
  writeFileSync(path, body)
  prepared.push({ ...card, path, body, issue: findCard(card) })
}
const start = '<!-- demonstracao-apps-2026-11-24:start -->'
const end = '<!-- demonstracao-apps-2026-11-24:end -->'
const existingPrepared = plan.existingUpdates.map((entry) => {
  const issue = issues.find((value) => value.number === entry.number)
  let body = issue.body ?? ''
  const startAt = body.indexOf(start)
  if (startAt !== -1) {
    const endAt = body.indexOf(end, startAt)
    if (endAt === -1)
      throw new Error(`Bloco incompleto na issue #${entry.number}.`)
    body = body.slice(0, startAt).trimEnd() + body.slice(endAt + end.length)
  }
  if (entry.status)
    body = body.replace(
      /- Status no Project: \*\*[^\n]+?\*\*\./,
      `- Status no Project: **${entry.status} (bloqueada por acesso externo)**.`,
    )
  body = `${body.trimEnd()}\n\n${start}\n\n## Atualização — demonstração dos aplicativos (24/11/2026)\n\n${entry.note}\n\nEntregas demonstrativas: GC-DEMO-001, GC-DEMO-002 e GC-DEMO-003. Fontes e limites: \`docs/DEMONSTRACAO_APPS.md\`.\n\n${end}\n`
  const path = `${directory}issue-${entry.number}.md`
  writeFileSync(path, body)
  return { ...entry, issue, body, path }
})
console.log(
  JSON.stringify(
    {
      mode: apply ? 'apply' : 'plan',
      project: project.url,
      cards: prepared.map(({ id, title, status, issue }) => ({
        id,
        title,
        status,
        existingIssue: issue?.number ?? null,
      })),
      updates: existingPrepared.map(({ number, status }) => ({
        number,
        status: status ?? 'preservado',
      })),
    },
    null,
    2,
  ),
)
if (!apply) process.exit(0)

function setStatus(issue, status, currentItems) {
  let item = currentItems.items.find(
    (value) => value.content?.url === issue.url,
  )
  if (!item)
    item = json(
      'project',
      'item-add',
      '2',
      '--owner',
      plan.projectOwner,
      '--url',
      issue.url,
      '--format',
      'json',
    )
  if (item.status !== status)
    command(
      'project',
      'item-edit',
      '--id',
      item.id,
      '--project-id',
      project.id,
      '--field-id',
      statusField.id,
      '--single-select-option-id',
      statusField.options.find((option) => option.name === status).id,
    )
}
for (const card of prepared) {
  let issue = card.issue
  if (!issue) {
    command(
      'issue',
      'create',
      '--repo',
      plan.repository,
      '--title',
      `[${card.id}] ${card.title}`,
      '--body-file',
      card.path,
      '--label',
      'kanban: gestão de custos',
      '--label',
      'prioridade: alta',
      '--label',
      'escopo: frontend',
      '--label',
      'área: Monitoramento e telemetria',
    )
    issue = findCard(card, listIssues())
    if (!issue)
      throw new Error(
        `Criação de ${card.id} não confirmada; interrompido para evitar duplicação.`,
      )
  } else if (
    issue.body !== card.body ||
    issue.title !== `[${card.id}] ${card.title}`
  ) {
    command(
      'issue',
      'edit',
      String(issue.number),
      '--repo',
      plan.repository,
      '--title',
      `[${card.id}] ${card.title}`,
      '--body-file',
      card.path,
    )
  }
  setStatus(issue, card.status, items)
}
for (const entry of existingPrepared) {
  if (entry.issue.body !== entry.body)
    command(
      'issue',
      'edit',
      String(entry.number),
      '--repo',
      plan.repository,
      '--body-file',
      entry.path,
    )
  if (entry.status) setStatus(entry.issue, entry.status, items)
}
const readme = `Quadro de acompanhamento do front-end de automação interna de backoffice — 2RPnet / Inovanet.\n\n120 tarefas originais de interface, 11 tarefas de telemetria e três entregas da demonstração dos aplicativos.\n\nAtualização de 24/11/2026: demonstração local em JSON dos 16 alvos com fontes oficiais, indicadores fictícios e download. GC-DEMO-001 a GC-DEMO-003 ficam em A validar para aceite e publicação do código. Integrações reais das issues #121 e #123 ficam em A fazer, com impedimento de credenciais, enquanto os acessos externos estão pendentes. O coletor pontual dos mocks (#122) permanece Em andamento.\n\nA validar significa revisão/aceite pendente; testes locais não homologam APIs externas. Responsáveis e prazos são definidos pela equipe. Nenhuma issue foi encerrada nesta atualização.\n\n<!-- gestao-de-custos-kanban-project -->`
if (
  project.readme !== readme ||
  project.shortDescription !==
    'Front-end do backoffice 2RPnet: 120 tarefas, telemetria e demonstração dos aplicativos com JSON e fontes oficiais.'
)
  command(
    'project',
    'edit',
    '2',
    '--owner',
    plan.projectOwner,
    '--description',
    'Front-end do backoffice 2RPnet: 120 tarefas, telemetria e demonstração dos aplicativos com JSON e fontes oficiais.',
    '--readme',
    readme,
  )
const afterIssues = listIssues()
const afterItems = listItems()
for (const card of prepared) {
  const issue = findCard(card, afterIssues)
  const item = afterItems.items.find(
    (value) => value.content?.url === issue?.url,
  )
  if (
    !issue ||
    issue.title !== `[${card.id}] ${card.title}` ||
    issue.body !== card.body ||
    item?.status !== card.status
  )
    throw new Error(`Verificação final falhou: ${card.id}.`)
}
for (const entry of existingPrepared) {
  if (
    afterIssues.find((value) => value.number === entry.number)?.body !==
    entry.body
  )
    throw new Error(`Corpo não confirmado: #${entry.number}.`)
  if (
    entry.status &&
    afterItems.items.find((value) => value.content?.url === entry.issue.url)
      ?.status !== entry.status
  )
    throw new Error(`Status não confirmado: #${entry.number}.`)
}
for (const issue of issues)
  if (
    afterIssues.find((value) => value.number === issue.number)?.state !==
    issue.state
  )
    throw new Error(
      `Estado da issue alterado inesperadamente: #${issue.number}.`,
    )
const report = {
  verifiedAt: new Date().toISOString(),
  project: project.url,
  total: afterItems.totalCount,
  statuses: afterItems.items.reduce(
    (counts, item) => ({
      ...counts,
      [item.status ?? 'Sem status']:
        (counts[item.status ?? 'Sem status'] ?? 0) + 1,
    }),
    {},
  ),
  cards: prepared.map((card) => {
    const issue = findCard(card, afterIssues)
    return {
      id: card.id,
      number: issue.number,
      url: issue.url,
      status: card.status,
    }
  }),
  updatedIssues: existingPrepared.map(({ number }) => number),
}
writeFileSync(
  `${directory}verified.json`,
  JSON.stringify(report, null, 2) + '\n',
)
console.log(JSON.stringify(report, null, 2))
