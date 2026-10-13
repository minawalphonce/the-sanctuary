import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

let firebaseConfig: object;
try {
    const response = await fetch("/__/firebase/init.json");
    // Serve the auth handler (/__/auth/handler) from the same host the app
    // runs on, so the sign-in redirect never leaves the app's origin. This
    // avoids "missing initial state" in the iOS home-screen app, whose
    // storage is partitioned from other sites.
    firebaseConfig = { ...(await response.json()), authDomain: window.location.host };
} catch {
    firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/spreadsheets");
// Force the account chooser on every sign-in instead of silently reusing
// whichever Google account is "active" — important for users signed into
// multiple Google accounts in the same browser.
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function uploadMemberPhoto(memberId: string, file: File): Promise<string> {
    const photoRef = ref(storage, `member-photos/${memberId}`);
    await uploadBytes(photoRef, file);
    return getDownloadURL(photoRef);
}
