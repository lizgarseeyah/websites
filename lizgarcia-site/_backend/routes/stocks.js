import express from "express";
import {
  getPortfolio,
  runScreener,
  executeTrades,
  getMarketNews,
  getTwitterFeed
} from "../services/stocks.js";

const router = express.Router();

/* -------------------------------------------
   GET PORTFOLIO
-------------------------------------------- */
router.get("/portfolio", async (req, res) => {
  try {
    const data = await getPortfolio();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

/* -------------------------------------------
   RUN SCREENER
-------------------------------------------- */
router.post("/screener", async (req, res) => {
  try {
    const output = await runScreener();
    res.json({ success: true, output });
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

/* -------------------------------------------
   EXECUTE TRADES
-------------------------------------------- */
router.post("/execute", async (req, res) => {
  try {
    const output = await executeTrades();
    res.json({ success: true, output });
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

/* -------------------------------------------
   MARKET NEWS
-------------------------------------------- */
router.get("/news", async (req, res) => {
  try {
    const news = await getMarketNews();
    res.json({ success: true, news });
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

/* -------------------------------------------
   TWITTER FEED
-------------------------------------------- */
router.get("/twitter", async (req, res) => {
  try {
    const feed = await getTwitterFeed();
    res.json({ success: true, feed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

export default router;
