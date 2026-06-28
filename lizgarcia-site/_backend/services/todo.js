import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

/* ------------------------------------------
   GOOGLE SHEETS CLIENT
------------------------------------------- */
export function getSheetClient() {
  return google.sheets({
    version: "v4",
    auth: new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    ),
  });
}

const SPREADSHEET_ID = process.env.SHEET_ID;
const TASK_TAB = "TaskBoard";

/* ------------------------------------------
   GET TASKS  (returns an ARRAY)
------------------------------------------- */
export async function getTasks() {
  const sheets = getSheetClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TASK_TAB}!A2:E`,
  });

  const rows = res.data.values || [];

  // Convert rows → tasks array
  const tasks = rows
    .map((row, i) => ({
      id: i + 2,                     // row number in sheet
      title: row[0] || "(No Title)",
      level: normalizeLevel(row[1]),
      time: row[2] || "",
      dueDate: normalizeDate(row[3]),
      notes: row[4] || "",
    }))
    .filter(t => ["1", "2", "3"].includes(t.level));

  return tasks;  // IMPORTANT: return array, NOT { tasks: [...] }
}

function normalizeLevel(raw) {
  if (!raw) return "3"; // default queue
  const text = raw.toString().toLowerCase();
  if (text.includes("1")) return "1";
  if (text.includes("2")) return "2";
  if (text.includes("3")) return "3";
  return "3";
}

function normalizeDate(raw) {
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (!isNaN(Date.parse(raw)))
    return new Date(raw).toISOString().slice(0, 10);
  return "";
}

/* ------------------------------------------
   ADD TASK (writes to A–E)
------------------------------------------- */
export async function addTask(task) {
  const sheets = getSheetClient();

  const values = [
    [
      task.title,     // A
      task.level,     // B
      task.time,      // C
      task.dueDate,   // D
      task.notes      // E
    ]
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TASK_TAB}!A:E`,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  return { success: true };
}

/* ------------------------------------------
   COMPLETE TASK (move to G–I)
------------------------------------------- */
export async function completeTask(rowNumber, taskTitle) {
  const sheets = getSheetClient();

  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
  });

  // Write completion info
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TASK_TAB}!G${rowNumber}:I${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[taskTitle, "Completed", timestamp]],
    },
  });

  // Clear original row
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TASK_TAB}!A${rowNumber}:E${rowNumber}`,
  });

  return { success: true };
}
