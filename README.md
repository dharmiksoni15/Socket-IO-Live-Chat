# Socket.IO Live Chat

A real-time chat application built using **Node.js, Express.js, Socket.IO, HTML, CSS, and JavaScript**. This project is being developed step by step to understand real-time communication, event-driven architecture, broadcasting, chat rooms, private messaging, authentication, and deployment.

## Overview

Socket.IO Live Chat demonstrates how multiple clients can communicate instantly through a server. The project starts with a basic real-time messaging system and gradually evolves into a complete chat application.

The primary goal is to learn Socket.IO through practical implementation while following a structured, phase-by-phase development roadmap.

## Current Features

- Real-time client-server communication using Socket.IO
- Send and receive messages without refreshing the page
- Express.js server serving the frontend
- Connection and disconnection event handling
- Message broadcasting to connected clients
- Simple HTML and JavaScript chat interface

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for the backend |
| Express.js | HTTP server and static file serving |
| Socket.IO | Real-time, event-based communication |
| HTML5 | Application structure |
| CSS3 | User interface and styling |
| JavaScript | Client-side interactions |
| MongoDB | Planned message persistence |
| JWT | Planned authentication |

## Project Structure

```text
Socket-IO-Live-Chat/
└── backend/
    ├── public/
    │   └── index.html
    ├── server.js
    ├── package.json
    ├── package-lock.json
    └── .gitignore
```

## Getting Started

### Prerequisites

- Node.js and npm installed
- Git installed
- A code editor such as Visual Studio Code
- A modern web browser

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/dharmiksoni15/Socket-IO-Live-Chat.git
```

**2. Navigate to the backend directory**

```bash
cd Socket-IO-Live-Chat/backend
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the server**

```bash
node server.js
```

**5. Open the application**

Visit:

http://localhost:5000

Keep the server terminal running while testing the application.

## Expected UI Design

The final application is planned to have a clean, modern, responsive chat interface inspired by contemporary messaging applications.

### UI Preview

```text
┌──────────────────────────────────────────────┐
│  Socket.IO Chat             ● Connected      │
├──────────────────────────────────────────────┤
│                                              │
│  ONLINE USERS                                │
│  ● User 1                                    │
│  ● User 2                                    │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  User 1                                      │
│  Hey! How are you?                           │
│                                              │
│                    I'm good. How about you?  │
│                                      You     │
│                                              │
│  User 1 is typing...                         │
│                                              │
├──────────────────────────────────────────────┤
│  Type your message...             [ Send ]   │
└──────────────────────────────────────────────┘
```

*This is a conceptual preview of the planned interface, not a screenshot of the current application.*

### Planned UI Components

- **Chat Header:** Application name and connection status.
- **Online Users:** List of currently connected users.
- **Message Area:** Incoming and outgoing messages with distinct styling.
- **Typing Indicator:** Shows when another user is typing.
- **Message Input:** Input field and send button.
- **Responsive Layout:** Usable on desktop and mobile screens.
- **Room Interface:** Planned support for joining different chat rooms.

## Development Roadmap

The project will be implemented in seven phases.

### Phase 1 — Setup & Connection
**Status: Completed**

- Set up Node.js and Express.js.
- Create an HTTP server.
- Integrate Socket.IO with the server.
- Connect the browser client to the Socket.IO server.

### Phase 2 — Events & Messaging
**Status: Basic implementation completed**

- Understand `connection` and `disconnect` events.
- Learn how `socket.on()` receives events.
- Learn how `socket.emit()` sends events.
- Implement basic message sending and receiving.
- Understand the client-server messaging flow.

### Phase 3 — Multiple Clients & Broadcasting
**Status: Next**

- Test communication between multiple browser clients.
- Understand `io.emit()` versus `socket.broadcast.emit()`.
- Send messages to all connected clients.
- Understand which clients receive each event.

### Phase 4 — Validation & Error Handling
**Status: Planned**

- Prevent empty messages.
- Trim unnecessary whitespace.
- Validate incoming message data.
- Handle invalid inputs safely.
- Add basic error handling and user feedback.

### Phase 5 — Rooms & Private Messaging
**Status: Planned**

- Create and join chat rooms.
- Send messages to a specific room.
- Implement group messaging.
- Explore private messaging between users.
- Understand room membership and targeted events.

### Phase 6 — Complete Chat Application
**Status: Planned**

- Build the complete responsive chat interface.
- Display online users.
- Add typing indicators.
- Improve message presentation and timestamps.
- Integrate MongoDB for message persistence.
- Load stored messages when appropriate.

### Phase 7 — Authentication & Deployment
**Status: Planned**

- Implement user authentication.
- Integrate JWT-based authentication.
- Protect chat-related server events.
- Associate messages with authenticated users.
- Configure production environment variables.
- Deploy the frontend and backend.
- Test real-time communication in production.

## Learning Objectives

By completing this project, the goal is to understand:

- How Socket.IO works with Node.js and Express.js.
- How real-time communication differs from ordinary HTTP requests.
- How event-driven communication works.
- How broadcasting and rooms are implemented.
- How to validate client input and handle errors.
- How to integrate a database into a real-time application.
- How authentication and deployment fit into a full-stack project.

## Future Improvements

- User profile and display names
- Message timestamps
- Unread message indicators
- Better mobile responsiveness
- Improved connection and reconnection feedback
- Production-ready security and validation

## Author

**Dharmik Soni**

MCA Student | Full-Stack Developer

- GitHub: [@dharmiksoni15](https://github.com/dharmiksoni15)
- Project Repository: [Socket-IO-Live-Chat](https://github.com/dharmiksoni15/Socket-IO-Live-Chat)

---

This project is being developed for practical learning, experimentation, and building a strong understanding of real-time application development.
