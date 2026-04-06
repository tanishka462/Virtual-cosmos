/**
 * Manages which users are in which proximity chat rooms.
 * rooms = { roomId: Set of socketIds }
 */
const rooms = {};

function joinRoom(io, socketId, roomId) {
  const socket = io.sockets.sockets.get(socketId);
  if (!socket) return;
  socket.join(roomId);
  if (!rooms[roomId]) rooms[roomId] = new Set();
  rooms[roomId].add(socketId);
}

function leaveRoom(io, socketId, roomId) {
  const socket = io.sockets.sockets.get(socketId);
  if (!socket) return;
  socket.leave(roomId);
  if (rooms[roomId]) {
    rooms[roomId].delete(socketId);
    if (rooms[roomId].size === 0) delete rooms[roomId];
  }
}

function leaveAllRooms(io, socketId) {
  Object.entries(rooms).forEach(([roomId, members]) => {
    if (members.has(socketId)) {
      leaveRoom(io, socketId, roomId);
    }
  });
}

function getRoomMembers(roomId) {
  return rooms[roomId] ? [...rooms[roomId]] : [];
}

module.exports = { joinRoom, leaveRoom, leaveAllRooms, getRoomMembers };
