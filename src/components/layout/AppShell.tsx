import ParticleField from '@/components/ui/ParticleField'
import Sidebar from './Sidebar'
import MainPanel from './MainPanel'
import CompareOverlay from '@/components/results/CompareOverlay'

export default function AppShell() {
  return (
    <div style={{ position: 'relative', display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <ParticleField />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', height: '100%' }}>
        <Sidebar />
        <MainPanel />
      </div>
      <CompareOverlay />
    </div>
  )
}
