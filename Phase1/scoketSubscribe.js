const socket = new WebSocket("ws://localhost:4000/f1-live-websocket");

socket.onopen = () => {
  console.log("WS Connected");

  socket.send("CONNECT\naccept-version:1.2\nhost:localhost\n\n\0");

  setTimeout(() => {
    socket.send("SUBSCRIBE\nid:sub-0\ndestination:/topic/telemetry\n\n\0");
  }, 1000);
};

socket.onmessage = (msg) => {
  console.log("🔥 DATA:", msg.data);
};
