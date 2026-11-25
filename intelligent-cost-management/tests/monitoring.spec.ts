import { expect, test } from '@playwright/test'
import connectedApps from '../src/data/mocks/connected-apps.json' with { type: 'json' }
import {
  employees,
  variableExpenses,
  referencePeriod,
} from '../src/data/people'
import {
  demoReference,
  demoSnapshot,
  inventorySnapshot,
  monitoredSystems,
} from '../src/data/monitoring'
import {
  currentExecution,
  fetchMonitoringSnapshot,
  normalizeObservation,
  parseMonitoringSnapshot,
  summarizeMonitoring,
  systemMonitors,
} from '../src/services/monitoringService'

const now = Date.parse(demoReference)
const sample = () =>
  demoSnapshot().observations.find((o) => o.systemId === 'solides')!

test('cenários preservam o arquivo-base e mantêm métricas reconciliadas com suas amostras', async () => {
  const { demoScenarios, demoScenarioId } =
    await import('../src/data/demoScenarios')
  const baseline = demoSnapshot()
  expect(demoScenarioId('__proto__')).toBe('overview')
  expect(demoScenarioId('inválido')).toBe('overview')
  for (const scenario of Object.keys(
    demoScenarios,
  ) as (keyof typeof demoScenarios)[]) {
    const snapshot = demoSnapshot(scenario)
    expect(snapshot.observations.map((o) => o.systemId)).toEqual(
      baseline.observations.map((o) => o.systemId),
    )
    for (const observation of snapshot.observations) {
      const checks = observation.demo?.checks
      if (!checks) continue
      expect(checks.successful + checks.failed).toBe(checks.total)
      const durations = checks.durationHistogram
        .flatMap((bucket) =>
          Array<number>(bucket.count).fill(bucket.durationMs),
        )
        .sort((a, b) => a - b)
      expect(durations).toHaveLength(checks.total)
      if (observation.metrics.latencyP95Ms !== null) {
        expect(observation.metrics.latencyP95Ms).toBe(
          durations[Math.ceil(0.95 * checks.total) - 1],
        )
        expect(observation.metrics.availabilityPercent).toBeCloseTo(
          (100 * checks.successful) / checks.total,
        )
        expect(observation.metrics.errorRatePercent).toBeCloseTo(
          (100 * checks.failed) / checks.total,
        )
      }
    }
    expect(demoSnapshot()).toEqual(baseline)
  }
})

test('falha e autorização recusada interrompem somente as etapas dependentes da execução', () => {
  expect(
    demoSnapshot('normal').execution!.steps.every(
      (step) => step.state === 'completed',
    ),
  ).toBe(true)
  const failure = demoSnapshot('failure')
  expect(failure.execution!.steps.map((step) => step.state)).toEqual([
    'completed',
    'completed',
    'failed',
    'skipped',
  ])
  expect(
    failure.observations.find((o) => o.systemId === 'omie')!.metrics
      .errorRatePercent,
  ).toBe(20)
  const denied = demoSnapshot('denied')
  expect(denied.execution!.steps.map((step) => step.state)).toEqual([
    'completed',
    'failed',
    'skipped',
    'skipped',
  ])
  expect(
    denied.observations.find((o) => o.systemId === 'solides'),
  ).toMatchObject({
    health: 'unknown',
    reason: 'auth_error',
    lastHttpStatus: 403,
  })
  expect(systemMonitors(denied, now).find((o) => o.id === 'omie')!.health).toBe(
    'available',
  )
  expect(
    denied
      .execution!.steps.filter((step) => step.state === 'skipped')
      .every((step) => step.durationMs === null),
  ).toBe(true)
})

test('exportar a simulação vencida mantém datas e remove estados e métricas sem validade', async () => {
  const { demoScenarioClock } = await import('../src/data/demoScenarios')
  const { exportDemoScenario } =
    await import('../src/services/demoScenarioService')
  const snapshot = demoSnapshot('expired')
  const expiredNow = demoScenarioClock('expired')
  expect(expiredNow - now).toBe(120_000)
  const exported = exportDemoScenario(snapshot, 'expired', expiredNow)
  expect(exported.generatedAt).toBe(demoReference)
  expect(exported.demoScenario.id).toBe('expired')
  expect(
    exported.observations.every(
      (observation) =>
        observation.health === 'unknown' &&
        Object.values(observation.metrics).every((value) => value === null),
    ),
  ).toBe(true)
  expect(
    exported.execution!.steps.every(
      (step) => step.state === 'unknown' && step.durationMs === null,
    ),
  ).toBe(true)
  expect(
    exported.observations.find((o) => o.systemId === 'solides')!.observedAt,
  ).toBe(demoReference)
  expect(
    snapshot.observations.find((o) => o.systemId === 'solides')!.metrics
      .availabilityPercent,
  ).toBe(100)
})

test('pendências vêm dos indicadores administrativos e ausência de dados não vira zero', async () => {
  const { demoPendingTasks } =
    await import('../src/services/demoScenarioService')
  const tasks = demoPendingTasks(demoSnapshot())
  expect(tasks.map((task) => task.pending)).toEqual([12, 7, 3])
  for (const task of tasks) {
    expect(task.pending! + task.completed!).toBe(task.total)
    expect(task.completionPercent).toBeCloseTo(
      (100 * task.completed!) / task.total!,
    )
    expect(task.href).toContain('mode=demo')
    expect(task.href).toContain(`system=${task.systemId}`)
  }
  const unavailable = demoPendingTasks(inventorySnapshot())
  expect(
    unavailable.every(
      (task) =>
        task.pending === null &&
        task.completed === null &&
        task.total === null &&
        task.completionPercent === null,
    ),
  ).toBe(true)
})

test('JSON cobre todo o inventário, documenta a origem e reconcilia contadores com a base financeira', () => {
  expect(connectedApps.mode).toBe('demo')
  expect(connectedApps.provenance.synthetic).toBe(true)
  expect(connectedApps.observations.map((o) => o.systemId).sort()).toEqual(
    monitoredSystems.map((s) => s.id).sort(),
  )
  expect(new Set(connectedApps.observations.map((o) => o.systemId)).size).toBe(
    monitoredSystems.length,
  )
  for (const observation of connectedApps.observations) {
    expect(observation.demo.officialReferences.length).toBeGreaterThan(0)
    expect(observation.demo.businessMetrics.length).toBeGreaterThan(0)
    for (const reference of observation.demo.officialReferences) {
      expect(new URL(reference.url).protocol).toBe('https:')
      expect(reference.checkedOn).toBe('2026-11-24')
      expect(reference.supports.length).toBeGreaterThan(20)
    }
    for (const metric of observation.demo.businessMetrics) {
      expect(metric.basis).toBe('project_demo')
      expect(metric.period).toBe(referencePeriod)
      expect(Number.isFinite(metric.value) && metric.value >= 0).toBe(true)
    }
  }
  const value = (system: string, metric: string) =>
    connectedApps.observations
      .find((o) => o.systemId === system)!
      .demo.businessMetrics.find((m) => m.id === metric)!.value
  expect(value('solides', 'employees')).toBe(employees.length)
  expect(value('solides', 'departments')).toBe(
    new Set(employees.map((e) => e.departamento)).size,
  )
  expect(value('omie', 'expenses')).toBe(
    variableExpenses.filter((e) => e.periodo === referencePeriod).length,
  )
  expect(value('onfly', 'expenses')).toBe(
    variableExpenses.filter(
      (e) => e.periodo === referencePeriod && e.origem === 'Onfly',
    ).length,
  )
  expect(value('omie', 'reconciled') + value('omie', 'pending')).toBe(
    value('omie', 'expenses'),
  )
  expect(value('sharepoint', 'backedUp') + value('sharepoint', 'pending')).toBe(
    value('sharepoint', 'documents'),
  )
  expect(value('autentique', 'signed') + value('autentique', 'pending')).toBe(
    value('autentique', 'documents'),
  )
})

test('recalcular taxas e percentil pelo histograma do JSON sem inventar métricas para fluxos manuais', () => {
  for (const observation of connectedApps.observations) {
    const checks = observation.demo.checks
    if (!checks) {
      expect(Object.values(observation.metrics).every((v) => v === null)).toBe(
        true,
      )
      expect(observation.observedAt).toBeNull()
      continue
    }
    expect(checks.successful + checks.failed).toBe(checks.total)
    expect(
      (Date.parse(checks.periodEnd) - Date.parse(checks.periodStart)) / 1000,
    ).toBe(observation.windowSeconds)
    const durations = checks.durationHistogram
      .flatMap((bucket) => Array<number>(bucket.count).fill(bucket.durationMs))
      .sort((a, b) => a - b)
    expect(durations).toHaveLength(checks.total)
    if (observation.metrics.latencyP95Ms === null) continue
    expect(observation.metrics.latencyP95Ms).toBe(
      durations[Math.ceil(checks.total * 0.95) - 1],
    )
    expect(observation.metrics.availabilityPercent).toBeCloseTo(
      (100 * checks.successful) / checks.total,
    )
    expect(observation.metrics.errorRatePercent).toBeCloseTo(
      (100 * checks.failed) / checks.total,
    )
  }
  const copy = demoSnapshot()
  copy.observations[0].metrics.availabilityPercent = 0
  expect(sample().metrics.availabilityPercent).toBe(100)
})

test('não atribuir saúde ou configuração às ferramentas sem coleta', () => {
  const systems = systemMonitors(inventorySnapshot(), now)
  expect(new Set(systems.map((s) => s.id)).size).toBe(monitoredSystems.length)
  expect(
    systems.every(
      (s) => s.health === 'unknown' && s.integrationState === 'unknown',
    ),
  ).toBe(true)
  expect(
    systems.every((s) => Object.values(s.metrics).every((v) => v === null)),
  ).toBe(true)
  expect(systems.some((s) => s.id === 'juridico')).toBe(false)
  expect(summarizeMonitoring(systems)).toMatchObject({
    available: 0,
    attention: 0,
    unknown: systems.length,
  })
})
test('substituir verde vencido e valores antigos por ausência de telemetria', () => {
  const observation = sample()
  const expired = normalizeObservation(
    observation,
    Date.parse(observation.expiresAt!),
  )
  expect(expired.health).toBe('unknown')
  expect(expired.reason).toBe('stale')
  expect(expired.integrationState).toBe('enabled')
  expect(Object.values(expired.metrics).every((v) => v === null)).toBe(true)
  expect(
    normalizeObservation(
      { ...observation, observedAt: null, expiresAt: null },
      now,
    ).health,
  ).toBe('unknown')
  expect(normalizeObservation(observation, now - 60_000).health).toBe('unknown')
})
test('distinguir autorização, limitação e pausa da disponibilidade do alvo', () => {
  expect(
    normalizeObservation(
      { ...sample(), health: 'unavailable', reason: 'auth_error' },
      now,
    ).health,
  ).toBe('unknown')
  expect(
    normalizeObservation({ ...sample(), reason: 'collector_error' }, now)
      .health,
  ).toBe('unknown')
  expect(
    normalizeObservation({ ...sample(), reason: 'rate_limited' }, now).health,
  ).toBe('degraded')
  const limitedWithoutWindow = normalizeObservation(
    { ...sample(), reason: 'rate_limited', windowSeconds: null },
    now,
  )
  expect(limitedWithoutWindow.health).toBe('degraded')
  expect(
    Object.values(limitedWithoutWindow.metrics).every((v) => v === null),
  ).toBe(true)
  expect(
    normalizeObservation({ ...sample(), integrationState: 'paused' }, now),
  ).toMatchObject({ health: 'available', integrationState: 'paused' })
  expect(
    normalizeObservation({ ...sample(), reason: 'not_configured' }, now).health,
  ).toBe('unknown')
  expect(
    Object.values(
      normalizeObservation({ ...sample(), windowSeconds: null }, now).metrics,
    ).every((v) => v === null),
  ).toBe(true)
})
test('validar o contrato, rejeitar duplicações e não aceitar métricas impossíveis', () => {
  const valid = { ...demoSnapshot(), mode: 'live' }
  expect(parseMonitoringSnapshot(valid).mode).toBe('live')
  expect(() => parseMonitoringSnapshot(demoSnapshot())).toThrow()
  expect(() =>
    parseMonitoringSnapshot({ ...valid, observations: [sample(), sample()] }),
  ).toThrow()
  expect(() =>
    parseMonitoringSnapshot({
      ...valid,
      observations: [
        {
          ...sample(),
          metrics: { ...sample().metrics, availabilityPercent: 101 },
        },
      ],
    }),
  ).toThrow()
  expect(() =>
    parseMonitoringSnapshot({
      ...valid,
      observations: [{ ...sample(), health: '__proto__' }],
    }),
  ).toThrow()
  expect(() =>
    parseMonitoringSnapshot({
      ...valid,
      observations: [{ ...sample(), observedAt: 'amanhã' }],
    }),
  ).toThrow()
  expect(() =>
    parseMonitoringSnapshot({
      ...valid,
      execution: {
        ...valid.execution,
        steps: [valid.execution!.steps[0], valid.execution!.steps[0]],
      },
    }),
  ).toThrow()
})
test('manter o cenário determinístico e separar falha financeira de consolidação não executada', () => {
  expect(demoSnapshot()).toEqual(demoSnapshot())
  const snapshot = demoSnapshot()
  const sharepoint = snapshot.observations.find(
    (s) => s.systemId === 'sharepoint',
  )!
  expect(sharepoint.metrics.availabilityPercent).toBe(75)
  expect(sharepoint.metrics.errorRatePercent).toBe(25)
  expect(snapshot.execution!.steps.map((s) => s.stepId)).toEqual([
    'trigger',
    'rh',
    'finance',
    'consolidation',
  ])
  expect(snapshot.execution!.steps[2].state).toBe('failed')
  expect(snapshot.execution!.steps[3]).toMatchObject({
    state: 'skipped',
    durationMs: null,
  })
  expect(currentExecution(null, now)).toBeNull()
  const expired = currentExecution(snapshot.execution, now + 300_000)!
  expect(expired.state).toBe('unknown')
  expect(
    expired.steps.every((s) => s.state === 'unknown' && s.durationMs === null),
  ).toBe(true)
})
test('aceitar leitura HTTP válida, recusar falha HTTP e respeitar cancelamento', async () => {
  const original = globalThis.fetch
  const controller = new AbortController()
  let received: AbortSignal | null | undefined
  try {
    globalThis.fetch = async (_input, init) => {
      received = init?.signal
      return new Response(JSON.stringify({ ...demoSnapshot(), mode: 'live' }), {
        status: 200,
      })
    }
    expect(
      (await fetchMonitoringSnapshot('/coleta', controller.signal)).mode,
    ).toBe('live')
    expect(received).toBe(controller.signal)
    globalThis.fetch = async () => new Response('', { status: 503 })
    await expect(
      fetchMonitoringSnapshot('/coleta', controller.signal),
    ).rejects.toThrow('não foram classificados como indisponíveis')
    globalThis.fetch = async () =>
      new Response('<html>Falha</html>', { status: 200 })
    await expect(
      fetchMonitoringSnapshot('/coleta', controller.signal),
    ).rejects.toThrow('formato inválido')
  } finally {
    globalThis.fetch = original
  }
})
