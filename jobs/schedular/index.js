const Agenda = require("agenda");
// const { allDefinitions } = require("../definitions");
// const { updateTicket } = require("../../controllers/ticketsV2");
const { JobHandlers } = require("../handlers");

const agenda = new Agenda({
  db: {
    address: "mongodb+srv://sivaklu92:Amphe@cluster0.rffejl0.mongodb.net/test1",
    collection: "agendaJobs",
    options: { useUnifiedTopology: true },
  },
  maxConcurrency: 20,
});


// listen for the ready or error event.
agenda
  .on("ready", () => console.log("Agenda started!"))
  .on("error", () => console.log("Agenda connection error!"));

// define all agenda jobs
// allDefinitions(agenda);
agenda.define(
  "update-ticket",
  JobHandlers.updateTicketNextLevel,
);
// agenda.define(
//   "update-ticket-next-level",
//   updateTicket
// );


// logs all registered jobs
// console.log({ jobs: agenda._definitions });

module.exports = { agenda };
