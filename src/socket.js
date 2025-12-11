import { io } from "socket.io-client";
import { getCurrentUser } from "./utils/getCurrentUser";

let socket = null;

export const getSocket = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userDetails = getCurrentUser();
    const userId = userDetails?.id;

    if (!userId) {
        console.log("No user token. Skipping socket io setup...")
        return null;
    }

    if (!socket) {
        socket = io("http://localhost:5000", {
            transports: ["websocket"],
            withCredentials: true,
            auth: {
                userId: userId,
                username: user?.username
            }
        });
        
        window.socket = socket

        socket.on("connect", () => {
            console.log(`Frontend connected to server with ID: ${socket.id}`);
            if (userId) {
                socket.emit("joinRoom", userId);
                console.log(`${user?.username} has joined fresh room at id:`, userId);
            }
        });

        socket.on("disconnect", () => {
            console.log(`${user?.username} disconnected from server`);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Connection error:", err.message);
        });
    }
    return socket;
}


export default socket;