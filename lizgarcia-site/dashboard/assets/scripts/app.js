// ==============================
//  APP.JS — FINAL WORKING VERSION
// ==============================

// IMPORT MODULES
import { initChat } from "./Modules/chat.js";
import { initJobs } from "./Modules/OE.js";
import { initStocks } from "./Modules/stocks.js";
import { initFuture } from "./Modules/future.js";
import { Todo } from "./Modules/todo.js";
import { initializeJobToolbar } from "./Modules/OE.js";
// ⭐ IMPORT SPIRITUALITY MODULE ⭐
import { Spirituality } from "./Modules/spirituality.js";
import { Marketing } from './Modules/contentcreator.js';
import { Microsoft } from './Modules/microsoft.js';
// ==============================
// PAGE NAVIGATION
// ==============================
export function showPage(pageId) {
    const pages = document.querySelectorAll('[id^="page-"]');
    pages.forEach(page => {
        page.classList.add("hidden-page");
        page.classList.remove("visible-page");
    });

    const active = document.getElementById(`page-${pageId}`);
    if (active) {
        active.classList.remove("hidden-page");
        active.classList.add("visible-page");
    }

    // ⭐ Page-specific logic goes here
    if (pageId === "detail-stocks") {
        console.log("📈 Stocks page is now visible, initializing...");
        setTimeout(() => initStocks(), 150);
    }

    lucide.createIcons();
}

window.showPage = showPage;

// ==============================
// INITIALIZE EVERYTHING
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    // Initialize other modules
    initChat?.();
    initJobs?.();
    initStocks?.();
    initFuture?.();
    initializeJobToolbar();
    Marketing.init();
    Microsoft.init();

    // ⭐ Initialize Todo ONLY if the TaskBoard exists
    if (document.getElementById("task-modal-bg")) {
        console.log("✓ TaskBoard detected — loading Todo module");
        Todo.init();
    } else {
        console.log("✗ Not on TaskBoard — skipping Todo module");
    }

    // ⭐ Initialize Spirituality Module ⭐
    Spirituality.init();

    // Icons + default page
    lucide.createIcons();
    showPage("dashboard");
});


