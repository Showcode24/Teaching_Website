import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Accessing the Vapid Key from environment variables
const vapidKey = import.meta.env.VITE_FIREBASE_KEY_PAIR; 

// Using the Vapid Key for token generation
getToken(messaging, { vapidKey: vapidKey })
  .then((currentToken) => {
    if (currentToken) {
      console.log("Got FCM token:", currentToken);
    } else {
      console.log("No token available. Request permission to generate one.");
    }
  })
  .catch((err) => {
    console.error("An error occurred while retrieving the token:", err);
  });

console.log("Firebase initialized successfully!");
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
