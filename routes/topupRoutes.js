import express from "express";
import { topUp } from "../controllers/topupController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/topup
router.post("/", verifyToken, topUp);

export default router;
