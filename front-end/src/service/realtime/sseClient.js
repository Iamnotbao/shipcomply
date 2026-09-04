const INITIAL_RECONNECT_DELAY = 1_000;
const MAX_RECONNECT_DELAY = 30_000;

const parseEventBlock = (block) => {
  const data = block
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const connectToEventStream = ({ url, token, onEvent }) => {
  let stopped = false;
  let reconnectDelay = INITIAL_RECONNECT_DELAY;
  let reconnectTimer = null;
  let activeController = null;

  const scheduleReconnect = () => {
    if (stopped) return;
    reconnectTimer = window.setTimeout(openStream, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
  };

  const openStream = async () => {
    activeController = new AbortController();

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal: activeController.signal,
      });

      if (response.status === 401 || response.status === 403) {
        window.dispatchEvent(new Event("shipcomply:auth-expired"));
        return;
      }
      if (!response.ok || !response.body) throw new Error("SSE connection failed");

      reconnectDelay = INITIAL_RECONNECT_DELAY;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!stopped) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() || "";
        blocks.forEach((block) => {
          const event = parseEventBlock(block);
          if (event) onEvent(event);
        });
      }

      if (!stopped) scheduleReconnect();
    } catch (error) {
      if (!stopped && error.name !== "AbortError") scheduleReconnect();
    }
  };

  openStream();

  return () => {
    stopped = true;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    activeController?.abort();
  };
};
