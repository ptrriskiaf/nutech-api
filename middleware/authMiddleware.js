import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 108,
        message: "Token tidak ditemukan",
        data: null,
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 108,
        message: "Format token tidak valid",
        data: null,
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // simpan data user ke request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ verifyToken error:", err.message);
    return res.status(401).json({
      status: 108,
      message: "Token tidak valid atau kadaluwarsa",
      data: null,
    });
  }
};
