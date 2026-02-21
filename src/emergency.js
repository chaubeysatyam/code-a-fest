// Emergency reporting module - Cloudinary upload, Firestore CRUD, location
import './firebase-init.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    limit,
    serverTimestamp,
} from 'firebase/firestore';

const db = getFirestore();
const EMERGENCIES_COL = 'emergencies';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/** Upload image to Cloudinary */
export async function uploadEmergencyImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'emergencies');

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

/** Reverse geocode lat/lng to address */
export async function reverseGeocode(lat, lng) {
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
        return data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    } catch {
        return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
}

/** Forward geocode: search text → lat/lng/address */
export async function forwardGeocode(searchText) {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`,
        {
            headers: {
                'Accept-Language': 'en',
                'User-Agent': 'SathiAI-DisasterApp/1.0',
            },
        }
    );
    const data = await res.json();
    if (data.length > 0) {
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            address: data[0].display_name,
        };
    }
    throw new Error('Location not found');
}

/** Get user's current location */
export function getEmergencyLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const address = await reverseGeocode(lat, lng);
                resolve({ lat, lng, address });
            },
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    });
}

/** Save emergency to Firestore */
export async function saveEmergency({ title, description, type, imageUrl, lat, lng, address, user }) {
    const docRef = await addDoc(collection(db, EMERGENCIES_COL), {
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
    });
    return docRef.id;
}

/** Listen to emergency feed in real-time */
export function listenToEmergencies(callback) {
    const q = query(
        collection(db, EMERGENCIES_COL),
        orderBy('createdAt', 'desc'),
        limit(50)
    );
    return onSnapshot(q, (snapshot) => {
        const emergencies = [];
        snapshot.forEach((doc) => {
            emergencies.push({ id: doc.id, ...doc.data() });
        });
        callback(emergencies);
    });
}

/** Format timestamp */
export function formatEmergencyTime(timestamp) {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
