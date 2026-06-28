import express from "express";
import { addPrayer, deletePrayer, clearAllPrayers } from "../services/sheets.js";

const router = express.Router();

// --------------------------------------------------
// ADD PRAYER
// --------------------------------------------------
router.post("/add", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Prayer text required" });
    }

    await addPrayer(text);

    res.json({ success: true });
  } catch (error) {
    console.error("Prayer route error:", error);
    res.status(500).json({ error: "Failed to add prayer" });
  }
});

// --------------------------------------------------
// CLEAR ALL
// --------------------------------------------------
router.post("/clear-all", async (req, res) => {
  try {
    await clearAllPrayers();
    res.json({ success: true });
  } catch (error) {
    console.error("Clear all prayers error:", error);
    res.status(500).json({ error: "Failed to clear prayers" });
  }
});


// --------------------------------------------------
// DELETE SINGLE PRAYER (by row number in column C)
// --------------------------------------------------
router.post("/delete", async (req, res) => {
  try {
    const { row } = req.body;

    if (!row) return res.status(400).json({ error: "Row required" });

    await deletePrayer(row);

    res.json({ success: true });
  } catch (error) {
    console.error("Delete prayer error:", error);
    res.status(500).json({ error: "Failed to delete prayer" });
  }
});

// --------------------------------------------------
// CLEAR ALL PRAYERS (C2 downward)
// --------------------------------------------------
router.post("/clear-all", async (req, res) => {
  try {
    await clearAllPrayers();
    res.json({ success: true });
  } catch (error) {
    console.error("Clear all prayers error:", error);
    res.status(500).json({ error: "Failed to clear all prayers" });
  }
});

export default router;
