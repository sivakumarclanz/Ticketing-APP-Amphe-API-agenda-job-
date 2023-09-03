// const { updateTicket } = require("../controllers/ticketsV2");

const { JobMethods } = require("./jobs");

const JobHandlers = {
  updateTicketNextLevel: async (job, done) => {
    // console.log('job', job)
    const { data } = job.attrs;
    console.log('data', data)
    await JobMethods.updateTicket(data);
    console.log('done')
    done();
  },
  // .... more methods that perform diffrent tasks
};
// exports.JobHandlers = JobHandlers;
module.exports = { JobHandlers };
