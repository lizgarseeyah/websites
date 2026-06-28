// ======================================================
// Nexus Dashboard — Spirituality Module (Final + Working)
// ======================================================

const API_SINS = "http://localhost:5001/api/sins";
const API_PRAYER = "http://localhost:5001/api/prayer";

export const Spirituality = {
    soulState: "Grace",

    // --------------------------------------------------
    // Toast Notification
    // --------------------------------------------------
    toast(message, type = "success") {
        const div = document.createElement("div");

        div.className =
            "fixed bottom-6 right-6 px-4 py-3 rounded-xl text-white shadow-lg z-[9999] opacity-0 transition-all duration-300 " +
            (type === "error"
                ? "bg-red-600"
                : type === "warning"
                ? "bg-yellow-600"
                : "bg-green-600");

        div.textContent = message;
        document.body.appendChild(div);

        requestAnimationFrame(() => (div.style.opacity = "1"));

        setTimeout(() => {
            div.style.opacity = "0";
            setTimeout(() => div.remove(), 300);
        }, 2000);
    },

    // --------------------------------------------------
    // API Wrapper
    // --------------------------------------------------
    async api(endpoint, options = {}) {
        try {
            const res = await fetch(`${API_SINS}${endpoint}`, {
                headers: { "Content-Type": "application/json" },
                ...options
            });
            if (!res.ok) throw new Error("API error");
            return res.json();
        } catch (err) {
            this.toast("Something went wrong.", "error");
            console.error(err);
        }
    },

    // --------------------------------------------------
    // UI Helpers
    // --------------------------------------------------
    setLoading(id, loading) {
        const btn = document.getElementById(id);
        if (!btn) return;

        if (loading) {
            btn.dataset.original = btn.innerHTML;
            btn.innerHTML = `
                <div class="flex items-center gap-2 justify-center">
                    <span class="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                </div>
            `;
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.original;
            btn.disabled = false;
        }
    },

    // --------------------------------------------------
    // Soul State Badge
    // --------------------------------------------------
    renderSoulState() {
        const badge = document.getElementById("soul-badge");
        const text = document.getElementById("dashboard-soul-status");
        const light = document.getElementById("dashboard-soul-indicator");

        const isGrace = this.soulState === "Grace";

        if (badge) {
            badge.className =
                "px-3 py-1 rounded-full text-[10px] flex items-center gap-1 " +
                (isGrace ? "bg-green-900/40 text-green-300" : "bg-red-900/40 text-red-300");

            badge.innerHTML = `
                <span class="w-1.5 h-1.5 rounded-full ${
                    isGrace ? "bg-green-400" : "bg-red-500"
                } animate-pulse"></span>
                ${this.soulState}
            `;
        }

        if (text) text.textContent = this.soulState;
        if (light) light.style.background = isGrace ? "#22c55e" : "#ef4444";
    },

    // --------------------------------------------------
    // Submit Sin
    // --------------------------------------------------
    async logSin() {
        const input = document.getElementById("sin-input");
        const value = input.value.trim();
        if (!value) return this.toast("Please enter something first.", "warning");

        this.setLoading("sin-submit-btn", true);

        await this.api("/add", {
            method: "POST",
            body: JSON.stringify({ text: value })
        });

        input.value = "";
        this.toast("Sin submitted.");
        await this.updateState();

        this.setLoading("sin-submit-btn", false);
    },

    // --------------------------------------------------
    // Confess (Clear Sins)
    // --------------------------------------------------
    async confess() {
        this.setLoading("confess-btn", true);

        await this.api("/clear", { method: "POST" });

        this.toast("All sins cleared — You are in Grace.");
        await this.updateState();

        this.setLoading("confess-btn", false);
    },

    // --------------------------------------------------
    // Update State (Grace / Condemnation)
    // --------------------------------------------------
    async updateState() {
        const data = await this.api("/state");
        if (data?.state) this.soulState = data.state;
        this.renderSoulState();
    },

// --------------------------------------------------
// ROSARY TRACKER
// --------------------------------------------------
rosaryState: {
    beads: Array(7).fill(null).map(() => ({
        active: false,
        mode: null
    })),
    startDate: null,
    day28: null,
    day54: null,
    confraternityMode: false
},

// Pretty date formatter
formatPrettyDate(dateString) {
    if (!dateString) return "--";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
},

initRosary() {
    // Clean stale bad data
    const saved = JSON.parse(localStorage.getItem("rosary-state"));
    if (saved && Array.isArray(saved.beads)) {
        // Fix legacy boolean-only beads
        if (typeof saved.beads[0] === "boolean") {
            localStorage.removeItem("rosary-state");
        } else {
            this.rosaryState = saved;
        }
    }

    // Toggle switch
    const toggle = document.getElementById("confraternity-toggle");
    if (toggle) {
        toggle.checked = this.rosaryState.confraternityMode;
        toggle.addEventListener("change", () => {
            this.rosaryState.confraternityMode = toggle.checked;
            this.saveRosary();
        });
    }

    // Dates
    const startInput = document.getElementById("rosary-start-date");
    if (startInput) {
        if (this.rosaryState.startDate) startInput.value = this.rosaryState.startDate;

        startInput.addEventListener("change", () => {
            this.rosaryState.startDate = startInput.value;
            this.calculateRosaryDates();
            this.saveRosary();
        });
    }

    this.calculateRosaryDates();
    this.renderBeads();
    this.updateDayCounter();
    this.updateNovenaDay();
},

calculateRosaryDates() {
    const start = this.rosaryState.startDate;
    if (!start) return;

    const base = new Date(start);

    const d28 = new Date(base);
    d28.setDate(d28.getDate() + 27);

    const d54 = new Date(base);
    d54.setDate(d54.getDate() + 53);

    this.rosaryState.day28 = d28.toISOString().split("T")[0];
    this.rosaryState.day54 = d54.toISOString().split("T")[0];

    const el28 = document.getElementById("rosary-day-28");
    const el54 = document.getElementById("rosary-day-54");

    if (el28) el28.textContent = this.formatPrettyDate(this.rosaryState.day28);
    if (el54) el54.textContent = this.formatPrettyDate(this.rosaryState.day54);

    this.updateNovenaDay();
},

renderBeads() {
    const row = document.getElementById("bead-row");
    if (!row) return;

    row.innerHTML = "";

    this.rosaryState.beads.forEach((beadState, index) => {
        const bead = document.createElement("div");

        let beadColor =
            beadState.active
                ? (beadState.mode === "blue"
                    ? "bg-[#7EC8E3] border-[#7EC8E3]"
                    : "bg-yellow-500 border-yellow-500")
                : "bg-gray-700 border-gray-600";

        bead.className =
            "w-8 h-4 rounded-full cursor-pointer transition border " + beadColor;

        bead.addEventListener("click", () => {
            beadState.active = !beadState.active;

            if (beadState.active) {
                beadState.mode = this.rosaryState.confraternityMode
                    ? "blue"
                    : "yellow";
            } else {
                beadState.mode = null;
            }

            this.saveRosary();
            this.renderBeads();
            this.updateDayCounter();
        });

        row.appendChild(bead);
    });
},

updateDayCounter() {
    const el = document.getElementById("rosary-day-counter");
    if (!el) return;

    const count = this.rosaryState.beads.filter(b => b.active).length;
    el.textContent = `Day ${count}`;
},

updateNovenaDay() {
    const el = document.getElementById("rosary-novena-day");
    if (!el || !this.rosaryState.startDate) {
        if (el) el.textContent = "Day 0";
        return;
    }

    const start = new Date(this.rosaryState.startDate);
    const now = new Date();

    // difference in days
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;

    // clamp between 1–54
    const day = Math.min(Math.max(diff, 1), 54);

    el.textContent = `Day ${day}`;
},

clearSelectedRosary() {
    // Reset only beads
    this.rosaryState.beads = Array(7).fill(null).map(() => ({
        active: false,
        mode: null
    }));

    // Wipe saved stale data
    localStorage.removeItem("rosary-state");

    // Save new clean state
    this.saveRosary();

    this.renderBeads();
    this.updateDayCounter();
    this.updateNovenaDay();

    this.toast("Selected beads cleared.", "warning");
},

resetBeadsOnly() {
    // Reset beads only
    this.rosaryState.beads = Array(7).fill(null).map(() => ({
        active: false,
        mode: null
    }));

    this.saveRosary();
    this.renderBeads();
    this.updateDayCounter();

    this.toast("Rosary beads reset.", "warning");
},

resetDayCounterOnly() {
    // Clear date-related fields
    this.rosaryState.startDate = null;
    this.rosaryState.day28 = null;
    this.rosaryState.day54 = null;

    // Update the UI date inputs
    const startInput = document.getElementById("rosary-start-date");
    if (startInput) startInput.value = "";

    const el28 = document.getElementById("rosary-day-28");
    const el54 = document.getElementById("rosary-day-54");

    if (el28) el28.textContent = "--";
    if (el54) el54.textContent = "--";

    // Save + update UI logic
    this.saveRosary();
    this.calculateRosaryDates();
    this.updateNovenaDay();

    this.toast("Day counter & dates reset.", "warning");
}, 

clearAllRosary() {
    // Full reset
    this.rosaryState = {
        beads: Array(7).fill(null).map(() => ({
            active: false,
            mode: null
        })),
        startDate: null,
        day28: null,
        day54: null,
        confraternityMode: false
    };

    // Completely wipe storage FIRST
    localStorage.removeItem("rosary-state");

    // Save clean state again
    this.saveRosary();

    this.renderBeads();
    this.calculateRosaryDates();
    this.updateDayCounter();
    this.updateNovenaDay();

    this.toast("Rosary tracker reset.", "warning");
},

saveRosary() {
    localStorage.setItem("rosary-state", JSON.stringify(this.rosaryState));
},

// --------------------------------------------
// BIBLE IN A YEAR TRACKER
// --------------------------------------------
bibleState: {
    lastSubmitted: null
},

initBible() {
    this.updateBibleToday();
    this.updateBibleUI();
},

updateBibleToday() {
    const today = new Date();
    const pretty = today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
    const el = document.getElementById("bible-today-date");
    if (el) el.textContent = pretty;
},

getBibleDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
},

updateBibleProgress() {
    const today = new Date();
    this.bibleState.lastSubmitted = today.toISOString();

    localStorage.setItem("bible-state", JSON.stringify(this.bibleState));

    this.updateBibleUI();

    this.toast("Bible progress updated!", "success");
},

updateBibleUI() {
    // Day number
    const day = this.getBibleDayOfYear();
    const dayEl = document.getElementById("bible-day-number");
    if (dayEl) dayEl.textContent = `Day ${day}`;

    // Last submitted
    const saved = JSON.parse(localStorage.getItem("bible-state"));
    let lastDatePretty = "--";
    let behindText = "--";

    if (saved && saved.lastSubmitted) {
        const last = new Date(saved.lastSubmitted);

        lastDatePretty = last.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        const diff = day - this.dateToDayOfYear(last);
        behindText = diff > 0 ? `${diff} days behind` : "On track!";
    }

    const lastEl = document.getElementById("bible-last-date");
    const behindEl = document.getElementById("bible-behind");

    if (lastEl) lastEl.textContent = lastDatePretty;
    if (behindEl) behindEl.textContent = behindText;
},

dateToDayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.floor((d - start) / (1000 * 60 * 60 * 24)) + 1;
},

// --------------------------------------------
// PRAYER WALL
// --------------------------------------------
prayerState: {
    prayers:[]
},
savePrayerWall() {
    localStorage.setItem("prayer-wall", JSON.stringify(this.prayerState));
},

loadPrayerWall() {
    const saved = localStorage.getItem("prayer-wall");
    if (saved) this.prayerState = JSON.parse(saved);
},
renderPrayerWall() {
    const container = document.getElementById("intention-list");
    if (!container) return;

    container.innerHTML = "";

    this.prayerState.prayers.forEach((text, index) => {
        const div = document.createElement("div");
        div.className =
            "p-3 bg-white/5 rounded-lg text-gray-300 border border-white/10 relative group";

        div.innerHTML = `
            ${text}
            <button onclick="Spirituality.deletePrayer(${index})"
                class="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                ×
            </button>
        `;

        container.appendChild(div);
    });
},
deletePrayer(index) {
    this.prayerState.prayers.splice(index, 1);
    this.savePrayerWall();
    this.renderPrayerWall();
    this.toast("Prayer removed.", "warning");
},
deleteAllPrayers() {
    this.prayerState.prayers = [];
    this.savePrayerWall();
    this.renderPrayerWall();
    this.toast("All prayers cleared.", "warning");
},
async addPrayer() {
    const text = prompt("Enter your prayer intention:");
    if (!text) return;

    // Update UI
    this.prayerState.prayers.push(text);
    this.savePrayerWall();
    this.renderPrayerWall();

    // Log to Google Sheets backend
    await fetch("http://localhost:5001/api/prayer/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });

    this.toast("Prayer saved to Google Sheet 🙏", "success");
},
async clearAllPrayers() {
    // 1. Clear UI + LocalState
    this.prayerState.prayers = [];
    this.savePrayerWall();
    this.renderPrayerWall();

    // 2. Clear Google Sheet column C
    await fetch("http://localhost:5001/api/prayer/clear-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    // 3. Toast
    this.toast("All prayers cleared 🙏", "warning");
},

// --------------------------------------------------
// Speech-to-Text for Prayer Entry
// --------------------------------------------------
startSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        this.toast("Speech recognition not supported on this device.", "error");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        const input = document.getElementById("prayer-input");
        input.value = text;
        this.toast("Speech captured 🎤", "success");
    };

    recognition.onerror = (event) => {
        console.error("Speech error:", event);
        this.toast("Mic error — try again.", "error");
    };
},
///////////////////////////////////
    // --------------------------------------------------
    // Initialize
    // --------------------------------------------------
    async init() {
        await this.updateState();
        this.initRosary();
        this.initBible();
        this.loadPrayerWall();
        this.renderPrayerWall();

    }
};

// ------------------------------------------------------
// Expose functions globally for HTML onclick()
// ------------------------------------------------------
window.logSin = () => Spirituality.logSin();
window.confess = () => Spirituality.confess();
// Expose globally so HTML can call these
window.Spirituality = Spirituality;
window.clearSelectedRosary = () => Spirituality.clearSelectedRosary();
window.clearAllRosary = () => Spirituality.clearAllRosary();
window.updateBibleProgress = () => Spirituality.updateBibleProgress();
window.clearAllPrayers = () => Spirituality.clearAllPrayers();
