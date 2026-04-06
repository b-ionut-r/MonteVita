import { useRef, useCallback } from 'react'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import type { SimulationResults } from '@/types'

interface WorkerMessage {
  type: 'progress' | 'result'
  pct?: number
  data?: SimulationResults
}

export function useSimulation() {
  const workerRef = useRef<Worker | null>(null)
  const stats = useSimulatorStore(s => s.stats)
  const decisions = useSimulatorStore(s => s.decisions)
  const setStatus = useSimulatorStore(s => s.setStatus)
  const setProgress = useSimulatorStore(s => s.setProgress)
  const setResults = useSimulatorStore(s => s.setResults)
  const setError = useSimulatorStore(s => s.setError)

  const run = useCallback(() => {
    // Terminate any running worker
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }

    setStatus('running')
    setProgress(0)

    const worker = new Worker(
      new URL('../engine/worker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === 'progress') {
        setProgress(e.data.pct ?? 0)
      } else if (e.data.type === 'result') {
        setResults(e.data.data!)
        worker.terminate()
        workerRef.current = null
      }
    }

    worker.onerror = (err) => {
      setError(err.message)
      worker.terminate()
      workerRef.current = null
    }

    worker.postMessage({ stats, decisions })
  }, [stats, decisions, setStatus, setProgress, setResults, setError])

  const cancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
      setStatus('idle')
    }
  }, [setStatus])

  return { run, cancel }
}
