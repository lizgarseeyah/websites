import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

// --------------------------------------------------
// AUTH SETUP
// --------------------------------------------------
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

// Your sheet/tab name
const TAB = "RelationshipwGod";

export function getSheets() {
  return sheets.spreadsheets.values;
}

// --------------------------------------------------
// ADD A SIN (writes to first empty row starting at A4)
// --------------------------------------------------
export async function addSin(sinText) {
  const range = `${TAB}!A4:A1000`;

  // Read sins to find next available row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range
  });

  const rows = res.data.values || [];

  // A4 = row 4, so next row = 4 + number of existing rows
  const nextRow = 4 + rows.length;

  const writeRange = `${TAB}!A${nextRow}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: writeRange,
    valueInputOption: "RAW",
    requestBody: { values: [[sinText]] }
  });

  console.log(`✨ Added sin to row ${nextRow}`);
}

// --------------------------------------------------
// CLEAR ALL SINS (A4 downward)
// --------------------------------------------------
export async function clearSins() {
  try {
    const range = "RelationshipwGod!A4:A1000";

    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.SHEET_ID,
      range
    });

    console.log("🔥 Cleared sins from A4:A1000");
  } catch (err) {
    console.error("❌ ERROR clearing sins:", err);
    throw err;
  }
}

// --------------------------------------------------
// GET SPIRITUAL STATE (Grace if A4 is empty)
// --------------------------------------------------
export async function getSinState() {
  const range = `${TAB}!A4:A1000`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range
  });

  const rows = res.data.values || [];

  if (rows.length === 0) {
    console.log("🙏 State: Grace");
    return "Grace";
  }

  console.log("🔥 State: Condemnation");
  return "Condemnation";
}

// --------------------------------------------------
// PRAYERS — behave EXACTLY like Sins
// --------------------------------------------------

// Add a prayer (C2 downward, no row shifting)
export async function addPrayer(text) {
  const range = `RelationshipwGod!C2:C1000`;

  // Read existing prayers to find next empty row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range
  });

  const rows = res.data.values || [];

  // C2 = row 2 → next row = 2 + existing count
  const nextRow = 2 + rows.length;

  const writeRange = `RelationshipwGod!C${nextRow}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: writeRange,
    valueInputOption: "RAW",
    requestBody: { values: [[text]] }
  });

  console.log(`🙏 Added prayer to row ${nextRow}`);
  return { row: nextRow };
}

// Delete a single prayer (clear cell only)
export async function deletePrayer(rowNumber) {
  return sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.SHEET_ID,
    range: `RelationshipwGod!C${rowNumber}`
  });
}

export async function clearAllPrayers() {
  return sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.SHEET_ID,
    range: "RelationshipwGod!C2:C1000"
  });
}

