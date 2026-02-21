// Firebase Auth module - Email & Password
import './firebase-init.js'; // Must be first!
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';

const auth = getAuth();

/** Sign up with email & password */
export async function signUpWithEmail(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name
    await updateProfile(result.user, { displayName });
    return result.user;
}

/** Sign in with email & password */
export async function loginWithEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
}

/** Sign out */
export async function logout() {
    await signOut(auth);
}

/** Listen to auth state changes */
export function onAuthChange(callback) {
    onAuthStateChanged(auth, callback);
}

export { auth };
