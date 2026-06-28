import express from "express";
import {
  getTasks,
  addTask,
  updateTask,
  moveTask,
  deleteTask,
  deleteAllTasks   // <-- IMPORTANT!
} from "../services/taskBoard.js";

const router = express.Router();

/* GET */
router.get("/", async (req, res) => {
  res.json(await getTasks());
});

/* POST */
router.post("/", async (req, res) => {
  res.json(await addTask(req.body));
});

/* UPDATE */
router.put("/:row", async (req, res) => {
  res.json(await updateTask(req.params.row, req.body));
});

/* MOVE COLUMN */
router.put("/move/:row", async (req, res) => {
  res.json(await moveTask(req.params.row, req.body.level));
});

// 🔴 NEW: DELETE ALL
router.delete("/delete-all", async (req, res) => {
  try {
    const result = await deleteAllTasks();
    res.json({ success: true, result });
  } catch (err) {
    console.error("Error in /api/todo/delete-all:", err);
    res.status(500).json({ error: "Failed to delete all tasks" });
  }
});

/* DELETE ONE */
router.delete("/:row", async (req, res) => {
  res.json(await deleteTask(req.params.row));
});

export default router;
