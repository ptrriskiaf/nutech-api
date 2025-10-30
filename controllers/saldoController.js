import db from "../config/db.js";

export const getSaldo = async (req, res) => {
  try {
    const userId = req.user?.userId; // diambil dari payload JWT

    // 🧩 Cek user id valid
    if (!userId) {
      return res.status(401).json({
        status: 108,
        message: "Token tidak valid atau kadaluwarsa",
        data: null,
      });
    }

    // 🧩 Ambil saldo dari database, buang desimal langsung dari SQL
    const [rows] = await db.query(
      "SELECT ROUND(balance, 0) AS balance FROM balance WHERE user_id = ?",
      [userId]
    );

    // 🧩 Jika tidak ada saldo untuk user
    if (rows.length === 0) {
      return res.status(404).json({
        status: 109,
        message: "Saldo tidak ditemukan untuk user ini",
        data: null,
      });
    }

    // 🧩 Pastikan hasilnya angka bulat (tanpa koma)
    const balance = Number(rows[0].balance);

    // 🧩 Kirim response sukses
    return res.status(200).json({
      status: 0,
      message: "Get Balance Berhasil",
      data: {
        balance,
      },
    });
  } catch (error) {
    console.error("Error getSaldo:", error);

    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan server",
      data: null,
    });
  }
};
