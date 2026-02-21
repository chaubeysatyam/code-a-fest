// Disaster reporting module - Cloudinary upload, Firestore CRUD, geolocation
import './firebase-init.js'; // Must be first!
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    onSnapshot,
    limit,
    serverTimestamp,
} from 'firebase/firestore';

const db = getFirestore();
const DISASTERS_COL = 'disasters';

// Cloudinary config from env
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload image to Cloudinary (unsigned upload - no server needed)
 * Returns the secure URL of the uploaded image
 */
export async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'disasters');

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

/**
 * Get user's current location
 * Returns { lat, lng, address }
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Try reverse geocoding for a readable address
                let address = '';
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
                        {
                            headers: {
                                'Accept-Language': 'en',
                                'User-Agent': 'SathiAI-DisasterApp/1.0',
                            },
                        }
                    );
                    const data = await res.json();
                    if (data.display_name) {
                        address = data.display_name;
                    }
                } catch {
                    // Geocoding failed, will use coordinate fallback
                }

                // Fallback to coordinates if geocoding failed
                if (!address) {
                    address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
                }

                resolve({ lat, lng, address });
            },
            (error) => {
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    });
}

/**
 * Save disaster report to Firestore
 */
export async function saveDisaster({ title, description, type, imageUrl, lat, lng, address, user, source, magnitude, depth }) {
    const data = {
        title,
        description,
        type,
        imageUrl,
        lat,
        lng,
        address,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        createdAt: serverTimestamp(),
    };
    if (source) data.source = source;
    if (magnitude) data.magnitude = magnitude;
    if (depth) data.depth = depth;
    const docRef = await addDoc(collection(db, DISASTERS_COL), data);
    return docRef.id;
}

/**
 * Check if an NDMA earthquake already exists (by source + title match)
 */
export async function checkNdmaDuplicate(title) {
    const q = query(
        collection(db, DISASTERS_COL),
        where('source', '==', 'NDMA'),
        where('title', '==', title),
        limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
}

/**
 * Listen to disaster feed in real-time (newest first)
 * callback receives array of disaster objects
 */
export function listenToDisasters(callback) {
    const q = query(
        collection(db, DISASTERS_COL),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const disasters = [];
        snapshot.forEach((doc) => {
            disasters.push({ id: doc.id, ...doc.data() });
        });
        callback(disasters);
    });
}

/**
 * Listen to only the latest disaster for breaking news
 */
export function listenToLatestDisaster(callback) {
    const q = query(
        collection(db, DISASTERS_COL),
        orderBy('createdAt', 'desc'),
        limit(1)
    );

    return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            callback({ id: doc.id, ...doc.data() });
        } else {
            callback(null);
        }
    });
}

/**
 * Format Firestore timestamp to readable string
 */
export function formatTime(timestamp) {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
