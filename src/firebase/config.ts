/**
 * Firebase configuration object.
 * Uses environment variables for security and flexibility.
 * Mock values are provided as fallbacks to prevent "invalid-api-key" errors during SSR/Build.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSy-Mock-Key-For-Prototyping",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "impact-vision.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "impact-vision",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "impact-vision.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:impactvisionapp",
};
