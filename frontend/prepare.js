// This script prepares the frontend build by handling environment variables
const fs = require('fs');
const path = require('path');

console.log('Preparing frontend build...');

// Ensure frontend/.env exists and contains necessary variables
try {
  const envContent = `# Environment variables for frontend build
NEXT_PUBLIC_BACKEND_URL=${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}
NEXT_PUBLIC_SITE_URL=${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
NEXT_PUBLIC_FIREBASE_API_KEY=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}
NEXT_PUBLIC_FIREBASE_APP_ID=${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''}
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || ''}
NEXT_PUBLIC_ONCHAINKIT_API_KEY=${process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ''}
GOOGLE_API_KEY=${process.env.GOOGLE_API_KEY || ''}
`;

  fs.writeFileSync(path.join(__dirname, '.env.local'), envContent);
  console.log('Created .env.local file with variables from Vercel environment');
} catch (error) {
  console.error('Error creating .env.local file:', error);
}

console.log('Frontend build preparation complete');
