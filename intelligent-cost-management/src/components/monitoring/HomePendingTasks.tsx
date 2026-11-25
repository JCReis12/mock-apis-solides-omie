import {
  ArrowUpRight,
  FileSignature,
  FolderSync,
  ReceiptText,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { demoSnapshot } from '../../data/monitoring'
import { demoPendingTasks } from '../../services/demoScenarioService'

const tasks = demoPendingTasks(demoSnapshot())
const period =
  tasks
    .find((task) => task.period)
    ?.period?.split('-')
    .reverse()
    .join('/') ?? 'não informada'
const icons = {
  sharepoint: FolderSync,
  autentique: FileSignature,
  omie: ReceiptText,
}
const names = {
  sharepoint: 'SharePoint',
  autentique: 'Autentique',
  omie: 'Omie',
}

export function HomePendingTasks() {
  return (
    <section
      className="home-pending-section"
      aria-labelledby="home-pending-heading"
    >
      <div className="container">
        <div className="home-pending-heading">
          <div>
            <span className="eyebrow">DO PAINEL PARA A ROTINA</span>
            <h2 id="home-pending-heading">O que precisa de atenção?</h2>
          </div>
          <p>
            Uma prévia das pendências administrativas.
            <br />
            <strong>Dados fictícios · competência {period}.</strong>
          </p>
        </div>
        <div className="home-pending-grid">
          {tasks.map((task) => {
            const Icon = icons[task.systemId]
            return (
              <article
                key={task.systemId}
                className="home-pending-card"
                aria-labelledby={`pending-${task.systemId}`}
              >
                <div className="home-pending-card-top">
                  <span className="home-pending-icon">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <span>{names[task.systemId]}</span>
                  <span className="home-pending-badge">Simulação</span>
                </div>
                <strong className="home-pending-count">
                  {task.pending?.toLocaleString('pt-BR') ?? '—'}
                </strong>
                <h3 id={`pending-${task.systemId}`}>{task.title}</h3>
                <p>{task.description}</p>
                <div className="home-pending-progress">
                  <span>
                    {task.completed !== null && task.total !== null
                      ? `${task.completed} de ${task.total} ${task.completedLabel}`
                      : 'Sem dados para esta rotina'}
                  </span>
                  {task.completionPercent !== null && (
                    <div aria-hidden="true">
                      <span style={{ width: `${task.completionPercent}%` }} />
                    </div>
                  )}
                </div>
                <Link to={task.href}>
                  {task.action}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
