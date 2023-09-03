const Joi = require("joi");
const schemas = {
  ticketsPOST: Joi.object({
    created_user: Joi.string().required(),
    ticket_number: Joi.string().required(),
    category: Joi.string().required(),
    department: Joi.string().required(),
    issue_severity: Joi.string().required(),
    description: Joi.string().required(),
    picture: Joi.string().required(),
    assigned_user: Joi.string(),
    created_user_status: Joi.string(),
    assigned_user_status: Joi.string(),
    closed_by: Joi.string(),
  }),
  ticketsGET: Joi.object({
    id: Joi.string().required(),
  }),
  // define all the other schemas below
};
module.exports = schemas;
