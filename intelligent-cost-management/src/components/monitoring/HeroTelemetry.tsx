import { Activity, ArrowUpRight, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { demoReference, demoSnapshot } from '../../data/monitoring'
import {
  monitoringDate,
  summarizeMonitoring,
  systemMonitors,
} from '../../services/monitoringService'
import { healthLabels } from '../../types/monitoring'

const systems = systemMonitors(demoSnapshot(), Date.parse(demoReference))
const summary = summarizeMonitoring(systems)
const highlights = ['solides', 'omie', 'sharepoint'].map((id) =>
  systems.find((system) => system.id === id)!,
)
const distribution = [
  { id: 'available', label: 'Disponíveis', count: summary.available },
  { id: 'attention', label: 'Com atenção', count: summary.attention },
  { id: 'maintenance', label: 'Em manutenção', count: summary.maintenance },
  { id: 'unknown', label: 'Sem telemetria', count: summary.unknown },
]

export function HeroTelemetry() {
  return (
    <aside className="hero-telemetry" aria-labelledby="hero-telemetry-heading">
      <div className="hero-telemetry-top">
        <span className="hero-telemetry-label">
          <Activity size={16} aria-hidden="true" />
          VISÃO DA OPERAÇÃO
        </span>
        <span className="hero-telemetry-demo">Demonstração</span>
      </div>
      <h2 id="hero-telemetry-heading">Cada conexão conta.</h2>
      <p className="hero-telemetry-intro">
        Um panorama dos aplicativos e das rotinas da equipe.
      </p>
      <div className="hero-telemetry-overview">
        <div className="hero-telemetry-total">
          <span className="hero-telemetry-total-icon" aria-hidden="true">
            <Layers3 size={20} />
          </span>
          <strong>{summary.total}</strong>
          <span>alvos mapeados</span>
        </div>
        <div className="hero-telemetry-featured">
          <strong>{summary.attention.toString().padStart(2, '0')}</strong>
          <span>com atenção</span>
          <small>no cenário simulado</small>
        </div>
      </div>
      <div className="hero-telemetry-distribution" aria-hidden="true">
        {distribution.map((group) => (
          <span
            key={group.id}
            className={`hero-telemetry-segment hero-telemetry-segment--${group.id}`}
            style={{ flexGrow: group.count }}
          />
        ))}
      </div>
      <ul className="hero-telemetry-legend" aria-label="Resumo da simulação">
        {distribution.map((group) => (
          <li key={group.id}>
            <span
              className={`hero-telemetry-dot hero-telemetry-dot--${group.id}`}
              aria-hidden="true"
            />
            <span>{group.label}</span>
            <strong>{group.count}</strong>
          </li>
        ))}
      </ul>
      <ul
        className="hero-telemetry-apps"
        aria-label="Aplicativos em destaque na simulação"
      >
        {highlights.map((system) => (
          <li key={system.id}>
            <span className="hero-telemetry-app-icon" aria-hidden="true">
              {system.name.slice(0, 2).toLocaleUpperCase('pt-BR')}
            </span>
            <span className="hero-telemetry-app-name">
              <strong>{system.name}</strong>
              <small>{system.area}</small>
            </span>
            <span
              className={`hero-telemetry-status hero-telemetry-status--${system.health}`}
            >
              {healthLabels[system.health]}
            </span>
          </li>
        ))}
      </ul>
      <Link className="hero-telemetry-link" to="/monitoramento">
        Ver telemetria completa <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      <p className="hero-telemetry-note">
        Dados fictícios · {monitoringDate(demoReference)} · horário de Brasília
      </p>
    </aside>
  )
}
