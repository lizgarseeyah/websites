/* backend/routes/microsoft.js */
import express from "express";
import * as msService from "../services/microsoft.js";

const router = express.Router();

// GET: Fetch Today's Meetings
router.get("/meetings", async (req, res) => {
    try {
        const data = await msService.getMeetings();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Fetch Communications Pulse
router.get("/comms", async (req, res) => {
    try {
        const data = await msService.getCommsPulse();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Log Hours
router.post("/log-hours", async (req, res) => {
    try {
        const result = await msService.logWorkHours(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Create Dispatch
router.post("/dispatch", async (req, res) => {
    try {
        const result = await msService.createDispatch(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;