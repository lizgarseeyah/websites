/* assets/scripts/Modules/contentcreator.js */

export const Marketing = {

    // 1. DATA: Your Wired Accounts
    accounts: [
        { platform: 'x', handle: '@sheshepeeng', name: 'Personal', followers: '1.2k', color: 'brand-x', icon: 'X' },
        { platform: 'x', handle: '@lizgpt1_0', name: 'LizGPT 1.0', followers: '850', color: 'brand-x', icon: 'X' },
        { platform: 'instagram', handle: '@lizgpt1.0', name: 'LizGPT 1.0', followers: '2.1k', color: 'brand-insta', icon: 'IG' },
        { platform: 'instagram', handle: '@golf_me1runtherunbiz', name: 'Golf & Biz', followers: '1.5k', color: 'brand-insta', icon: 'IG' },
        { platform: 'instagram', handle: '@techlifedynamictutorials', name: 'Tech Life', followers: '5.3k', color: 'brand-insta', icon: 'IG' },
        { platform: 'tiktok', handle: '@igz984', name: 'Creator', followers: '12k', color: 'brand-tiktok', icon: 'TT' },
        { platform: 'youtube', handle: '@LizGPT', name: 'LizGPT Channel', followers: '3.4k', color: 'brand-youtube', icon: 'YT' }
    ],

    // 2. INIT: Run this when the page loads
    init: function() {
        console.log("Content Creator Module Loaded");
        this.renderAccounts();
        this.calculateTotalReach();
        this.bindEvents(); // <--- THIS IS THE KEY NEW PART
    },

    // 3. RENDER: Create the HTML for the account cards
    renderAccounts: function() {
        const list = document.getElementById('marketing-accounts-list');
        if (!list) return;

        list.innerHTML = ''; // Clear current

        this.accounts.forEach(acc => {
            const card = document.createElement('div');
            // Using the CSS classes we added in Step 1
            card.className = `glass-card p-3 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer transition-all ${acc.color}`;
            
            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs text-gray-300 border border-white/10">
                        ${acc.icon}
                    </div>
                    <div>
                        <div class="font-bold text-sm text-white">${acc.handle}</div>
                        <div class="text-[10px] text-gray-400 uppercase tracking-wide">${acc.platform}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-white text-sm">${acc.followers}</div>
                    <div class="text-[10px] text-green-400">Active</div>
                </div>
            `;
            list.appendChild(card);
        });
    },

    // 4. LOGIC: Simple math for the "Total Reach" display
    calculateTotalReach: function() {
        // In a real app, we'd parse the 'k' and 'm' and sum them up. 
        document.getElementById('total-followers-display').innerText = "26.3k"; 
    },

    // 5. EVENTS: Handle user interaction (This was missing)
    bindEvents: function() {
        // A. Dropdown Color Changer
        const selector = document.getElementById('post-platform-select');
        const inputArea = document.getElementById('content-input');
        
        if(selector && inputArea) {
            selector.addEventListener('change', (e) => {
                this.updateEditorTheme(e.target.value, inputArea);
            });
        }

        // B. AI Rewrite Button
        const aiBtn = document.getElementById('btn-ai-rewrite');
        if(aiBtn && inputArea) {
            aiBtn.addEventListener('click', () => {
                this.simulateAIRewrite(inputArea);
            });
        }

        // C. Schedule Action Buttons (Pause, Cancel, Go)
        // We use event delegation because buttons might be inside cards
        document.body.addEventListener('click', (e) => {
            // PAUSE
            if (e.target.closest('.btn-pause')) {
                alert("⏸ Schedule PAUSED for this item.");
            }
            // CANCEL (Delete row)
            if (e.target.closest('.btn-cancel')) {
                if(confirm("Are you sure you want to cancel this post?")) {
                    const row = e.target.closest('.group'); // Finds the container
                    if(row) row.remove();
                }
            }
            // GO (Post Now)
            if (e.target.closest('.btn-go')) {
                alert("🚀 Launching post immediately!");
            }
        });
    },

    // 6. VISUALS: Change editor glow based on platform
    updateEditorTheme: function(platform, element) {
        // Reset classes
        element.className = "w-full h-24 bg-black/30 border rounded-xl p-4 text-sm text-white focus:outline-none mb-4 font-mono transition-all duration-500";
        
        // Add specific border colors
        if (platform === 'insta') {
            element.classList.add('border-pink-500', 'shadow-[0_0_15px_rgba(236,72,153,0.15)]');
        } else if (platform === 'x') {
            element.classList.add('border-white/40', 'shadow-[0_0_15px_rgba(255,255,255,0.1)]');
        } else if (platform === 'tiktok') {
            element.classList.add('border-teal-400', 'shadow-[0_0_15px_rgba(45,212,191,0.15)]');
        } else {
            element.classList.add('border-white/10', 'focus:border-indigo-500'); // Default
        }
    },

    // 7. SIMULATION: The AI "Typing" Effect
    simulateAIRewrite: function(inputElement) {
        const originalText = inputElement.value;
        if(!originalText) {
            alert("Write something first for the AI to fix!");
            return;
        }

        // 1. Loading State
        inputElement.disabled = true;
        const oldPlaceholder = inputElement.placeholder;
        inputElement.value = "✨ AI Agent is optimizing your caption...";
        inputElement.classList.add('animate-pulse');

        // 2. Wait 1.5 seconds (Simulating API call)
        setTimeout(() => {
            inputElement.classList.remove('animate-pulse');
            inputElement.disabled = false;
            
            // 3. Mock Response (In the future, this comes from Python)
            inputElement.value = `🚀 ${originalText} \n\n#TechLife #Innovation #FutureIsNow`;
            
            // Flash green to show success
            const oldBorderColor = inputElement.style.borderColor;
            inputElement.style.borderColor = "#4ade80"; // Green
            setTimeout(() => { inputElement.style.borderColor = oldBorderColor; }, 500);
            
        }, 1500);
    },

    refreshStats: function() {
        // Placeholder for the Python Automation later
        alert("Connecting to Python Backend... (Data Refresh Simulation)");
    },
    enableEdit: function(btnElement) {
        // Find the textarea in the same container
        const container = btnElement.closest('div').parentElement; // Goes up to the Right Column div
        const textarea = container.querySelector('textarea');
        
        // Remove Readonly
        textarea.removeAttribute('readonly');
        
        // Visual Focus
        textarea.focus();
        textarea.classList.add('bg-black/20', 'rounded', 'p-2'); // Darken background to show it's active
        
        // Change Button Text
        btnElement.innerHTML = "🔓 Editing...";
        btnElement.classList.add('text-yellow-300', 'border-yellow-500/50');
    },

    // 2. SEND THE REPLY
    submitSingleReply: function(btnElement) {
        // Find text
        const container = btnElement.closest('div').parentElement; 
        const textarea = container.querySelector('textarea');
        const textToSend = textarea.value;

        // Visual Feedback
        btnElement.innerHTML = "Sent!";
        btnElement.className = "px-3 py-1 rounded text-[10px] bg-green-500 text-white font-bold flex items-center gap-1";
        
        // Simulate API delay then remove row
        setTimeout(() => {
            const row = btnElement.closest('.group'); // The whole Left/Right row
            row.style.transition = "all 0.5s ease";
            row.style.transform = "translateX(50px)";
            row.style.opacity = "0";
            
            setTimeout(() => row.remove(), 500);
            
            // Console log for your testing
            console.log(`[LizGPT] Reply Sent: ${textToSend}`);
        }, 800);
    },
    submitSingleReply: function(btnElement) {
        // 1. Find the text inside the input next to the button
        const input = btnElement.previousElementSibling.querySelector('input');
        const replyText = input.value;

        // 2. Visual Feedback (Loading)
        const originalText = btnElement.innerText;
        btnElement.innerText = "✓";
        btnElement.classList.add('bg-green-500', 'scale-110');
        
        // 3. Simulate API Call
        setTimeout(() => {
            // In a real app, this sends data to Python
            console.log(`Sending Reply: "${replyText}"`);
            
            // 4. Remove the row (Task Done!)
            const row = btnElement.closest('.group');
            row.style.opacity = '0';
            setTimeout(() => row.remove(), 300); // Wait for fade out
            
            // Optional: Toast notification
            alert(`Replied: "${replyText}"`);
            
        }, 600);
    }
};

// Make it global so HTML buttons can see it if needed
window.Marketing = Marketing;