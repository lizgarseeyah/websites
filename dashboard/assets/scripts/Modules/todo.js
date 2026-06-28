/* ============================================================
   TODO MODULE — Kanban Board + Modal + Sheets Sync
   ============================================================ */

const API_BASE = "http://localhost:5001/api/todo";

const Todo = {
    deleteHistory: [],   // 🔥 stores previously deleted tasks
    tasks: [],
    draggedId: null,
    editingTask: null,
    lastDeleted: [],

    /* -----------------------------------------
       INIT
    ------------------------------------------ */
    async init() {
        console.log("✓ Todo Module Loaded");

        await this.loadTasks();
        this.bindDragColumns();

        const addBtn = document.getElementById("add-task-btn");
        if (addBtn) addBtn.onclick = () => this.openAddModal();

        // Delete Selected Button
        const delSelBtn = document.getElementById("delete-selected-btn");
        if (delSelBtn) delSelBtn.onclick = () => this.deleteSelectedTasks();
    },

    /* -----------------------------------------
       LOAD TASKS
    ------------------------------------------ */
    async loadTasks() {
        try {
            const res = await fetch(API_BASE);

            if (!res.ok) throw new Error("Backend unavailable");

            const data = await res.json();
            this.tasks = Array.isArray(data) ? data : [];

        } catch (err) {
            console.warn("⚠ Backend offline — empty tasks");
            this.tasks = [];
        }

        this.render();
    },

    /* -----------------------------------------
       RENDER KANBAN COLUMNS
    ------------------------------------------ */
    render() {
        ["1", "2", "3"].forEach(level => {
            const col = document.querySelector(`#col-${level}`);
            if (col) col.innerHTML = "";
        });

        this.tasks.forEach(task => {
            const column = document.querySelector(`#col-${task.level}`);
            if (!column) return;

            const card = this.createTaskCard(task);
            column.appendChild(card);
        });
    },

    /* -----------------------------------------
       CREATE TASK CARD
    ------------------------------------------ */
    createTaskCard(task) {
        const card = document.createElement("div");
        card.className = `task-card level-${task.level}`;
        card.draggable = true;
        card.dataset.row = task.rowNumber;

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="font-semibold text-white text-lg">${task.title}</div>
                <input type="checkbox" class="task-select-checkbox" data-row="${task.rowNumber}"
                    onclick="event.stopPropagation();">
            </div>

            <div class="text-xs text-gray-400 mt-1">${task.notes || ""}</div>

            <div class="flex justify-between text-xs text-gray-500 mt-2">
                <span>📅 ${task.dueDate || "—"}</span>
                <span>⏱ ${task.time || 0} min</span>
            </div>
        `;

        card.onclick = () => this.openEditModal(task);

        card.addEventListener("dragstart", () => {
            this.draggedId = task.rowNumber;
            card.classList.add("dragging");
        });

        card.addEventListener("dragend", () => {
            this.draggedId = null;
            card.classList.remove("dragging");
        });

        return card;
    },

    /* -----------------------------------------
       DRAG & DROP HANDLERS
    ------------------------------------------ */
    bindDragColumns() {
        document.querySelectorAll(".kanban-dropzone").forEach(col => {
            col.addEventListener("dragover", e => {
                e.preventDefault();
                col.classList.add("drag-over");
            });

            col.addEventListener("dragleave", () => {
                col.classList.remove("drag-over");
            });

            col.addEventListener("drop", async () => {
                col.classList.remove("drag-over");

                const newLevel = col.parentElement.dataset.level;
                await this.moveTask(this.draggedId, newLevel);
            });
        });
    },

    async moveTask(rowNumber, newLevel) {
        if (!rowNumber) return;

        await fetch(`${API_BASE}/move/${rowNumber}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ level: newLevel })
        });

        await this.loadTasks();
    },

    /* -----------------------------------------
       ADD NEW TASK
    ------------------------------------------ */
    openAddModal() {
        this.editingTask = null;

        document.getElementById("task-delete-btn").classList.add("hidden");
        document.getElementById("task-save-btn").innerText = "Add Task";

        document.getElementById("task-title").value = "";
        document.getElementById("task-level").value = "3";
        document.getElementById("task-due-date").value = "";
        document.getElementById("task-time").value = "";
        document.getElementById("task-notes").value = "";

        document.getElementById("task-modal-title").innerText = "Add New Task";
        document.getElementById("task-save-btn").onclick = () => this.saveNewTask();

        document.getElementById("task-modal-bg").classList.remove("hidden");
    },

    async saveNewTask() {

        const body = {
            title: document.getElementById("task-title").value,
            level: document.getElementById("task-level").value,
            time: document.getElementById("task-time").value,
            dueDate: document.getElementById("task-due-date").value,
            notes: document.getElementById("task-notes").value
        };

        console.log("Saving Task:", body);

        await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        // 🔥 NEW: Confirmation AFTER task is saved
        this.showToast("Task added successfully!");

        this.closeModal();
        await this.loadTasks();
    },

    /* -----------------------------------------
       EDIT TASK
    ------------------------------------------ */
    openEditModal(task) {
        this.editingTask = task;
        document.getElementById("task-delete-btn").classList.remove("hidden");
        // Required fields that exist in your HTML
        document.getElementById("task-title").value = task.title || "";
        document.getElementById("task-level").value = task.level || "3";
        document.getElementById("task-due-date").value = task.dueDate || "";
        document.getElementById("task-time").value = task.time || "";
        document.getElementById("task-notes").value = task.notes || "";

        // Update modal text + button behavior
        document.getElementById("task-modal-title").innerText = "Edit Task";
        document.getElementById("task-save-btn").onclick = () => this.saveTaskEdits();

        // Open modal
        document.getElementById("task-modal-bg").classList.remove("hidden");
    },

    async saveTaskEdits() {
        // --- Confirmation before saving edits ---
        const confirmEdit = window.confirm("Save changes to this task?");
        if (!confirmEdit) return;

        const task = this.editingTask;

        const updated = {
            rowNumber: task.rowNumber,
            title: document.getElementById("task-title").value,
            level: document.getElementById("task-level").value,
            time: document.getElementById("task-time").value,
            dueDate: document.getElementById("task-due-date").value,
            notes: document.getElementById("task-notes").value
        };

        await fetch(`${API_BASE}/${task.rowNumber}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });

        this.closeModal();
        await this.loadTasks();
    },

    /* -----------------------------------------
       DELETE TASK
    ------------------------------------------ */
    async deleteTask() {
        if (!this.editingTask) return;

        // ⭐ Save task to history BEFORE deleting
        this.deleteHistory = [ this.editingTask ];

        // Store deleted task for undo
        this.lastDeleted = [ this.editingTask ];

        await fetch(`${API_BASE}/${this.editingTask.rowNumber}`, {
            method: "DELETE"
        });

        this.closeModal();
        await this.loadTasks();
        this.showUndo();
    },
    /* -----------------------------------------
            DELETE ALL TASKS
    ------------------------------------------ */
async deleteAllTasks() {

    try {
        const res = await fetch(`${API_BASE}/delete-all`, {
            method: "DELETE"
        });

        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }

        // Save everything before deleting
        this.lastDeleted = [...this.tasks];

        await this.loadTasks();
        this.showToast("All tasks deleted", "error");

    } catch (err) {
        console.error("Delete all failed:", err);
        this.showToast("Could not delete tasks", "error");
    }
},

    async completeTask(rowNumber) {
        await fetch(`${API_BASE}/${rowNumber}`, { method: "DELETE" });
        await this.loadTasks();
        this.showUndo();
    },

    /* -----------------------------------------
    DELETE SELECTED TASKS
    ------------------------------------------ */
    async deleteSelectedTasks() {

        const selected = Array.from(
            document.querySelectorAll(".task-select-checkbox")
        )
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.row);

        if (selected.length === 0) {
            alert("No tasks selected.");
            return;
        }

        const confirmed = window.confirm(`Delete ${selected.length} selected task(s)?`);
        if (!confirmed) return;

        // ⭐ Save deleted tasks to history BEFORE deleting
        this.deleteHistory = this.tasks.filter(t => selected.includes(String(t.rowNumber)));

        // Delete each selected
        // Save deleted items BEFORE deleting
        this.lastDeleted = this.tasks.filter(t => selected.includes(String(t.rowNumber)));

        for (const row of selected) {
            await fetch(`${API_BASE}/${row}`, { method: "DELETE" });
        }

        await this.loadTasks();
        this.showUndo();
    },

    async undo() {
        if (!this.lastDeleted || this.lastDeleted.length === 0) {
            this.showToast("Nothing to undo", "warning");
            return;
        }

        // Restore each task
        for (const task of this.lastDeleted) {
            const restoreBody = {
                title: task.title,
                level: task.level,
                time: task.time,
                dueDate: task.dueDate,
                notes: task.notes
            };

            await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(restoreBody)
            });
        }

        this.lastDeleted = []; // Clear history
        this.showToast("Undo restored your tasks!", "success");

        // UI refresh
        const bar = document.getElementById("undo-snackbar");
        const btn = document.getElementById("undo-btn");
        if (bar) bar.classList.add("hidden");
        if (btn) btn.classList.add("hidden");

        await this.loadTasks();
    },
    
    showUndo() {
        document.getElementById("undo-snackbar")?.classList.remove("hidden");
        document.getElementById("undo-btn")?.classList.remove("hidden");

        setTimeout(() => {
            document.getElementById("undo-snackbar")?.classList.add("hidden");
        }, 5000);
    },

    showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const colors = {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-blue-600",
        warning: "bg-yellow-400 text-black"
    };

    const toast = document.createElement("div");
    toast.className = `${colors[type]} text-white px-4 py-2 rounded shadow-lg animate-fade-in`;
    toast.innerText = message;

    container.appendChild(toast);

    // Remove toast
    setTimeout(() => {
        toast.classList.add("animate-fade-out");
        setTimeout(() => toast.remove(), 300);
        }, 2500);
    },

    closeModal() {
        document.getElementById("task-modal-bg").classList.add("hidden");
        this.editingTask = null;
    },

    speechToText() {
        alert("Speech-to-text coming soon.");
    }
};

window.Todo = Todo;
export { Todo };
