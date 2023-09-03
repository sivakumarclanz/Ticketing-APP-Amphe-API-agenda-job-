const { ticketDefinitions } = require("./index");

const definitions = [ticketDefinitions];

const allDefinitions = (agenda) => {
  definitions.forEach((definition) => definition(agenda));
};


module.exports = { allDefinitions };
