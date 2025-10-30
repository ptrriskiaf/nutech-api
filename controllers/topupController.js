import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const topUp = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { top_up_amount } = req.body;

    if (!top_up_amount || isNaN(top_up_amount) || Number(top_up_amount) <= 0) {
      return res.status(400).json({
        status: 102,
        message: "Parameter tidak lengkap / format salah",
      });
    }

    const topUpAmount = Number(top_up_amount);
    const invoiceNumber = "TOPUP-" + uuidv4().split("-")[0].toUpperCase();

    // pastikan user punya record saldo
    const [saldoRows] = await db.query("SELECT balance FROM balance WHERE user_id = ?", [userId]);
    if (saldoRows.length === 0) {
      await db.query("INSERT INTO balance (user_id, balance) VALUES (?, 0.00)", [userId]);
    }

    // update saldo
    await db.query(
      "UPDATE balance SET balance = ROUND(balance + ?, 2) WHERE user_id = ?",
      [topUpAmount, userId]
    );

    // ambil saldo terbaru
    const [updatedRows] = await db.query(
      "SELECT ROUND(balance, 0) AS balance FROM balance WHERE user_id = ?",
      [userId]
    );
    const newBalance = Number(updatedRows[0].balance);

    // simpan ke tabel topup
    await db.query(
      "INSERT INTO topup (user_id, top_up_amount, invoice_number, created_on) VALUES (?, ?, ?, NOW())",
      [userId, topUpAmount, invoiceNumber]
    );

    // simpan juga ke tabel transaction
    await db.query(
      "INSERT INTO transaction (invoice_number, transaction_type, amount, service_code, service_name, user_id, created_on) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [invoiceNumber, "TOPUP", topUpAmount, "TOPUP", "Top Up Balance", userId]
    );

    return res.status(200).json({
      status: 0,
      message: "Top Up Balance berhasil",
      data: { invoice_number: invoiceNumber, balance: newBalance },
    });
  } catch (error) {
    console.error("Top Up Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
