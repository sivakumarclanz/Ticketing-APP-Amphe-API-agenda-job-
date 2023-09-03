const logger = require("../helpers/logger");
const { success, error } = require("../helpers/response");
const bcrypt = require("bcrypt");
const { Employee } = require("../models");
const { getAccessToken } = require("../helpers/token");

const signIn = async (req, res) => {
  logger.info("signin called");
  try {
    let result = await Employee.findOne({
      user_name: req.body.user_name,
    });

    if (!result) {
      res.status(401).json(error("Invalid user_name", res.statusCode));
    }

    if (result && bcrypt.compareSync(req.body.password, result.password)) {
      let token = getAccessToken(result);
      let output = {};
      output.user_name = result.user_name;
      output.email_address = result.email_address;
      output.mobile_number = result.mobile_number;
      output.user_id = result._id; // Populate user_id with _id
      output.token = token;
      res.status(200).json(success("OK", output, res.statusCode));
    } else {
      res.status(401).json(error("unauthorized", res.statusCode));
    }
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

const adminSignIn = async (req, res) => {
  logger.info("adminSignIn called");
  try {
    const user_name = "Admin";
    const password = "password@123";

    if (req.body.user_name === user_name && req.body.password === password) {
      let result = {
        user_name: user_name,
        password: password,
      };
      res.status(200).json(success("OK", result, res.statusCode));
    } else {
      res.status(401).json(error("Unauthorized", res.statusCode));
    }
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

module.exports = {
  adminSignIn,
  signIn,
};
