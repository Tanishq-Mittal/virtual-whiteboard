# 🚀 Deployment Guide

## Problem
Your frontend is deployed to Vercel but still trying to connect to `localhost:5003` for the backend API.

## Solution: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Deploy Backend
1. Click "New Project" → "Deploy from GitHub"
2. Select your `whiteboard-project` repository
3. Choose the `backend` folder as the root directory
4. Set environment variables:
   ```
   MONGODB_URI=mongodb://your-mongodb-connection-string
   SESSION_SECRET=your-random-secret-key-here
   PORT=5003
   ```

### Step 3: Get Database
1. Add MongoDB plugin to your Railway project
2. Copy the MongoDB connection string
3. Update `MONGODB_URI` in Railway environment variables

### Step 4: Update Frontend
1. Get your Railway backend URL (something like `https://your-project.up.railway.app`)
2. Update `frontend/.env`:
   ```
   VITE_API_URL=https://your-project.up.railway.app
   ```
3. Redeploy frontend to Vercel

### Step 5: Test
- Frontend: https://virtual-whiteboard-mu.vercel.app/
- Backend: Your Railway URL
- Login should work!

## Alternative: Use Render
If Railway doesn't work, try Render.com (free tier available).

Would you like me to help you with the Railway deployment?