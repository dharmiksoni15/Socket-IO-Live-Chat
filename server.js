
require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

// Temporary storage for registered users and online users
const registeredUsers = new Map();
const users = new Map();

// Register API
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    if (registeredUsers.has(username)) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    registeredUsers.set(username, {
      username,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Registration successful.",
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Unable to register user.",
    });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = registeredUsers.get(username);

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Set the username for this socket
  socket.on("setUsername", (username) => {
    if (typeof username !== "string" || !username.trim()) {
      return;
    }

    users.set(socket.id, username.trim());

    io.emit("onlineUsers", Array.from(users.values()));
  });

  // Join a chat room
  socket.on("joinRoom", (room) => {
    if (typeof room !== "string" || !room.trim()) {
      return;
    }

    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Send a message to the current room
  socket.on("message", (message) => {
    if (typeof message !== "string" || !message.trim()) {
      socket.emit("validationError", "Message cannot be empty.");
      return;
    }

    const username = users.get(socket.id) || "Anonymous";
    const messageData = {
      username,
      message: message.trim(),
    };

    const room = Array.from(socket.rooms).find(
      (roomName) => roomName !== socket.id
    );

    if (!room) {
      socket.emit("validationError", "Join a room before sending messages.");
      return;
    }

    io.to(room).emit("message", messageData);
  });

  // Send a private message
  socket.on("privateMessage", ({ to, message } = {}) => {
    if (
      typeof to !== "string" ||
      !to.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      socket.emit("validationError", "Recipient and message are required.");
      return;
    }

    const recipient = to.trim();
    const text = message.trim();

    const recipientSocketId = Array.from(users.entries()).find(
      ([, username]) => username === recipient
    )?.[0];

    if (!recipientSocketId) {
      socket.emit("validationError", "User is not online.");
      return;
    }

    const sender = users.get(socket.id) || "Anonymous";

    io.to(recipientSocketId).emit("privateMessage", {
      from: sender,
      message: text,
    });
  });

  // Notify other users when someone starts typing
  socket.on("typing", () => {
    const username = users.get(socket.id) || "Anonymous";
    socket.broadcast.emit("typing", username);
  });

  // Notify other users when typing stops
  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  // Remove the user when they disconnect
  socket.on("disconnect", () => {
    users.delete(socket.id);

    io.emit("onlineUsers", Array.from(users.values()));

    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
