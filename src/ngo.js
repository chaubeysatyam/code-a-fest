// NGO module - Registration, approval, Firestore CRUD
import './firebase-init.js';
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    updateDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';

const db = getFirestore();
const NGOS_COL = 'ngos';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/** Upload NGO image to Cloudinary */
export async function uploadNgoImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'ngos');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Image upload failed');
    }
    const data = await res.json();
    return data.secure_url;
}

/** Submit NGO registration (status: pending) */
export async function registerNgo({
    name, description, registrationNumber, foundedYear, category,
    contactEmail, contactPhone, website, address, imageUrl, user,
}) {
    const docRef = await addDoc(collection(db, NGOS_COL), {
        name,
        description,
        registrationNumber,
        foundedYear,
        category,
        contactEmail,
        contactPhone,
        website,
        address,
        imageUrl,
        status: 'pending', // pending | approved | declined
        userId: user.uid,
        submittedBy: user.displayName || user.email || 'Unknown',
        createdAt: serverTimestamp(),
        reviewedAt: null,
        adminNote: '',
    });
    return docRef.id;
}

/** Listen to approved NGOs (for public display) */
export function listenToApprovedNgos(callback) {
    const q = query(
        collection(db, NGOS_COL),
        where('status', '==', 'approved')
    );
    return onSnapshot(q, (snapshot) => {
        const ngos = [];
        snapshot.forEach((d) => ngos.push({ id: d.id, ...d.data() }));
        // Sort client-side to avoid composite index requirement
        ngos.sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() || 0;
            const tb = b.createdAt?.toMillis?.() || 0;
            return tb - ta;
        });
        callback(ngos);
    });
}

/** Listen to all NGOs (for admin panel) */
export function listenToAllNgos(callback) {
    const q = query(collection(db, NGOS_COL));
    return onSnapshot(q, (snapshot) => {
        const ngos = [];
        snapshot.forEach((d) => ngos.push({ id: d.id, ...d.data() }));
        ngos.sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() || 0;
            const tb = b.createdAt?.toMillis?.() || 0;
            return tb - ta;
        });
        callback(ngos);
    });
}

/** Admin: Approve an NGO */
export async function approveNgo(ngoId) {
    await updateDoc(doc(db, NGOS_COL, ngoId), {
        status: 'approved',
        reviewedAt: serverTimestamp(),
    });
}

/** Admin: Decline an NGO */
export async function declineNgo(ngoId, reason = '') {
    await updateDoc(doc(db, NGOS_COL, ngoId), {
        status: 'declined',
        adminNote: reason,
        reviewedAt: serverTimestamp(),
    });
}

/** Format timestamp */
export function formatNgoTime(timestamp) {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
