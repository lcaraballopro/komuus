import openSocket from "socket.io-client";

function connectToSocket() {
  const token = localStorage.getItem("token");
  // Use the origin (base URL) for socket.io, not the API path
  const socketUrl = window.location.origin;
  return openSocket(socketUrl, {
    transports: ["websocket", "polling", "flashsocket"],
    path: "/socket.io",
    query: {
      token: JSON.parse(token),
    },
  });
}

export default connectToSocket;