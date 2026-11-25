import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { demoSnapshot, inventorySnapshot } from '../data/monitoring'
import { fetchMonitoringSnapshot } from '../services/monitoringService'
import type { MonitoringSnapshot } from '../types/monitoring'
import {
  demoScenarioClock,
  demoScenarioId,
  type DemoScenarioId,
} from '../data/demoScenarios'

export function useMonitoring() {
  const endpoint = (
    import.meta.env.VITE_MONITORING_API_URL as string | undefined
  )?.trim()
  const [params, setParams] = useSearchParams()
  const requestedMode = params.get('mode')
  const mode =
    requestedMode === 'demo' || requestedMode === 'collection'
      ? requestedMode
      : endpoint
        ? 'collection'
        : 'demo'
  const scenario = demoScenarioId(params.get('scenario'))
  const demonstration = useMemo(() => demoSnapshot(scenario), [scenario])
  const [revision, setRevision] = useState(0)
  const [now, setNow] = useState(Date.now)
  const pending = useRef<AbortController | null>(null)
  const [result, setResult] = useState<{
    snapshot: MonitoringSnapshot | null
    error: string | null
    loading: boolean
  }>({ snapshot: null, error: null, loading: false })
  const live = mode === 'collection' && Boolean(endpoint)

  useEffect(() => {
    if (!live || !endpoint) return
    const lifecycle = new AbortController()
    async function load() {
      pending.current?.abort()
      const request = new AbortController()
      pending.current = request
      const timeout = window.setTimeout(() => request.abort(), 12_000)
      setResult((previous) => ({ ...previous, loading: true }))
      try {
        const snapshot = await fetchMonitoringSnapshot(
          endpoint!,
          request.signal,
        )
        if (
          !lifecycle.signal.aborted &&
          pending.current === request &&
          !request.signal.aborted
        )
          setResult({ snapshot, error: null, loading: false })
      } catch (error) {
        if (!lifecycle.signal.aborted && pending.current === request)
          setResult((previous) => ({
            ...previous,
            loading: false,
            error: request.signal.aborted
              ? 'A coleta demorou para responder. Tente novamente.'
              : error instanceof Error
                ? error.message
                : 'Não foi possível consultar a coleta.',
          }))
      } finally {
        clearTimeout(timeout)
      }
    }
    void load()
    const poll = window.setInterval(() => void load(), 30_000)
    const clock = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      lifecycle.abort()
      pending.current?.abort()
      clearInterval(poll)
      clearInterval(clock)
    }
  }, [endpoint, live, revision])

  return {
    mode,
    setMode: (next: 'collection' | 'demo') => {
      setNow(Date.now())
      setParams(
        (previous) => {
          const nextParams = new URLSearchParams(previous)
          nextParams.set('mode', next)
          return nextParams
        },
        { replace: true },
      )
    },
    scenario,
    setScenario: (next: DemoScenarioId) =>
      setParams(
        (previous) => {
          const nextParams = new URLSearchParams(previous)
          nextParams.set('mode', 'demo')
          nextParams.set('scenario', next)
          return nextParams
        },
        { replace: true },
      ),
    refresh: () => setRevision((r) => r + 1),
    configured: Boolean(endpoint),
    loading: live && result.loading,
    error: live ? result.error : null,
    snapshot:
      mode === 'demo'
        ? demonstration
        : live && result.snapshot
          ? result.snapshot
          : inventorySnapshot(),
    now: mode === 'demo' ? demoScenarioClock(scenario) : now,
  }
}
