const express = require("express");
const checkReq = require("../middlewares/validate");
const router = express.Router();
const {
  //getTicketsById,
  patchTickets,
  deleteTickets,
  getAllTickets,
  handleGetTicketByNumber,
  createTickets,
  getTicketsCreatedByMe,
  getTicketsAssignedToME,
  deleteTicketImage,
  
} = require("../controllers/ticketsV2");
// const { ticketsPOST, ticketsGET } = require("../schemas/tickets");

//Create new record Method
router.post("/ticketsV2", createTickets);

//Get all Method
router.get("/ticketsV2", getAllTickets);

//Get all Method
router.get("/ticketsV2/ticket/:ticket_number", handleGetTicketByNumber);



//Get by ID Method
// router.get("/ticketsV2/:id", getTicketsById);
router.get("/ticketsV2/created-by-me/:id", getTicketsCreatedByMe);
router.get("/ticketsV2/assigned-to-me/:id", getTicketsAssignedToME);

//Update by ID Method
router.patch("/ticketsV2/:id", patchTickets);

//Delete by ID Method
router.delete("/ticketsV2/:id", deleteTickets);

//Delete by image
router.delete("/ticketsV2/:id/image/:image", deleteTicketImage);

module.exports = router;
