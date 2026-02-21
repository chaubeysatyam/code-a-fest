// Main entry point - App orchestration
import './style.css';
import './firebase-init.js';
import { loginWithEmail, signUpWithEmail, logout, onAuthChange } from './auth.js';
import {
    uploadImageToCloudinary,
    getCurrentLocation,
    saveDisaster,
    checkNdmaDuplicate,
    listenToDisasters,
    listenToLatestDisaster,
    formatTime,
} from './disaster.js';
import {
    uploadEmergencyImage,
    getEmergencyLocation,
    forwardGeocode,
    reverseGeocode,
    saveEmergency,
    listenToEmergencies,
    formatEmergencyTime,
} from './emergency.js';
import {
    uploadNgoImage,
    registerNgo,
    listenToApprovedNgos,
    formatNgoTime,
} from './ngo.js';
import { initChatbot } from './chatbot.js';
import {
    verifyNewsWithAI,
    saveNews,
    listenToNews,
    formatNewsTime,
} from './news.js';

// ---------- DOM Elements ----------
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const btnLogout = document.getElementById('btn-logout');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

// Auth form
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authName = document.getElementById('auth-name');
const nameField = document.getElementById('name-field');
const btnAuthSubmit = document.getElementById('btn-auth-submit');
const authBtnText = document.getElementById('auth-btn-text');
const authSpinner = document.getElementById('auth-spinner');
const authError = document.getElementById('auth-error');
const btnAuthToggle = document.getElementById('btn-auth-toggle');
const authToggleText = document.getElementById('auth-toggle-text');

// Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Disaster form
const btnOpenReport = document.getElementById('btn-open-report');
const reportModal = document.getElementById('report-modal');
const modalOverlay = document.getElementById('modal-overlay');
const btnCloseModal = document.getElementById('btn-close-modal');
const disasterForm = document.getElementById('disaster-form');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const locationStatus = document.getElementById('location-status');
const locationText = document.getElementById('location-text');
const locationLat = document.getElementById('location-lat');
const locationLng = document.getElementById('location-lng');
const submitText = document.getElementById('submit-text');
const submitSpinner = document.getElementById('submit-spinner');
const btnSubmit = document.getElementById('btn-submit-disaster');

// Emergency form
const btnOpenEmergency = document.getElementById('btn-open-emergency');
const emergencyModal = document.getElementById('emergency-modal');
const emergencyModalOverlay = document.getElementById('emergency-modal-overlay');
const btnCloseEmergencyModal = document.getElementById('btn-close-emergency-modal');
const emergencyForm = document.getElementById('emergency-form');
const emergencyImageInput = document.getElementById('emergency-image-input');
const emergencyImagePreview = document.getElementById('emergency-image-preview');
const emergencyUploadPlaceholder = document.getElementById('emergency-upload-placeholder');
const btnEmergencyAutoLoc = document.getElementById('btn-emergency-auto-loc');
const btnEmergencyTypeLoc = document.getElementById('btn-emergency-type-loc');
const emergencyLocAuto = document.getElementById('emergency-loc-auto');
const emergencyLocType = document.getElementById('emergency-loc-type');
const emergencyLocStatus = document.getElementById('emergency-loc-status');
const emergencyLocResult = document.getElementById('emergency-loc-result');
const emergencyLocSearch = document.getElementById('emergency-loc-search');
const btnEmergencySearchLoc = document.getElementById('btn-emergency-search-loc');
const emergencySearchResult = document.getElementById('emergency-search-result');
const emergencySearchError = document.getElementById('emergency-search-error');
const emergencyLat = document.getElementById('emergency-lat');
const emergencyLng = document.getElementById('emergency-lng');
const emergencySubmitText = document.getElementById('emergency-submit-text');
const emergencySubmitSpinner = document.getElementById('emergency-submit-spinner');
const btnSubmitEmergency = document.getElementById('btn-submit-emergency');

// Breaking news
const breakingNews = document.getElementById('breaking-news');
const breakingText = document.getElementById('breaking-text');

// Feeds
const disasterFeed = document.getElementById('disaster-feed');
const emergencyFeed = document.getElementById('emergency-feed');

// NGO form
const btnOpenNgo = document.getElementById('btn-open-ngo');
const ngoModal = document.getElementById('ngo-modal');
const ngoModalOverlay = document.getElementById('ngo-modal-overlay');
const btnCloseNgoModal = document.getElementById('btn-close-ngo-modal');
const ngoForm = document.getElementById('ngo-form');
const ngoImageInput = document.getElementById('ngo-image-input');
const ngoImagePreview = document.getElementById('ngo-image-preview');
const ngoUploadPlaceholder = document.getElementById('ngo-upload-placeholder');
const ngoSubmitText = document.getElementById('ngo-submit-text');
const ngoSubmitSpinner = document.getElementById('ngo-submit-spinner');
const btnSubmitNgo = document.getElementById('btn-submit-ngo');
const ngoFeed = document.getElementById('ngo-feed');

// News form
const btnOpenNews = document.getElementById('btn-open-news');
const newsModal = document.getElementById('news-modal');
const newsModalOverlay = document.getElementById('news-modal-overlay');
const btnCloseNewsModal = document.getElementById('btn-close-news-modal');
const newsForm = document.getElementById('news-form');
const newsSubmitText = document.getElementById('news-submit-text');
const newsSubmitSpinner = document.getElementById('news-submit-spinner');
const btnSubmitNews = document.getElementById('btn-submit-news');
const newsFeed = document.getElementById('news-feed');
const newsAiStatus = document.getElementById('news-ai-status');
const newsAiVerifying = document.getElementById('news-ai-verifying');
const newsAiResult = document.getElementById('news-ai-result');

// ---------- State ----------
let currentUser = null;
let selectedFile = null;
let userLocation = null;
let emergencySelectedFile = null;
let emergencyLocation = null;
let ngoSelectedFile = null;
let unsubDisasterFeed = null;
let unsubEmergencyFeed = null;
let unsubNgoFeed = null;
let unsubNewsFeed = null;
let unsubBreaking = null;
let isSignUpMode = false;
let activeTab = 'disaster';
let latestDisaster = null;
let latestEmergency = null;
let allDisasters = [];
let allEmergencies = [];
let ndmaEarthquakes = [];

let deferredInstallPrompt = null;
const btnPwaInstall = document.getElementById('btn-pwa-install');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    btnPwaInstall.classList.remove('hidden');
    btnPwaInstall.classList.add('flex');
});

btnPwaInstall.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
        btnPwaInstall.classList.add('hidden');
        btnPwaInstall.classList.remove('flex');
    }
    deferredInstallPrompt = null;
});

window.addEventListener('appinstalled', () => {
    btnPwaInstall.classList.add('hidden');
    btnPwaInstall.classList.remove('flex');
    deferredInstallPrompt = null;
});

// ---------- SOS Quick Emergency ----------
const btnSos = document.getElementById('btn-sos');
if (btnSos) {
    btnSos.addEventListener('click', async () => {
        if (!currentUser) {
            showToast('Please login first', 'error');
            return;
        }
        btnSos.disabled = true;
        btnSos.classList.remove('animate-pulse');
        btnSos.innerHTML = '<i class="fas fa-spinner fa-spin text-[10px]"></i> Sending...';
        showToast('Getting your location...', 'info');
        try {
            const loc = await getEmergencyLocation();
            const uName = currentUser.displayName || 'Anonymous User';
            await saveEmergency({
                title: 'SOS Emergency!',
                description: `HELP! I am in an emergency! My name is ${uName}. Location: ${loc.address}. Please send help immediately!`,
                type: 'sos',
                imageUrl: '',
                lat: loc.lat,
                lng: loc.lng,
                address: loc.address,
                user: currentUser,
            });
            showToast('SOS sent! Help is on the way!', 'success');
        } catch (err) {
            console.error('SOS error:', err);
            showToast('SOS failed: ' + (err.message || 'Unknown error'), 'error');
        }
        btnSos.disabled = false;
        btnSos.innerHTML = '<i class="fas fa-exclamation-triangle text-[10px]"></i> SOS';
        btnSos.classList.add('animate-pulse');
    });
}

// ---------- Auth ----------
btnAuthSubmit.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const name = authName.value.trim();

    if (!email || !password) {
        showAuthError('Please enter email and password');
        return;
    }
    if (isSignUpMode && !name) {
        showAuthError('Please enter your name');
        return;
    }

    btnAuthSubmit.disabled = true;
    authBtnText.textContent = isSignUpMode ? 'Creating account...' : 'Signing in...';
    authSpinner.classList.remove('hidden');
    hideAuthError();

    try {
        if (isSignUpMode) {
            await signUpWithEmail(email, password, name);
        } else {
            await loginWithEmail(email, password);
        }
    } catch (err) {
        let msg = 'Authentication failed';
        if (err.code === 'auth/user-not-found') msg = 'No account found. Sign up first!';
        else if (err.code === 'auth/wrong-password') msg = 'Incorrect password';
        else if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password';
        else if (err.code === 'auth/email-already-in-use') msg = 'Email already registered. Sign in!';
        else if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters';
        else if (err.code === 'auth/invalid-email') msg = 'Invalid email address';
        showAuthError(msg);
    } finally {
        btnAuthSubmit.disabled = false;
        authBtnText.textContent = isSignUpMode ? 'Sign Up' : 'Sign In';
        authSpinner.classList.add('hidden');
    }
});

btnAuthToggle.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    if (isSignUpMode) {
        nameField.classList.remove('hidden');
        authBtnText.textContent = 'Sign Up';
        authToggleText.textContent = 'Already have an account?';
        btnAuthToggle.textContent = 'Sign In';
    } else {
        nameField.classList.add('hidden');
        authBtnText.textContent = 'Sign In';
        authToggleText.textContent = "Don't have an account?";
        btnAuthToggle.textContent = 'Sign Up';
    }
    hideAuthError();
});

function showAuthError(msg) {
    authError.textContent = msg;
    authError.classList.remove('hidden');
}
function hideAuthError() {
    authError.classList.add('hidden');
}

authPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnAuthSubmit.click();
});

btnLogout.addEventListener('click', async () => {
    await logout();
});

onAuthChange((user) => {
    currentUser = user;
    if (user) {
        loginScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=ef4444&color=fff`;
        userName.textContent = user.displayName || user.email || 'User';
        startListeners();
        fetchNDMAEarthquakes();
    } else {
        loginScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
        if (unsubDisasterFeed) unsubDisasterFeed();
        if (unsubEmergencyFeed) unsubEmergencyFeed();
        if (unsubNgoFeed) unsubNgoFeed();
        if (unsubNewsFeed) unsubNewsFeed();
        if (unsubBreaking) unsubBreaking();
    }
});

// ---------- Tabs ----------
tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        activeTab = targetTab;
        localStorage.setItem('activeTab', targetTab);

        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        tabContents.forEach((tc) => tc.classList.add('hidden'));
        document.getElementById(`tab-${targetTab}`).classList.remove('hidden');

        // Update breaking news for active tab
        updateBreakingNews();
    });
});

// Restore saved tab on load
const savedTab = localStorage.getItem('activeTab');
if (savedTab) {
    const savedBtn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
    if (savedBtn) savedBtn.click();
}

// =========================================
// DISASTER SECTION
// =========================================
btnOpenReport.addEventListener('click', () => {
    reportModal.classList.remove('hidden');
    detectLocation();
});
btnCloseModal.addEventListener('click', closeDisasterModal);
modalOverlay.addEventListener('click', closeDisasterModal);

function closeDisasterModal() {
    reportModal.classList.add('hidden');
    resetDisasterForm();
}

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
        imagePreview.src = ev.target.result;
        imagePreview.classList.remove('hidden');
        uploadPlaceholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
});

async function detectLocation() {
    locationStatus.classList.remove('hidden');
    locationText.classList.add('hidden');
    try {
        const loc = await getCurrentLocation();
        userLocation = loc;
        locationLat.value = loc.lat;
        locationLng.value = loc.lng;
        locationStatus.classList.add('hidden');
        locationText.classList.remove('hidden');
        locationText.textContent = `${loc.address}`;
    } catch {
        locationStatus.innerHTML = `<span class="text-yellow-400"><i class="fas fa-exclamation-triangle mr-1"></i> Could not detect location. Please enable GPS.</span>`;
    }
}

disasterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('disaster-title').value.trim();
    const description = document.getElementById('disaster-desc').value.trim();
    const type = document.getElementById('disaster-type').value;

    if (!title || !description || !type) { showToast('Please fill all fields', 'error'); return; }
    if (!selectedFile) { showToast('Please upload an image', 'error'); return; }

    btnSubmit.disabled = true;
    submitText.textContent = 'Uploading image...';
    submitSpinner.classList.remove('hidden');

    try {
        const imageUrl = await uploadImageToCloudinary(selectedFile);
        submitText.textContent = 'Saving report...';
        await saveDisaster({
            title, description, type, imageUrl,
            lat: userLocation?.lat || 0, lng: userLocation?.lng || 0,
            address: userLocation?.address || 'Unknown', user: currentUser,
        });
        showToast('Disaster reported successfully!', 'success');
        closeDisasterModal();
    } catch (err) {
        console.error('Submit error:', err);
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        btnSubmit.disabled = false;
        submitText.textContent = 'Post Disaster Report';
        submitSpinner.classList.add('hidden');
    }
});

function resetDisasterForm() {
    disasterForm.reset();
    selectedFile = null;
    userLocation = null;
    imagePreview.classList.add('hidden');
    imagePreview.src = '';
    uploadPlaceholder.classList.remove('hidden');
    locationStatus.classList.remove('hidden');
    locationStatus.innerHTML = `<div class="w-4 h-4 border-2 border-gray-500 border-t-red-500 rounded-full animate-spin"></div> Detecting your location...`;
    locationText.classList.add('hidden');
}

// =========================================
// EMERGENCY SECTION
// =========================================
btnOpenEmergency.addEventListener('click', () => {
    emergencyModal.classList.remove('hidden');
});
btnCloseEmergencyModal.addEventListener('click', closeEmergencyModal);
emergencyModalOverlay.addEventListener('click', closeEmergencyModal);

function closeEmergencyModal() {
    emergencyModal.classList.add('hidden');
    resetEmergencyForm();
}

// Image upload
emergencyImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    emergencySelectedFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
        emergencyImagePreview.src = ev.target.result;
        emergencyImagePreview.classList.remove('hidden');
        emergencyUploadPlaceholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
});

// Location: Auto-detect button
btnEmergencyAutoLoc.addEventListener('click', async () => {
    emergencyLocAuto.classList.remove('hidden');
    emergencyLocType.classList.add('hidden');
    emergencyLocStatus.classList.remove('hidden');
    emergencyLocResult.classList.add('hidden');

    // Highlight active button
    btnEmergencyAutoLoc.className = btnEmergencyAutoLoc.className.replace('bg-blue-500/10', 'bg-blue-500/30').replace('border-blue-500/20', 'border-blue-500/50');
    btnEmergencyTypeLoc.className = btnEmergencyTypeLoc.className.replace('bg-blue-500/30', 'bg-gray-800').replace('border-blue-500/50', 'border-gray-700');

    try {
        const loc = await getEmergencyLocation();
        emergencyLocation = loc;
        emergencyLat.value = loc.lat;
        emergencyLng.value = loc.lng;
        emergencyLocStatus.classList.add('hidden');
        emergencyLocResult.classList.remove('hidden');
        emergencyLocResult.textContent = `${loc.address}`;
    } catch {
        emergencyLocStatus.innerHTML = `<span class="text-yellow-400"><i class="fas fa-exclamation-triangle mr-1"></i> Could not detect location. Try typing it instead.</span>`;
    }
});

// Location: Type location button
btnEmergencyTypeLoc.addEventListener('click', () => {
    emergencyLocType.classList.remove('hidden');
    emergencyLocAuto.classList.add('hidden');
    emergencySearchResult.classList.add('hidden');
    emergencySearchError.classList.add('hidden');

    // Highlight active button
    btnEmergencyTypeLoc.className = btnEmergencyTypeLoc.className.replace('bg-gray-800', 'bg-blue-500/30').replace('border-gray-700', 'border-blue-500/50');
    btnEmergencyAutoLoc.className = btnEmergencyAutoLoc.className.replace('bg-blue-500/30', 'bg-blue-500/10').replace('border-blue-500/50', 'border-blue-500/20');
});

// Location: Search button
btnEmergencySearchLoc.addEventListener('click', async () => {
    const query = emergencyLocSearch.value.trim();
    if (!query) return;

    btnEmergencySearchLoc.textContent = 'Searching...';
    btnEmergencySearchLoc.disabled = true;
    emergencySearchResult.classList.add('hidden');
    emergencySearchError.classList.add('hidden');

    try {
        const loc = await forwardGeocode(query);
        emergencyLocation = loc;
        emergencyLat.value = loc.lat;
        emergencyLng.value = loc.lng;
        emergencySearchResult.classList.remove('hidden');
        emergencySearchResult.textContent = `${loc.address}`;
    } catch {
        emergencySearchError.classList.remove('hidden');
        emergencySearchError.textContent = 'Location not found. Try a different search.';
    } finally {
        btnEmergencySearchLoc.textContent = 'Search';
        btnEmergencySearchLoc.disabled = false;
    }
});

// Enter key in location search
emergencyLocSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        btnEmergencySearchLoc.click();
    }
});

// Emergency form submit
emergencyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('emergency-title').value.trim();
    const description = document.getElementById('emergency-desc').value.trim();
    const type = document.getElementById('emergency-type').value;

    if (!title || !description || !type) { showToast('Please fill all fields', 'error'); return; }
    if (!emergencySelectedFile) { showToast('Please upload an image', 'error'); return; }
    if (!emergencyLocation) { showToast('Please set a location', 'error'); return; }

    btnSubmitEmergency.disabled = true;
    emergencySubmitText.textContent = 'Uploading image...';
    emergencySubmitSpinner.classList.remove('hidden');

    try {
        const imageUrl = await uploadEmergencyImage(emergencySelectedFile);
        emergencySubmitText.textContent = 'Saving report...';
        await saveEmergency({
            title, description, type, imageUrl,
            lat: emergencyLocation.lat, lng: emergencyLocation.lng,
            address: emergencyLocation.address, user: currentUser,
        });
        showToast('Emergency reported successfully!', 'success');
        closeEmergencyModal();
    } catch (err) {
        console.error('Emergency submit error:', err);
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        btnSubmitEmergency.disabled = false;
        emergencySubmitText.textContent = 'Post Emergency Report';
        emergencySubmitSpinner.classList.add('hidden');
    }
});

function resetEmergencyForm() {
    emergencyForm.reset();
    emergencySelectedFile = null;
    emergencyLocation = null;
    emergencyImagePreview.classList.add('hidden');
    emergencyImagePreview.src = '';
    emergencyUploadPlaceholder.classList.remove('hidden');
    emergencyLocAuto.classList.add('hidden');
    emergencyLocType.classList.add('hidden');
    emergencyLocResult.classList.add('hidden');
    emergencySearchResult.classList.add('hidden');
    emergencySearchError.classList.add('hidden');
}

// =========================================
// REAL-TIME LISTENERS
// =========================================
function startListeners() {
    // Disaster feed
    unsubDisasterFeed = listenToDisasters((disasters) => {
        allDisasters = disasters;
        // Track latest for breaking news
        latestDisaster = disasters.length > 0 ? disasters[0] : null;
        updateBreakingNews();

        if (disasters.length === 0) {
            disasterFeed.innerHTML = `
                <div class="flex items-center justify-center py-12 text-gray-500">
                    <div class="text-center space-y-2">
                        <svg class="w-12 h-12 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                        </svg>
                        <p>No disaster reports yet. Be the first to report!</p>
                    </div>
                </div>`;
            return;
        }
        disasterFeed.innerHTML = disasters.map((d) => renderCard(d, 'red', formatTime)).join('');
    });

    // Emergency feed
    unsubEmergencyFeed = listenToEmergencies((emergencies) => {
        allEmergencies = emergencies;
        // Track latest for breaking news
        latestEmergency = emergencies.length > 0 ? emergencies[0] : null;
        updateBreakingNews();

        if (emergencies.length === 0) {
            emergencyFeed.innerHTML = `
                <div class="flex items-center justify-center py-12 text-gray-500">
                    <div class="text-center space-y-2">
                        <svg class="w-12 h-12 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                        </svg>
                        <p>No emergency reports yet. Be the first to report!</p>
                    </div>
                </div>`;
            return;
        }
        emergencyFeed.innerHTML = emergencies.map((d) => renderCard(d, 'blue', formatEmergencyTime)).join('');
    });

    // NGO approved feed
    unsubNgoFeed = listenToApprovedNgos((ngos) => {
        if (ngos.length === 0) {
            ngoFeed.innerHTML = `
                <div class="flex items-center justify-center py-12 text-gray-500">
                    <div class="text-center space-y-2">
                        <svg class="w-12 h-12 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <p>No verified NGOs yet</p>
                    </div>
                </div>`;
            return;
        }

        ngoFeed.innerHTML = ngos.map((n) => `
            <div class="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/30 transition-all">
                <div class="flex flex-col sm:flex-row">
                    ${n.imageUrl
                ? `<div class="w-full sm:w-52 min-h-[200px] flex-shrink-0 overflow-hidden self-stretch">
                            <img src="${n.imageUrl}" alt="${escapeHtml(n.name)}" class="w-full h-full object-cover block" loading="lazy" />
                        </div>`
                : `<div class="w-full sm:w-52 min-h-[200px] flex-shrink-0 bg-gray-800 flex items-center justify-center overflow-hidden self-stretch">
                            <i class="fas fa-building text-5xl text-gray-500"></i>
                        </div>`
            }
                    <div class="flex-1 p-4 space-y-2">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500/15 text-green-400">
                                        <i class="fas fa-check-circle mr-1"></i> Verified
                                    </span>
                                    <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-800 text-gray-400">
                                        ${escapeHtml(n.category)}
                                    </span>
                                </div>
                                <h3 class="text-lg font-bold text-white">${escapeHtml(n.name)}</h3>
                            </div>
                            <span class="text-xs text-gray-500 whitespace-nowrap mt-1">Since ${escapeHtml(n.foundedYear)}</span>
                        </div>
                        <p class="text-sm text-gray-400 line-clamp-3">${escapeHtml(n.description)}</p>
                        <div class="flex items-center gap-4 pt-1 text-xs text-gray-500">
                            ${n.contactEmail ? `<span><i class="fas fa-envelope mr-1"></i>${escapeHtml(n.contactEmail)}</span>` : ''}
                            ${n.contactPhone ? `<span><i class="fas fa-phone mr-1"></i>${escapeHtml(n.contactPhone)}</span>` : ''}
                        </div>
                        ${n.address ? `<p class="text-xs text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>${escapeHtml(n.address)}</p>` : ''}
                        ${n.website ? `<a href="${escapeHtml(n.website)}" target="_blank" class="inline-block text-xs text-green-400 hover:text-green-300 mt-1"><i class="fas fa-globe mr-1"></i>Visit Website</a>` : ''}
                    </div>
                </div>
            </div>`
        ).join('');
    });

    // News feed
    unsubNewsFeed = listenToNews((newsList) => {
        if (newsList.length === 0) {
            newsFeed.innerHTML = `
                <div class="flex items-center justify-center py-12 text-gray-500">
                    <div class="text-center space-y-2">
                        <svg class="w-12 h-12 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                        </svg>
                        <p>No verified news yet. Be the first to share!</p>
                    </div>
                </div>`;
            return;
        }
        newsFeed.innerHTML = newsList.map((n) => renderNewsCard(n)).join('');
    });
}

function renderNewsCard(n) {
    const catColors = {
        Disaster: 'red', Weather: 'blue', Safety: 'amber', Government: 'cyan',
        Health: 'green', Environment: 'emerald', Technology: 'violet', General: 'purple',
    };
    const color = catColors[n.category] || 'purple';
    return `
        <div class="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all p-5 space-y-3">
            <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500/15 text-green-400">
                            <i class="fas fa-shield-halved text-[9px]"></i> AI Verified
                        </span>
                        <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-${color}-500/15 text-${color}-400">
                            ${escapeHtml(n.category || 'General')}
                        </span>
                        ${n.aiConfidence ? `<span class="text-[10px] text-gray-500">${n.aiConfidence}% confidence</span>` : ''}
                    </div>
                    <h3 class="text-lg font-bold text-white">${escapeHtml(n.headline)}</h3>
                </div>
                <span class="text-xs text-gray-500 whitespace-nowrap mt-1">${formatNewsTime(n.createdAt)}</span>
            </div>
            <p class="text-sm text-gray-400 leading-relaxed">${escapeHtml(n.content)}</p>
            ${n.aiVerdict ? `
            <div class="flex items-start gap-2 px-3 py-2 bg-green-500/5 border border-green-500/15 rounded-xl">
                <i class="fas fa-robot text-green-400 text-xs mt-0.5"></i>
                <p class="text-xs text-green-300/80"><strong>AI Verdict:</strong> ${escapeHtml(n.aiVerdict)}</p>
            </div>` : ''}
            ${n.aiSources ? `
            <p class="text-[11px] text-gray-500"><i class="fas fa-link text-[9px] mr-1"></i>${escapeHtml(n.aiSources)}</p>` : ''}
            <div class="flex items-center gap-2 pt-1">
                <img src="${n.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.userName)}&size=24&background=374151&color=9ca3af`}" 
                     class="w-5 h-5 rounded-full" alt="" />
                <span class="text-xs text-gray-500">${escapeHtml(n.userName)}</span>
            </div>
        </div>`;
}

// =========================================
// BREAKING NEWS - switches based on active tab
// =========================================
function updateBreakingNews() {
    let item = null;
    let icon = '🚨';
    let timeFn = formatTime;

    if (activeTab === 'emergency') {
        item = latestEmergency;
        icon = '🆘';
        timeFn = formatEmergencyTime;
    } else {
        item = latestDisaster;
        icon = '🚨';
        timeFn = formatTime;
    }

    if (item) {
        breakingNews.classList.remove('hidden');
        // Change banner color based on tab
        if (activeTab === 'emergency') {
            breakingNews.className = breakingNews.className.replace(/from-red-700/g, 'from-blue-700').replace(/via-red-600/g, 'via-blue-600').replace(/to-red-700/g, 'to-blue-700');
        } else {
            breakingNews.className = breakingNews.className.replace(/from-blue-700/g, 'from-red-700').replace(/via-blue-600/g, 'via-red-600').replace(/to-blue-700/g, 'to-red-700');
        }
        breakingText.textContent = `${icon} ${item.type}: ${item.title} — ${item.address || 'Location unknown'} — ${timeFn(item.createdAt)}`;
    } else {
        breakingNews.classList.add('hidden');
    }
}

// =========================================
// SHARED CARD RENDERER
// =========================================
function renderCard(d, color, timeFn) {
    return `
        <div class="disaster-card group relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden hover:border-${color}-500/40 transition-all duration-300">
            <div class="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-${color}-500 to-${color}-600 rounded-l-2xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div class="flex flex-col sm:flex-row">
                ${d.imageUrl
            ? `<div class="sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                        <img src="${d.imageUrl}" alt="${escapeHtml(d.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>`
            : ''
        }
                <div class="flex-1 p-5 space-y-3">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-${color}-500/15 text-${color}-400 border border-${color}-500/20 mb-2">
                                <i class="fas fa-circle text-[5px]"></i>
                                ${d.type || 'Report'}
                            </span>
                            <h3 class="text-base font-bold text-white leading-snug">${escapeHtml(d.title)}</h3>
                        </div>
                        <span class="text-[11px] text-gray-500 whitespace-nowrap mt-1 bg-gray-800/50 px-2 py-0.5 rounded-md">${timeFn(d.createdAt)}</span>
                    </div>
                    <p class="text-sm text-gray-400/90 line-clamp-2 leading-relaxed">${escapeHtml(d.description)}</p>
                    <div class="flex items-center justify-between pt-1 border-t border-gray-800/50">
                        <div class="flex items-center gap-2">
                            <img src="${d.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.userName)}&size=24&background=374151&color=9ca3af`}" 
                                 class="w-5 h-5 rounded-full ring-1 ring-gray-700" alt="" />
                            <span class="text-xs text-gray-500">${escapeHtml(d.userName)}</span>
                        </div>
                        ${d.address ? `<span class="text-[11px] text-gray-500 truncate max-w-[200px]"><i class="fas fa-map-marker-alt mr-1 text-${color}-500/50"></i>${escapeHtml(d.address)}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
}

// =========================================
// NGO SECTION
// =========================================
btnOpenNgo.addEventListener('click', () => {
    ngoModal.classList.remove('hidden');
});
btnCloseNgoModal.addEventListener('click', closeNgoModal);
ngoModalOverlay.addEventListener('click', closeNgoModal);

function closeNgoModal() {
    ngoModal.classList.add('hidden');
    resetNgoForm();
}

ngoImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    ngoSelectedFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
        ngoImagePreview.src = ev.target.result;
        ngoImagePreview.classList.remove('hidden');
        ngoUploadPlaceholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
});

ngoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('ngo-name').value.trim();
    const regNumber = document.getElementById('ngo-reg-number').value.trim();
    const founded = document.getElementById('ngo-founded').value.trim();
    const category = document.getElementById('ngo-category').value;
    const description = document.getElementById('ngo-description').value.trim();
    const email = document.getElementById('ngo-email').value.trim();
    const phone = document.getElementById('ngo-phone').value.trim();
    const address = document.getElementById('ngo-address').value.trim();
    const website = document.getElementById('ngo-website').value.trim();

    if (!name || !regNumber || !founded || !category || !description || !email || !phone || !address) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    btnSubmitNgo.disabled = true;
    ngoSubmitText.textContent = 'Uploading...';
    ngoSubmitSpinner.classList.remove('hidden');

    try {
        let imageUrl = '';
        if (ngoSelectedFile) {
            imageUrl = await uploadNgoImage(ngoSelectedFile);
        }
        ngoSubmitText.textContent = 'Submitting...';
        await registerNgo({
            name, description, registrationNumber: regNumber,
            foundedYear: founded, category, contactEmail: email,
            contactPhone: phone, website, address, imageUrl,
            user: currentUser,
        });
        showToast('NGO submitted for review! Admin will approve shortly.', 'success');
        closeNgoModal();
    } catch (err) {
        console.error('NGO submit error:', err);
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        btnSubmitNgo.disabled = false;
        ngoSubmitText.textContent = 'Submit for Review';
        ngoSubmitSpinner.classList.add('hidden');
    }
});

function resetNgoForm() {
    ngoForm.reset();
    ngoSelectedFile = null;
    ngoImagePreview.classList.add('hidden');
    ngoImagePreview.src = '';
    ngoUploadPlaceholder.classList.remove('hidden');
}

// =========================================
// UTILITIES
// =========================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-medium shadow-2xl ${type === 'error' ? 'bg-red-500 text-white'
        : type === 'success' ? 'bg-green-500 text-white'
            : 'bg-gray-800 text-white'
        }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =========================================
// DONATION (Razorpay)
// =========================================
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const btnDonate = document.getElementById('btn-donate');
const donateModal = document.getElementById('donate-modal');
const donateModalOverlay = document.getElementById('donate-modal-overlay');
const btnCloseDonate = document.getElementById('btn-close-donate');
const donateAmount = document.getElementById('donate-amount');
const btnPayNow = document.getElementById('btn-pay-now');
const donatePresets = document.querySelectorAll('.donate-preset');
const receiptModal = document.getElementById('receipt-modal');
const receiptModalOverlay = document.getElementById('receipt-modal-overlay');
const receiptDetails = document.getElementById('receipt-details');
const btnDownloadReceipt = document.getElementById('btn-download-receipt');
const btnCloseReceipt = document.getElementById('btn-close-receipt');

let lastReceipt = null;

btnDonate.addEventListener('click', () => {
    donateModal.classList.remove('hidden');
    donateAmount.value = '';
});
btnCloseDonate.addEventListener('click', () => donateModal.classList.add('hidden'));
donateModalOverlay.addEventListener('click', () => donateModal.classList.add('hidden'));

donatePresets.forEach((btn) => {
    btn.addEventListener('click', () => {
        donateAmount.value = btn.dataset.amount;
        donatePresets.forEach((b) => b.classList.remove('border-pink-500', 'bg-pink-500/15'));
        btn.classList.add('border-pink-500', 'bg-pink-500/15');
    });
});

btnPayNow.addEventListener('click', () => {
    const amount = parseInt(donateAmount.value);
    if (!amount || amount < 1) {
        showToast('Please enter a valid amount', 'error');
        return;
    }

    const options = {
        key: RAZORPAY_KEY,
        amount: amount * 100, // paise
        currency: 'INR',
        name: 'SathiAI Disaster Relief',
        description: 'Donation for disaster relief',
        image: '',
        handler: function (response) {
            // Payment success
            const now = new Date();
            lastReceipt = {
                id: response.razorpay_payment_id,
                amount: amount,
                currency: 'INR',
                date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
                time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                donor: currentUser?.displayName || currentUser?.email || 'Anonymous',
                email: currentUser?.email || '',
            };

            donateModal.classList.add('hidden');
            showReceipt(lastReceipt);
        },
        prefill: {
            name: currentUser?.displayName || '',
            email: currentUser?.email || '',
        },
        theme: {
            color: '#ec4899',
        },
        modal: {
            ondismiss: function () { },
        },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
});

function showReceipt(r) {
    receiptDetails.innerHTML = `
        <div class="flex justify-between"><span class="text-gray-400">Transaction ID</span><span class="text-white font-mono text-xs">${r.id}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Amount</span><span class="text-green-400 font-bold">\u20b9${r.amount}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Donor</span><span class="text-white">${escapeHtml(r.donor)}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Date</span><span class="text-white">${r.date}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Time</span><span class="text-white">${r.time}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Status</span><span class="text-green-400">\u2705 Success</span></div>
    `;
    receiptModal.classList.remove('hidden');
}

btnCloseReceipt.addEventListener('click', () => receiptModal.classList.add('hidden'));
receiptModalOverlay.addEventListener('click', () => receiptModal.classList.add('hidden'));

btnDownloadReceipt.addEventListener('click', () => {
    if (!lastReceipt) return;
    const r = lastReceipt;

    const W = 600, H = 820;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Gradient header
    const hGrad = ctx.createLinearGradient(0, 0, W, 0);
    hGrad.addColorStop(0, '#f97316');
    hGrad.addColorStop(0.5, '#ef4444');
    hGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, W, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SathiAI', W / 2, 60);
    ctx.font = '15px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('Digital Payment Receipt', W / 2, 90);

    // Payment Successful badge
    let y = 175;
    ctx.fillStyle = '#ecfdf5';
    ctx.beginPath();
    ctx.roundRect((W - 250) / 2, y - 22, 250, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 15px Inter, Arial, sans-serif';
    ctx.fillText('\u2705  Payment Successful', W / 2, y + 1);

    // Big amount
    y = 260;
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 48px Inter, Arial, sans-serif';
    ctx.fillText('\u20b9' + r.amount, W / 2, y);

    // Date + time
    y = 295;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, Arial, sans-serif';
    ctx.fillText(r.date + '  \u2022  ' + r.time, W / 2, y);

    // Dashed divider
    y = 325;
    ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 40, y); ctx.stroke(); ctx.restore();

    // Details
    y = 370;
    const details = [
        ['Transaction ID', r.id],
        ['Amount', `\u20b9${r.amount}`],
        ['Donor', r.donor],
        ['Email', r.email],
        ['Purpose', 'Disaster Relief'],
    ];
    details.forEach(([label, val]) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter, Arial, sans-serif';
        ctx.fillText(label, 50, y);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px Inter, Arial, sans-serif';
        ctx.fillText(val, W - 50, y);
        y += 42;
    });

    // Dashed divider
    y += 5;
    ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 40, y); ctx.stroke(); ctx.restore();

    // Donation amount
    y += 40;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Inter, Arial, sans-serif';
    ctx.fillText('Donation Amount', 50, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#1e293b';
    ctx.font = '14px Inter, Arial, sans-serif';
    ctx.fillText('\u20b9' + r.amount, W - 50, y);

    // Total Donated (green)
    y += 45;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    ctx.fillText('Total Donated', 50, y);
    ctx.textAlign = 'right';
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.fillText('\u20b9' + r.amount, W - 50, y);

    // Dashed divider
    y += 30;
    ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 40, y); ctx.stroke(); ctx.restore();

    // Payment ID footer
    y += 40;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.fillText('Payment ID', 50, y);
    y += 22;
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px Inter, Arial, sans-serif';
    ctx.fillText(r.id, 50, y);

    // Thank you footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#059669';
    ctx.font = '14px Inter, Arial, sans-serif';
    ctx.fillText('Thank you for using SathiAI! \u2764\uFE0F', W / 2, H - 40);

    // Download
    const link = document.createElement('a');
    link.download = `SathiAI_Receipt_${r.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('\ud83d\udce5 Receipt downloaded!', 'success');
});

// =========================================
// MAP SECTION (Google Maps + NDMA Earthquakes)
// =========================================
const mapModal = document.getElementById('map-modal');
const mapOverlay = document.getElementById('map-modal-overlay');
const btnOpenMap = document.getElementById('btn-open-map');
const btnCloseMap = document.getElementById('btn-close-map');
const mapTitleEl = document.getElementById('map-title');
let gMap = null;
let gMarkers = [];
let gInfoWindow = null;

function initGoogleMap() {
    if (gMap) { google.maps.event.trigger(gMap, 'resize'); return; }
    gMap = new google.maps.Map(document.getElementById('google-map'), {
        center: { lat: 22.5, lng: 78.9 },
        zoom: 5,
        mapTypeId: 'roadmap',
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
            { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#0e1626' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
            { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
            { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
        ],
    });
    gInfoWindow = new google.maps.InfoWindow();
}

function clearGMarkers() {
    gMarkers.forEach(m => m.setMap(null));
    gMarkers = [];
}

function makeSvgUrl(emoji, bg) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="${bg}" stroke="#fff" stroke-width="2"/><text x="20" y="26" text-anchor="middle" font-size="18">${emoji}</text></svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

const disasterPins = {
    Flood: makeSvgUrl('\ud83c\udf0a', '#3b82f6'),
    Earthquake: makeSvgUrl('\ud83c\udfe1', '#ef4444'),
    Fire: makeSvgUrl('\ud83d\udd25', '#f97316'),
    Cyclone: makeSvgUrl('\ud83c\udf00', '#8b5cf6'),
    Landslide: makeSvgUrl('\u26f0', '#78716c'),
    Drought: makeSvgUrl('\u2600', '#eab308'),
    Industrial: makeSvgUrl('\ud83c\udfed', '#6b7280'),
    Other: makeSvgUrl('\u26a0', '#f59e0b'),
};
const emergencyPin = makeSvgUrl('\ud83c\udd98', '#dc2626');
const ndmaPin = makeSvgUrl('\ud83d\udce1', '#10b981');

function addGMarker(lat, lng, iconUrl, html) {
    const marker = new google.maps.Marker({
        position: { lat, lng },
        map: gMap,
        icon: { url: iconUrl, scaledSize: new google.maps.Size(36, 36) },
    });
    marker.addListener('click', () => {
        gInfoWindow.setContent(`<div style="color:#222;font-family:Inter,sans-serif;max-width:220px">${html}</div>`);
        gInfoWindow.open(gMap, marker);
    });
    gMarkers.push(marker);
}

function populateMap() {
    clearGMarkers();
    if (!gMap) return;

    if (activeTab === 'emergency') {
        mapTitleEl.textContent = 'Emergency Map';
        allEmergencies.forEach(e => {
            if (!e.lat || !e.lng) return;
            addGMarker(e.lat, e.lng, emergencyPin,
                `<b>${escapeHtml(e.title)}</b><br>${escapeHtml(e.type)}<br><small>${escapeHtml(e.address || '')}</small>`);
        });
    } else {
        mapTitleEl.textContent = 'Disaster Map';
        allDisasters.forEach(d => {
            if (!d.lat || !d.lng) return;
            const pin = disasterPins[d.type] || disasterPins.Other;
            addGMarker(d.lat, d.lng, pin,
                `<b>${escapeHtml(d.title)}</b><br>${escapeHtml(d.type)}<br><small>${escapeHtml(d.address || '')}</small>`);
        });
        ndmaEarthquakes.forEach(eq => {
            addGMarker(eq.lat, eq.lng, ndmaPin,
                `<b>\ud83d\udce1 NDMA Earthquake</b><br>Magnitude: ${eq.magnitude}<br>Depth: ${eq.depth}<br>${escapeHtml(eq.location)}<br><small>${eq.time}</small>`);
        });
    }
}

btnOpenMap.addEventListener('click', () => {
    mapModal.classList.remove('hidden');
    setTimeout(() => {
        initGoogleMap();
        populateMap();
    }, 150);
});

// Emergency Map button
const btnOpenEmergencyMap = document.getElementById('btn-open-emergency-map');
if (btnOpenEmergencyMap) {
    btnOpenEmergencyMap.addEventListener('click', () => {
        mapModal.classList.remove('hidden');
        setTimeout(() => {
            initGoogleMap();
            populateMap();
        }, 150);
    });
}

btnCloseMap.addEventListener('click', () => mapModal.classList.add('hidden'));
mapOverlay.addEventListener('click', () => mapModal.classList.add('hidden'));

// --- NDMA Earthquake Fetch ---
function isInIndia(lat, lng) {
    return lat >= 6.5 && lat <= 37.5 && lng >= 67.0 && lng <= 98.0;
}

async function fetchNDMAEarthquakes() {
    try {
        // Use Vite proxy in dev, fallback to CORS proxy in production
        const ndmaUrl = import.meta.env.DEV
            ? '/api/ndma/FetchEarthquakeAlerts'
            : 'https://corsproxy.io/?' + encodeURIComponent('https://sachet.ndma.gov.in/cap_public_website/FetchEarthquakeAlerts');
        const res = await fetch(ndmaUrl);
        const data = await res.json();
        if (!data.alerts) return;

        ndmaEarthquakes = data.alerts
            .filter(a => isInIndia(parseFloat(a.latitude), parseFloat(a.longitude)))
            .map(a => ({
                lat: parseFloat(a.latitude),
                lng: parseFloat(a.longitude),
                magnitude: a.magnitude,
                depth: a.depth,
                location: a.direction,
                time: a.effective_start_time,
                message: a.warning_message,
            }));

        // Auto-add to disaster feed (Firestore) with dedup
        // Only auto-save if user is logged in (Firestore rules require authenticated userId)
        if (!currentUser) {
            console.log('NDMA: Skipping auto-save (no logged-in user). Earthquakes still visible on map.');
            return;
        }

        for (const eq of ndmaEarthquakes) {
            const eqTitle = `Earthquake M${eq.magnitude} - ${eq.location}`;
            try {
                const exists = await checkNdmaDuplicate(eqTitle);
                if (exists) continue;
                await saveDisaster({
                    title: eqTitle,
                    description: eq.message || `Magnitude ${eq.magnitude} earthquake detected at ${eq.location}. Depth: ${eq.depth}.`,
                    type: 'Earthquake',
                    imageUrl: '',
                    lat: eq.lat,
                    lng: eq.lng,
                    address: eq.location,
                    user: currentUser,
                    source: 'NDMA',
                    magnitude: eq.magnitude,
                    depth: eq.depth,
                });
            } catch (e) {
                console.warn('Could not auto-save NDMA earthquake:', e);
            }
        }
        console.log(`NDMA: ${ndmaEarthquakes.length} India earthquakes loaded`);
    } catch (err) {
        console.warn('NDMA earthquake fetch failed (CORS or network):', err);
    }
}

// =========================================
// NEWS FORM HANDLERS
// =========================================
function openNewsModal() {
    newsModal.classList.remove('hidden');
    newsAiStatus.classList.add('hidden');
    newsAiResult.classList.add('hidden');
    newsAiResult.innerHTML = '';
}
function closeNewsModal() {
    newsModal.classList.add('hidden');
    newsForm.reset();
    newsAiStatus.classList.add('hidden');
    newsAiResult.classList.add('hidden');
    newsAiResult.innerHTML = '';
    btnSubmitNews.disabled = false;
    newsSubmitText.textContent = 'Verify & Post News';
    newsSubmitSpinner.classList.add('hidden');
}

btnOpenNews.addEventListener('click', openNewsModal);
btnCloseNewsModal.addEventListener('click', closeNewsModal);
newsModalOverlay.addEventListener('click', closeNewsModal);

newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) { alert('Please log in first.'); return; }

    const headline = document.getElementById('news-headline').value.trim();
    const content = document.getElementById('news-content').value.trim();
    if (!headline || !content) return;

    btnSubmitNews.disabled = true;
    newsSubmitText.textContent = 'Analyzing...';
    newsSubmitSpinner.classList.remove('hidden');
    newsAiStatus.classList.remove('hidden');
    newsAiVerifying.classList.remove('hidden');
    newsAiVerifying.innerHTML = `
        <div class="space-y-2 text-xs">
            <p class="text-cyan-400 animate-pulse"><i class="fas fa-search mr-1"></i> Scanning headline patterns...</p>
        </div>`;
    newsAiResult.classList.add('hidden');

    setTimeout(() => {
        newsAiVerifying.innerHTML += `<p class="text-cyan-400 animate-pulse text-xs"><i class="fas fa-satellite-dish mr-1"></i> Checking published sources...</p>`;
    }, 900);
    setTimeout(() => {
        newsAiVerifying.innerHTML += `<p class="text-cyan-400 animate-pulse text-xs"><i class="fas fa-database mr-1"></i> Cross-referencing with NDMA, IMD, PTI databases...</p>`;
    }, 1600);

    try {
        const result = await verifyNewsWithAI(headline, content);

        newsAiVerifying.classList.add('hidden');
        newsAiResult.classList.remove('hidden');

        if (result.verified) {
            newsAiResult.innerHTML = `
                <div class="px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-shield-halved text-green-400"></i>
                        <span class="text-sm font-bold text-green-400"><i class="fas fa-check-circle mr-1"></i> News Verified!</span>
                        <span class="text-xs text-green-400/70 ml-auto">${result.confidence}% confidence</span>
                    </div>
                    <p class="text-xs text-green-300/80">${escapeHtml(result.verdict)}</p>
                    ${result.sources ? `<p class="text-[11px] text-gray-400"><i class="fas fa-link text-[9px] mr-1"></i>${escapeHtml(result.sources)}</p>` : ''}
                    <p class="text-xs text-green-300 mt-1">Publishing your news now...</p>
                </div>`;


            await saveNews({
                headline,
                content,
                category: result.category || 'General',
                user: currentUser,
                aiVerdict: result.verdict,
                aiConfidence: result.confidence,
                aiSources: result.sources || '',
            });


            setTimeout(() => {
                closeNewsModal();
                showToast('News verified and published!');
            }, 1500);

        } else {
            newsAiResult.innerHTML = `
                <div class="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-triangle-exclamation text-red-400"></i>
                        <span class="text-sm font-bold text-red-400"><i class="fas fa-times-circle mr-1"></i> News Not Verified</span>
                        <span class="text-xs text-red-400/70 ml-auto">${result.confidence}% confidence</span>
                    </div>
                    <p class="text-xs text-red-300/80">${escapeHtml(result.verdict)}</p>
                    ${result.sources ? `<p class="text-[11px] text-gray-400"><i class="fas fa-link text-[9px] mr-1"></i>${escapeHtml(result.sources)}</p>` : ''}
                    <p class="text-xs text-red-300/60 mt-1">This news cannot be published as it could not be verified. Please check your facts and try again.</p>
                </div>`;

            btnSubmitNews.disabled = false;
            newsSubmitText.textContent = 'Verify & Post News';
            newsSubmitSpinner.classList.add('hidden');
        }

    } catch (err) {
        console.error('News verification error:', err);
        newsAiVerifying.classList.add('hidden');
        newsAiResult.classList.remove('hidden');
        newsAiResult.innerHTML = `
            <div class="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p class="text-xs text-amber-300"><i class="fas fa-exclamation-triangle mr-1"></i>Verification failed: ${escapeHtml(err.message)}. Please try again.</p>
            </div>`;
        btnSubmitNews.disabled = false;
        newsSubmitText.textContent = 'Verify & Post News';
        newsSubmitSpinner.classList.add('hidden');
    }
});

// =========================================
// RESILIENCE AI CHATBOT
// =========================================
initChatbot();
