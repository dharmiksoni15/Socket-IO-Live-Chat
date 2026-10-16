
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Temporary in-memory storage
const registeredUsers = new Map();
const users = new Map();

// ==================== STEP 9.2: REGISTER ====================
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate registration input
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.trim() === "" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Username is required and password must be at least 8 characters."
      });
    }

    const normalizedUsername = username.trim();

    // Check for an existing username
    if (registeredUsers.has(normalizedUsername)) {
      return res.status(409).json({
        message: "Username already exists."
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user temporarily in memory
    registeredUsers.set(normalizedUsername, {
      username: normalizedUsername,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "User registered successfully."
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
});

// ==================== STEP 9.3: LOGIN + JWT ====================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate login input
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.trim() === "" ||
      password === ""
    ) {
      return res.status(400).json({
        message: "Username and password are required."
      });
    }

    const normalizedUsername = username.trim();

    // Find registered user
    const user = registeredUsers.get(normalizedUsername);

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password."
      });
    }

    // Compare entered password with stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password."
      });
    }

    // Check JWT secret configuration
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from .env");

      return res.status(500).json({
        message: "Server authentication is not configured."
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
});

// ==================== SOCKET.IO CHAT ====================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a room
  socket.on("joinRoom", (roomName) => {
    if (typeof roomName !== "string" || !roomName.trim()) {
      socket.emit("validationError", "Room name cannot be empty");
      return;
    }

    const room = roomName.trim();

    // Leave previously joined application rooms
    for (const joinedRoom of socket.rooms) {
      if (joinedRoom !== socket.id) {
        socket.leave(joinedRoom);
      }
    }

    socket.join(room);
    socket.emit("roomJoined", room);

    console.log(`${socket.id} joined room: ${room}`);
  });

  // Receive and broadcast room messages
  socket.on("message", (message) => {
    if (typeof message !== "string" || message.trim() === "") {
      socket.emit("validationError", "Message cannot be empty");
      return;
    }

    const currentRoom = [...socket.rooms].find(
      (room) => room !== socket.id
    );

    if (!currentRoom) {
      socket.emit(
        "validationError",
        "Join a room before sending messages"
      );
      return;
    }

    const cleanMessage = message.trim();

    console.log("Received:", cleanMessage);

    io.to(currentRoom).emit("message", {
      username: users.get(socket.id) || "Anonymous",
      message: cleanMessage
    });
  });

  // Set username and update online users
  socket.on("setUsername", (username) => {
    if (typeof username !== "string" || !username.trim()) {
      socket.emit("validationError", "Username cannot be empty");
      return;
    }

    users.set(socket.id, username.trim());

    io.emit("onlineUsers", [...users.values()]);
  });

  // Send private messages
  socket.on("privateMessage", ({ to, message } = {}) => {
    if (
      typeof to !== "string" ||
      typeof message !== "string" ||
      !to.trim() ||
      !message.trim()
    ) {
      socket.emit(
        "validationError",
        "Recipient and message are required"
      );
      return;
    }

    const recipient = [...users.entries()].find(
      ([, username]) => username === to.trim()
    );

    if (!recipient) {
      socket.emit("validationError", "Recipient is not online");
      return;
    }

    const payload = {
      from: users.get(socket.id) || "Anonymous",
      message: message.trim()
    };

    io.to(recipient[0]).emit("privateMessage", payload);
    socket.emit("privateMessageSent", payload);
  });

  // Typing indicator
  socket.on("typing", () => {
    socket.broadcast.emit(
      "typing",
      users.get(socket.id) || "Anonymous"
    );
  });

  // Stop typing indicator
  socket.on("stopTyping", () => {
    socket.broadcast.emit(
      "stopTyping",
      users.get(socket.id) || "Anonymous"
    );
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const username = users.get(socket.id);

    users.delete(socket.id);

    console.log("User disconnected:", socket.id);

    io.emit("onlineUsers", [...users.values()]);

    if (username) {
      io.emit("stopTyping", username);
    }
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
