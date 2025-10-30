import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        status: 102,
        message: "Parameter tidak lengkap / format salah",
      });
    }

    // Cek apakah email sudah digunakan
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ status: 103, message: "Email sudah terdaftar" });
    }

    // Default profile image
    const defaultProfileImage = "https://api-doc-tht.nutech-integrasi.com/images/default_profile.jpg";

    // Simpan user baru
    const [result] = await db.query(
      "INSERT INTO users (email, password, first_name, last_name, profile_image) VALUES (?, ?, ?, ?, ?)",
      [email, password, first_name, last_name, defaultProfileImage]
    );

    // 🔥 Tambahan baru: buat saldo awal 0 untuk user baru
    const userId = result.insertId;
    await db.query("INSERT INTO balance (user_id, balance) VALUES (?, 0)", [userId]);

    return res.status(201).json({
      status: 0,
      message: "Registrasi berhasil",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};


// === LOGIN ===
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek user di database
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.status(400).json({
        status: 105,
        message: "Email tidak ditemukan",
        data: null,
      });
    }

    // Bandingkan password biasa (tanpa bcrypt)
    if (password !== user[0].password) {
      return res.status(400).json({
        status: 106,
        message: "Password salah",
        data: null,
      });
    }

    // Buat token JWT
    const token = jwt.sign(
      { userId: user[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: 0,
      message: "Login berhasil",
      data: { token },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};
