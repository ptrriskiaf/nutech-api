import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// ubah dari "/registration" ke "/"
router.post("/registration", register);
router.post("/login", login);

export default router;
