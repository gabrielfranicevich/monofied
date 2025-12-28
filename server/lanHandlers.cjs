/**
 * LAN discovery handlers
 */
const { getIpSubnet } = require('./utils.cjs');

function setupLanHandlers(io, socket, rooms, clientIp) {

  socket.on('requestLanGames', ({ localIp }) => {
    const requesterPublicSubnet = getIpSubnet(clientIp);
    const requesterLocalSubnet = getIpSubnet(localIp);

    const lanGames = Object.values(rooms)
      .filter(r => {
        const roomLocalSubnet = getIpSubnet(r.creatorLocalIp);
        const roomPublicSubnet = getIpSubnet(r.creatorPublicIp);

        if (requesterLocalSubnet && roomLocalSubnet && requesterLocalSubnet === roomLocalSubnet) {
          return true;
        }
        if (requesterPublicSubnet && roomPublicSubnet && requesterPublicSubnet === roomPublicSubnet) {
          return true;
        }
        return false;
      })
      .map(r => ({
        id: r.id,
        name: r.roomName || r.players[0].name + "'s Game",
        players: r.players.length,
        maxPlayers: r.settings.players,
        type: r.settings.type,
        status: r.status
      }));

    socket.emit('lanGamesList', lanGames);
  });
}

module.exports = { setupLanHandlers };
