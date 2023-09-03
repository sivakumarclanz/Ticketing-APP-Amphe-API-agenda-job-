const mongoose = require("mongoose");
const { Schema } = mongoose;
const tokenSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
});

module.exports = tokenSchema;
