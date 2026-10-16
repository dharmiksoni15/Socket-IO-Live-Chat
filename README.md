# Socket.IO Live Chat

A real-time chat application built using **Node.js, Express.js, Socket.IO, HTML, CSS, and JavaScript** to learn real-time communication and event-driven application development.

## Overview

This project started with basic client-server messaging and gradually expanded to include broadcasting, chat rooms, private messaging, input validation, and JWT authentication.

## Features

- Real-time messaging and broadcasting
- Connection and disconnection event handling
- Empty-message validation and error handling
- Room-based chat: `general`, `react`, and `nodeJs`
- Private messaging between connected users
- Online-user tracking and typing indicators
- User registration and login
- Password hashing with `bcryptjs`
- JWT generation and Socket.IO authentication middleware

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Real-time communication:** Socket.IO
- **Authentication:** JSON Web Token (`jsonwebtoken`), `bcryptjs`
- **Configuration:** `dotenv`

## Getting Started

### Prerequisites

- Node.js and npm
- Git
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

**4. Configure environment variables**

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
JWT_SECRET=your_secure_secret
```

Use a strong, private secret. Never commit your `.env` file to GitHub.

**5. Start the server**

```bash
node server.js
```

**6. Open the application**

Visit `http://localhost:5000` in your browser while the server is running.

## Development Journey

### Phase 1 — Setup & Connection
**Completed**
- Set up Node.js, Express.js, and Socket.IO.
- Created the HTTP server and connected the browser client.

### Phase 2 — Events & Messaging
**Completed**
- Practised `connection` and `disconnect` events.
- Used `socket.on()` and `socket.emit()` for message communication.

### Phase 3 — Broadcasting
**Completed**
- Tested communication across multiple browser tabs.
- Learned the difference between `io.emit()` and `socket.broadcast.emit()`.

### Phase 4 — Validation & Error Handling
**Completed**
- Blocked empty and whitespace-only messages.
- Added message validation and error feedback.

### Phase 5 — Rooms & Private Messaging
**Completed**
- Implemented `general`, `react`, and `nodeJs` rooms.
- Added room-based and private messaging.

### Phase 6 — Live Chat Features
**Implemented**
- Added online-user tracking and typing indicators.
- Connected the main chat interface with real-time events.

### Phase 7 — JWT Authentication
**Authentication Implemented**
- Added registration and login APIs.
- Used `bcryptjs` for password hashing and comparison.
- Generated JWT tokens and verified them through Socket.IO middleware.

## Future Improvements

- Integrate MongoDB for persistent user accounts and chat history.
- Enforce authenticated user identity across all chat events.
- Improve message history, room management, and production security.

## Author

**Dharmik Soni**  
MCA Student | Full-Stack Developer

- GitHub: [@dharmiksoni15](https://github.com/dharmiksoni15)
- Portfolio: [dharmiksoni-portfolio.netlify.app](https://dharmiksoni-portfolio.netlify.app)
- Repository: [Socket.IO Live Chat](https://github.com/dharmiksoni15/Socket-IO-Live-Chat)

---

*Built as a hands-on learning project to strengthen real-time communication and backend development skills.*
