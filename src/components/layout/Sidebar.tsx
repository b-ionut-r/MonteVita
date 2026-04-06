import PersonBuilder from '@/components/person-builder/PersonBuilder'
import RunButton from '@/components/simulation/RunButton'

export default function Sidebar() {
  return (
    <div
      style={{
        width: '400px',
        minWidth: '400px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(5,8,16,0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <PersonBuilder />
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <RunButton />
      </div>
    </div>
  )
}
