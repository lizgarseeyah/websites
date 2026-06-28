import dotenv from "dotenv";
dotenv.config();

import Parser from "rss-parser";
const parser = new Parser();

import { google } from "googleapis";
import axios from "axios";

/* ---------------------------------------------------
   GOOGLE SHEETS CONFIG — restored to your old setup
--------------------------------------------------- */
const sheets = google.sheets({
  version: "v4",
  auth: new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  })
});

// YOUR ORIGINAL .env VARIABLES
const SPREADSHEET_ID = process.env.SHEET_ID;       // <-- your actual variable
const TAB = process.env.TAB_STOCKS;                // <-- "StockTracker"

/* ---------------------------------------------------
   1. GET PORTFOLIO
--------------------------------------------------- */
export async function getPortfolio() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB}!A3:H`
    });

    const rows = res.data.values || [];

  return rows.map((row) => ({
    ticker: row[0],
    assetType: row[1],
    quantity: Number(row[2]),
    currentPrice: Number(row[3]),
    totalInvestment: Number(row[4]),
    marketValue: Number(row[5]),
    gain: Number(row[6]),
    gainPct: Number(row[7])
  }));

  } catch (err) {
    console.error("❌ Error loading portfolio:", err);
    throw err;
  }
}

/* ---------------------------------------------------
   2. Screener (placeholder)
--------------------------------------------------- */
export async function runScreener() {
  return "Screener placeholder";
}

/* ---------------------------------------------------
   3. Trades (placeholder)
--------------------------------------------------- */
export async function executeTrades() {
  return "Trade execution placeholder";
}

/* ---------------------------------------------------
   4. MARKET NEWS (includes Techmeme)
--------------------------------------------------- */
export async function getMarketNews() {
  const feeds = [
    { name: "CNBC Markets", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
    { name: "Coindesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
    { name: "Bloomberg", url: "https://www.bloomberg.com/feeds/podcasts/etf-report.xml" },
    { name: "Techmeme", url: "https://www.techmeme.com/feed.xml" }
  ];

  let allNews = [];

  for (const feed of feeds) {
    try {
      const data = await parser.parseURL(feed.url);
      const items = (data.items || []).slice(0, 6).map((item) => ({
        source: feed.name,
        title: item.title,
        link: item.link,
        time: item.pubDate
      }));

      allNews = allNews.concat(items);
    } catch (err) {
      console.error(`❌ Failed to load ${feed.name}:`, err.message);
    }
  }

  return allNews;
}

/* ---------------------------------------------------
   5. X / TWITTER FEED
--------------------------------------------------- */
export async function getTwitterFeed() {
  try {
    const bearer = process.env.X_BEARER_TOKEN;
    if (!bearer) throw new Error("Missing X_BEARER_TOKEN in .env");

    const usernames = ["pelositracker", "MilkRoad"];
    const results = [];

    for (const username of usernames) {

      // 1. Get User ID
      const userRes = await axios.get(
        `https://api.x.com/2/users/by/username/${username}`,
        {
          headers: { Authorization: `Bearer ${bearer}` }
        }
      );

      const userId = userRes.data.data?.id;
      if (!userId) continue;

      // 2. Get Recent Tweets for user
      const tweetRes = await axios.get(
        `https://api.x.com/2/users/${userId}/tweets?max_results=10`,
        {
          headers: { Authorization: `Bearer ${bearer}` }
        }
      );

      results.push({
        username,
        tweets: tweetRes.data.data || []
      });
    }

    return results;

  } catch (err) {
    console.error("❌ X FEED ERROR:", err.response?.data || err);
    return [];
  }
}

