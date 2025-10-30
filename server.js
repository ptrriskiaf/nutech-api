import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from './routes/authRoutes.js';
import saldoRoutes from "./routes/saldoRoutes.js";
import transaksiRoutes from "./routes/transaksiRoutes.js";
import topupRoutes from "./routes/topupRoutes.js";
import db from './config/db.js'; 
import loginRoutes from "./routes/login.js";
import serviceRoutes from './routes/serviceRoutes.js'; 
import profileRoutes from "./routes/profileRoutes.js";


dotenv.config();
const app = express();

const testConnection = async () => {
    try {
      const [rows] = await db.query("SELECT 1");
      console.log("✅ Database connected!");
    } catch (err) {
      console.error("❌ Database connection failed:", err.message);
    }
  };
  testConnection();

app.use(bodyParser.json());

// Routes
app.use("/", authRoutes);
app.use("/balance", saldoRoutes);         // GET /balance
app.use("/topup", topupRoutes);           // POST /topup
app.use("/transaction", transaksiRoutes); // POST /transaction, GET /transaction/history
app.use("/services", serviceRoutes);
app.use("/profile", profileRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
