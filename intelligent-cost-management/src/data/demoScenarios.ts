import connectedApps from './mocks/connected-apps.json' with { type: 'json' }
import type { MonitoringSnapshot, SystemObservation } from '../types/monitoring'

export const demoScenarios = {
  overview: {
    label: 'Visão geral',
    description:
      'Explore os estados do arquivo demonstrativo: disponibilidade, falhas, pausa e manutenção.',
  },
  normal: {
    label: 'Operação normal',
    description:
      'Os adaptadores fictícios respondem e os quatro nós concluem a execução. Rotinas manuais continuam sem coleta técnica.',
  },
  failure: {
    label: 'Falha na integração',
    description:
      'O adaptador financeiro apresenta erros. A consulta à Omie falha e a consolidação não é executada.',
  },
  denied: {
    label: 'Acesso recusado',
    description:
      'A consulta de RH recebe HTTP 403. A saúde da Sólides fica desconhecida e as etapas seguintes não são executadas.',
  },
  expired: {
    label: 'Coleta vencida',
    description:
      'O relógio da simulação avança dois minutos. As observações técnicas vencem e deixam de confirmar a saúde dos alvos.',
  },
} as const
export type DemoScenarioId = keyof typeof demoScenarios
export const demoReference = connectedApps.generatedAt
export const demoScenarioId = (value: string | null): DemoScenarioId =>
  value && Object.hasOwn(demoScenarios, value)
    ? (value as DemoScenarioId)
    : 'overview'
export const demoScenarioClock = (scenario: DemoScenarioId) =>
  Date.parse(demoReference) + (scenario === 'expired' ? 120_000 : 0)

function simulateChecks(observation: SystemObservation, failed: number) {
  const total = 60
  const base =
    observation.demo?.checks?.durationHistogram.find(
      (bucket) => bucket.durationMs < 5000,
    )?.durationMs ?? 250
  const durations = Array.from({ length: total }, (_, index) =>
    index >= total - failed ? 5000 : base + (index % 10) * 12,
  )
  const sorted = [...durations].sort((a, b) => a - b)
  observation.health = failed ? 'degraded' : 'available'
  observation.integrationState = 'enabled'
  observation.reason = null
  observation.lastHttpStatus = failed ? 503 : 200
  observation.lastCheckDurationMs = durations.at(-1)!
  observation.metrics = {
    availabilityPercent: (100 * (total - failed)) / total,
    errorRatePercent: (100 * failed) / total,
    latencyP95Ms: sorted[Math.ceil(total * 0.95) - 1],
  }
  if (observation.demo?.checks) {
    observation.demo.checks = {
      ...observation.demo.checks,
      total,
      successful: total - failed,
      failed,
      durationHistogram: [...new Set(sorted)].map((durationMs) => ({
        durationMs,
        count: sorted.filter((value) => value === durationMs).length,
      })),
    }
    observation.demo.note =
      'Resposta do adaptador fictício neste cenário. Nenhuma consulta ou alteração foi feita no fornecedor.'
  }
}

export function demoSnapshot(
  scenario: DemoScenarioId = 'overview',
): MonitoringSnapshot {
  const snapshot = structuredClone(connectedApps) as MonitoringSnapshot
  // O cenário-base permanece intacto, incluindo fontes e contadores administrativos.
  if (scenario === 'overview' || scenario === 'expired') return snapshot
  for (const observation of snapshot.observations) {
    if (observation.observedAt) simulateChecks(observation, 0)
  }
  const execution = snapshot.execution!
  execution.id = `DEMO-${scenario.toUpperCase()}-0042`
  execution.state = 'completed'
  execution.steps.forEach((step, index) => {
    step.state = 'completed'
    step.durationMs = [35, 188, 460, 120][index]
  })
  const agent = snapshot.observations.find((o) => o.systemId === 'agent')!
  for (const metric of agent.demo?.businessMetrics ?? []) {
    if (metric.id === 'completed')
      metric.value = scenario === 'normal' ? 24 : 23
    if (metric.id === 'failed') metric.value = scenario === 'normal' ? 0 : 1
  }
  if (scenario === 'failure') {
    simulateChecks(
      snapshot.observations.find((o) => o.systemId === 'omie')!,
      12,
    )
    execution.state = 'failed'
    execution.steps[2] = {
      stepId: 'finance',
      state: 'failed',
      durationMs: 5000,
    }
    execution.steps[3] = {
      stepId: 'consolidation',
      state: 'skipped',
      durationMs: null,
    }
    simulateChecks(agent, 1)
  }
  if (scenario === 'denied') {
    const rh = snapshot.observations.find((o) => o.systemId === 'solides')!
    rh.health = 'unknown'
    rh.reason = 'auth_error'
    rh.lastHttpStatus = 403
    rh.lastCheckDurationMs = 120
    rh.metrics = {
      availabilityPercent: null,
      errorRatePercent: null,
      latencyP95Ms: null,
    }
    if (rh.demo?.checks)
      rh.demo.checks = {
        ...rh.demo.checks,
        successful: 0,
        failed: 60,
        durationHistogram: [{ durationMs: 120, count: 60 }],
      }
    execution.state = 'failed'
    execution.steps[1] = { stepId: 'rh', state: 'failed', durationMs: 120 }
    execution.steps[2] = {
      stepId: 'finance',
      state: 'skipped',
      durationMs: null,
    }
    execution.steps[3] = {
      stepId: 'consolidation',
      state: 'skipped',
      durationMs: null,
    }
    simulateChecks(agent, 1)
  }
  return snapshot
}
