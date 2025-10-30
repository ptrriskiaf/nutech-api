import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  updateProfileImage,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);
router.put("/image", verifyToken, updateProfileImage);

export default router;
