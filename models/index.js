const mongoose = require("mongoose");

const tokenSchema = require("./token");
const employeeSchema = require("./Employee");
const ticketsSchema = require("./tickets");
const ticketsV2Schema = require("./ticketsV2");

const Token = mongoose.model("Token", tokenSchema);
const Employee = mongoose.model("Employee", employeeSchema);
const Tickets = mongoose.model("Tickets", ticketsSchema);
const TicketsV2 = mongoose.model("TicketsV2", ticketsV2Schema);

module.exports = {
  Token,
  Employee,
  Tickets,
  TicketsV2,
};
