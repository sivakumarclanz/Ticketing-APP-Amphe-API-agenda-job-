const Joi = require("joi");
const schemas = {
  employeePOST: Joi.object({
    user_name: Joi.string().required(),
    email_address: Joi.string().email(),
    password: Joi.string().required(),
    department: Joi.string().required(),
    department_level: Joi.string(),
  }),
  employeeGET: Joi.object({
    id: Joi.string().required(),
  }),
  // define all the other schemas below
};
module.exports = schemas;
