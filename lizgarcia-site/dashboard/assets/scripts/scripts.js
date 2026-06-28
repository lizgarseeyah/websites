/**
 * Dashboard Logic - script.js
 */

// --- CONFIGURATION ---
const GEMINI_API_KEY = "AIzaSyCmXpngiCz5tuYXdfVSZYaJNe6t1WDZMNs"; 
const PYTHON_STOCK_API_URL = "http://127.0.0.1:5000/api/v1/trade"; 
const PYTHON_API_TOKEN = "YOUR_SECRET_TOKEN";

let chatMode = 'copilot';
const mockStocks = [{ ticker: 'MSFT', price: 415.20 }, { ticker: 'NVDA', price: 890.00 }, { ticker: 'BTC', price: 64200 }];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // 2. Render Charts
    renderCharts();
    
    // 3. Setup Chat
    setupChat();
    
    // 4. Generate Rosary Beads (Default Mode)
    generateBeads('bead-default');
    
    // 5. Generate Adoration Days
    generateAdorationDays();
    
    // 6. Setup Sin Input Listener
    setupSinInputListener();

    // 7. Show Default Page
    showPage('dashboard'); 
});


// --- PAGE NAVIGATION ---
function showPage(pageId) {
    const allPages = document.querySelectorAll('[id^="page-"]');
    allPages.forEach(p => { 
        p.classList.remove('visible-page'); 
        p.classList.add('hidden-page'); 
    });
    
    const targetId = pageId === 'dashboard' ? 'page-dashboard' : 'page-' + pageId;
    const target = document.getElementById(targetId);
    if(target) {
        target.classList.remove('hidden-page');
        target.classList.add('visible-page');
    }
}


// --- SPIRITUALITY: SIN & CONFESSION ---
function setupSinInputListener() {
    const sinInput = document.getElementById('sin-input');
    if (sinInput) {
        sinInput.addEventListener('input', () => {
            const badge = document.getElementById('soul-badge');
            const card = document.getElementById('soul-card');
            if(sinInput.value.trim().length > 0) {
                 badge.className = "status-sin px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2";
                 badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Needs Confession`;
                 card.classList.add('border-red-500/50');
            } else {
                 badge.className = "status-grace px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2";
                 badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Grace`;
                 card.classList.remove('border-red-500/50');
            }
        });
    }
}

function markConfessed() {
    const sinInput = document.getElementById('sin-input');
    if(sinInput) sinInput.value = "";
    
    const badge = document.getElementById('soul-badge');
    const card = document.getElementById('soul-card');
    
    if (badge && card) {
        badge.className = "status-grace px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2";
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Grace`;
        card.classList.remove('border-red-500/50');
    }
    
    alert("Status reset to Grace. Deus te absolvat.");
}


// --- SPIRITUALITY: ROSARY & NOVENA ---
function toggleNovenaMode() {
    const isNovena = document.getElementById('confraternity-toggle').checked;
    const container = document.getElementById('novena-dates');
    const card = document.getElementById('rosary-card');
    
    if(isNovena) {
        // Switch to Novena/Confraternity Mode
        container.classList.remove('hidden');
        card.classList.replace('border-yellow-500', 'border-pink-500'); // Change border color
        generateBeads('bead-novena'); // Regenerate pink beads
    } else {
        // Revert to Standard
        container.classList.add('hidden');
        card.classList.replace('border-pink-500', 'border-yellow-500');
        generateBeads('bead-default'); // Regenerate gold beads
    }
}

function generateBeads(beadClass) {
    const beadContainer = document.getElementById('bead-row');
    if (!beadContainer) return;
    
    beadContainer.innerHTML = ''; // Clear existing
    for(let i=0; i<10; i++) {
        const bead = document.createElement('div');
        bead.className = `w-4 h-4 rounded-full transition-all cursor-pointer ${beadClass}`;
        bead.onclick = function() { this.classList.toggle('active'); }
        beadContainer.appendChild(bead);
    }
}

function calculateNovenaDates() {
    const startInput = document.getElementById('novena-start').value;
    if(!startInput) return;

    const startDate = new Date(startInput);
    
    // Calculate Midway (27 Days)
    const midwayDate = new Date(startDate);
    midwayDate.setDate(startDate.getDate() + 27);
    
    // Calculate End (54 Days)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 54);

    // Format Dates
    const options = { month: 'short', day: 'numeric' };
    document.getElementById('novena-midway').innerText = midwayDate.toLocaleDateString('en-US', options) + " (Switch to Thanksgiving)";
    document.getElementById('novena-end').innerText = endDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function logRosary() {
    const isConfraternity = document.getElementById('confraternity-toggle').checked;
    const msg = isConfraternity 
        ? "Rosary Logged (Confraternity Mode). Day marked in Novena." 
        : "Rosary Logged.";
    alert(msg);
    
    // Reset beads visual only
    const beadContainer = document.getElementById('bead-row');
    if (beadContainer) {
        Array.from(beadContainer.children).forEach(b => b.classList.remove('active'));
    }
}


// --- SPIRITUALITY: ADORATION TRACKER ---
function generateAdorationDays() {
    const container = document.getElementById('adoration-days');
    if(!container) return;
    
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    container.innerHTML = '';
    
    days.forEach((day, index) => {
        const el = document.createElement('div');
        el.className = 'adoration-day';
        el.innerText = day;
        el.onclick = () => {
            el.classList.toggle('active');
            updateAdorationCount();
        };
        container.appendChild(el);
    });
}

function updateAdorationCount() {
    const activeDays = document.querySelectorAll('.adoration-day.active').length;
    document.getElementById('adoration-count').innerText = activeDays;
}


// --- SPIRITUALITY: BIBLE & INTENTIONS ---
function updateBibleProgress() {
    const dayInput = document.getElementById('bible-day-input');
    if (!dayInput) return;
    
    const day = dayInput.value;
    const pct = (day / 365) * 100;
    
    const bar = document.getElementById('bible-bar');
    if (bar) bar.style.width = pct + '%';
    
    const text = document.getElementById('bible-progress-text');
    if (text) text.innerText = `Day ${day} of 365`;
}

function addIntention() {
    const text = prompt("Enter prayer intention:");
    if(text) {
        const div = document.createElement('div');
        div.className = "p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-gray-300 group relative";
        div.innerHTML = `${text} <button class="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition" onclick="this.parentElement.remove()">×</button>`;
        const list = document.getElementById('intention-list');
        if (list) list.prepend(div);
    }
}


// --- STOCKS: CHART MOCK ---
function renderCharts() {
    const ctx = document.getElementById('stocksChart');
    if(ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [138000, 141000, 139500, 142205, 143100],
                    borderColor: '#4f46e5',
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}


// --- AI ASSISTANT CHAT LOGIC ---
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');
    
    if (chatWindow.classList.contains('hidden')) {
        chatWindow.classList.remove('hidden');
        chatWindow.classList.add('flex');
        iconOpen.classList.add('hidden');
        iconClose.classList.remove('hidden');
    } else {
        chatWindow.classList.add('hidden');
        chatWindow.classList.remove('flex');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
    }
}

function setupChat() {
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const input = document.getElementById('chat-input');
            if(input.value.trim()) {
                addMessage(input.value, 'user');
                const loadingId = addMessage('Thinking...', 'agent', true);
                // Mock response for now to ensure UI works without API keys
                setTimeout(() => {
                    const loadingMsg = document.getElementById(loadingId);
                    if(loadingMsg) loadingMsg.remove();
                    addMessage("I've received your request. (API Placeholder)", 'agent');
                }, 1000);
                input.value = '';
            }
        });
    }
}

function addMessage(text, sender, isLoading=false) {
    const container = document.getElementById('chat-messages');
    const id = 'msg-' + Date.now();
    if (container) {
        container.insertAdjacentHTML('beforeend', `<div id="${id}" class="flex ${sender==='user'?'justify-end':'justify-start'}"><div class="${sender==='user'?'bg-indigo-600':'bg-white/10'} p-3 rounded-2xl text-sm mb-2 ${isLoading?'animate-pulse':''}">${text}</div></div>`);
        container.scrollTop = container.scrollHeight;
    }
    return id;
}

function setChatMode(mode) { 
    chatMode = mode; 
    const statusText = document.getElementById('chat-status');
    if (statusText) statusText.innerText = mode === 'copilot' ? 'MS Copilot Mode' : 'Gemini AI Mode'; 
    
    // Visual toggle
    const btnCopilot = document.getElementById('btn-copilot');
    const btnGemini = document.getElementById('btn-gemini');
    
    if (btnCopilot && btnGemini) {
        if(mode === 'copilot') {
            btnCopilot.className = "px-3 py-1 text-xs rounded-md bg-indigo-600 text-white transition";
            btnGemini.className = "px-3 py-1 text-xs rounded-md text-gray-400 hover:text-white transition";
        } else {
            btnGemini.className = "px-3 py-1 text-xs rounded-md bg-indigo-600 text-white transition";
            btnCopilot.className = "px-3 py-1 text-xs rounded-md text-gray-400 hover:text-white transition";
        }
    }
}