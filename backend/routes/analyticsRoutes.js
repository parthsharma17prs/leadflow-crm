import express from "express";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8001";

// GET /api/v1/analytics/overview — Proxies FastAPI /leads/analytics
router.get("/overview", protect, async (req, res, next) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/leads/analytics`);
    const data = await response.json();
    return res.status(response.status).json({ success: response.ok, data });
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: "FastAPI microservice unreachable",
      error: err.message,
    });
  }
});

// POST /api/v1/analytics/score — Proxies FastAPI /leads/score
router.post("/score", protect, async (req, res, next) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/leads/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    return res.status(response.status).json({ success: response.ok, data });
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: "FastAPI microservice unreachable",
      error: err.message,
    });
  }
});

// GET /api/v1/analytics/scores — Proxies FastAPI /leads/scores/all
router.get("/scores", protect, async (req, res, next) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/leads/scores/all`);
    const data = await response.json();
    return res.status(response.status).json({ success: response.ok, data });
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: "FastAPI microservice unreachable",
      error: err.message,
    });
  }
});

// GET /api/v1/analytics/forecast — Proxies FastAPI /forecast/summary
router.get("/forecast", protect, async (req, res, next) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/forecast/summary`);
    const data = await response.json();
    return res.status(response.status).json({ success: response.ok, data });
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: "FastAPI microservice unreachable",
      error: err.message,
    });
  }
});

export default router;

