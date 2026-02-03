# Nexus | Real-Time Collaboration App

A high-performance video conferencing and collaboration platform built with Next.js, WebRTC, and Socket.io.

## Features

- 📹 **Video Calling**: High-quality multi-user video/audio streaming.
- 🖥️ **Screen Sharing**: Effortlessly share your screen with other participants.
- 🎨 **Whiteboard**: Real-time collaborative drawing and brainstorming.
- 💬 **Encrypted Chat**: Secure messaging with end-to-end AES encryption.
- 📂 **File Sharing**: Securely share files within the chat.
- 🔐 **User Authentication**: Premium login/signup experience (Mocked).
- 🛡️ **Data Security**: DTLS/SRTP for media and AES for collaboration data.

## Technology Stack

- **Frontend**: Next.js 15, Framer Motion, Lucide Icons, Vanilla CSS.
- **Real-Time**: Socket.io (Signaling & Data Sync).
- **Media**: WebRTC (via Simple-Peer).
- **Security**: CryptoJS (AES-256).
- **Backend**: Node.js, Express.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Socket.io Signaling Server
```bash
node server.js
```

### 3. Start Next.js Development Server
```bash
npm run dev
```

### 4. Open in Browser
Visit [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

## Note on Video Calling
For a production environment, you should use a STUN/TURN server for NAT traversal. This app uses default Google STUN servers.
For large-scale multi-user calls, consider an SFU (Selective Forwarding Unit) like Mediasoup or LiveKit.
