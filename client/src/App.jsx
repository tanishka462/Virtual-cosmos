import { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import JoinScreen from './components/JoinScreen';
import Canvas     from './components/Canvas';
import ChatPanel  from './components/ChatPanel';
import HUD        from './components/HUD';

export default function App() {
  const [hasJoined, setHasJoined]       = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    isConnected,
    myUser,
    users,
    connections,
    messages,
    typingUsers,
    join,
    move,
    sendMessage,
    sendTyping
  } = useSocket();

  const handleJoin = (username) => {
    setIsConnecting(true);
    join(username);
    // Wait for server confirmation
    const check = setInterval(() => {
      if (isConnected) {
        clearInterval(check);
        setIsConnecting(false);
        setHasJoined(true);
      }
    }, 100);
    // Fallback: show canvas after 1.5s regardless
    setTimeout(() => {
      clearInterval(check);
      setIsConnecting(false);
      setHasJoined(true);
    }, 1500);
  };

  // ── JOIN SCREEN ──────────────────────────────────────────────────────────────
  if (!hasJoined) {
    return <JoinScreen onJoin={handleJoin} isConnecting={isConnecting} />;
  }

  // ── MAIN COSMOS VIEW ─────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#060612',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top HUD bar */}
      <HUD
        myUser={myUser}
        users={users}
        connections={connections}
        isConnected={isConnected}
      />

      {/* Canvas centered */}
      <div style={{ marginTop: 52 }}>
        <Canvas
          myUser={myUser}
          users={users}
          connections={connections}
          onMove={move}
        />
      </div>

      {/* Chat panel — bottom right, appears only when nearby */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <ChatPanel
          connections={connections}
          messages={messages}
          typingUsers={typingUsers}
          myUser={myUser}
          onSend={sendMessage}
          onTyping={sendTyping}
        />
      </div>

      {/* Proximity hint toast - shown briefly when first connection appears */}
      {Object.keys(connections).length === 0 && hasJoined && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(13,13,34,0.9)',
          border: '1px solid #2d2d5a',
          borderRadius: 12, padding: '10px 20px',
          fontSize: 13, color: '#64748b',
          backdropFilter: 'blur(12px)',
          whiteSpace: 'nowrap'
        }}>
          🔭 Move close to another user to open chat
        </div>
      )}
    </div>
  );
}
