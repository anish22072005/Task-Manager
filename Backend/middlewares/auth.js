const jwt = require("jsonwebtoken");
const JWT_SECRET = "supersecretkey";

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  if (!token)
    return res.status(401).json({ msg: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    res.status(401).json({ msg: "Token invalid" });
  }
};
