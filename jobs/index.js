const JobHandlers = require("./handlers");

const ticketDefinitions = (agenda) => {
  console.log('definitions')
  agenda.define(
    "update-ticket",
    JobHandlers.updateTicketNextLevel,
  );
};

module.exports = {
  ticketDefinitions,
};
