const logger = require("./logger");
const jwt = require("jsonwebtoken");

const getAccessToken = (result) => {
  try {
    const token = jwt.sign(
      { user_id: result._id, user_name: result.user_name },

      process.env.ACCESS_SECRET,
      {
        expiresIn: process.env.TOKEN_EXPIRE,
        issuer: "clanizon",
      }
    );
    return token;
  } catch (err) {
    logger.error(err.message);
    throw Error(err.message);
  }
};

const getRefreshToken = () => {};

module.exports = {
  getAccessToken,
  getRefreshToken,
};
