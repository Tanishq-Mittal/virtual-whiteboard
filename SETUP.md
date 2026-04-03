# Smart Whiteboard - Complete Setup Guide

## Prerequisites
- Node.js & npm installed
- MongoDB installed and running locally
- A code editor (VS Code recommended)

---

## ⚡ Quick Start (Recommended)

### Windows Users - Use Startup Script
Double-click one of these files in the project root:
- `start-all.bat` (Command Prompt)
- `start-all.ps1` (PowerShell)

This will automatically start:
1. MongoDB
2. Backend Server (port 5003)
3. Frontend Dev Server (port 5173)

Then open: **http://localhost:5173**

---

## 🚀 Manual Setup (Step-by-Step)

### Step 1: Start MongoDB
Open a new terminal and run:
```bash
mongod
```
You should see: `Waiting for connections on port 27017`

### Step 2: Start Backend Server
Open a new terminal and run:
```bash
cd backend
npm start
```
You should see: `Server running on port 5003`

### Step 3: Start Frontend Dev Server
Open a new terminal and run:
```bash
cd frontend
npm run dev
```
You should see: `Local: http://localhost:5173`

### Step 4: Open in Browser
Go to: **http://localhost:5173**

---

## 📝 Testing the App

### Register a New Account
1. Click "Create Account"
2. Fill in all fields:
   - Full Name: `John Doe`
   - Address: `123 Main St`
   - Phone: `1234567890`
   - Email: `john@example.com`
   - Password: `password123`
3. Click "Create Account"
4. After success, click "Login"

### Login
1. Click "Login"
2. Enter credentials:
   - Email: `john@example.com`
   - Password: `password123`
3. Click "Login"

### Draw on the Whiteboard
- **Desktop/Laptop**: Click and drag with mouse
- **Mobile/Tablet**: Touch and drag with finger
- **Features**:
  - Choose pen color
  - Adjust thickness (1-30)
  - Change background color
  - Erase with eraser tool
  - Undo/Redo changes
  - Download as image
  - Join shared rooms

---

## 🔧 Configuration Files

### Frontend (.env)
```
VITE_API_URL=http://localhost:5003
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/whiteboard
SESSION_SECRET=whiteboard-secret-key-2024
PORT=5003
```

---

## 📱 Mobile Testing
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On phone, visit: `http://YOUR_IP:5173`
3. The app is fully responsive and touch-enabled

---

## ❌ Troubleshooting

### "Cannot connect to server"
- ❌ Backend not running? → Run `npm start` in backend folder
- ❌ MongoDB not running? → Run `mongod` in a terminal
- ❌ Wrong port? → Check ports (5003 for backend, 5173 for frontend)

### "Login fails with error"
- ✅ Check browser console (F12) for error messages
- ✅ Make sure backend is responding on http://localhost:5003
- ✅ Verify MongoDB is running
- ✅ Check that credentials are correct

### "Canvas not appearing after login"
- ✅ Wait 2-3 seconds for canvas to load
- ✅ Refresh the page (F5)
- ✅ Check browser console for JavaScript errors
- ✅ Try a different browser

### "Drawing not syncing to other users"
- ✅ Join the same room ID
- ✅ Check that Socket.IO is connected
- ✅ Make sure both users are logged in

---

## 📦 Project Structure
```
whiteboard-project/
├── backend/              # Express.js API server
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── .env              # Configuration
├── frontend/             # React Vite application
│   ├── src/
│   │   ├── App.jsx       # Main app component
│   │   ├── App.css       # Responsive styles
│   │   └── main.jsx      # Entry point
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.js    # Vite configuration
│   └── .env              # API configuration
└── README.md             # This file
```

---

## ✨ Features
- ✅ Responsive design (desktop/tablet/mobile)
- ✅ Touch drawing support
- ✅ Real-time collaboration (Socket.IO)
- ✅ User authentication
- ✅ Undo/Redo functionality
- ✅ Change colors and brush thickness
- ✅ Grid overlay option
- ✅ Download drawings as PNG
- ✅ Join shared rooms

---

## 🎯 Production Deployment
1. Build frontend: `npm run build` (in frontend folder)
2. Deploy on Vercel, Netlify, or GitHub Pages
3. Update CORS in backend for production URL
4. Use MongoDB Atlas for cloud database
5. Set environment variables on hosting platform

---

**Need help? Check the console (F12) for error messages!**
