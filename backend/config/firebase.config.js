const admin = require('firebase-admin');

// Initialize Firebase Admin
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin already initialized');
      return admin.app();
    }

    // Check if Firebase credentials are provided
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.warn('⚠️  Firebase credentials not configured!');
      console.warn('📝 Please set up Firebase Admin SDK credentials in backend/.env');
      console.warn('📖 See FIREBASE_MIGRATION_GUIDE.md for setup instructions');
      console.warn('🔧 The backend will start but database operations will fail until configured');
      return null;
    }

    // Initialize with service account credentials
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });

    console.log('✅ Firebase Admin initialized successfully');
    console.log(`🔥 Firestore connected for project: ${process.env.FIREBASE_PROJECT_ID}`);
    return admin.app();
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.error('📖 Please check your Firebase credentials in backend/.env');
    console.error('📚 See FIREBASE_MIGRATION_GUIDE.md for setup instructions');
    // Don't throw - allow server to start but operations will fail
    return null;
  }
};

// Get Firestore instance
const getFirestore = () => {
  if (admin.apps.length === 0) {
    const app = initializeFirebase();
    if (!app) {
      throw new Error('Firebase not initialized. Please configure Firebase credentials in backend/.env');
    }
  }
  return admin.firestore();
};

// Get Auth instance
const getAuth = () => {
  if (admin.apps.length === 0) {
    const app = initializeFirebase();
    if (!app) {
      throw new Error('Firebase not initialized. Please configure Firebase credentials in backend/.env');
    }
  }
  return admin.auth();
};

// Collection names
const COLLECTIONS = {
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  APPOINTMENTS: 'appointments',
  THERAPIES: 'therapies',
  DOCTOR_AVAILABILITY: 'doctor_availability',
  CHATS: 'chats'
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  admin,
  COLLECTIONS
};
