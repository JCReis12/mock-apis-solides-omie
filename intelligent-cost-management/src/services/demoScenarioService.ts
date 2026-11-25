import { demoScenarios, type DemoScenarioId } from '../data/demoScenarios'
import { currentExecution, normalizeObservation } from './monitoringService'
import type { MonitoringSnapshot } from '../types/monitoring'

export function exportDemoScenario(
  snapshot: MonitoringSnapshot,
  scenario: DemoScenarioId,
  now: number,
) {
  return {
    ...snapshot,
    demoScenario: {
      id: scenario,
      label: demoScenarios[scenario].label,
      evaluatedAt: new Date(now).toISOString(),
    },
    observations: snapshot.observations.map((observation) =>
      normalizeObservation(observation, now),
    ),
    execution: currentExecution(snapshot.execution, now),
  }
}

export const pendingTaskDefinitions = [
  {
    systemId: 'sharepoint',
    title: 'Backups pendentes',
    totalMetric: 'documents',
    completedMetric: 'backedUp',
    completedLabel: 'documentos com backup',
    action: 'Conferir backups',
    description: 'Documentos aguardando cópia no destino previsto para o RH.',
  },
  {
    systemId: 'autentique',
    title: 'Documentos aguardando assinatura',
    totalMetric: 'documents',
    completedMetric: 'signed',
    completedLabel: 'documentos concluídos',
    action: 'Conferir assinaturas',
    description: 'Documentos que ainda aguardam a conclusão das assinaturas.',
  },
  {
    systemId: 'omie',
    title: 'Despesas a conciliar',
    totalMetric: 'expenses',
    completedMetric: 'reconciled',
    completedLabel: 'despesas conciliadas',
    action: 'Conferir despesas',
    description:
      'Lançamentos financeiros aguardando conferência na competência.',
  },
] as const

export function demoPendingTasks(snapshot: MonitoringSnapshot) {
  return pendingTaskDefinitions.map((definition) => {
    const observation = snapshot.observations.find(
      (item) => item.systemId === definition.systemId,
    )
    const value = (id: string) =>
      observation?.demo?.businessMetrics.find((metric) => metric.id === id)
        ?.value ?? null
    const pending = value('pending')
    const completed = value(definition.completedMetric)
    const total = value(definition.totalMetric)
    return {
      ...definition,
      pending,
      completed,
      total,
      period:
        observation?.demo?.businessMetrics.find(
          (metric) => metric.id === 'pending',
        )?.period ?? null,
      completionPercent:
        completed !== null && total !== null && total > 0 && completed <= total
          ? (100 * completed) / total
          : null,
      href: `/monitoramento?mode=demo&system=${definition.systemId}`,
    }
  })
}
