import { ecosystemServices } from './ecosystem'
export { demoReference, demoSnapshot } from './demoScenarios'
import type {
  MonitoringSnapshot,
  MonitoredSystem,
  SystemObservation,
} from '../types/monitoring'

const areas: Record<string, string> = {
  sharepoint: 'Documentos',
  sindpd: 'Comunicação',
  'email-solides': 'Comunicação',
}
export const monitoredSystems: readonly MonitoredSystem[] = [
  {
    id: 'solides',
    name: 'Sólides',
    area: 'RH',
    target:
      'API mock de RH baseada na documentação da Sólides. A verificação não mede o serviço real do fornecedor.',
    scopeLabel: 'API mock · dados de negócio simulados',
  },
  {
    id: 'omie',
    name: 'Omie',
    area: 'Financeiro',
    target:
      'API mock financeira baseada na documentação da Omie. A verificação não mede o serviço real do fornecedor.',
    scopeLabel: 'API mock · dados de negócio simulados',
  },
  {
    id: 'agent',
    name: 'Agente externo',
    area: 'Automação',
    target: 'Execuções e quatro nós do workflow',
    scopeLabel: 'Gemini Enterprise · acesso externo da equipe',
  },
  {
    id: 'onfly',
    name: 'Onfly',
    area: 'Financeiro',
    target:
      'Viagens e hospedagens usadas como despesas variáveis na demonstração financeira.',
    scopeLabel: 'Origem de despesas · integração real não confirmada',
  },
  {
    id: 'frontend',
    name: 'Portal interno',
    area: 'Infraestrutura',
    target: 'Página e futura API de leitura de telemetria',
  },
  ...ecosystemServices
    .filter((s) => s.status !== 'excluded')
    .map((s) => ({
      id: s.id,
      name: s.name,
      area: areas[s.id] || 'RH',
      target: s.scope,
    })),
  {
    id: 'autentique',
    name: 'Autentique',
    area: 'Documentos',
    target: 'Rotina documental e backup previsto no SharePoint',
  },
]
export const emptyMetrics = () => ({
  availabilityPercent: null,
  latencyP95Ms: null,
  errorRatePercent: null,
})
export function unknownObservation(systemId: string): SystemObservation {
  return {
    systemId,
    health: 'unknown',
    integrationState: 'unknown',
    reason: 'not_configured',
    source: null,
    observedAt: null,
    expiresAt: null,
    windowSeconds: null,
    metrics: emptyMetrics(),
  }
}
export function inventorySnapshot(): MonitoringSnapshot {
  return {
    schemaVersion: 1,
    mode: 'inventory',
    generatedAt: null,
    observations: monitoredSystems.map((s) => unknownObservation(s.id)),
    execution: null,
  }
}
