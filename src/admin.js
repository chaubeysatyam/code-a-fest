// Admin panel - NGO approval/decline
import './style.css';
import './firebase-init.js';
import { listenToAllNgos, approveNgo, declineNgo, formatNgoTime } from './ngo.js';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

// DOM
const adminLogin = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const adminPasswordInput = document.getElementById('admin-password');
const btnAdminLogin = document.getElementById('btn-admin-login');
const adminError = document.getElementById('admin-error');
const pendingCount = document.getElementById('pending-count');
const adminNgoList = document.getElementById('admin-ngo-list');
const adminTabs = document.querySelectorAll('.admin-tab');

let allNgos = [];
let currentFilter = 'pending';
let unsubNgos = null;

// Login
btnAdminLogin.addEventListener('click', () => {
    const pwd = adminPasswordInput.value;
    if (pwd === ADMIN_PASSWORD) {
        adminLogin.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        startListening();
    } else {
        adminError.textContent = 'Incorrect password';
        adminError.classList.remove('hidden');
    }
});

adminPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnAdminLogin.click();
});

// Tabs
adminTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        currentFilter = tab.dataset.status;
        adminTabs.forEach((t) => {
            t.className = 'admin-tab px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer bg-gray-800 text-gray-400 border border-gray-700';
        });
        // Highlight active
        if (currentFilter === 'pending') {
            tab.className = 'admin-tab active px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer bg-yellow-500/15 text-yellow-400 border border-yellow-500/20';
        } else if (currentFilter === 'approved') {
            tab.className = 'admin-tab active px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer bg-green-500/15 text-green-400 border border-green-500/20';
        } else if (currentFilter === 'declined') {
            tab.className = 'admin-tab active px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer bg-red-500/15 text-red-400 border border-red-500/20';
        } else {
            tab.className = 'admin-tab active px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer bg-indigo-500/15 text-indigo-400 border border-indigo-500/20';
        }
        renderNgos();
    });
});

function startListening() {
    unsubNgos = listenToAllNgos((ngos) => {
        allNgos = ngos;
        pendingCount.textContent = ngos.filter((n) => n.status === 'pending').length;
        renderNgos();
    });
}

function renderNgos() {
    const filtered = currentFilter === 'all'
        ? allNgos
        : allNgos.filter((n) => n.status === currentFilter);

    if (filtered.length === 0) {
        adminNgoList.innerHTML = `
            <div class="flex items-center justify-center py-16 text-gray-500">
                <p>No ${currentFilter === 'all' ? '' : currentFilter} NGO applications</p>
            </div>`;
        return;
    }

    adminNgoList.innerHTML = filtered.map((ngo) => {
        const statusBadge = ngo.status === 'pending'
            ? '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-500/15 text-yellow-400">🕐 Pending</span>'
            : ngo.status === 'approved'
                ? '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500/15 text-green-400"><i class="fas fa-check-circle mr-1"></i>Approved</span>'
                : '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/15 text-red-400"><i class="fas fa-times-circle mr-1"></i>Declined</span>';

        const actions = ngo.status === 'pending'
            ? `<div class="flex gap-2 mt-3">
                    <button onclick="window._approveNgo('${ngo.id}')"
                        class="flex-1 px-4 py-2 bg-green-500/15 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/30 transition-all text-sm font-medium cursor-pointer">
                        <i class="fas fa-check mr-1"></i> Approve
                    </button>
                    <button onclick="window._declineNgo('${ngo.id}')"
                        class="flex-1 px-4 py-2 bg-red-500/15 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium cursor-pointer">
                        <i class="fas fa-times mr-1"></i> Decline
                    </button>
                </div>`
            : '';

        return `
            <div class="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 hover:border-indigo-500/20 transition-all">
                <div class="flex items-start gap-4">
                    ${ngo.imageUrl
                ? `<img src="${ngo.imageUrl}" alt="${esc(ngo.name)}" class="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-gray-700" />`
                : `<div class="w-20 h-20 rounded-xl bg-gray-800 flex items-center justify-center text-3xl flex-shrink-0"><i class="fas fa-building text-gray-500"></i></div>`
            }
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h3 class="text-lg font-bold text-white">${esc(ngo.name)}</h3>
                            ${statusBadge}
                        </div>
                        <p class="text-sm text-gray-400 mt-1">${esc(ngo.description)}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="bg-gray-800/50 rounded-lg p-3">
                        <p class="text-gray-500 text-xs mb-1">Registration No.</p>
                        <p class="text-white font-medium">${esc(ngo.registrationNumber)}</p>
                    </div>
                    <div class="bg-gray-800/50 rounded-lg p-3">
                        <p class="text-gray-500 text-xs mb-1">Founded</p>
                        <p class="text-white font-medium">${esc(ngo.foundedYear)}</p>
                    </div>
                    <div class="bg-gray-800/50 rounded-lg p-3">
                        <p class="text-gray-500 text-xs mb-1">Category</p>
                        <p class="text-white font-medium">${esc(ngo.category)}</p>
                    </div>
                    <div class="bg-gray-800/50 rounded-lg p-3">
                        <p class="text-gray-500 text-xs mb-1">Submitted by</p>
                        <p class="text-white font-medium">${esc(ngo.submittedBy)}</p>
                    </div>
                    <div class="bg-gray-800/50 rounded-lg p-3">
                        <p class="text-gray-500 text-xs mb-1"><i class="fas fa-envelope mr-1"></i> Email</p>
                        <p class="text-white font-medium truncate">${esc(ngo.contactEmail)}</p>
                    </div>
                    <div class="bg-gray-800/50 rounded-lg p-3">
                        <p class="text-gray-500 text-xs mb-1"><i class="fas fa-phone mr-1"></i> Phone</p>
                        <p class="text-white font-medium">${esc(ngo.contactPhone)}</p>
                    </div>
                    <div class="bg-gray-800/50 rounded-lg p-3 col-span-2">
                        <p class="text-gray-500 text-xs mb-1"><i class="fas fa-map-marker-alt mr-1"></i> Address</p>
                        <p class="text-white font-medium">${esc(ngo.address)}</p>
                    </div>
                    ${ngo.website ? `
                    <div class="bg-gray-800/50 rounded-lg p-3 col-span-2">
                        <p class="text-gray-500 text-xs mb-1"><i class="fas fa-globe mr-1"></i> Website</p>
                        <a href="${esc(ngo.website)}" target="_blank" class="text-indigo-400 hover:text-indigo-300 font-medium">${esc(ngo.website)}</a>
                    </div>` : ''}
                </div>

                <div class="flex items-center justify-between pt-2 text-xs text-gray-500">
                    <span>Submitted: ${formatNgoTime(ngo.createdAt)}</span>
                    ${ngo.reviewedAt ? `<span>Reviewed: ${formatNgoTime(ngo.reviewedAt)}</span>` : ''}
                </div>

                ${actions}
                ${ngo.adminNote ? `<p class="text-sm text-red-400 mt-2">Admin note: ${esc(ngo.adminNote)}</p>` : ''}
            </div>`;
    }).join('');
}

// Global handlers for approve/decline
window._approveNgo = async (id) => {
    try {
        await approveNgo(id);
        showAdminToast('NGO approved!', 'success');
    } catch (err) {
        showAdminToast(`Error: ${err.message}`, 'error');
    }
};

window._declineNgo = async (id) => {
    const reason = prompt('Reason for declining (optional):') || '';
    try {
        await declineNgo(id, reason);
        showAdminToast('NGO declined', 'info');
    } catch (err) {
        showAdminToast(`Error: ${err.message}`, 'error');
    }
};

function showAdminToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-medium shadow-2xl ${type === 'error' ? 'bg-red-500 text-white'
        : type === 'success' ? 'bg-green-500 text-white'
            : 'bg-gray-800 text-white'
        }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function esc(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
