# Mediconnect Setup Guide

This guide will help you set up and run the Mediconnect application on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** - Either local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- **Git** (optional) - For version control

## Required Services & API Keys

You'll need to set up accounts and get API keys from the following services:

### 1. MongoDB
**Purpose:** Database for storing users, appointments, and medical records

**Setup:**
- **Option A - MongoDB Atlas (Cloud):**
  1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create a free account
  3. Create a new cluster
  4. Click "Connect" → "Connect your application"
  5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
  
- **Option B - Local MongoDB:**
  1. Install MongoDB locally
  2. Start MongoDB service
  3. Use connection string: `mongodb://localhost:27017/mediconnect`

### 2. Firebase Authentication
**Purpose:** User authentication (email/password, Google OAuth)

**Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Authentication:
   - Click "Authentication" → "Get Started"
   - Enable "Email/Password" provider
   - Enable "Google" provider
4. Get configuration:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" → "Web app"
   - Copy the `firebaseConfig` values

### 3. Google Cloud Platform (Calendar API & OAuth)
**Purpose:** Google Calendar integration for appointments, OAuth authentication

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable APIs:
   - Search for "Google Calendar API" → Enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/google/callback`
     - `http://localhost:5000/auth/google/callback`
   - Copy the Client ID and Client Secret

### 4. Groq API (AI Medical Chatbot)
**Purpose:** AI-powered medical advice chatbot

**Setup:**
1. Go to [Groq Console](https://console.groq.com/)
2. Create an account (free tier available)
3. Navigate to API Keys
4. Create a new API key
5. Copy the API key

### 5. Digital Samba (Optional)
**Purpose:** Video consultation between doctors and patients

**Setup:**
1. Go to [Digital Samba](https://digitalsamba.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. **Note:** This is optional; video features won't work without it

## Installation Steps

### Step 1: Clone or Navigate to the Project

```bash
cd c:\Users\user\Desktop\Mediconnect
```

### Step 2: Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   - Copy `.env.example` to `.env`
   ```bash
   copy ..\.env.example .env
   ```

4. **Edit `.env` file and add your credentials:**
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_key_min_32_chars
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
   GROQ_API_KEY=your_groq_api_key
   PORT=5000
   ```

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to frontend folder:**
   ```bash
   cd c:\Users\user\Desktop\Mediconnect\frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   - Copy `.env.example` to `.env`
   ```bash
   copy .env.example .env
   ```

4. **Edit `.env` file and add your Firebase credentials:**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=http://localhost:5000
   ```

## Running the Application

### Start Backend Server

In the backend terminal:
```bash
cd c:\Users\user\Desktop\Mediconnect\backend
npm start
```

You should see:
```
✅ MongoDB connected: ...
Server listening on http://localhost:5000
```

### Start Frontend Development Server

In the frontend terminal:
```bash
cd c:\Users\user\Desktop\Mediconnect\frontend
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and navigate to: **http://localhost:5173/**

## Testing the Setup

1. **Homepage:** Should load without errors
2. **Register:** Try creating a new patient/doctor account
3. **Login:** Test authentication
4. **Dashboard:** Verify you can access the dashboard
5. **AI Chatbot:** Test the medical advice chatbot (requires Groq API key)

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
- **Solution:** Check your `MONGO_URI` is correct and MongoDB is running
- For Atlas, ensure your IP is whitelisted

### Issue: Firebase Authentication Not Working
- **Solution:** Verify all Firebase environment variables are correct
- Check Firebase Console that Email/Password and Google providers are enabled

### Issue: Port Already in Use
- **Solution:** Change the `PORT` in backend `.env` file or kill the process using that port

### Issue: CORS Errors
- **Solution:** Ensure backend `server.js` has the correct frontend URL in CORS config
- Default is `http://localhost:5173`

### Issue: Google Calendar Not Working
- **Solution:** 
  - Verify Google Calendar API is enabled
  - Check OAuth credentials and redirect URIs
  - Users must authorize Google Calendar access first

### Issue: AI Chatbot Not Responding
- **Solution:** 
  - Verify `GROQ_API_KEY` is set correctly
  - Check Groq API quota/limits
  - Review backend console for error messages

## Environment Variables Summary

### Backend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| MONGO_URI | ✅ Yes | MongoDB connection string |
| JWT_SECRET | ✅ Yes | Secret key for JWT tokens |
| PORT | No | Server port (default: 5000) |
| GOOGLE_CLIENT_ID | ✅ Yes | Google OAuth Client ID |
| GOOGLE_CLIENT_SECRET | ✅ Yes | Google OAuth Client Secret |
| GOOGLE_REDIRECT_URI | ✅ Yes | OAuth callback URL |
| GROQ_API_KEY | ✅ Yes | Groq AI API key |
| DIGITAL_SAMBA_API_KEY | No | Video conferencing API key |

### Frontend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| VITE_FIREBASE_API_KEY | ✅ Yes | Firebase API key |
| VITE_FIREBASE_AUTH_DOMAIN | ✅ Yes | Firebase auth domain |
| VITE_FIREBASE_PROJECT_ID | ✅ Yes | Firebase project ID |
| VITE_FIREBASE_STORAGE_BUCKET | ✅ Yes | Firebase storage bucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | ✅ Yes | Firebase messaging sender ID |
| VITE_FIREBASE_APP_ID | ✅ Yes | Firebase app ID |
| VITE_API_URL | ✅ Yes | Backend API URL |

## Next Steps

Once everything is running:

1. **Create Test Accounts:** Register both a patient and doctor account
2. **Complete Profiles:** Fill in profile information
3. **Test Features:**
   - Book appointments
   - Use the AI medical chatbot
   - Try VR/AR therapy modules
   - Test video consultations (if Digital Samba configured)

## Production Deployment

For deploying to production:

1. **Backend:** Deploy to services like Render, Railway, or Heroku
2. **Frontend:** Deploy to Vercel, Netlify, or similar
3. **Update Environment Variables:** Use production URLs and credentials
4. **Update CORS:** Add production frontend URL to backend CORS config
5. **Database:** Use MongoDB Atlas for production
6. **Security:** Ensure strong JWT_SECRET and enable HTTPS

## Support

If you encounter issues:
1. Check the console logs (browser and terminal)
2. Verify all environment variables are set correctly
3. Ensure all required services are running
4. Review the error messages carefully

---

**Happy Coding! 🚀**

*Mediconnect Team*
