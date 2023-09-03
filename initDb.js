const mongoose = require("mongoose");
const log = require("./helpers/logger");

module.exports = () => {
  mongoose
    .connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      // useFindAndModify: false,
      // useUnifiedTopology: true
    })
    .then(() => {
      log.info("Connected to MongoDB");
    })
    .catch((err) => {
      log.error("Error in database connection", err);
    });

  mongoose.connection.on("error", (err) => {
    log.error(err);
  });
  mongoose.connection.on("disconnected", () => {
    log.warn("MongoDB Disconnected");
  });
  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      process.exit(0);
    });
  });
};
