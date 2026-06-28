/* assets/scripts/Modules/microsoft.js */

export const Microsoft = {

    // Internal State for Tasks (Mock Data)
    tasks: [
        { id: 1, txt: 'Fix Power Automate JSON Error', due: 'Today', time: '30m' },
        { id: 2, txt: 'Update Azure DevOps Board', due: 'Fri', time: '15m' }
    ],

    init: function() {
        console.log("Microsoft Assistant Loaded");
        this.renderMeetings();
        this.renderOutlook(); // New separated renderer
        this.renderTeams();   // New separated renderer
        this.renderTodoList();
        this.renderMilestones();
    },

    /* ===========================
       1. AGENDA SECTION
       =========================== */
    renderMeetings: function() {
        // Shared HTML generator
        const createMeetingHTML = (time, ampm, title, sub, colorClass) => `
            <div class="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg transition border-l-2 ${colorClass}">
                <div class="text-center min-w-[50px]">
                    <div class="text-xs font-bold text-white">${time}</div>
                    <div class="text-[10px] text-gray-500">${ampm}</div>
                </div>
                <div>
                    <div class="text-sm font-bold text-white">${title}</div>
                    <div class="text-xs text-gray-400">${sub}</div>
                </div>
            </div>
        `;

        // Today
        const todayContainer = document.getElementById('ms-meetings-today');
        if(todayContainer) {
            todayContainer.innerHTML = 
                createMeetingHTML("10:00", "AM", "Daily Standup", "Teams Meeting", "border-blue-500") +
                createMeetingHTML("02:00", "PM", "Client Req Review", "Contoso Project", "border-purple-500");
        }

        // Prep for Tomorrow (Modified as requested: Link INSIDE the card)
        const prepContainer = document.getElementById('ms-meetings-prep');
        if(prepContainer) {
            prepContainer.innerHTML = `
                <div class="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg transition border-l-2 border-yellow-500 group">
                    <div class="text-center min-w-[50px]">
                        <div class="text-xs font-bold text-white">09:00</div>
                        <div class="text-[10px] text-gray-500">AM</div>
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-bold text-white">Architecture Review</div>
                        <div class="text-xs text-gray-400 mb-2">With Tom</div>
                        
                        <a href="#" class="inline-flex items-center gap-1 text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20 hover:bg-yellow-500/20 transition">
                            📄 View Spec Doc
                        </a>
                    </div>
                </div>
            `;
        }
    },

    /* ===========================
       2. OUTLOOK MESSAGES (AI PULSE STYLE)
       =========================== */
    renderOutlook: function() {
        const list = document.getElementById('ms-outlook-list');
        if(!list) return;

        const emails = [
            { id: 'mail1', from: 'Sarah Mgr', subject: 'Budget Approval', time: '10m', draft: 'Budget approved. Proceeding with PO #992.' },
            { id: 'mail2', from: 'Jira Alert', subject: 'Ticket #492 Assigned', time: '1h', draft: 'Acknowledged. Will investigate logs.' }
        ];

        // We stack them vertically (Message Top, AI Draft Bottom) to fit the column width
        list.innerHTML = emails.map(e => `
            <div class="group bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-3 hover:bg-white/10 transition mb-3">
                
                <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold border border-blue-500/30 shrink-0">OM</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-bold text-xs text-white truncate">${e.from}</span>
                            <span class="text-[10px] text-gray-500">${e.time}</span>
                        </div>
                        <p class="text-xs text-gray-400 truncate">"${e.subject}"</p>
                    </div>
                </div>

                <div class="flex justify-center -my-2 opacity-30">
                    <span class="text-xs">↓</span>
                </div>

                <div class="bg-blue-500/10 rounded-lg border border-blue-500/30 p-2 flex flex-col gap-2 relative transition-all focus-within:bg-blue-500/20 focus-within:border-blue-400">
                     <span class="absolute -top-2 right-2 text-[8px] bg-blue-500 text-white px-1.5 rounded shadow-lg uppercase font-bold tracking-wider">AI Draft</span>
                     
                     <textarea readonly 
                        class="w-full bg-transparent border-none text-xs text-blue-100 focus:outline-none resize-none min-h-[40px] p-1 font-medium placeholder-blue-400/50"
                    >${e.draft}</textarea>

                    <div class="flex justify-end gap-2 pt-1 border-t border-blue-500/20">
                        <button onclick="Microsoft.enableEdit(this)" class="px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-white/10 text-blue-300 border border-white/10 transition">✏️ Edit</button>
                        <button onclick="Microsoft.submitReply(this)" class="px-3 py-1 rounded text-[10px] bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-900/20 transition">🚀 Send</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /* ===========================
       3. TEAMS MESSAGES (AI PULSE STYLE)
       =========================== */
    renderTeams: function() {
        const list = document.getElementById('ms-teams-list');
        if(!list) return;

        const msgs = [
            { id: 'team1', from: 'Dev Group', msg: 'Deployment failed in UAT', time: '2m', draft: 'Checking error logs now. Stand by.' },
            { id: 'team2', from: 'Tom', msg: 'Can you check the PR?', time: '15m', draft: 'On it. Will review in 10 mins.' }
        ];

        list.innerHTML = msgs.map(m => `
            <div class="group bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-3 hover:bg-white/10 transition mb-3">
                
                <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold border border-indigo-500/30 shrink-0">TM</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-bold text-xs text-white truncate">${m.from}</span>
                            <span class="text-[10px] text-green-400">Online</span>
                        </div>
                        <p class="text-xs text-gray-300 truncate">"${m.msg}"</p>
                    </div>
                </div>

                <div class="flex justify-center -my-2 opacity-30">
                    <span class="text-xs">↓</span>
                </div>

                <div class="bg-indigo-500/10 rounded-lg border border-indigo-500/30 p-2 flex flex-col gap-2 relative transition-all focus-within:bg-indigo-500/20 focus-within:border-indigo-400">
                     <span class="absolute -top-2 right-2 text-[8px] bg-indigo-500 text-white px-1.5 rounded shadow-lg uppercase font-bold tracking-wider">AI Draft</span>
                     
                     <textarea readonly 
                        class="w-full bg-transparent border-none text-xs text-indigo-100 focus:outline-none resize-none min-h-[40px] p-1 font-medium placeholder-indigo-400/50"
                    >${m.draft}</textarea>

                    <div class="flex justify-end gap-2 pt-1 border-t border-indigo-500/20">
                        <button onclick="Microsoft.enableEdit(this)" class="px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 transition">✏️ Edit</button>
                        <button onclick="Microsoft.submitReply(this)" class="px-3 py-1 rounded text-[10px] bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-900/20 transition">🚀 Send</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /* ===========================
       4. TO-DO LIST (With Select & Delete)
       =========================== */
    renderTodoList: function() {
        const list = document.getElementById('ms-todo-list');
        if(!list) return;
        
        list.innerHTML = this.tasks.map(t => `
            <div class="group flex flex-col gap-2 p-2 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition" id="ms-task-${t.id}">
                <div class="flex items-center gap-2">
                    <input type="checkbox" class="ms-task-checkbox accent-indigo-500 w-4 h-4 cursor-pointer" data-id="${t.id}">
                    
                    <span class="flex-1 text-xs text-white font-medium editable-text">${t.txt}</span>
                    
                    <div class="opacity-0 group-hover:opacity-100 flex gap-1 transition">
                        <button onclick="Microsoft.editTask(${t.id})" class="text-gray-400 hover:text-white" title="Update">✏️</button>
                    </div>
                </div>
                <div class="flex gap-2 pl-6">
                    <span class="text-[10px] text-gray-500 bg-black/20 px-1.5 rounded">📅 ${t.due}</span>
                    <span class="text-[10px] text-gray-500 bg-black/20 px-1.5 rounded">⏱ ${t.time}</span>
                </div>
            </div>
        `).join('');
    },
    
    addToDo: function() {
        const txt = prompt("Task Name:");
        if(txt) {
            const newId = Date.now();
            this.tasks.push({ id: newId, txt: txt, due: 'Today', time: '--' });
            this.renderTodoList();
        }
    },

    editTask: function(id) {
        const task = this.tasks.find(t => t.id === id);
        if(!task) return;
        const newText = prompt("Update Task:", task.txt);
        if(newText) {
            task.txt = newText;
            this.renderTodoList();
        }
    },

    // 🔥 NEW: Bulk Delete Functionality
    deleteSelectedTasks: function() {
        // 1. Find all checked boxes
        const checkboxes = document.querySelectorAll('.ms-task-checkbox:checked');
        
        if(checkboxes.length === 0) {
            alert("No tasks selected.");
            return;
        }

        if(confirm(`Delete ${checkboxes.length} selected task(s)?`)) {
            // 2. Get IDs to delete
            const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
            
            // 3. Filter them out of the array
            this.tasks = this.tasks.filter(t => !idsToDelete.includes(t.id));
            
            // 4. Re-render
            this.renderTodoList();
        }
    },

    /* ===========================
       5. MILESTONES (Teal Styling)
       =========================== */
    renderMilestones: function() {
        const list = document.getElementById('ms-milestones-list');
        if(!list) return;

        const items = [
            { acct: 'Northwind', stage: 'Phase 1 Config', lic: '5 E5', status: 'In Progress' },
            { acct: 'Contoso', stage: 'UAT Sign-off', lic: '20 E3', status: 'Pending' }
        ];

        list.innerHTML = items.map(m => `
            <div class="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2 relative group hover:bg-white/10 transition">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-bold text-sm text-white">${m.acct}</div>
                        <div class="text-xs text-teal-400">${m.stage}</div>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30">${m.status}</span>
                </div>
                <div class="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                    <span>Licenses: ${m.lic}</span>
                </div>
            </div>
        `).join('');
    },

    /* ===========================
       6. INTERACTIONS & HELPERS
       =========================== */
    
    // Unlocks AI Draft for editing
    enableEdit: function(btnElement) {
        const container = btnElement.closest('div').parentElement; 
        const textarea = container.querySelector('textarea');
        textarea.removeAttribute('readonly');
        textarea.focus();
        textarea.classList.add('bg-black/20', 'rounded');
        btnElement.innerHTML = "🔓 Editing...";
        btnElement.classList.add('text-yellow-300', 'border-yellow-500/50');
    },

    // Submits the AI Reply
    submitReply: function(btnElement) {
        const container = btnElement.closest('div').parentElement;
        const textarea = container.querySelector('textarea');
        const textToSend = textarea.value;

        btnElement.innerHTML = "✓ Sent";
        btnElement.className = "px-3 py-1 rounded text-[10px] bg-green-500 text-white font-bold flex items-center gap-1";
        
        // Remove the card visually
        setTimeout(() => {
            const card = btnElement.closest('.group');
            card.style.transition = "all 0.5s ease";
            card.style.opacity = "0";
            card.style.transform = "translateX(20px)";
            setTimeout(() => card.remove(), 500);
        }, 800);
    },

    toggleEdit: function(panelId) {
        const panel = document.getElementById(panelId);
        if(!panel) return;
        const inputs = panel.querySelectorAll('input, select, textarea');
        const isCurrentlyDisabled = inputs[0].disabled;
        inputs.forEach(input => {
            input.disabled = !isCurrentlyDisabled;
            if(isCurrentlyDisabled) {
                input.classList.add('bg-black/40', 'border-indigo-500');
                input.classList.remove('bg-transparent', 'border-transparent');
            } else {
                input.classList.remove('bg-black/40', 'border-indigo-500');
            }
        });
        if(isCurrentlyDisabled) inputs[0].focus();
    },

    submitLog: function() {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "⏳ Saving...";
        setTimeout(() => {
            btn.innerText = "✅ Saved";
            btn.classList.replace('bg-indigo-600', 'bg-green-600');
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.replace('bg-green-600', 'bg-indigo-600');
                this.toggleEdit('log-hours-panel');
            }, 2000);
        }, 1500);
    },

    refreshAll: function() {
        alert("Syncing with Microsoft Graph...");
    }
};

window.Microsoft = Microsoft;