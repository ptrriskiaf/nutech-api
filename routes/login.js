import express from "express";
import db from "../config/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // validasi input
  if (!email || !password) {
    return res.status(400).json({ status: 102, message: "Email dan password wajib diisi" });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ status: 103, message: "User tidak ditemukan" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(400).json({ status: 104, message: "Password salah" });
    }

    // generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      status: 0,
      message: "Login berhasil",
      data: { token },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Terjadi kesalahan server" });
  }
});

export default router;
