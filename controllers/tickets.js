const logger = require("../helpers/logger");
const { success, error } = require("../helpers/response");
const { Tickets, Employee } = require("../models");
const { sendNotification } = require("../helpers/firebase");
const FILE_UPLOAD_DIR = "uploads/";
const multiparty = require("multiparty");
const AwsClient = require("../AWSclient");
const fs = require("fs");

const createTickets = async (req, res) => {
  logger.info("Tickets created");
  try {
    const form = new multiparty.Form({
      uploadDir: FILE_UPLOAD_DIR,
      multiples: true,
    });
    let dataa;
    let imageUrls = [];

    form.parse(req, async function (err, fields, files) {
      const lastTicket = await Tickets.findOne({}, {}, { sort: { _id: -1 } });
      const ticketNumber = lastTicket ? lastTicket.ticket_number + 1 : 1;

      if (err) {
        console.log("Error occurred while parsing the form:", err);
        return res.send({ error: err.message });
      }

      dataa = fields;

      console.log("req.body", dataa);

      let assignedUser;

      assignedUser = await Employee.findOne({
        department: dataa.department[0].toLowerCase(),
        department_level: "level-1",
      });

      if (!assignedUser) {
        assignedUser = await Employee.findOne({
          department: dataa.department[0].toLowerCase(),
          department_level: "level-2",
        });
      }

      if (!assignedUser) {
        assignedUser = await Employee.findOne({
          department: dataa.department[0].toLowerCase(),
          department_level: "level-3",
        });
      }

      if (!assignedUser) {
        assignedUser = await Employee.findOne({
          department: dataa.department[0].toLowerCase(),
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

      console.log("Received form data:", fields); // Check the received form data
      const s3 = new AwsClient.Aws.S3({});

      if (files.picture && Array.isArray(files.picture)) {
        // Iterate over the file paths and perform necessar

        // Iterate over the file paths and perform necessary operations for each file
        for (let i = 0; i < files.picture.length; i++) {
          const filePath = files.picture[i].path;
          const fileName = filePath.slice(filePath.lastIndexOf("\\") + 1);

          fs.readFile(filePath, (err, fileBuffer) => {
            if (err) {
              console.log("Error occurred while reading the file:", err);
              return res.send({ error: err.message });
            }

            const uploadParams = {
              Key: fileName,
              Bucket: "ticketing-app-amphe",
              Body: fileBuffer,
              ACL: "public-read",
              ContentType: "image/jpeg",
              ContentEncoding: "base64",
            };

            const upload = s3.upload(uploadParams);
            upload.on("httpUploadProgress", (evt) => {
              console.log("Upload Progress:", evt.loaded, "/", evt.total);
            });

            upload.send((err, data) => {
              if (err) {
                console.log("Error occurred while uploading the file:", err);
                return res.send({ error: err.message });
              }

              const fileURL = data.Location;
              console.log("File URL:", fileURL);

              // Store the file URL in the array
              imageUrls.push(fileURL);
              console.log("imageUrls:", imageUrls);
              // Check if all files have been processed
              if (imageUrls.length === files.picture.length) {
                let newTicket = new Tickets({
                  created_user: dataa?.created_user[0],
                  assigned_user: assignedUser._id,
                  department: dataa?.department[0],
                  department_level: assignedUser?.department_level,
                  issue_severity: dataa?.issue_severity[0],
                  category: dataa?.category[0],
                  description: dataa?.description[0],
                  closed_by: dataa?.closed_by[0],
                  timelineToSortOut: dataa?.timelineToSortOut[0],
                  ticket_number: ticketNumber,
                  picture: imageUrls,
                });

                // Save the new ticket and schedule the updateTickets function
                newTicket
                  .save()
                  .then((result) => {
                    console.log("Ticket saved:", result);
                    result.department = dataa.department[0];
                    result.department_level = assignedUser.department_level;
                    res
                      .status(200)
                      .json(success("CREATED", result, res.statusCode));

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

                    const timelineToSortOut = dataa?.timelineToSortOut[0];
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

                        console.log("intervalInMs:", intervalInMs);

                        // Schedule the updateTickets function to run after the calculated interval for the current ticket
                        const interval = setInterval(async () => {
                          try {
                            const openTickets = await Tickets.find({
                              assigned_user_status: "Open",
                              _id: result._id,
                            });

                            if (openTickets.length === 0) {
                              console.log(
                                "No open tickets found for the current ticket:",
                                result._id
                              );
                              clearInterval(interval); // Clear the interval if the ticket is no longer open
                              return;
                            }

                            const ticket = openTickets[0];
                            const currentLevel = ticket.department_level;

                            if (currentLevel === "level-4") {
                              console.log(
                                "Ticket reached the final level:",
                                ticket._id
                              );
                              clearInterval(interval); // Clear the interval if the ticket has reached the final level
                              return;
                            }

                            let nextLevel;
                            let assignedUser; // Move the assignedUser variable inside the loop

                            // Check if the next level exists in the list
                            for (
                              let i = parseInt(currentLevel.slice(-1)) + 1;
                              i <= 4;
                              i++
                            ) {
                              nextLevel = `level-${i}`;
                              assignedUser = await Employee.findOne({
                                department: ticket.department,
                                department_level: nextLevel,
                              });

                              if (assignedUser) {
                                break; // Found the next available level and assignedUser, exit the loop
                              }
                            }

                            if (!assignedUser) {
                              console.log(
                                "No next level available for ticket:",
                                ticket._id
                              );
                              clearInterval(interval); // Clear the interval if no next level user is found
                              return;
                            }

                            ticket.assigned_user = assignedUser._id;
                            ticket.department_level = nextLevel;
                            await ticket.save();
                            console.log("Ticket updated:", ticket._id);
                            console.log("push", assignedUser);
                            console.log("push1", newTicket.ticket_number);
                            sendNotification(
                              `Ticket Assigned | ${newTicket.ticket_number}`,
                              "A new ticket has been assigned to you.",
                              assignedUser?.fcm_token,
                              "Open", // Provide the status of the ticket
                              newTicket._id, // Provide the ID of the ticket
                              newTicket.ticket_number
                            );
                          } catch (err) {
                            console.error(
                              "Error assigning next level to ticket:",
                              err
                            );
                          }
                        }, intervalInMs);
                      } else {
                        console.log(
                          "Invalid timelineToSortOut:",
                          timelineToSortOut
                        );
                        // Handle the case of an invalid timelineToSortOut value
                        // For example, you can return an error response or perform other necessary actions
                      }
                    }

                    console.log("push", assignedUser);
                    console.log("push1", newTicket.ticket_number);
                    sendNotification(
                      `Ticket Assigned | ${newTicket.ticket_number}`,
                      "A new ticket has been assigned to you.",
                      assignedUser?.fcm_token,
                      "Open", // Provide the status of the ticket
                      newTicket._id, // Provide the ID of the ticket
                      newTicket.ticket_number
                    );
                  })

                  .catch((err) => {
                    console.error(
                      "Error occurred while saving the ticket:",
                      err
                    );
                    // Handle the error as needed
                  });
              }
            });
          });
        }
      } else {
        console.log("No files or invalid file format detected.");
      }
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

const getAllTickets = async (req, res) => {
  logger.info("Get all Tickets Called");
  try {
    let result = await Tickets.find({}).populate("created_user", "user_name");
    res.status(200).json(success("OK", result, res.statusCode));
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

const getTicketsCreatedByMe = async (req, res) => {
  logger.info("Get Tickets Created by User Called");
  try {
    const data = await Tickets.find({ created_user: req.params.id }).populate(
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
    const data = await Tickets.find({ assigned_user: req.params.id }).populate(
      "created_user",
      "user_name"
    );
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
    const ticketId = req.params.id; // Assuming the ticket ID is passed as a parameter
    console.log("ticketId:", ticketId);
    // Retrieve the existing ticket from the database
    const existingTicket = await Tickets.findById(ticketId);
    console.log("existing ticket:", existingTicket);
    if (!existingTicket) {
      return res.status(404).json(error("Ticket not found.", res.statusCode));
    }

    const form = new multiparty.Form({
      uploadDir: FILE_UPLOAD_DIR,
      multiples: true,
    });
    let dataa;
    let imageUrls = [];

    form.parse(req, async function (err, fields, files) {
      if (err) {
        console.log("Error occurred while parsing the form:", err);
        return res.status(400).json(error(err.message, res.statusCode));
      }

      dataa = fields;

      console.log("req.body", dataa);

      const s3 = new AwsClient.Aws.S3({});

      // Iterate over the file paths and perform necessary operations for each file
      if (files.picture) {
        for (let i = 0; i < files.picture.length; i++) {
          const filePath = files.picture[i].path;
          const fileName = filePath.slice(filePath.lastIndexOf("\\") + 1);

          fs.readFile(filePath, (err, fileBuffer) => {
            if (err) {
              console.log("Error occurred while reading the file:", err);
              return res.status(400).json(error(err.message, res.statusCode));
            }

            const uploadParams = {
              Key: fileName,
              Bucket: "ticketing-app-amphe",
              Body: fileBuffer,
              ACL: "public-read",
              ContentType: "image/jpeg",
              ContentEncoding: "base64",
            };

            const upload = s3.upload(uploadParams);
            upload.on("httpUploadProgress", (evt) => {
              console.log("Upload Progress:", evt.loaded, "/", evt.total);
            });

            upload.send((err, data) => {
              if (err) {
                console.log("Error occurred while uploading the file:", err);
                return res.status(400).json(error(err.message, res.statusCode));
              }

              const fileURL = data.Location;
              console.log("File URL:", fileURL);

              // Store the file URL in the array
              imageUrls.push(fileURL);
              console.log("imageUrls:", imageUrls);
              // Check if all files have been processed
              if (imageUrls.length === files.picture.length) {
                // Update the ticket properties with the new values
                existingTicket.issue_severity = dataa?.issue_severity[0];
                existingTicket.category = dataa?.category[0];
                existingTicket.description = dataa?.description[0];
                existingTicket.created_user_status =
                  dataa?.created_user_status[0];
                existingTicket.assigned_user_status =
                  dataa?.assigned_user_status[0];
                existingTicket.closed_by = dataa?.closed_by[0];
                existingTicket.picture = [
                  ...existingTicket.picture,
                  ...imageUrls,
                ];

                // Save the updated ticket
                existingTicket
                  .save()
                  .then((result) => {
                    console.log("Ticket updated:", result);
                    res
                      .status(200)
                      .json(success("UPDATED", result, res.statusCode));
                  })
                  .catch((err) => {
                    console.log("Error occurred while saving the ticket:", err);
                    res.status(500).json(error(err.message, res.statusCode));
                  });
              }
            });
          });
        }
      } else {
        console.log("No pictures found in the request");
        // Return an appropriate response or throw an error if required
      }
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

const deleteTickets = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Tickets.findByIdAndDelete(id);
    res.status(200).json(success("Deleted", result, res.statusCode));
  } catch (err) {
    res.status(500).json(error(err.message, res.statusCode));
  }
};

const deleteTicketImage = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const imageKey = req.params.image;

    console.log("Request Parameters:");
    console.log("Ticket ID:", ticketId);
    console.log("Image Key:", imageKey);

    const ticket = await Tickets.findById(ticketId);

    if (!ticket) {
      console.log("Ticket not found");
      return res.status(404).json(error("Ticket not found", res.statusCode));
    }

    console.log("Ticket Picture:", ticket.picture);

    const imageRegex = new RegExp(imageKey, "i");
    let imageIndex;

    for (let i = 0; i < ticket.picture.length; i++) {
      if (imageRegex.test(ticket.picture[i])) {
        imageIndex = i;
        break;
      }
    }

    console.log("imageIndex:", imageIndex);

    if (imageIndex === undefined) {
      console.log("Image key not found in the ticket");
      return res
        .status(404)
        .json(error("Image key not found in the ticket", res.statusCode));
    }

    const s3 = new AwsClient.Aws.S3({});
    const deleteParams = {
      Key: imageKey,
      Bucket: "ticketing-app-amphe",
    };
    await s3.deleteObject(deleteParams).promise();

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
  //getTicketsById,
  getTicketsCreatedByMe,
  getTicketsAssignedToME,
  patchTickets,
  deleteTickets,
  deleteTicketImage,
};
