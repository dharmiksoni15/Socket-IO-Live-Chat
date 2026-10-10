
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
    console.log("Received:", text);

    // Send the message to all connected clients
    io.emit("message", text);
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
