# NexaChat 💬

NexaChat is a cloud-based real-time chat application built using Next.js and Firebase. It provides secure one-to-one messaging, group chats, media sharing, and real-time notifications through a modern responsive interface.

---

## 🚀 Features

- 🔐 User Authentication (Register, Login, Email Verification)
- 🔑 Forgot Password & Password Reset
- 💬 Real-Time One-to-One Chat
- 👥 Group Chat Support
- 🤝 Friend Requests & Friends Management
- 📷 Image Sharing
- 🎵 Audio Sharing
- 📄 File Sharing
- 🔔 Desktop Notifications
- 🟢 Online/Offline Presence
- 🔕 Mute / Unmute Chats
- 🚫 Block / Unblock Users
- 📦 Archive Chats
- 🗑 Delete Chats
- 👤 User Profile Management
- ⚙️ Settings Management
- 📱 Fully Responsive UI (Mobile + Desktop)

---

## 🛠 Tech Stack

### Frontend
- Next.js 15
- React
- TypeScript
- Tailwind CSS

### Backend & Cloud Services
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Hosting

### Additional Tools
- Sonner Toast Notifications
- Browser Notification API
- Artillery (Load Testing)

---

## 📁 Project Structure

```text
frontend/          Next.js application
docs/              Project documentation and reports
firestore.rules    Firestore security rules
storage.rules      Firebase Storage security rules
firebase.json      Firebase configuration
load-tests/        Performance testing scripts
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Dilveers/NexaChat.git
cd NexaChat
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Application runs at:

```text
http://localhost:3000
```

---

## 🔥 Firebase Configuration

Create a file:

```text
frontend/.env.local
```

Add:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

---

## 🚀 Deployment

Deploy using Firebase CLI:

```bash
firebase deploy
```

Frontend can also be deployed on:

- Vercel
- Firebase Hosting

---

## ✅ Final Checks

- Protected routes secured using `AuthGuard`
- Firestore and Storage rules configured
- Mobile responsive design implemented
- Real-time messaging enabled
- Notifications integrated

---

## 👨‍💻 Author

**Dilveer Singh**

BCA Student | Chandigarh University

---



## 📄 License

This project is developed for academic and educational purposes.