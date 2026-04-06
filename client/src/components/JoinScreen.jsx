import { useState } from 'react';

export default function JoinScreen({ onJoin, isConnecting }) {
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    if (username.trim()) onJoin(username.trim());
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#060612', fontFamily: 'Space Grotesk, sans-serif'
    }}>
      <div style={{
        background: 'rgba(13,13,34,0.95)',
        border: '1px solid #2d2d5a',
        borderRadius: 20, padding: '40px 48px',
        display: 'flex', flexDirection: 'column', gap: 20,
        minWidth: 340, textAlign: 'center',
        boxShadow: '0 0 40px rgba(124,58,237,0.2)'
      }}>
        <div style={{ fontSize: 32 }}>🌌</div>
        <h1 style={{ color: '#a78bfa', fontSize: 22, fontWeight: 700, margin: 0 }}>
          Virtual Cosmos
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
          Move close to others to start chatting
        </p>

        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter your name..."
          autoFocus
          style={{
            background: '#1a1a3a', border: '1px solid #2d2d5a',
            borderRadius: 10, padding: '10px 14px',
            color: '#e2e8f0', fontSize: 14, outline: 'none',
            fontFamily: 'Space Grotesk, sans-serif'
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!username.trim() || isConnecting}
          style={{
            background: username.trim() ? '#7c3aed' : '#1e1e3f',
            border: 'none', borderRadius: 10, padding: '11px',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: username.trim() ? 'pointer' : 'default',
            transition: 'background 0.2s'
          }}
        >
          {isConnecting ? 'Connecting...' : 'Enter Cosmos →'}
        </button>
      </div>
    </div>
  );
}