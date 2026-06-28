/* assets/scripts/Modules/health.js */

export const Health = {
    // 1. User Bio-Data (The "Source of Truth")
    profile: {
        age: 32, // Default
        sex: 'Female',
        height: '5\'6"',
        weight: 145,
        targetWeight: 135,
        activityLevel: 'High' // Sedentary, Moderate, High
    },

    waterIntake: 0,
    waterGoal: 90,

    init: function() {
        console.log("Bio-OS Loaded");
        this.renderProfile();
        this.renderSupplements();
        this.renderMedicalNexus();
    },

    // 2. Render Vitals
    renderProfile: function() {
        document.getElementById('bio-weight').innerText = this.profile.weight;
        document.getElementById('bio-target-weight').innerText = this.profile.targetWeight;
        document.getElementById('bio-profile-summary').innerText = `${this.profile.sex} | ${this.profile.age}yo | ${this.profile.activityLevel} Activity`;
        this.updateWaterUI();
    },

    // 3. Logic: The Supplement Stack
    renderSupplements: function() {
        const list = document.getElementById('bio-supplements-list');
        if(!list) return;

        const stack = [
            { name: "Multivitamin", dose: "1 Tablet", time: "AM", taken: true },
            { name: "Vitamin D3", dose: "2000 IU", time: "AM", taken: true },
            { name: "Omega-3", dose: "1000mg", time: "PM", taken: false },
            { name: "Magnesium", dose: "400mg", time: "PM", taken: false },
            { name: "Probiotic", dose: "1 Cap", time: "AM", taken: true },
            { name: "Creatine", dose: "5g", time: "Post-Workout", taken: false }
        ];

        list.innerHTML = stack.map(pill => `
            <div class="pill-card cursor-pointer group" onclick="Health.togglePill(this)">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full ${pill.taken ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-white/5 text-gray-500 border-white/10'} flex items-center justify-center border transition-colors group-hover:border-cyan-400">
                        ${pill.taken ? '✓' : '💊'}
                    </div>
                    <div>
                        <div class="text-sm font-bold ${pill.taken ? 'text-gray-500 line-through' : 'text-white'}">${pill.name}</div>
                        <div class="text-[10px] text-gray-400">${pill.dose} • ${pill.time}</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // 4. Logic: The Personal Doctor (Auto-Scheduler)
    renderMedicalNexus: function() {
        const list = document.getElementById('bio-appointments-list');
        if(!list) return;

        // Generate recommendations based on Profile Age
        let checks = [
            { type: "Annual Physical", freq: "Yearly", status: "Overdue", date: "Due: Oct 2025" },
            { type: "Dental Cleaning", freq: "6 Months", status: "Scheduled", date: "Dec 12, 2025" },
            { type: "Eye Exam", freq: "Yearly", status: "Good", date: "May 2026" }
        ];

        // Specific logic for Women
        if(this.profile.sex === 'Female') {
            checks.push({ type: "Well-Woman Exam", freq: "Yearly", status: "Action Needed", date: "Schedule Now" });
        }

        // Logic for Age > 30 (Dermatology)
        if(this.profile.age >= 30) {
            checks.push({ type: "Dermatology Skin Check", freq: "Yearly", status: "Good", date: "Aug 2026" });
        }

        list.innerHTML = checks.map(c => {
            let color = "text-gray-400";
            let icon = "○";
            let bg = "bg-white/5";

            if(c.status === "Overdue" || c.status === "Action Needed") {
                color = "text-red-400";
                icon = "!";
                bg = "bg-red-500/10 border-red-500/30";
            } else if (c.status === "Scheduled") {
                color = "text-cyan-400";
                icon = "📅";
                bg = "bg-cyan-500/10 border-cyan-500/30";
            } else {
                color = "text-green-400";
                icon = "✓";
            }

            return `
            <div class="flex items-center gap-3 p-3 rounded-xl border border-white/5 ${bg}">
                <div class="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center font-bold ${color}">${icon}</div>
                <div class="flex-1">
                    <div class="text-sm font-bold text-white">${c.type}</div>
                    <div class="flex justify-between mt-1">
                        <span class="text-[10px] text-gray-500 uppercase tracking-wider">${c.freq}</span>
                        <span class="text-[10px] ${color} font-bold">${c.date}</span>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    },

    // Interactions
    logWater: function() {
        this.waterIntake += 8; // Add 8oz
        if(this.waterIntake > this.waterGoal) this.waterIntake = this.waterGoal;
        this.updateWaterUI();
    },

    updateWaterUI: function() {
        document.getElementById('bio-water').innerText = this.waterIntake;
        const pct = (this.waterIntake / this.waterGoal) * 100;
        document.getElementById('bio-water-bar').style.width = `${pct}%`;
    },

    togglePill: function(el) {
        // Just a visual toggle for the prototype
        const iconDiv = el.querySelector('div > div');
        const textDiv = el.querySelector('div > div:nth-child(2) > div');
        
        if(textDiv.classList.contains('line-through')) {
            // Uncheck
            textDiv.classList.remove('text-gray-500', 'line-through');
            textDiv.classList.add('text-white');
            iconDiv.classList.remove('bg-green-500/20', 'text-green-400', 'border-green-500/50');
            iconDiv.classList.add('bg-white/5', 'text-gray-500', 'border-white/10');
            iconDiv.innerText = "💊";
        } else {
            // Check
            textDiv.classList.add('text-gray-500', 'line-through');
            textDiv.classList.remove('text-white');
            iconDiv.classList.add('bg-green-500/20', 'text-green-400', 'border-green-500/50');
            iconDiv.classList.remove('bg-white/5', 'text-gray-500', 'border-white/10');
            iconDiv.innerText = "✓";
        }
    },

    editProfile: function() {
        const newWeight = prompt("Update Weight (lbs):", this.profile.weight);
        if(newWeight) {
            this.profile.weight = newWeight;
            this.renderProfile();
        }
    }
};

window.Health = Health;