# 🗨️ Real-Time Chat Application with Socket.io

## 🚀 Project Overview
This project is a full-featured real-time chat application built with Node.js, Express, Socket.io, and React (Vite). It demonstrates bidirectional communication between clients and server, supporting live messaging, notifications, online status, private messaging, multiple chat rooms, file sharing, message reactions, and more. The app is optimized for both desktop and mobile devices and includes robust UX and performance features.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+ (https://nodejs.org/)
- pnpm (https://pnpm.io/)

### 1. Clone the repository
```
git clone <your-repo-url>
cd <your-repo-directory>
```

### 2. Install dependencies
#### Server
```
cd server
pnpm install
```
#### Client
```
cd ../client
pnpm install
```

### 3. Start the development servers
#### Server
```
pnpm run dev
```
#### Client
```
pnpm run dev
```

- The client will run at http://localhost:5173 by default.
- The server will run at http://localhost:5000 by default.

### 4. (Optional) Add Notification Sound
Place a `notification.mp3` file in the `client/public/` directory for sound notifications.

---

## ✨ Features Implemented
- **Username-based authentication**
- **Global chat room** for all users
- **Multiple chat rooms/channels** (create, join, switch)
- **Private messaging** between users
- **Live messaging** with sender name and timestamp
- **Typing indicators** (per room/private chat)
- **Online/offline user status**
- **File and image sharing** (inline images, download links for files)
- **Message reactions** (like, love, laugh, wow, sad, party)
- **Read receipts** (see who has read each message)
- **Message delivery acknowledgment** (delivered checkmark)
- **Real-time notifications** (unread counts, join/leave, sound, browser notifications)
- **Message search** (filter messages in current chat)
- **Message pagination** (load older messages)
- **Robust reconnection logic**
- **Responsive design** (works on desktop and mobile)
- **Logout button**

---

## 📸 Screenshots / GIFs

> _Add screenshots or GIFs of the application below. Example:_

![Chat Room Screenshot](./screenshots/chat-room.png)

![Mobile View Screenshot](./screenshots/mobile-view.png)

![Private Messaging GIF](./screenshots/private-messaging.gif)

---

## 📄 License
MIT
