import db from "../config/db.js";

export const getAllServices = async (req, res) => {
  try {
    // Query ke database
    const [results] = await db.query("SELECT * FROM services");

    // Format data hasil query
    const formatted = results.map((item) => ({
      service_code: item.service_code,
      service_name: item.service_name,
      service_icon: item.service_icon,
      service_tariff: item.service_tariff,
    }));

    // Kirim response sukses
    return res.status(200).json({
      status: 0,
      message: "Sukses",
      data: formatted,
    });
  } catch (error) {
    console.error("Error getAllServices:", error);

    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan server",
      data: null,
    });
  }
};
