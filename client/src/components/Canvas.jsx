import { useEffect, useRef, useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PROXIMITY_RADIUS, getInitials } from '../utils/helpers';
import { useMovement } from '../hooks/useMovement';

const AVATAR_RADIUS = 22;

export default function Canvas({ myUser, users, connections, onMove }) {
  const canvasRef = useRef(null);
  const posRef    = useMovement({ myUser, onMove, enabled: !!myUser });
  const [, forceRender] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceRender(n => n + 1), 33);
    return () => clearInterval(id);
  }, []);

  const myPos = myUser ? posRef.current : null;
  const connectedIds = new Set(Object.keys(connections));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = CANVAS_WIDTH;
    const H = CANVAS_HEIGHT;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = '#1a1a3a';
    for (let x = 40; x < W; x += 40) {
      for (let y = 40; y < H; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Border
    ctx.strokeStyle = '#2d2d5a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(2, 2, W - 4, H - 4);

    // Draw all users
    Object.values(users).forEach(user => {
      const isMe = user.id === myUser?.id;
      const pos  = isMe && myPos ? myPos : (user.position || { x: 400, y: 300 });
      const x    = pos.x;
      const y    = pos.y;
      const color       = user.avatarColor || '#7c3aed';
      const isConnected = connectedIds.has(user.id);

      // Proximity ring (only for me)
      if (isMe) {
        ctx.beginPath();
        ctx.arc(x, y, PROXIMITY_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = color + '55';
        ctx.lineWidth   = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, AVATAR_RADIUS + 12);
      grad.addColorStop(0, color + '44');
      grad.addColorStop(1, color + '00');
      ctx.beginPath();
      ctx.arc(x, y, AVATAR_RADIUS + 12, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Circle fill
      ctx.beginPath();
      ctx.arc(x, y, AVATAR_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = isMe || isConnected ? color : '#0d0d22';
      ctx.fill();

      // Circle border
      ctx.beginPath();
      ctx.arc(x, y, AVATAR_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = isMe ? 2.5 : 1.5;
      ctx.stroke();

      // Initials
      ctx.fillStyle    = isMe || isConnected ? '#ffffff' : color;
      ctx.font         = '600 11px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(getInitials(user.username), x, y);

      // Username label
      ctx.fillStyle    = isMe ? '#a78bfa' : '#94a3b8';
      ctx.font         = '11px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(isMe ? user.username + ' (you)' : user.username, x, y + AVATAR_RADIUS + 6);

      // Green dot if connected
      if (isConnected && !isMe) {
        ctx.beginPath();
        ctx.arc(x + AVATAR_RADIUS - 5, y - AVATAR_RADIUS + 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      }
    });
  });

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        borderRadius: 12,
        cursor: 'crosshair',
        display: 'block',
        boxShadow: '0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.1)'
      }}
    />
  );
}