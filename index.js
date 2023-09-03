const express = require("express");
const cors = require("cors");
const test = require("./routes/test");
const user = require("./routes/user");
const tickets = require("./routes/tickets");
const ticketsV2 = require("./routes/ticketsV2");
const employee = require("./routes/Employee");
const upload = require("./routes/upload");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();
const { agenda } = require("./jobs/schedular");
const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
require("./initDb")();

app.use("/api", test);
app.use("/api", user);
app.use("/api", tickets);
app.use("/api", ticketsV2);
app.use("/api", employee);
app.use("/api", upload);

process.on("unhandledRejection", (err) => console.log("Error:", err));


(async function () {
  // IIFE to give access to async/await
  await agenda.start();
  // await agenda.schedule('in 2 minutes', 'update-ticket', '7383');

  // await agenda.every("1 month", "send monthly billing report");
})();

app.listen(5000, () => {
  console.log(`Server Started at ${5000}`);
});
