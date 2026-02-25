import { Server } from "socket.io";

// Stores active rooms and their participants
let connections = {};

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.on("connection", (socket) => {
        socket.on("join-call", (path, username) => {
            if (!connections[path]) connections[path] = [];
            
            connections[path].push({ 
                socketId: socket.id, 
                name: username || "Guest" 
            });

            // Isolate users into a specific room based on the URL path
            socket.join(path);

            // Notify everyone in the room to start WebRTC handshakes
            connections[path].forEach((user) => {
                io.to(user.socketId).emit("user-joined", socket.id, connections[path]);
            });
        });

        // Broadcast chat messages to everyone in the room except the sender
        socket.on("chat-message", (path, data) => {
            socket.to(path).emit("chat-message", data);
        });

        // Relay WebRTC signaling data (SDP/ICE) between peers
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("disconnect", () => {
            for (const [key, val] of Object.entries(connections)) {
                const index = val.findIndex(u => u.socketId === socket.id);
                if (index !== -1) {
                    val.splice(index, 1); // Remove user from room
                    val.forEach(u => io.to(u.socketId).emit('user-left', socket.id));
                    
                    if (val.length === 0) delete connections[key]; // Clean up empty rooms
                    break;
                }
            }
        });
    });
    return io;
};

export default connectToSocket;