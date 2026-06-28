// ===============================
// JOBS — TOAST NOTIFICATIONS
// ===============================
export function showJobToast(message, undoCallback = null) {
    const container = document.getElementById("job-toast-container");
    const id = "job-toast-" + Date.now();

    const html = `
        <div id="${id}" class="job-toast min-w-[240px]">
            <span>${message}</span>
            ${
                undoCallback
                    ? `<button class="ml-3 text-indigo-300 hover:text-white transition"
                               onclick="(${undoCallback})(); document.getElementById('${id}').remove();">
                            Undo
                       </button>`
                    : ""
            }
        </div>
    `;

    container.insertAdjacentHTML("beforeend", html);

    setTimeout(() => {
        const toast = document.getElementById(id);
        if (toast) toast.remove();
    }, 3000);
}
// ===============================
// JOB MODEL
// ===============================
export function createJob({ jobTitle, company, roleLink, prepLink, status }) {
    return {
        id: "job-" + crypto.randomUUID(),
        dateCreated: new Date().toISOString(),

        jobTitle,
        company,
        roleLink,
        prepLink,

        status, // wishlist | applied | interview | offers | rejected
    };
}

// ===============================
// DELETE JOB + UNDO
// ===============================
export function deleteJob(jobId) {
    const index = jobs.findIndex(j => j.id === jobId);
    if (index === -1) return;

    const snapshot = { ...jobs[index] }; // Save for undo

    jobs.splice(index, 1);
    renderJobBoard(); // This will be created in Phase 2

    showJobToast("Job deleted", () => {
        jobs.splice(index, 0, snapshot);
        renderJobBoard();
    });
}

// ===============================
// JOB SELECTION HANDLERS
// ===============================

// Return array of selected jobs
export function getSelectedJobIds() {
    return [...document.querySelectorAll(".job-checkbox:checked")]
        .map(cb => cb.dataset.jobid);
}

// Bind toolbar actions
export function initializeJobToolbar() {
    document.getElementById("jobs-search-btn").onclick = () => {
        const ids = getSelectedJobIds();
        if (ids.length === 0) return showJobToast("No jobs selected");
        showJobToast("Searching…");
    };

    document.getElementById("jobs-apply-btn").onclick = () => {
        const ids = getSelectedJobIds();
        if (ids.length === 0) return showJobToast("No jobs selected");
        showJobToast("Applying to jobs…");
    };

    document.getElementById("jobs-followup-btn").onclick = () => {
        const ids = getSelectedJobIds();
        if (ids.length === 0) return showJobToast("No jobs selected");
        showJobToast("Marked for follow-up");
    };

    document.getElementById("jobs-delete-btn").onclick = () => {
        const ids = getSelectedJobIds();
        if (ids.length === 0) return showJobToast("No jobs selected");

        showJobToast("Jobs deleted", () => {
            // UNDO placeholder
        });
    };

    document.getElementById("jobs-prep-btn").onclick = () => {
        const ids = getSelectedJobIds();
        if (ids.length === 0) return showJobToast("No jobs selected");
        showJobToast("Opening interview prep…");
    };
}

export function initJobs() {
    console.log("OE module loaded (placeholder)");
}

export let jobs = [
    {
        id: "job-openai-1",
        dateCreated: "2025-01-15T14:22:00Z",
        jobTitle: "Product Manager",
        company: "OpenAI",
        roleLink: "https://openai.com/careers/product-manager",
        prepLink: "http://localhost:5001/prep/openai/pm",
        recruiterLastMsg: "Thanks Liz — we’ll reach out next week!",
        status: "wishlist"
    },
    {
        id: "job-google-1",
        dateCreated: "2025-01-10T10:02:00Z",
        jobTitle: "Product Manager",
        company: "Google",
        roleLink: "https://careers.google.com/jobs/results/pm/",
        prepLink: "http://localhost:5001/prep/google/pm",
        recruiterLastMsg: "Please complete the candidate questionnaire by Friday.",
        status: "applied"
    },
    {
        id: "job-vercel-1",
        dateCreated: "2025-01-09T18:10:00Z",
        jobTitle: "Developer Relations Engineer",
        company: "Vercel",
        roleLink: "https://vercel.com/careers/devrel-engineer",
        prepLink: "http://localhost:5001/prep/vercel/devrel",
        recruiterLastMsg: "Interview scheduled for Monday at 2 PM PST.",
        status: "interview"
    },
    {
        id: "job-startup-1",
        dateCreated: "2025-01-07T12:03:00Z",
        jobTitle: "Tech Lead",
        company: "Startup Inc",
        roleLink: "https://startup-inc.com/careers/techlead",
        prepLink: "http://localhost:5001/prep/startup/techlead",
        recruiterLastMsg: "Congrats again! Final contract review in progress.",
        status: "offers"
    },
    {
        id: "job-amazon-1",
        dateCreated: "2025-01-05T09:15:00Z",
        jobTitle: "Solutions Architect",
        company: "Amazon",
        roleLink: "https://amazon.jobs/solutions-architect",
        prepLink: "http://localhost:5001/prep/amazon/sa",
        recruiterLastMsg: "Unfortunately we decided not to move forward.",
        status: "rejected"
    }
];
