// ============================================
// FILE 1: utils/socket.js (CLIENT SIDE)
// ============================================
import { io } from "socket.io-client";

let socket = null;
let connected = false;
const lockedRecords = new Map();
const callbacks = {}; 
const socketUrl = import.meta.env.VITE_SOCKET_URL;

//  FIX: Tạo key GIỐNG HỆT server
const createKey = (table, primaryKey) => {
  const keys = Object.keys(primaryKey).sort();
  const parts = [table];
  keys.forEach(key => {
    parts.push(key);
    parts.push(primaryKey[key]);
  });
  return parts.join(':');
};

const setupListeners = () => { 
  socket.on("record-locked", (data) => {
    const key = createKey(data.table, data.primaryKey);
    lockedRecords.set(key, data);
    console.log("🔒 Record locked:", key, data);
    callbacks.onLocked?.(data); 
  });

  socket.on("record-unlocked", (data) => { 
    const key = createKey(data.table, data.primaryKey);
    console.log("🔓 Record unlocked event:", {
      key,
      data,
      hadLock: lockedRecords.has(key)
    });
    
    const deleted = lockedRecords.delete(key);
    console.log("🔓 Delete from Map success?", deleted);
    console.log("🔓 Remaining locks:", Array.from(lockedRecords.keys()));
    
    callbacks.onUnlocked?.(data); 
  });

  socket.on("lock-success", (data) => { 
    console.log(" Lock success");
    callbacks.onLockSuccess?.(data); 
  });

  socket.on("lock-failed", (data) => {
    console.log(" Lock failed:", data);
    callbacks.onLockFailed?.(data);
  });

  socket.on("active-locks", (response) => {
    if (response.success) {
      console.log(`📋 Active locks received: ${response.total || response.data.length}`);
      
      // Clear old locks trước
      lockedRecords.clear();
      
      response.data.forEach((lock) => {
        const key = createKey(lock.table, lock.primaryKey);
        lockedRecords.set(key, lock);
        console.log("📋 Added lock to Map:", key);
      });
      
      console.log("📋 Total locks in Map:", lockedRecords.size);
      console.log("📋 All lock keys:", Array.from(lockedRecords.keys()));
    }
  });
};

export const connect = (url = socketUrl) => { 
  if (socket?.connected) {
    return;
  }

  socket = io(url, {
    autoConnect: true,
    reconnection: true, 
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    connected = true;
    console.log(" Socket connected:", socket.id);
  });

  socket.on("disconnect", () => { 
    connected = false;
    console.log(" Socket disconnected");
  });

  setupListeners();
};

export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    connected = false;
    lockedRecords.clear();
  }
};

export const lock = (table, primaryKey, userInfo) => {
  if (!socket?.connected) {
    console.error(" Socket not connected");
    return;
  }

  console.log("🔒 Locking:", { table, primaryKey, userInfo });
  
  socket.emit("lock-record", {
    type: "lock-record",
    data: {
      table,
      primaryKey,
      user_code: userInfo.user_code,
      dept_code: userInfo.dept_code, 
      fact_code: userInfo.fact_code, 
      desktop_ip: userInfo.desktop_ip, 
    },
  });
};

export const unlock = (table, primaryKey, lockInfo) => {
  if (!socket?.connected) {
    console.error(" Socket is not connected");
    return;
  }

  console.log("🔓 Unlocking:", { table, primaryKey, lockInfo });

  socket.emit("unlock-record", {
    type: "unlock-record",
    data: {
      table,
      primaryKey,
      lock_info: lockInfo, 
    },
  });
};

//  FIX: Update checkLock để dùng table
export const checkLock = (table, primaryKey) => {
  const key = createKey(table, primaryKey);
  const lock = lockedRecords.get(key);
  console.log("🔍 Check lock:", { key, hasLock: !!lock, lock });
  return lock;
};

//  FIX: Update isLockedByOthers
export const isLockedByOthers = (table, primaryKey, currentLockInfo) => { 
  const lock = checkLock(table, primaryKey);
  const result = lock && lock.lock_info !== currentLockInfo;
  console.log("🔍 Is locked by others?", { result, lock, currentLockInfo });
  return result;
};

export const getActiveLocks = (table) => {
  if (!socket?.connected) {
    console.error(" Socket is not connected");
    return;
  }

  console.log("📋 Requesting active locks for table:", table);
  
  socket.emit("get-active-locks", {
    type: "get-active-locks",
    data: { table },
  });
};

export const getCurrentLockInfo = (user) => {
  return `${user.user_code}-${user.fact_code}-${user.dept_code}-${user.desktop_ip}`;
};

export const setCallbacks = ({
  onLocked,
  onUnlocked,
  onLockSuccess,
  onLockFailed,
}) => {
  callbacks.onLocked = onLocked;
  callbacks.onUnlocked = onUnlocked; 
  callbacks.onLockSuccess = onLockSuccess;
  callbacks.onLockFailed = onLockFailed;
};