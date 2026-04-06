# 🌌 Virtual Cosmos

A real-time 2D virtual space where users can move around and chat with others based on proximity — just like real-world interactions, but virtual.

> Move close to someone → chat opens. Move away → chat closes.

---

## 🎥 Demo

![Virtual Cosmos Demo]

---

## ✨ Features

- 🧑‍🚀 Real-time multiplayer — see others move live
- 🔭 Proximity-based chat — chat opens/closes automatically
- 💬 Multi-user chat tabs — chat with multiple nearby users
- ⌨️ Typing indicators
- 🎨 Unique avatar colors per user
- 🌐 Persistent user sessions via MongoDB

---

## 🛠️ Tech Stack

### Frontend
- React + Vite
- HTML5 Canvas (custom rendering)
- Socket.IO Client
- Tailwind CSS (utility classes)

### Backend
- Node.js + Express
- Socket.IO
- MongoDB + Mongoose

---

## 📁 Project Structure
```
virtual-cosmos/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.jsx        # 2D game canvas
│   │   │   ├── ChatPanel.jsx     # Proximity chat UI
│   │   │   ├── HUD.jsx           # Top status bar
│   │   │   └── JoinScreen.jsx    # Entry screen
│   │   ├── hooks/
│   │   │   ├── useSocket.js      # Socket.IO logic
│   │   │   └── useMovement.js    # WASD movement
│   │   ├── utils/
│   │   │   └── helpers.js        # Constants & utilities
│   │   └── App.jsx
│   └── package.json
│
└── backend/
    ├── models/
    │   └── User.js               # MongoDB schema
    ├── utils/
    │   ├── proximity.js          # Distance & room logic
    │   └── roomManager.js        # Socket room manager
    ├── server.js
    ├── .env
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/tanishka462/Virtual-cosmos.git
cd virtual-cosmos
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in the backend folder:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=YOUR_MONGO_URI
```

Start the server:
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app

Go to `http://localhost:5173` in two browser tabs to test multiplayer.

---

## 🎮 How to Use

1. Open the app and enter your name
2. You'll appear as a colored circle in the cosmos
3. Use **WASD** or **Arrow Keys** to move
4. Move close to another user → chat panel appears
5. Start messaging!
6. Move away → chat closes automatically

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL for CORS |
| `MONGODB_URI` | `mongodb://localhost:27017/virtual-cosmos` | MongoDB connection string |
| `PROXIMITY_RADIUS` | `150px` | Distance to trigger chat |

---

## 📡 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user:join` | Client → Server | Join the cosmos |
| `user:move` | Client → Server | Send position update |
| `user:joined` | Server → Client | Confirm join with user data |
| `users:list` | Server → Client | All current users |
| `user:new` | Server → Client | Someone joined |
| `user:moved` | Server → Client | Someone moved |
| `user:left` | Server → Client | Someone left |
| `proximity:connect` | Server → Client | Nearby user detected |
| `proximity:disconnect` | Server → Client | User moved away |
| `chat:message` | Both | Send/receive message |
| `chat:typing` | Both | Typing indicator |

