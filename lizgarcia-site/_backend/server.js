import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

import sinsRoutes from "./routes/sins.js";
import prayerRoutes from "./routes/prayer.js";
import todoRoutes from "./routes/todo.js";
import stocksRouter from "./routes/stocks.js"

const app = express();
// Resolve backend folder path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend folder explicitly
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("Loaded ENV:", {
  SPREADSHEET_ID: process.env.SPREADSHEET_ID,
  TAB_STOCKS: process.env.TAB_STOCKS,
});

app.use(cors());
app.use(express.json());

app.use("/api/sins", sinsRoutes);
app.use("/api/prayer", prayerRoutes);
app.use("/api/todo", todoRoutes);
app.use("/api/stocks", stocksRouter);
app.use("/api/microsoft", microsoftRouter); // <--- ADD THIS
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});