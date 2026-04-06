import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected]   = useState(false);
  const [myUser, setMyUser]             = useState(null);
  const [users, setUsers]               = useState({});       // all users on canvas
  const [connections, setConnections]   = useState({});       // { userId: { roomId, username, avatarColor } }
  const [messages, setMessages]         = useState({});       // { roomId: [msg, msg, ...] }
  const [typingUsers, setTypingUsers]   = useState({});       // { userId: username }

  // ── INIT SOCKET ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false
    });
    socketRef.current = socket;

    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => { setIsConnected(false); setMyUser(null); });

    // Own user confirmed by server
    socket.on('user:joined', (userData) => {
      setMyUser(userData);
    });

    // Full list of current users (on first join)
    socket.on('users:list', (userMap) => {
      setUsers(userMap);
    });

    // New user joined the cosmos
    socket.on('user:new', (userData) => {
      setUsers(prev => ({ ...prev, [userData.id]: userData }));
    });

    // Someone moved
    socket.on('user:moved', ({ id, position }) => {
      setUsers(prev => {
        if (!prev[id]) return prev;
        return { ...prev, [id]: { ...prev[id], position } };
      });
    });

    // Someone left
    socket.on('user:left', ({ id }) => {
      setUsers(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setConnections(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });

    // Proximity: someone came close
    socket.on('proximity:connect', ({ userId, roomId, username, avatarColor }) => {
      setConnections(prev => ({
        ...prev,
        [userId]: { roomId, username, avatarColor }
      }));
      // Init message history for this room
      setMessages(prev => ({
        ...prev,
        [roomId]: prev[roomId] || []
      }));
    });

    // Proximity: someone moved away
    socket.on('proximity:disconnect', ({ userId }) => {
      setConnections(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    // Incoming chat message
    socket.on('chat:message', ({ roomId, message }) => {
      setMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), message]
      }));
    });

    // Typing indicator
    socket.on('chat:typing', ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        if (isTyping) next[userId] = username;
        else delete next[userId];
        return next;
      });
    });

    return () => socket.disconnect();
  }, []);

  // ── PUBLIC ACTIONS ───────────────────────────────────────────────────────────
  const join = useCallback((username) => {
    if (!socketRef.current) return;
    socketRef.current.connect();
    socketRef.current.once('connect', () => {
      socketRef.current.emit('user:join', { username });
    });
  }, []);

  const move = useCallback((x, y) => {
    socketRef.current?.emit('user:move', { x, y });
    // Optimistic update for own user
    setMyUser(prev => prev ? { ...prev, position: { x, y } } : prev);
  }, []);

  const sendMessage = useCallback((roomId, text) => {
    if (!socketRef.current || !text.trim()) return;
    const optimistic = {
      id: Date.now(),
      from: myUser?.username,
      fromId: socketRef.current.id,
      avatarColor: myUser?.avatarColor,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    // Optimistic append
    setMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), optimistic]
    }));
    socketRef.current.emit('chat:message', { roomId, text });
  }, [myUser]);

  const sendTyping = useCallback((roomId, isTyping) => {
    socketRef.current?.emit('chat:typing', { roomId, isTyping });
  }, []);

  return {
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
  };
}
