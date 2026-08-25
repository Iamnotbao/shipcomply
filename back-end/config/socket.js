let io = null;

const initIoSocket = (httpServer) => {
  io = new new Server(httpServer, {
    cors: {
      origins: [
        "http://localhost:5173",
        "http://10.12.3.4",
        "http://10.1.0.60:8080",
        "http://10.1.0.60",
      ],
      method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
    pingTimeout: 10000,
    pingInterval: 5000,
  })();

  io.on(SOCKET_EVENTS.CONNECT, (socket) => {
    const user_code = socket.handshake.query;

    if (user_code === null || user_code === undefined) {
      io.disconnect(true);
    }

    const allowed = socket.addUser(user_code, socket.id);
    if (!allowed) {
      socket.emit("error", { message: "Too many tabs open !" });
      io.disconnect(true);
    }

    socket.join(user_code);

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      sockeManager.removeUser(user_code, socket.id);
    });
    return io;
  });
};
export default initIoSocket;
