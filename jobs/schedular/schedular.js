const {agenda}  = require("./index");
const logger = require("../../helpers/logger");

const sendTicketnextlevel = async (intervalInMs,ticketId) => {
  logger.info("sendTicketnextlevel");
  console.log('sendTicketnextlevel::initialized', new Date().toGMTString())
  await agenda.schedule(
    `in ${intervalInMs}`,
    `update-ticket`,
    { ticketId }
  );
};


module.exports = {sendTicketnextlevel};

