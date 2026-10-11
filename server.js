const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Create an Express application
const app = express();

// Create an HTTP server using the Express application
const server = http.createServer(app);

// Create a Socket.IO server using the HTTP server
const io = new Server(server);

// serve the html client
app.use(express.static("public"));

// Listen for new client connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for a message sent by this client
  socket.on("message", (text) => {
    // Validate the message
    if (typeof text !== "string" || text.trim() === "") {
      socket.emit(
        "validationError",
        "Invalid message. Message cannot be empty or non-string.",
      );
      return;
    }
    // Remove extra spaces from the message
    const message = text.trim();

    console.log("Received:", message);

    // Send the valid message to all connected clients
    // io.emit("message", message);

    // Send the valid message to all clients in the "chatroom" room
    io.to("chatroom").emit("message",message);
  });

  // Add the joinRoom event listener
  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    console.log(`User Joined Room: ${roomName}`);
  });

  // Listen when this client disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server on port 5000
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
