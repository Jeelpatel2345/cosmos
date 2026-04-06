const getDistance = (pos1, pos2) => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getNearbyUsers = (userId, users, radius) => {
  const currentUser = users[userId];
  if (!currentUser) return [];
  return Object.values(users)
    .filter((u) => u.userId !== userId && getDistance(currentUser.position, u.position) < radius)
    .map((u) => u.userId);
};

module.exports = { getDistance, getNearbyUsers };
