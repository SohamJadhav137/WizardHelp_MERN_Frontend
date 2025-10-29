import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    withCredentials: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});
window.socket = socket

socket.on("connect", () => {
    console.log("Connected to server with ID:",socket.id);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection error:",err.message);
});


export default socket;