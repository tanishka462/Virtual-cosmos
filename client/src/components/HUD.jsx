export default function HUD({ myUser, users, connections, isConnected }) {
  const onlineCount    = Object.keys(users).length;
  const connectedCount = Object.keys(connections).length;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px',
      background: 'rgba(10,10,26,0.85)',
      borderBottom: '1px solid #1e1e3f',
      backdropFilter: 'blur(12px)',
      zIndex: 10,
      fontFamily: 'Space Grotesk, sans-serif'
    }}>
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>🌌</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa', letterSpacing: '-0.01em' }}>
          Virtual Cosmos
        </span>
      </div>

      {/* Center: Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Online badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 6px #10b981' : '0 0 6px #ef4444'
          }} />
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {onlineCount} online
          </span>
        </div>

        {/* Connections badge */}
        {connectedCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#7c3aed22', border: '1px solid #7c3aed44',
            borderRadius: 20, padding: '3px 10px'
          }}>
            <span style={{ fontSize: 10 }}>💬</span>
            <span style={{ fontSize: 12, color: '#a78bfa' }}>
              {connectedCount} chat{connectedCount > 1 ? 's' : ''} active
            </span>
          </div>
        )}

        {/* My username */}
        {myUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: myUser.avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#fff'
            }}>
              {myUser.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{myUser.username}</span>
          </div>
        )}
      </div>

      {/* Right: Controls hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {['W','A','S','D'].map(k => (
          <kbd key={k} style={{
            padding: '2px 6px', borderRadius: 5,
            background: '#1a1a3a', border: '1px solid #2d2d5a',
            fontSize: 10, color: '#6366f1', fontFamily: 'JetBrains Mono, monospace'
          }}>
            {k}
          </kbd>
        ))}
        <span style={{ fontSize: 11, color: '#374151', marginLeft: 4 }}>to move</span>
      </div>
    </div>
  );
}
