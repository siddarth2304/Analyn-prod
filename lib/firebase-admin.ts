// File: lib/firebase-admin.ts
console.log("FIREBASE_ADMIN_CONFIG:", process.env.FIREBASE_ADMIN_CONFIG ? "Loaded" : "!!! UNDEFINED !!!");
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_ADMIN_CONFIG as string
  );
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();