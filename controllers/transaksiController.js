// controllers/transaksiController.js
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// === CREATE TRANSACTION ===
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { service_code } = req.body;

    if (!service_code) {
      return res.status(400).json({
        status: 102,
        message: "Parameter service_code tidak boleh kosong",
        data: null,
      });
    }

    // Cek layanan
    const [services] = await db.query(
      "SELECT * FROM services WHERE service_code = ?",
      [service_code]
    );
    if (services.length === 0) {
      return res.status(400).json({
        status: 108,
        message: "Service code tidak ditemukan",
        data: null,
      });
    }

    const service = services[0];

    // Cek saldo
    const [saldoRows] = await db.query(
      "SELECT balance FROM balance WHERE user_id = ?",
      [userId]
    );
    const currentBalance = saldoRows.length > 0 ? Number(saldoRows[0].balance) : 0;

    if (currentBalance < service.service_tariff) {
      return res.status(400).json({
        status: 107,
        message: "Saldo tidak mencukupi",
        data: null,
      });
    }

    // Kurangi saldo
    const newBalance = currentBalance - service.service_tariff;
    await db.query("UPDATE balance SET balance = ? WHERE user_id = ?", [
      newBalance,
      userId,
    ]);

    // Insert transaksi
    const invoice_number = `INV-${Date.now()}-${uuidv4().slice(0, 8)}`;
    await db.query(
      `INSERT INTO transaction
        (user_id, service_code, service_name, transaction_type, amount, invoice_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        service.service_code,
        service.service_name,
        "PAYMENT",
        service.service_tariff,
        invoice_number,
      ]
    );

    return res.status(200).json({
      status: 0,
      message: "Transaksi berhasil",
      data: {
        invoice_number,
        service_code: service.service_code,
        service_name: service.service_name,
        transaction_type: "PAYMENT",
        total_amount: Number(service.service_tariff),
        created_on: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("❌ Error createTransaction:", err);
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan server",
      data: null,
    });
  }
};

// === HISTORY ===
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = req.query.limit ? Number(req.query.limit) : null;
    const offset = Number(req.query.offset) || 0;

    let query = `
      SELECT 
        invoice_number,
        transaction_type,
        service_name,
        amount,
        created_on
      FROM transaction
      WHERE user_id = ?
      ORDER BY created_on DESC
    `;
    const params = [userId];

    if (limit) {
      query += " LIMIT ? OFFSET ?";
      params.push(limit, offset);
    }

    const [rows] = await db.query(query, params);

    const records = rows.map((r) => ({
      invoice_number: r.invoice_number || "-",
      transaction_type: r.transaction_type,
      description:
        r.service_name ||
        (r.transaction_type === "TOPUP" ? "Top Up balance" : "-"),
      total_amount: Number(r.amount),
      created_on: new Date(r.created_on).toISOString(),
    }));

    return res.json({
      status: 0,
      message: "Get History Berhasil",
      data: {
        offset,
        limit: limit ?? records.length,
        records,
      },
    });
  } catch (err) {
    console.error("❌ Error getTransactionHistory:", err);
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan server",
      data: null,
    });
  }
};

// === DETAIL ===
export const getTransactionDetail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { invoice_number } = req.params;

    if (!invoice_number) {
      return res.status(400).json({
        status: 102,
        message: "Parameter invoice_number tidak boleh kosong",
        data: null,
      });
    }

    const [rows] = await db.query(
      `SELECT invoice_number, transaction_type, service_code, service_name, amount, created_on
       FROM transaction
       WHERE user_id = ? AND invoice_number = ?
       LIMIT 1`,
      [userId, invoice_number]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Transaksi tidak ditemukan",
        data: null,
      });
    }

    const t = rows[0];
    return res.json({
      status: 0,
      message: "Sukses",
      data: {
        invoice_number: t.invoice_number,
        transaction_type: t.transaction_type,
        service_code: t.service_code,
        service_name: t.service_name,
        total_amount: Number(t.amount),
        created_on: new Date(t.created_on).toISOString(),
      },
    });
  } catch (err) {
    console.error("❌ Error getTransactionDetail:", err);
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan server",
      data: null,
    });
  }
};
