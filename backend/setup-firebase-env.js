/**
 * Helper script to convert Firebase Service Account JSON to .env format
 * 
 * Usage:
 * 1. Download your service account JSON from Firebase Console:
 *    Project Settings > Service Accounts > Generate New Private Key
 * 2. Save it as 'serviceAccount.json' in the backend folder
 * 3. Run: node setup-firebase-env.js
 * 4. This will show you the correct values to put in your .env file
 */

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'serviceAccount.json');

if (!fs.existsSync(jsonPath)) {
  console.error('❌ Error: serviceAccount.json not found!');
  console.log('\n📋 Please follow these steps:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select your project (mediconnectv1)');
  console.log('3. Click the gear icon > Project Settings');
  console.log('4. Go to "Service Accounts" tab');
  console.log('5. Click "Generate New Private Key"');
  console.log('6. Save the downloaded file as "serviceAccount.json" in the backend folder');
  console.log('7. Run this script again: node setup-firebase-env.js');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  console.log('✅ Service account JSON file found!\n');
  console.log('📝 Copy these values to your backend/.env file:\n');
  console.log('----------------------------------------');
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}`);
  console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  console.log(`FIREBASE_CLIENT_ID=${serviceAccount.client_id}`);
  console.log(`FIREBASE_CLIENT_CERT_URL=${serviceAccount.client_x509_cert_url}`);
  console.log('----------------------------------------\n');
  
  console.log('✅ Done! Copy the values above to your .env file.');
  console.log('⚠️  Important: Keep the quotes around FIREBASE_PRIVATE_KEY');
  console.log('🔒 Security: Delete serviceAccount.json after copying (never commit it to git)');
  
} catch (error) {
  console.error('❌ Error reading service account JSON:', error.message);
  console.log('\n📋 Make sure the serviceAccount.json file is valid JSON format.');
  process.exit(1);
}
