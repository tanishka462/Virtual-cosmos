const PROXIMITY_RADIUS = 150;

function getDistance(userA, userB) {
  const dx = userA.x - userB.x;
  const dy = userA.y - userB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getRoomId(socketIdA, socketIdB) {
  return [socketIdA, socketIdB].sort().join('__');
}

function checkProximity(movedSocketId, allUsers, getRoomMembers) {
  const me = allUsers[movedSocketId];
  if (!me) return { toConnect: [], toDisconnect: [] };

  const toConnect = [];
  const toDisconnect = [];

  Object.entries(allUsers).forEach(([otherId, other]) => {
    if (otherId === movedSocketId) return;

    const dist = getDistance(me.position, other.position);
    const roomId = getRoomId(movedSocketId, otherId);
    const members = getRoomMembers(roomId);
    const alreadyConnected = members.includes(movedSocketId) && members.includes(otherId);

    if (dist < PROXIMITY_RADIUS && !alreadyConnected) {
      toConnect.push({ userId: otherId, roomId, distance: Math.round(dist) });
    } else if (dist >= PROXIMITY_RADIUS && alreadyConnected) {
      toDisconnect.push({ userId: otherId, roomId });
    }
  });

  return { toConnect, toDisconnect };
}

module.exports = { checkProximity, getRoomId, getDistance, PROXIMITY_RADIUS };