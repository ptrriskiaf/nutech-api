import db from "../config/db.js";
import fs from "fs";
import path from "path";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await db.query(
      "SELECT email, first_name, last_name, profile_image FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: 102, message: "User tidak ditemukan" });
    }

    return res.json({
      status: 0,
      message: "Get Profile Berhasil",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { first_name, last_name } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({
        status: 102,
        message: "Parameter tidak lengkap / format salah",
      });
    }

    await db.query(
      "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?",
      [first_name, last_name, userId]
    );

    res.json({
      status: 0,
      message: "Update Profile berhasil",
      data: { first_name, last_name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { profile_image } = req.body;

    if (!profile_image) {
      return res.status(400).json({
        status: 102,
        message: "Parameter tidak lengkap / format salah",
      });
    }

    // Simpan image ke folder lokal (opsional)
    const imgBuffer = Buffer.from(profile_image, "base64");
    const filePath = path.join("uploads", `profile_${userId}.jpg`);

    fs.writeFileSync(filePath, imgBuffer);

    await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [filePath, userId]);

    res.json({
      status: 0,
      message: "Update Profile Image berhasil",
      data: { profile_image: filePath },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};
