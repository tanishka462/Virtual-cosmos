/**
 * Calculate Euclidean distance between two positions
 */
export function getDistance(posA, posB) {
  const dx = posA.x - posB.x;
  const dy = posA.y - posB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Format timestamp to readable time string
 */
export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Generate initials from username
 */
export function getInitials(username) {
  if (!username) return '??';
  return username
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Clamp a number between min and max
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Generate a unique room label for display
 */
export function getRoomLabel(roomId) {
  return `#${roomId.slice(0, 8)}`;
}

export const CANVAS_WIDTH  = 800;
export const CANVAS_HEIGHT = 600;
export const PROXIMITY_RADIUS = 150;
