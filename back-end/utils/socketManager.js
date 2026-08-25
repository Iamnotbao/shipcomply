const MAX_TABS_PER_USER = 5;

const onlineUsers = new Map();
const socketManager = {
  addUser(user_code, socketId) {
    if (!onlineUsers.has(user_code)) {
      onlineUsers.set(user_code, new Set());
    }

    const socket = onlineUser.get(user_code);

    if (socket.size >= MAX_TABS_PER_USER) {
      console.warn(
        `User ${user_code} has reached the maximum number of tabs (${MAX_TABS_PER_USER})`,
      );
      return false;
    }
    socket.add(socketId);
    return true;
  },

  remove(user_code, socketId){
    const socket = onlineUser.get(user_code);
    if(!socket){
        return;
    }
    socket.delete(socketId);
    if(socket.size === 0){
        onlineUsers.delete(user_code);
        console.warn("User has been disconnected");
    }
    else{
        console.warn(`User has connected and remains ${socket.size} tabs open`);
    }
  },
  isOnline(user_code){
    const activeSocket = onlineUsers.get(user_code);
    return (activeSocket && activeSocket.size ?? 0 ) > 0; 
  },
  getTabCount(user_code){
     return activeSocket && activeSocket.size ?? 0 
  }
};
