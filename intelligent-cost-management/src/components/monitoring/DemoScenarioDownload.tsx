import { Download } from 'lucide-react'
import type { DemoScenarioId } from '../../data/demoScenarios'
import { exportDemoScenario } from '../../services/demoScenarioService'
import type { MonitoringSnapshot } from '../../types/monitoring'

export function DemoScenarioDownload({
  snapshot,
  scenario,
  now,
}: {
  snapshot: MonitoringSnapshot
  scenario: DemoScenarioId
  now: number
}) {
  function download() {
    const contents =
      JSON.stringify(exportDemoScenario(snapshot, scenario, now), null, 2) +
      '\n'
    const url = URL.createObjectURL(
      new Blob([contents], { type: 'application/json' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download =
      scenario === 'overview'
        ? '2rpnet-apps-demonstracao.json'
        : `2rpnet-apps-${scenario}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <button
      className="button button-secondary"
      type="button"
      onClick={download}
    >
      <Download size={15} aria-hidden="true" /> Baixar dados JSON
    </button>
  )
}
