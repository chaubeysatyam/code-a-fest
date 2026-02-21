<p align="center">
  <img src="https://img.shields.io/badge/SathiAI-Disaster%20Resilience-red?style=for-the-badge&logo=firebase&logoColor=white" />
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Android-blue?style=for-the-badge" />
</p>

# 🚨 SathiAI — AI-Powered Disaster Resilience Platform

> **Real-time crowd-sourced disaster reporting, emergency SOS alerts, AI-powered news verification, and NGO coordination — all in one platform.**

🔗 **Live:** [https://sathiai.web.app](https://sathiai.web.app)

---

## 📋 Problem Statement

During natural disasters, affected communities face critical delays in receiving alerts, reporting incidents, and accessing verified information. Official data sources like NDMA aren't easily accessible, misinformation spreads rapidly, and there's no unified platform for real-time disaster reporting, emergency SOS, and NGO coordination. **This information gap costs lives.**

## 💡 Solution

SathiAI bridges this gap with a comprehensive AI-powered disaster resilience platform combining crowd-sourced reporting, official government data, and intelligent automation.

---

## ✨ Features

### 🗺️ Interactive Disaster Map
- Real-time Google Maps visualization of all disasters and emergencies
- Auto-fetches NDMA earthquake data with marker clustering
- Color-coded markers by type (earthquake, flood, fire, cyclone, etc.)
- Click markers for full details with info windows

### 🆘 One-Tap SOS Emergency
- **Single button press** sends emergency alert instantly
- Auto-captures GPS location with reverse geocoding
- Auto-fills user name and emergency message
- Appears in the emergency feed within seconds

### 📢 Disaster & Emergency Reporting
- Crowd-sourced disaster reports with image uploads (via Cloudinary)
- Emergency reports with auto/manual location detection
- Real-time Firestore-powered live feed with breaking news banner
- Image preview, type categorization, and timestamp tracking

### 🤖 AI-Powered Features
- **News Verification:** Gemini AI analyzes news articles for authenticity, detects misinformation with confidence scoring
- **Resilience Chatbot:** AI assistant provides real-time disaster guidance, safety tips, and emergency procedures

### 🔔 Push Notifications (FCM)
- Firebase Cloud Messaging for instant push alerts
- Auto-notifications when new disasters/emergencies are added to Firestore
- Admin panel for manual broadcast notifications
- Topic-based messaging to all subscribed users

### 🏢 NGO Directory
- Verified NGO registration and listing
- Admin approval workflow
- Contact details, coverage areas, and service descriptions

### 💰 Donation System
- Direct financial support for disaster relief
- Receipt generation and download

### 📱 Android APK
- Native Android wrapper via WebView
- FCM push notification support
- Notification permission handling for Android 13+
- Geolocation and camera access

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, JavaScript (ES Modules), Tailwind CSS v4, Vite |
| **Backend** | Firebase (Firestore, Auth, Hosting), Node.js + Express |
| **AI** | Google Gemini AI (news verification + chatbot) |
| **Maps** | Google Maps JavaScript API |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **Images** | Cloudinary CDN |
| **Geocoding** | Nominatim (OpenStreetMap) |
| **Mobile** | Android (Java, WebView, Firebase Messaging SDK) |
| **PWA** | Service Worker, Web App Manifest |
| **Data Source** | NDMA CAP Feed (earthquakes) |

---

## 📁 Project Structure

```
sathiai/
├── index.html                 # Main app HTML
├── admin.html                 # Admin panel HTML
├── vite.config.js             # Vite + Tailwind v4 config
├── package.json               # Dependencies
├── firebase.json              # Firebase hosting config
├── firestore.rules            # Firestore security rules
├── src/
│   ├── main.js                # App orchestration & event handling
│   ├── style.css              # Tailwind imports + custom CSS
│   ├── firebase-init.js       # Firebase initialization
│   ├── auth.js                # Email/password authentication
│   ├── disaster.js            # Disaster CRUD + NDMA fetch
│   ├── emergency.js           # Emergency CRUD + geocoding
│   ├── ngo.js                 # NGO registration & listing
│   ├── news.js                # News verification with AI
│   ├── chatbot.js             # Gemini AI chatbot
│   └── admin.js               # Admin panel logic
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── icon-192.svg           # App icon 192x192
│   └── icon-512.svg           # App icon 512x512
├── server/
│   ├── server.js              # Express + FCM notification server
│   ├── package.json           # Server dependencies
│   └── public/
│       └── admin.html         # Notification admin dashboard
└── APK/
    ├── build.gradle.kts       # Project-level Gradle
    ├── gradle/
    │   └── libs.versions.toml # Version catalog
    └── app/
        ├── build.gradle.kts   # App-level Gradle (SDK 36)
        └── src/main/
            ├── AndroidManifest.xml
            ├── java/com/mobo/sathiai/
            │   ├── MainActivity.java
            │   └── MyFirebaseMessagingService.java
            └── res/
                ├── layout/activity_main.xml
                ├── drawable/progress_bar.xml
                └── values/colors.xml
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Auth, and FCM enabled
- Google Maps API key
- Cloudinary account

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/sathiai.git
cd sathiai
npm install
```

### 2. Configure Firebase

Create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
VITE_GEMINI_API_KEY=your_gemini_key
VITE_ADMIN_PASSWORD=your_admin_password
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build & Deploy

```bash
npm run build
firebase deploy --only hosting
```

### 5. Notification Server (Optional)

```bash
cd server
npm install
# Add your Firebase service account key
node server.js
```

The notification admin dashboard opens at [http://localhost:3000](http://localhost:3000)

### 6. Android APK (Optional)

1. Open the `APK/` folder in Android Studio
2. Add your `google-services.json` to `APK/app/`
3. Build and run on device/emulator

---

## 📸 Screenshots

| Feature | Description |
|---------|-------------|
| 🗺️ **Live Map** | Interactive Google Maps with disaster markers |
| 🆘 **SOS Button** | One-tap emergency with auto-location |
| 📊 **Dashboard** | Real-time disaster & emergency feeds |
| 🤖 **AI Chatbot** | Gemini-powered disaster guidance |
| 📰 **News Verify** | AI misinformation detection |
| 🔔 **Notifications** | FCM push alerts admin panel |

---

## 🔐 Security

- Firebase Authentication (email/password)
- Firestore security rules for data access control
- Admin panel protected with password
- Service account keys excluded from repository

---

## 👥 Team

Built with ❤️ for disaster resilience.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
