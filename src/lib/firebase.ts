import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

export async function loginWithGoogle() {
  const auth = getAuth(getFirebaseApp());
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const { user } = await signInWithPopup(auth, provider);
  const firebaseToken = await user.getIdToken();
  return {
    firebaseToken,
    email: user.email ?? "",
    nombre: user.displayName ?? "",
    foto_url: user.photoURL ?? "",
  };
}
