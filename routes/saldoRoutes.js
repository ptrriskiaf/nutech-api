import express from "express";
import { getSaldo } from "../controllers/saldoController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/saldo
router.get("/", verifyToken, getSaldo);

export default router;
