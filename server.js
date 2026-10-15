
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Create an Express application
const app = express();

// Create an HTTP server using the Express application
const server = http.createServer(app);

// Create a Socket.IO server using the HTTP server
const io = new Server(server);

// Store usernames and their socket IDs
const users = new Map();

// Serve the HTML client from the public folder
app.use(express.static("public"));

// Listen for new client connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Generate a username for the connected user
  const username = `User-${socket.id.slice(0, 5)}`;

  // Store the username and socket ID in the Map
  users.set(username, socket.id);

  // Display the list of online users
  console.log("Online users:", [...users.keys()]);

  // Send the current online users list to all connected clients
io.emit("onlineUsers", [...users.keys()]);

  // Listen for room messages sent by this client
  socket.on("message", (text) => {
    // Validate the message type and content
    if (typeof text !== "string" || text.trim() === "") {
      socket.emit(
        "validationError",
        "Invalid message. Message cannot be empty or non-string."
      );
      return;
    }

    // Remove extra spaces from the message
    const message = text.trim();

    // Check whether the user has joined a room
    if (!socket.data.room) {
      socket.emit("validationError", "Please join a room first.");
      return;
    }

    // Send the message to everyone in the current room
    io.to(socket.data.room).emit("message", message);

    // Log the room where the message was sent
    console.log("Sending to room:", socket.data.room);
  });

  // Listen for private messages sent by this client
  socket.on("privateMessage", ({ to, message } = {}) => {
    // Validate the recipient username
    if (typeof to !== "string" || to.trim() === "") {
      socket.emit("validationError", "Please enter a recipient username.");
      return;
    }

    // Find the recipient's socket ID using their username
    const recipientSocketId = users.get(to.trim());

    // Check whether the recipient is online
    if (!recipientSocketId) {
      socket.emit(
        "validationError",
        `User ${to} not found or not online.`
      );
      return;
    }

    // Validate the private message content
    if (typeof message !== "string" || message.trim() === "") {
      socket.emit("validationError", "Private message cannot be empty.");
      return;
    }

    // Send the private message only to the recipient
    io.to(recipientSocketId).emit("privateMessage", {
      from: username,
      message: message.trim()
    });

    // Log the private message delivery
    console.log(`Private message sent from ${username} to ${to.trim()}`);
  });

  
  // Listen when this user starts typing
  socket.on("typing", () => {
    console.log(`${username} started typing`);

    // Notify other connected users
    socket.broadcast.emit("typing", username);
  });

  // Listen when this user stops typing
  socket.on("stopTyping", () => {
    console.log(`${username} stopped typing`);

    // Notify other connected users
    socket.broadcast.emit("stopTyping", username);
  });


  // Listen for room joining and room switching
  socket.on("joinRoom", async (roomName) => {
    // Validate the room name
    if (typeof roomName !== "string" || roomName.trim() === "") {
      socket.emit("validationError", "Please select a valid room.");
      return;
    }

    // Get all rooms currently joined by this socket
    const rooms = [...socket.rooms];

    // Leave previous rooms, except the socket's own private room
    for (const room of rooms) {
      if (room !== socket.id) {
        await socket.leave(room);
        console.log(`${username} left room: ${room}`);
      }
    }

    // Join the selected room
    const selectedRoom = roomName.trim();
    await socket.join(selectedRoom);

    // Store the current room name for future messages
    socket.data.room = selectedRoom;

    // Log the room joining event
    console.log(`${username} joined room: ${selectedRoom}`);
  });

  // Listen when this client disconnects
  socket.on("disconnect", () => {
    // Find and remove the disconnected user from the Map
    for (const [storedUsername, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(storedUsername);
        console.log(`${storedUsername} disconnected`);
        break;
      }
    }

    // Display the updated list of online users
    console.log("Online users:", [...users.keys()]);

    // Notify all clients about the updated online users list
    io.emit("onlineUsers",[...users.keys()]);
    
  });
});

// Start the server on port 5000
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
