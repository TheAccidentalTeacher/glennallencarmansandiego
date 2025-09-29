# Carmen Sandiego Game - Development Server Setup

## Quick Start (Single Command)

**To start both servers with one command:**

```bash
node start-game.mjs
```

This will start:
- Backend API server on `http://localhost:3001`
- React frontend on `http://localhost:5173`

Then open your browser to: **http://localhost:5173**

---

## What Was Done to Fix the Development Setup

### Problem
- Frontend was trying to call `/api/images/villains` but only `/api/villains` existed
- React dev server wasn't starting properly
- Multiple terminals and complex setup required

### Solution

#### 1. Fixed Missing API Endpoint
Added to `test-server.mjs`:
```javascript
// Get villains for image management (aliases for frontend compatibility)
app.get('/api/images/villains', async (req, res) => {
  try {
    const database = await connectMongoDB();
    const villains = await database.collection('villains').find({}).toArray();
    
    // Transform data for frontend compatibility
    const villainsWithImages = villains.map(villain => ({
      ...villain,
      hasImage: true, // Assume all villains have images for now
      imageCount: 1   // Default image count
    }));
    
    res.json(villainsWithImages);
  } catch (error) {
    console.error('Error fetching villains for images:', error);
    res.status(500).json({ error: 'Failed to fetch villains' });
  }
});
```

#### 2. Set Environment Variables
Added to `.env` file:
```bash
VITE_API_URL=http://localhost:3001
```

#### 3. Created Single Start Script
Created `start-game.mjs` that automatically starts both:
- Backend API server (MongoDB Atlas connection)
- React frontend dev server

#### 4. Verified Configuration Files

**Vite Config Already Had Proper Proxy:**
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

**MongoDB Atlas Connection:**
```javascript
MONGODB_URI=mongodb+srv://scosom:nonPhubic4@brainstorm-cluster.bg60my0.mongodb.net/carmen-sandiego
```

---

## For Future Use in Other Chats

### Copy This Prompt for AI Assistant:

```
I need help setting up a development server for my full-stack app. The structure is:
- React frontend that should run on localhost:5173
- Node.js backend API that should run on localhost:3001
- The frontend makes API calls to `/api/...` endpoints
- I need both servers to run simultaneously for testing

Please:
1. Check if the API endpoints the frontend is calling actually exist in the backend
2. Ensure proper environment variables are set (VITE_API_URL)
3. Verify the Vite proxy configuration routes /api requests to the backend
4. Create a single script to start both servers with one command

The goal is: run one command, open browser to localhost:5173, everything works.
```

---

## Current Setup Status

✅ **Backend API Server**: `http://localhost:3001`
- Connected to MongoDB Atlas
- Endpoints: `/health`, `/api/villains`, `/api/locations`, `/api/cases`, `/api/images/villains`

✅ **React Frontend**: `http://localhost:5173`
- Vite dev server with hot reload
- Proxy configured to route API calls to backend
- Environment variables set

✅ **Database**: MongoDB Atlas
- 3 villains loaded
- 5 locations loaded  
- 1 test case loaded

---

## Troubleshooting

If you see "localhost refused to connect":
1. Make sure you ran `node start-game.mjs`
2. Wait for both servers to fully start (about 5 seconds)
3. Check that you're going to `http://localhost:5173` (not 3001)

If you see API 404 errors:
1. Check that backend server started and shows "MongoDB Atlas: Connected"
2. Test backend directly: `http://localhost:3001/health`
3. Verify proxy is working: check browser network tab

---

**That's it! One command, working game. No more complexity!** 🎮