

const { TicketsV2, Employee } = require("../models");
const { sendNotification } = require("../helpers/firebase");
// const { sendTicketnextlevelUtil } = require('./util');
const { sendTicketnextlevel } = require('../jobs/schedular/schedular');



const JobMethods = {
  updateTicket: async (data) => {
    console.log('Ticketassignednextlevel::completed', new Date().toGMTString(), data);
    const ticketId = data.ticketId;
    try {
      const openTickets = await TicketsV2.findOne({
        assigned_user_status: "Open",
        _id: ticketId,
      });
      console.log('openTickets', openTickets)
      if (!openTickets) {
        console.log("No open tickets found for the current ticket:", ticketId);
        return;
      }

      const ticket = openTickets;
      const currentLevel = ticket.department_level;
  
      if (currentLevel === "level-4") {
        return;
      }
  
      let nextLevel;
      let assignedUser;
  
      // Loop through levels 2, 3, and 4
      for (let i = parseInt(currentLevel.slice(-1)) + 1; i <= 4; i++) {
        nextLevel = `level-${i}`;
        assignedUser = await Employee.findOne({
          department: ticket.department,
          department_level: nextLevel,
        }).limit(1);
  
        if (assignedUser) {
          break;
        }
      }
  
      if (!assignedUser) {
        console.log("No next level available for ticket:", ticket._id);
        return;
      }
  
      ticket.assigned_user = assignedUser._id;
      ticket.department_level = nextLevel;
      await ticket.save();
  
      sendNotification(
        `Ticket Assigned | ${ticket.ticket_number}`,
        "A new ticket has been assigned to you.",
        assignedUser?.fcm_token,
        "Open",
        ticket._id
      );

      // Schedule the next ticket level update using Agenda
      if (nextLevel !== "level-4") {
        await sendTicketnextlevel(openTickets.timelineToSortOut.toLocaleLowerCase(), ticketId);
        // await scheduler.sendTicketnextlevel(result.timelineToSortOut.toLocaleLowerCase(), result._id)
        // await scheduler.sendTicketnextlevel(result.timelineToSortOut.toLocaleLowerCase(), result._id)
           
      }
    
    } catch (err) {
      console.error("Error assigning next level to ticket:", err);
    }
  }
};

module.exports = { JobMethods };

