const clients = new Map();

const addClient = (clientId, response) => {
  clients.set(clientId, response);
};

const removeClient = (clientId) => {
  clients.delete(clientId);
};

const publishRealtimeEvent = (event) => {
  const payload = `data: ${JSON.stringify(event)}\n\n`;

  clients.forEach((response, clientId) => {
    if (response.destroyed || response.writableEnded) {
      removeClient(clientId);
      return;
    }

    try {
      response.write(payload);
    } catch (_error) {
      removeClient(clientId);
    }
  });
};

const getClientCount = () => clients.size;

module.exports = {
  addClient,
  removeClient,
  publishRealtimeEvent,
  broadcast: publishRealtimeEvent,
  getClientCount,
};
