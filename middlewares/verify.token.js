const jwt = require("jsonwebtoken");
const { error } = require("../helpers/response");

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res
      .status(403)
      .send(error("A token is required for authentication", res.statusCode));
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send(error("Invalid Token", res.status));
  }
  return next();
};
module.exports = verifyToken;
