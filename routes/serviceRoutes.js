import express from "express";
import { getAllServices } from "../controllers/serviceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get('/', verifyToken, getAllServices);
  
  

export default router;
