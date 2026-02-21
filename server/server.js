const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../sathiai-firebase-adminsdk-fbsvc-c26103c371.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'sathiai'
});

const db = admin.firestore();
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ ADMIN PAGE ============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============ SEND NOTIFICATION TO ALL USERS ============
app.post('/api/send-notification', async (req, res) => {
    try {
        const { title, body, type } = req.body;
        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        const message = {
            topic: 'all_users',
            data: {
                title: title,
                body: body,
                type: type || 'general'
            },
            android: {
                priority: 'high',
                notification: {
                    title: title,
                    body: body,
                    color: type === 'disaster' ? '#EF4444' : type === 'emergency' ? '#3B82F6' : '#8B5CF6',
                    sound: 'default',
                    channelId: 'sathiai_alerts'
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log('Notification sent:', response);

        // Save to Firestore
        await db.collection('notifications').add({
            title, body, type: type || 'general',
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            messageId: response
        });

        res.json({ success: true, messageId: response });
    } catch (err) {
        console.error('Send error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ GET NOTIFICATION HISTORY ============
app.get('/api/notifications', async (req, res) => {
    try {
        const snap = await db.collection('notifications')
            .orderBy('sentAt', 'desc').limit(50).get();
        const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ LISTEN FOR NEW DISASTERS & EMERGENCIES ============
let disasterListener = null;
let emergencyListener = null;

function startFirestoreListeners() {
    // Listen for new disasters
    disasterListener = db.collection('disasters')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .onSnapshot(async (snap) => {
            snap.docChanges().forEach(async (change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    // Skip if already notified
                    if (data._notified) return;

                    const title = `⚠️ New Disaster: ${data.title || data.type || 'Unknown'}`;
                    const body = `${data.description || ''}\n📍 ${data.address || 'Unknown location'}`;

                    try {
                        await admin.messaging().send({
                            topic: 'all_users',
                            data: { title, body, type: 'disaster' },
                            android: {
                                priority: 'high',
                                notification: {
                                    title, body,
                                    color: '#EF4444',
                                    sound: 'default',
                                    channelId: 'sathiai_alerts'
                                }
                            }
                        });

                        // Mark as notified
                        await change.doc.ref.update({ _notified: true });
                        console.log('Auto-notified disaster:', data.title || data.type);
                    } catch (err) {
                        console.error('Auto-notify disaster error:', err);
                    }
                }
            });
        });

    // Listen for new emergencies
    emergencyListener = db.collection('emergencies')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .onSnapshot(async (snap) => {
            snap.docChanges().forEach(async (change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    if (data._notified) return;

                    const title = `🚨 Emergency: ${data.title || data.type || 'Unknown'}`;
                    const body = `${data.description || ''}\n📍 ${data.address || 'Unknown location'}`;

                    try {
                        await admin.messaging().send({
                            topic: 'all_users',
                            data: { title, body, type: 'emergency' },
                            android: {
                                priority: 'high',
                                notification: {
                                    title, body,
                                    color: '#3B82F6',
                                    sound: 'default',
                                    channelId: 'sathiai_alerts'
                                }
                            }
                        });

                        await change.doc.ref.update({ _notified: true });
                        console.log('Auto-notified emergency:', data.title || data.type);
                    } catch (err) {
                        console.error('Auto-notify emergency error:', err);
                    }
                }
            });
        });

    console.log('Firestore listeners active — auto-notifications enabled');
}

// ============ START SERVER ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n  SathiAI Notification Server running on http://localhost:${PORT}\n`);
    startFirestoreListeners();
});
