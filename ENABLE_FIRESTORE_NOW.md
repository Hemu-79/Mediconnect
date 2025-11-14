# 🔥 FIRESTORE DATABASE NOT ENABLED - ACTION REQUIRED!

## ❌ Current Issue:
```
Cloud Firestore API has not been used in project mediconnectv1 
before or it is disabled.
```

## ✅ Solution: Enable Firestore Database

### Step 1: Go to Firebase Console
Open this link in your browser:
```
https://console.firebase.google.com/project/mediconnectv1/firestore
```

### Step 2: Enable Firestore Database
1. Click **"Create database"** button
2. Choose **Start mode:**
   - Select **"Start in test mode"** (for development)
   - Or **"Start in production mode"** (for production)
   
   **Recommended for development:** Test mode
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, 12, 31);
       }
     }
   }
   ```

3. Choose **Firestore location:**
   - Select closest region (e.g., `us-central1`, `asia-south1`, `europe-west1`)
   - **⚠️ WARNING:** Cannot be changed after selection!

4. Click **"Enable"** or **"Create"**

### Step 3: Wait for Initialization
- Takes 30-60 seconds to provision
- You'll see "Creating Firestore database..." message
- Once complete, you'll see the Firestore console

### Step 4: (Optional) Set Up Better Security Rules
If you want more secure rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Patients collection
    match /patients/{patientId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.firebaseUid;
      allow delete: if request.auth != null && request.auth.uid == resource.data.firebaseUid;
    }
    
    // Doctors collection
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.firebaseUid;
      allow delete: if request.auth != null && request.auth.uid == resource.data.firebaseUid;
    }
    
    // Appointments collection
    match /appointments/{appointmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Other collections (therapies, chats, doctor_availability)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 5: Enable Firebase Authentication (if not already done)
1. Go to: https://console.firebase.google.com/project/mediconnectv1/authentication
2. Click **"Get started"**
3. Enable **"Email/Password"** sign-in method:
   - Click on "Email/Password"
   - Toggle **Enable**
   - Toggle **Email link (passwordless sign-in)** if desired
   - Click **Save**

### Step 6: Verify Everything Works
After enabling Firestore, restart your backend server:

```powershell
# In the backend terminal, press Ctrl+C to stop
# Then restart:
npm start
```

Or just save any backend file (nodemon will auto-restart).

### Step 7: Test User Registration
1. Open: http://localhost:5173
2. Click "Register"
3. Fill in the form
4. Submit
5. Check Firestore console to see the new user document!

---

## 🔍 How to Check if Firestore is Enabled:

1. Go to: https://console.firebase.google.com/project/mediconnectv1/firestore
2. If you see the "Create database" button → **NOT enabled**
3. If you see collections/documents interface → **Enabled** ✅

---

## ⚡ Quick Links:

- **Enable Firestore:** https://console.firebase.google.com/project/mediconnectv1/firestore
- **Enable Authentication:** https://console.firebase.google.com/project/mediconnectv1/authentication
- **Project Settings:** https://console.firebase.google.com/project/mediconnectv1/settings/general

---

## 📝 After Enabling:

Once Firestore is enabled, users will be able to:
- ✅ Register accounts (patient/doctor)
- ✅ Login with credentials
- ✅ Create profiles
- ✅ Book appointments
- ✅ View data in Firestore console
- ✅ Use all app features

**The backend is already configured correctly - it just needs Firestore to be enabled!**
