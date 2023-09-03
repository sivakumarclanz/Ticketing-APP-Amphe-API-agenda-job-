const Joi = require("joi");
const { error: e } = require("../helpers/response");

const middleware = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      res.status(422).json(e(message, res.status));
    }
  };
};
module.exports = middleware;
