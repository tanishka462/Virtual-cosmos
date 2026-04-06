import { useEffect, useRef, useState } from 'react';
import { formatTime, getInitials } from '../utils/helpers';

export default function ChatPanel({ connections, messages, typingUsers, myUser, onSend, onTyping }) {
  const [activeTab, setActiveTab]   = useState(null); // roomId of open chat
  const [inputText, setInputText]   = useState('');
  const [wasTyping, setWasTyping]   = useState(false);
  const messagesEndRef              = useRef(null);
  const typingTimerRef              = useRef(null);

  const connectionList = Object.entries(connections); // [[userId, { roomId, username, avatarColor }]]

  // Auto-select first connection
  useEffect(() => {
    if (connectionList.length > 0 && !activeTab) {
      setActiveTab(connectionList[0][1].roomId);
    }
    if (connectionList.length === 0) setActiveTab(null);
  }, [connectionList.length]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const activeMessages = activeTab ? (messages[activeTab] || []) : [];
  const activeConnection = connectionList.find(([, c]) => c.roomId === activeTab);

  const handleSend = () => {
    if (!inputText.trim() || !activeTab) return;
    onSend(activeTab, inputText.trim());
    setInputText('');
    if (wasTyping) {
      onTyping(activeTab, false);
      setWasTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!activeTab) return;

    if (!wasTyping) {
      onTyping(activeTab, true);
      setWasTyping(true);
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTyping(activeTab, false);
      setWasTyping(false);
    }, 1500);
  };

  if (connectionList.length === 0) return null;

  return (
    <div className="animate-fadeIn chat-panel flex flex-col"
      style={{
        width: 300,
        height: 420,
        background: 'rgba(13, 13, 34, 0.92)',
        border: '1px solid #1e1e3f',
        borderRadius: 16,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ background: '#0f0f28', borderBottom: '1px solid #1e1e3f', padding: '10px 14px' }}>
        <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
          NEARBY CONNECTIONS
        </div>

        {/* Tabs for multiple connections */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {connectionList.map(([userId, conn]) => (
            <button
              key={conn.roomId}
              onClick={() => setActiveTab(conn.roomId)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20,
                border: `1px solid ${activeTab === conn.roomId ? conn.avatarColor : '#2d2d5a'}`,
                background: activeTab === conn.roomId ? `${conn.avatarColor}22` : 'transparent',
                cursor: 'pointer', fontSize: 12, color: activeTab === conn.roomId ? '#e2e8f0' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              {/* Mini avatar */}
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: conn.avatarColor, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0
              }}>
                {getInitials(conn.username)}
              </span>
              {conn.username}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {activeMessages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#3f3f6e', fontSize: 12, marginTop: 40 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
            <div>You're connected!</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Say something...</div>
          </div>
        )}

        {activeMessages.map((msg) => {
          const isMe = msg.fromId === myUser?.id;
          return (
            <div key={msg.id} style={{
              display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
              alignItems: 'flex-end', gap: 8, marginBottom: 12
            }}>
              {/* Avatar dot */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: msg.avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fff'
              }}>
                {getInitials(msg.from)}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: '72%' }}>
                {!isMe && (
                  <div style={{ fontSize: 10, color: '#4b5563', marginBottom: 3, paddingLeft: 2 }}>
                    {msg.from}
                  </div>
                )}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? msg.avatarColor : '#1a1a3a',
                  color: '#e2e8f0',
                  fontSize: 13,
                  lineHeight: 1.5,
                  wordBreak: 'break-word'
                }}>
                  {msg.text}
                </div>
                <div style={{
                  fontSize: 10, color: '#374151', marginTop: 3,
                  textAlign: isMe ? 'right' : 'left', paddingLeft: 2, paddingRight: 2
                }}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {Object.values(typingUsers).length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6366f1', fontSize: 12 }}>
            <span style={{ display: 'flex', gap: 3 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: '50%', background: '#6366f1',
                  animation: `pulseRing 1s ${i * 0.2}s ease-in-out infinite`
                }} />
              ))}
            </span>
            {Object.values(typingUsers)[0]} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #1e1e3f', background: '#0d0d22' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            style={{
              flex: 1, background: '#1a1a3a', border: '1px solid #2d2d5a',
              borderRadius: 10, padding: '8px 12px', color: '#e2e8f0',
              fontSize: 13, outline: 'none', fontFamily: 'Space Grotesk, sans-serif'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: inputText.trim() ? '#7c3aed' : '#1e1e3f',
              border: 'none', cursor: inputText.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s', fontSize: 16
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
