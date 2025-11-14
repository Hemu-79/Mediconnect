# 🚀 Quick Start - Mediconnect

## Current Status: ✅ Servers Running!

- **Backend:** http://localhost:5000 ✅
- **Frontend:** http://localhost:5173 ✅

## ⚠️ IMPORTANT: Configure Environment Variables First!

The application won't work properly until you configure the `.env` files.

## Minimum Required Setup (To Test Locally)

### 1️⃣ MongoDB (REQUIRED - Takes 5 minutes)
**Option A - MongoDB Atlas (Recommended):**
```
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account → Create free cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string (looks like: mongodb+srv://...)
5. Edit: backend/.env
   Replace: MONGO_URI=mongodb://localhost:27017/mediconnect
   With: MONGO_URI=your_connection_string_here
```

**Option B - Local MongoDB:**
```
1. Install MongoDB from: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Keep: MONGO_URI=mongodb://localhost:27017/mediconnect in backend/.env
```

### 2️⃣ Firebase (REQUIRED - Takes 5 minutes)
```
1. Go to: https://console.firebase.google.com/
2. Create new project → Continue → Continue
3. Click "Authentication" → Get Started
4. Enable "Email/Password" (click it → Enable → Save)
5. Go to Project Settings (⚙️ icon) → Your apps → Add app → Web (</>)
6. Register app (nickname: Mediconnect) → Register app
7. Copy the firebaseConfig values to frontend/.env:

   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123:web:abc123
```

### 3️⃣ Groq AI - Optional but Recommended (Takes 2 minutes)
```
1. Go to: https://console.groq.com/
2. Sign up with Google/GitHub
3. Go to API Keys → Create API Key
4. Copy key to backend/.env:
   GROQ_API_KEY=gsk_...
```

## After Configuration

### Restart Servers:
```powershell
# Stop backend (Ctrl+C in backend terminal)
# Stop frontend (Ctrl+C in frontend terminal)

# Restart backend
cd c:\Users\user\Desktop\Mediconnect\backend
npm start

# Restart frontend (new terminal)
cd c:\Users\user\Desktop\Mediconnect\frontend
npm run dev
```

### Test the App:
```
1. Open: http://localhost:5173
2. Click "Get Started" or "Register"
3. Create a patient account
4. Complete your profile
5. Explore the dashboard!
```

## Optional Advanced Setup

### Google Calendar Integration (Optional)
**Requires:** Google Cloud Console setup
**Time:** ~10 minutes
**See:** SETUP_GUIDE.md for detailed instructions

### Video Calls (Optional)
**Requires:** Digital Samba API key
**Time:** ~5 minutes
**See:** SETUP_GUIDE.md for detailed instructions

## Troubleshooting

### "MongoDB connection failed"
→ Check MONGO_URI in backend/.env is correct

### Firebase errors in browser console
→ Check all VITE_FIREBASE_* variables in frontend/.env

### AI Chatbot not responding
→ Add GROQ_API_KEY to backend/.env

### Port already in use
→ Change PORT in backend/.env or kill the process

## File Locations

```
📁 Mediconnect/
   📁 backend/
      📄 .env           ← Edit this for backend config
   📁 frontend/
      📄 .env           ← Edit this for frontend config
   📄 SETUP_GUIDE.md    ← Full detailed guide
   📄 PROJECT_SUMMARY.md ← Complete project info
   📄 QUICK_START.md     ← This file
```

## Need Help?

1. Read `SETUP_GUIDE.md` for detailed instructions
2. Check browser console (F12) for frontend errors
3. Check backend terminal for server errors
4. Verify all environment variables are set correctly

---

**Remember:** You need MongoDB + Firebase at minimum to test the app!

Good luck! 🚀
