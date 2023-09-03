const logger = require("../helpers/logger");
const { success, error } = require("../helpers/response");
const { TicketsV2, Employee } = require("../models");
const { sendNotification } = require("../helpers/firebase");
const fs = require("fs");
const { s3 } = require("../helpers/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const scheduler = require("../jobs/schedular/schedular"); 

const createTickets = async (req, res) => {
  logger.info("Tickets created");
  try {
    const dataa = req.body;

    const lastTicket = await TicketsV2.findOne({}, {}, { sort: { _id: -1 } });
    const ticketNumber = lastTicket ? lastTicket.ticket_number + 1 : 1;

    let assignedUser;

    assignedUser = await Employee.findOne({
      department: dataa.department.toLowerCase(),
      department_level: "level-1",
    });

    if (!assignedUser) {
      assignedUser = await Employee.findOne({
        department: dataa.department.toLowerCase(),
        department_level: "level-2",
      });
    }

    if (!assignedUser) {
      assignedUser = await Employee.findOne({
        department: dataa.department.toLowerCase(),
        department_level: "level-3",
      });
    }

    if (!assignedUser) {
      assignedUser = await Employee.findOne({
        department: dataa.department.toLowerCase(),
        department_level: "level-4",
      });
    }

    console.log("Assigned User:", assignedUser);

    if (!assignedUser) {
      return res
        .status(400)
        .json(
          error("No eligible employee found for assignment.", res.statusCode)
        );
    }

    let newTicket = new TicketsV2({
      created_user: dataa?.created_user,
      assigned_user: assignedUser._id,
      department: dataa?.department,
      department_level: assignedUser?.department_level,
      issue_severity: dataa?.issue_severity,
      category: dataa?.category,
      description: dataa?.description,
      closed_by: dataa?.closed_by,
      timelineToSortOut: dataa?.timelineToSortOut,
      ticket_number: ticketNumber,
      picture: dataa?.picture,
    });

    // Save the new ticket and schedule the updateTickets function
    newTicket
      .save()
      .then(async(result) => {
        console.log("Ticket saved:", result);
        result.department = dataa.department;
        result.department_level = assignedUser.department_level;
        res.status(200).json(success("CREATED", result, res.statusCode));

        const timelineToSortOutInMinutes = [
          { label: "1 Minute", minutes: 1 },
          { label: "2 Minutes", minutes: 2 },
          { label: "1 Hour", hours: 1 },
          { label: "2 Hours", hours: 2 },
          { label: "4 Hours", hours: 4 },
          { label: "1 Day", days: 1 },
          { label: "2 Days", days: 2 },
          { label: "3 Days", days: 3 },
          { label: "4 Days", days: 4 },
          { label: "5 Days", days: 5 },
        ];

        const timelineToSortOut = dataa?.timelineToSortOut;
        console.log("timelineToSortOut:", timelineToSortOut);

        if (timelineToSortOut) {
          const time = timelineToSortOutInMinutes.find(
            (item) => item.label === timelineToSortOut
          );
          console.log("time:", time);

          if (time) {
            let intervalInMs = 0;

            if (time.minutes) {
              intervalInMs = time.minutes * 60 * 1000; // For minutes
            } else if (time.hours) {
              intervalInMs = time.hours * 60 * 60 * 1000; // For hours
            } else if (time.days) {
              intervalInMs = time.days * 24 * 60 * 60 * 1000; // For days
            }
            console.log("intervalInMs:", intervalInMs, result._id); 
            await scheduler.sendTicketnextlevel(result.timelineToSortOut.toLocaleLowerCase(), result._id)
            // console.log("intervalInMs:", intervalInMs);

          } else {
            console.log("Invalid timelineToSortOut:", timelineToSortOut);
          }


          // setTimeout(async () => {
            // await updateTicket(result._id, dataa.department.toLowerCase(), intervalInMs);
          // }, intervalInMs);
          // } else {
          //   console.log("Invalid timelineToSortOut:", timelineToSortOut);
          // }
          //   await scheduler.sendTicketnextlevel(result.timelineToSortOut.toLocaleLowerCase(), result._id)
          //   // console.log("intervalInMs:", intervalInMs);
          
        }

        sendNotification(
          `Ticket Assigned | ${newTicket.ticket_number}`,
          "A new ticket has been assigned to you.",
          assignedUser?.fcm_token,
          "Open",
          newTicket._id
        );
      })
      .catch((err) => {
        console.error("Error occurred while saving the ticket:", err);
        res.status(500).json(error(err.message, res.statusCode));
      });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};


const getAllTickets = async (req, res) => {
  logger.info("Get all Tickets Called");
  try {
    let result = await TicketsV2.find({}).populate("created_user", "user_name");
    res.status(200).json(success("OK", result, res.statusCode));
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};




const handleGetTicketByNumber = async (req, res) => {
  const ticket_number = req.params.ticket_number;

  try {
    const ticket = await TicketsV2.findOne({ ticket_number }).populate("created_user", "user_name");
    if (!ticket) {
      return res.status(404).json(error("Ticket not found", res.statusCode));
    }

    res.status(200).json(success("OK", ticket, res.statusCode));
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};


const getTicketsCreatedByMe = async (req, res) => {
  logger.info("Get Tickets Created by User Called");
  try {
    const data = await TicketsV2.find({ created_user: req.params.id }).populate(
      "created_user",
      "user_name"
    );
    res.status(200).json(success("OK", data, res.statusCode));
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

const getTicketsAssignedToME = async (req, res) => {
  logger.info("Get Tickets Assigned to User Called");
  try {
    const data = await TicketsV2.find({
      assigned_user: req.params.id,
    }).populate("created_user", "user_name");
    res.status(200).json(success("OK", data, res.statusCode));
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

//patchTickets
const patchTickets = async (req, res) => {
  logger.info("Ticket updated");
  try {
    const ticketId = req.params.id;
    const dataa = req.body;

    const existingTicket = await TicketsV2.findById(ticketId);
    if (!existingTicket) {
      return res.status(404).json(error("Ticket not found.", res.statusCode));
    }

    // Save the original status before updating
    const originalAssignedUserStatus = existingTicket.assigned_user_status;
    const originalCreatedUserStatus = existingTicket.created_user_status;

    // Update the ticket properties with the new values from 'dataa'
    existingTicket.issue_severity = dataa?.issue_severity;
    existingTicket.category = dataa?.category;
    existingTicket.description = dataa?.description;
    existingTicket.closed_by = dataa?.closed_by;
    existingTicket.created_user_status = dataa?.created_user_status;
    existingTicket.assigned_user_status = dataa?.assigned_user_status;

    // Combine the existing and new image URLs
    existingTicket.picture = [
      ...(existingTicket.picture || []), // If no existing picture array, create an empty array
      ...(dataa?.picture || []), // If no new picture array in the request, create an empty array
    ];

    // Save the updated ticket
    const result = await existingTicket.save();

    // Check if the status has changed and send notifications to the respective users
    if (originalAssignedUserStatus !== existingTicket.assigned_user_status) {
      // If the assigned_user_status is changed, send a notification to the created user

      const title = `Ticket Status Updated | ${existingTicket.ticket_number}`;
      const body = `The status of the ticket assigned to you has been updated to ${existingTicket.assigned_user_status}.`;
      const createdUserFcmToken = existingTicket.created_user?.fcm_token;
      console.log("createdUserFcmToken", existingTicket.created_user);
      sendNotification(
        title,
        body,
        createdUserFcmToken,
        existingTicket.assigned_user_status,
        existingTicket._id,
        "this is silent notification",
        existingTicket.ticket_number
      );
    }

    if (originalCreatedUserStatus !== existingTicket.created_user_status) {
      // If the created_user_status is changed, send a notification to the assigned user

      const title = `Ticket Status Updated | ${existingTicket.ticket_number}`;
      const body = `The status of your ticket has been updated to ${existingTicket.created_user_status}.`;
      const assignedUserFcmToken = existingTicket.assigned_user?.fcm_token;

      sendNotification(
        title,
        body,
        assignedUserFcmToken,
        existingTicket.created_user_status,
        existingTicket._id,
        "this is silent notification",
        existingTicket.ticket_number
      );
    }

    res.status(200).json(success("UPDATED", result, res.statusCode));
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

const deleteTickets = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await TicketsV2.findByIdAndDelete(id);
    res.status(200).json(success("Deleted", result, res.statusCode));
  } catch (err) {
    res.status(500).json(error(err.message, res.statusCode));
  }
};

const deleteTicketImage = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const imageKey = req.params.image;

    const ticket = await TicketsV2.findById(ticketId);

    if (!ticket) {
      console.log("Ticket not found");
      return res.status(404).json(error("Ticket not found", res.statusCode));
    }

    console.log("Ticket Picture:", ticket.picture);

    const imageRegex = new RegExp(imageKey, "i");
    const imageIndex = ticket.picture.findIndex((url) => imageRegex.test(url));

    console.log("imageIndex:", imageIndex);

    if (imageIndex === -1) {
      console.log("Image key not found in the ticket");
      return res
        .status(404)
        .json(error("Image key not found in the ticket", res.statusCode));
    }

    const deleteParams = {
      Key: imageKey,
      Bucket: "ticketing-app-amphe",
    };

    await s3.send(new DeleteObjectCommand(deleteParams));

    console.log("Image deleted from S3");

    ticket.picture.splice(imageIndex, 1);

    console.log("Balance Ticket Picture:", ticket.picture);

    const updatedTicket = await ticket.save();

    let output = {
      picture: updatedTicket.picture,
      id: updatedTicket._id,
      createdAt: updatedTicket.createdAt,
      updatedAt: updatedTicket.updatedAt,
    };

    res.status(200).json(success("Image deleted", output, res.statusCode));
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

module.exports = {
  createTickets,
  getAllTickets,
  getTicketsCreatedByMe,
  getTicketsAssignedToME,
  patchTickets,
  deleteTickets,
  deleteTicketImage,
  handleGetTicketByNumber,
  // JobMethods
};
