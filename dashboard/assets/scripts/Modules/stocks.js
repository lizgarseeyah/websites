// ======================================================
// STOCKS DASHBOARD MODULE
// ======================================================

export function initStocks() {
    console.log("📈 Stocks module loaded.");

    setupButtons();

    // Load data after page becomes visible
    setTimeout(() => {
        loadPortfolio();
        loadMarketNews();
        loadXFeed();
    }, 150);
}

/* ------------------------------------------------------
   1. Load portfolio holdings from backend
------------------------------------------------------ */
async function loadPortfolio() {
    try {
        const res = await fetch("http://localhost:5001/api/stocks/portfolio");
        const data = await res.json();

        if (!data.success) {
            console.error("Error loading portfolio", data.error);
            return;
        }

        const rows = data.data;
        renderHoldingsTable(rows);
        attachRowClickEvents(rows);

    } catch (err) {
        console.error("❌ Portfolio fetch error:", err);
    }
}

/* ------------------------------------------------------
   2. Render the holdings table dynamically
------------------------------------------------------ */
function renderHoldingsTable(rows) {
    const tableBody = document.getElementById("holdingsTableBody");
    if (!tableBody) {
        console.warn("Holdings table not found. Page not ready.");
        return;
    }

    tableBody.innerHTML = "";

    rows.forEach((item, index) => {
        tableBody.innerHTML += `
            <tr class="hover:bg-white/5 cursor-pointer" data-index="${index}">
                <td class="px-4 py-3">${item.ticker || "-"}</td>
                <td class="px-4 py-3">${item.assetType || "-"}</td>
                <td class="px-4 py-3">${item.quantity || 0}</td>
                <td class="px-4 py-3">$${(item.currentPrice || 0).toLocaleString()}</td>
                <td class="px-4 py-3">$${(item.totalInvestment || 0).toLocaleString()}</td>
                <td class="px-4 py-3">$${(item.marketValue || 0).toLocaleString()}</td>
                <td class="px-4 py-3">$${(item.gain || 0).toLocaleString()}</td>
                <td class="px-4 py-3">${item.gainPct != null ? (item.gainPct * 100).toFixed(2) + "%" : "-"}</td>
            </tr>
        `;
    });
}

/* ------------------------------------------------------
   3. Clicking a row updates the chart
------------------------------------------------------ */
function attachRowClickEvents(rows) {
    const tableBody = document.getElementById("holdingsTableBody");

    tableBody.querySelectorAll("tr").forEach((row) => {
        row.addEventListener("click", (e) => {
            // Ignore clicks on the "Trade" button
            if (e.target.innerText === "Trade") return;

            const index = row.dataset.index;
            const item = rows[index];

            logAutomation(`Updating chart for ${item.ticker}...`);
            updateChart(item);
        });
    });
}

/* ------------------------------------------------------
   4. Update chart to selected ticker
------------------------------------------------------ */
function updateChart(item) { 
    const ctx = document.getElementById("stocksChart").getContext("2d");

    // Destroy existing chart before drawing a new one
    if (window.portfolioChart) {
        window.portfolioChart.destroy();
    }

    // Placeholder chart data (replace with backend later)
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const values = [
        item.marketValue * 0.97,
        item.marketValue * 0.99,
        item.marketValue * 1.01,
        item.marketValue * 1.03,
        item.marketValue
    ];

    window.portfolioChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: `${item.ticker} Value`,
                data: values,
                borderColor: "#6366f1",
                borderWidth: 2,
                tension: 0.4,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: { ticks: { color: "#aaa" } },
                x: { ticks: { color: "#aaa" } }
            }
        }
    });
}

/* ------------------------------------------------------
   5. Setup Buttons (Run Screener + Execute Trades)
------------------------------------------------------ */
function setupButtons() {
    const outputBox = document.getElementById("automationOutput");  // FIXED ID

    if (!outputBox) {
        console.warn("automationOutput box not found.");
        return;
    }

    // Run Screener
    const runBtn = document.getElementById("runScreenerBtn");
    if (runBtn) {
        runBtn.addEventListener("click", async () => {
            logAutomation("Running screener...");
            outputBox.classList.remove("hidden");
            outputBox.innerHTML = "Running screener...";

            try {
                const res = await fetch("http://localhost:5001/api/stocks/screener", { method: "POST" });
                const data = await res.json();

                outputBox.innerHTML = `<pre>${data.output}</pre>`;
                logAutomation("Screener completed.");

            } catch (err) {
                outputBox.innerHTML = `<span class="text-red-400">${err}</span>`;
                logAutomation("Screener failed.");
            }
        });
    }

    // Execute Trades
    const execBtn = document.getElementById("executeTradesBtn");
    if (execBtn) {
        execBtn.addEventListener("click", async () => {
            logAutomation("Executing proposed trades...");
            outputBox.classList.remove("hidden");
            outputBox.innerHTML = "Executing trades...";

            try {
                const res = await fetch("http://localhost:5001/api/stocks/execute", { method: "POST" });
                const data = await res.json();

                outputBox.innerHTML = `<pre>${data.output}</pre>`;
                logAutomation("Trades executed.");

            } catch (err) {
                outputBox.innerHTML = `<span class="text-red-400">${err}</span>`;
                logAutomation("Trade execution failed.");
            }
        });
    }
}

/* ------------------------------------------------------
   6. Load Market News
------------------------------------------------------ */
async function loadMarketNews() {
    const container = document.getElementById("marketNewsContainer");
    if (!container) return;

    container.innerHTML = "Loading news...";

    try {
        const res = await fetch("http://localhost:5001/api/stocks/news");
        const data = await res.json();

        if (!data.success) {
            container.innerHTML = "Failed to load news.";
            return;
        }

        const news = data.news;
        container.innerHTML = "";

        news.forEach(item => {
            const div = document.createElement("div");
            div.className = "text-xs border-b border-white/5 pb-2";

            div.innerHTML = `
                <span class="font-bold ${
                    item.source === 'Coindesk' ? 'text-green-400' :
                    item.source === 'Bloomberg' ? 'text-blue-400' :
                    'text-indigo-400'
                }">${item.source.toUpperCase()}</span>
                <span class="text-gray-500 ml-1">${formatTime(item.time)}</span>
                <p class="text-gray-300 mt-1 hover:text-white cursor-pointer" onclick="window.open('${item.link}', '_blank')">
                    ${item.title}
                </p>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        container.innerHTML = "Error loading news.";
        console.error(err);
    }
}

/* ------------------------------------------------------
   Helpers
------------------------------------------------------ */
function formatTime(dateString) {
    const date = new Date(dateString);
    if (!date || isNaN(date)) return "";

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

function logAutomation(message) {
    const out = document.getElementById("automationOutput");
    const entry = document.createElement("div");
    entry.className = "mb-1";
    entry.textContent = `• ${message}`;
    out.appendChild(entry);
    out.scrollTop = out.scrollHeight;
}
async function loadXFeed() {
    const container = document.getElementById("xfeedContainer");
    if (!container) return;

    container.innerHTML = "<div class='text-gray-500'>Loading X data...</div>";

    try {
        const res = await fetch("http://localhost:5001/api/stocks/twitter");
        const { feed } = await res.json();

        container.innerHTML = "";

        feed.forEach(user => {
            const header = document.createElement("div");
            header.className = "text-indigo-400 font-bold mt-2";
            header.textContent = "@" + user.username;
            container.appendChild(header);

            user.tweets.forEach(t => {
                const div = document.createElement("div");
                div.className =
                    "p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer";

                div.innerHTML = `
                    <div class="text-gray-300">${t.text}</div>
                    <div class="text-gray-500 text-[10px] mt-1">
                        ${new Date(t.created_at).toLocaleString()}
                    </div>
                `;

                div.onclick = () =>
                    window.open(`https://x.com/${user.username}/status/${t.id}`, "_blank");

                container.appendChild(div);
            });
        });

    } catch (err) {
        container.innerHTML = `<div class="text-red-400">Failed to load X feed.</div>`;
    }
}
