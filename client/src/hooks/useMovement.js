import { useEffect, useRef, useCallback } from 'react';
import { clamp, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/helpers';

const SPEED = 3;          // pixels per frame
const EMIT_INTERVAL = 50; // ms between server updates (20 fps)

export function useMovement({ myUser, onMove, enabled = true }) {
  const keysRef       = useRef({});
  const posRef        = useRef({ x: 400, y: 300 });
  const rafRef        = useRef(null);
  const emitTimerRef  = useRef(null);
  const lastEmitRef   = useRef(0);

  // Sync posRef when myUser changes externally (on first join)
  useEffect(() => {
    if (myUser?.position) {
      posRef.current = { ...myUser.position };
    }
  }, [myUser?.id]); // only on id change (first join)

  const emitIfMoved = useCallback((x, y) => {
    const now = Date.now();
    if (now - lastEmitRef.current >= EMIT_INTERVAL) {
      onMove(x, y);
      lastEmitRef.current = now;
    }
  }, [onMove]);

  // Game loop
  useEffect(() => {
    if (!enabled) return;

    const loop = () => {
      const keys = keysRef.current;
      let { x, y } = posRef.current;
      let moved = false;

      if (keys['ArrowUp']    || keys['w'] || keys['W']) { y -= SPEED; moved = true; }
      if (keys['ArrowDown']  || keys['s'] || keys['S']) { y += SPEED; moved = true; }
      if (keys['ArrowLeft']  || keys['a'] || keys['A']) { x -= SPEED; moved = true; }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) { x += SPEED; moved = true; }

      if (moved) {
        x = clamp(x, 24, CANVAS_WIDTH  - 24);
        y = clamp(y, 24, CANVAS_HEIGHT - 24);
        posRef.current = { x, y };
        emitIfMoved(x, y);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, emitIfMoved]);

  // Key listeners
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e) => {
      // Don't hijack typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      keysRef.current[e.key] = true;
    };
    const onKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, [enabled]);

  return posRef; // expose ref for canvas to read directly
}
