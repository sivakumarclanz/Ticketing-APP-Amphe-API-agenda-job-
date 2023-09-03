const express = require("express");
const checkReq = require("../middlewares/validate");
const router = express.Router();
const {
  //getTicketsById,
  patchTickets,
  deleteTickets,
  getAllTickets,
  createTickets,
  getTicketsCreatedByMe,
  getTicketsAssignedToME,
  deleteTicketImage,
} = require("../controllers/tickets");
// const { ticketsPOST, ticketsGET } = require("../schemas/tickets");

//Create new record Method
router.post("/tickets", createTickets);

//Get all Method
router.get("/tickets", getAllTickets);

//Get by ID Method
// router.get("/tickets/:id", getTicketsById);
router.get("/tickets/created-by-me/:id", getTicketsCreatedByMe);
router.get("/tickets/assigned-to-me/:id", getTicketsAssignedToME);

//Update by ID Method
router.patch("/tickets/:id", patchTickets);

//Delete by ID Method
router.delete("/tickets/:id", deleteTickets);

//Delete by image
router.delete("/tickets/:id/image/:image", deleteTicketImage);

module.exports = router;
