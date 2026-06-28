import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

function getSheetsClient() {
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
const TAB = "TaskBoard";

/* ------------------------------------------
   GET TASKS (Reads A–G)
------------------------------------------- */
export async function getTasks() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A2:G`,
  });

  const rows = res.data.values || [];

  return rows.map((row, i) => ({
    id: row[0] || String(i + 2),  // ID column
    title: row[1] || "(No Title)",
    level: row[2] || "3",
    allotted: row[3] || "",
    time: row[4] || "",
    dueDate: row[5] || "",
    notes: row[6] || "",
    rowNumber: i + 2
  }));
}

/* ------------------------------------------
   ADD TASK (Append new row)
------------------------------------------- */
export async function addTask(task) {
  const sheets = getSheetsClient();

  // generate a unique ID 
  const id = Date.now().toString();

  const values = [
    [
      id,               // A: ID
      task.title,       // B
      task.level,       // C
      task.allotted || "",
      task.time || "",
      task.dueDate || "",
      task.notes || ""
    ]
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A:G`,
    valueInputOption: "RAW",
    requestBody: { values }
  });

  return { success: true, id };
}

/* ------------------------------------------
   EDIT TASK (Update row)
------------------------------------------- */
export async function updateTask(row, task) {
  const sheets = getSheetsClient();

  const values = [
    [
      task.id,
      task.title,
      task.level,
      task.allotted || "",
      task.time || "",
      task.dueDate || "",
      task.notes || ""
    ]
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A${row}:G${row}`,
    valueInputOption: "RAW",
    requestBody: { values }
  });

  return { success: true };
}

/* ------------------------------------------
   MOVE TASK (update only Level column)
------------------------------------------- */
export async function moveTask(row, newLevel) {
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!C${row}`,
    valueInputOption: "RAW",
    requestBody: { values: [[newLevel]] },
  });

  return { success: true };
}

/* ------------------------------------------
   DELETE TASK (Clear row A–G)
------------------------------------------- */
export async function deleteTask(row) {
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A${row}:G${row}`,
  });

  return { success: true };
}

/* ------------------------------------------
   DELETE ALL TASKS  (Clear rows A–G except header)
------------------------------------------- */
export async function clearAllTasks() {
  const sheets = getSheetsClient();

  // Clear rows 2 through 999 (your content area)
await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: "TaskBoard!A2:G",
});


  return { success: true };
}

// 🔴 NEW: delete ALL tasks (rows 2+ in columns A–G)
export async function deleteAllTasks() {
  const sheets = getSheetsClient();        // ✅ add this
  const range = `${TAB}!A2:G`;            

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,         // ✅ use correct constant
    range
  });

  return { success: true };
}

