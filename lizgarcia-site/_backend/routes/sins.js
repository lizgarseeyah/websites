import express from "express";
import { addSin, clearSins, getSinState } from "../services/sheets.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    console.log("🔥 /add route hit with body:", req.body);

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing sin text" });

    await addSin(text);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ ERROR in /add route:", err);
    res.status(500).json({ error: "Failed to submit sin" });
  }
});

router.post("/clear", async (_req, res) => {
  try {
    await clearSins();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ ERROR in /clear route:", err);
    res.status(500).json({ error: "Failed to clear sins" });
  }
});

router.get("/state", async (_req, res) => {
  try {
    const state = await getSinState();
    res.json({ state });
  } catch (err) {
    console.error("❌ ERROR in /state route:", err);
    res.status(500).json({ error: "Failed to get state" });
  }
});

export default router;
