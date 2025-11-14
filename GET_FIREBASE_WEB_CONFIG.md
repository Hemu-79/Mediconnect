# Get Your Firebase Web Configuration

## Quick Steps to Complete Frontend Setup:

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project: **mediconnectv1**

2. **Navigate to Project Settings:**
   - Click the **⚙️ gear icon** (Settings)
   - Select **Project Settings**

3. **Scroll to "Your apps" section:**
   - If you don't see a web app, click **"Add app"** → Select **Web (</> icon)**
   - Give it a nickname: "Mediconnect Web"
   - Check "Also set up Firebase Hosting" (optional)
   - Click **"Register app"**

4. **Copy the Firebase Config:**
   You'll see something like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "mediconnectv1.firebaseapp.com",
     projectId: "mediconnectv1",
     storageBucket: "mediconnectv1.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```

5. **Update `frontend/.env` file:**
   Replace these values:
   ```env
   VITE_FIREBASE_API_KEY=<your apiKey>
   VITE_FIREBASE_AUTH_DOMAIN=<your authDomain>
   VITE_FIREBASE_PROJECT_ID=<your projectId>
   VITE_FIREBASE_STORAGE_BUCKET=<your storageBucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your messagingSenderId>
   VITE_FIREBASE_APP_ID=<your appId>
   ```

6. **The frontend server will auto-restart** after you save the .env file

---

## Current Status:

✅ **Backend:** Fully configured with Firebase Admin SDK (running on port 5000)
⚠️ **Frontend:** Needs actual Firebase Web App config (placeholder values currently)

Once you update the frontend .env with real values, both authentication and database operations will work perfectly!
