import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createTransaction,
  getTransactionHistory,
  getTransactionDetail,
} from "../controllers/transaksiController.js";

const router = express.Router();

// sementara skip verifyToken biar bisa dites
const dummyAuth = (req, res, next) => {
  req.user = { userId: 1 }; // contoh user id manual
  next();
};

router.post("/", verifyToken, createTransaction);
router.get("/history", verifyToken, getTransactionHistory);
router.get("/:invoice_number", verifyToken, getTransactionDetail);


export default router;
