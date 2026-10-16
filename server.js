require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Check the JWT before allowing a socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  // Reject the connection if no token was sent
  if (!token) {
    return next(new Error("Authentication token missing"));
  }

  try {
    // Verify the token and read the username stored inside it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.data.username = decoded.username;

    // Allow the connection to continue if the token is valid
    next();
  } catch (error) {
    // Invalid or expired tokens cannot connect
    next(new Error("invalid or expired token"));
  }
});

// Parse incoming JSON requests and serve the frontend files
app.use(express.json());
app.use(express.static("public"));

// Store registered and online users in memory for now
const registeredUsers = new Map();
const users = new Map();

// Register a new user
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    // Prevent duplicate usernames
    if (registeredUsers.has(username)) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    // Store a hashed password instead of the original password
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

// Check login details and return a JWT if they are correct
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = registeredUsers.get(username);

    // Return the same error for an unknown username or wrong password
    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    // Compare the entered password with the stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    // Create a token that expires after one hour
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

// Handle socket connections after the JWT middleware approves them
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Set the username for this socket
  socket.on("setUsername", (username) => {
    if (typeof username !== "string" || !username.trim()) {
      return;
    }

    users.set(socket.id, username.trim());

    // Send the updated online user list to all connected clients
    io.emit("onlineUsers", Array.from(users.values()));
  });

  // Join the room selected by the user
  socket.on("joinRoom", (room) => {
    if (typeof room !== "string" || !room.trim()) {
      return;
    }

    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Validate and send a message to the joined room
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

    // Find the room this socket joined, excluding its private socket room
    const room = Array.from(socket.rooms).find(
      (roomName) => roomName !== socket.id
    );

    if (!room) {
      socket.emit("validationError", "Join a room before sending messages.");
      return;
    }

    // Broadcast the message to everyone in that room
    io.to(room).emit("message", messageData);
  });

  // Send a private message to a specific online user
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

    // Find the socket ID belonging to the recipient
    const recipientSocketId = Array.from(users.entries()).find(
      ([, username]) => username === recipient
    )?.[0];

    if (!recipientSocketId) {
      socket.emit("validationError", "User is not online.");
      return;
    }

    const sender = users.get(socket.id) || "Anonymous";

    // Deliver the private message only to the recipient
    io.to(recipientSocketId).emit("privateMessage", {
      from: sender,
      message: text,
    });
  });

  // Tell other users who is typing
  socket.on("typing", () => {
    const username = users.get(socket.id) || "Anonymous";
    socket.broadcast.emit("typing", username);
  });

  // Clear the typing indicator when the user stops typing
  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  // Remove the disconnected socket from the online users list
  socket.on("disconnect", () => {
    users.delete(socket.id);

    io.emit("onlineUsers", Array.from(users.values()));

    console.log("User disconnected:", socket.id);
  });
});

// Start the server on the configured port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
