const mongoose = require("mongoose");
const moment = require("moment");
const { Schema } = mongoose;

const ticketsSchema = new mongoose.Schema(
  {
    created_user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
      index: true,
    },
    ticket_number: {
      type: Number,
      index: true,
      required: true,
      unique: true,
      immutable: true,
    },
    department: { type: String, required: true },
    timelineToSortOut: { type: String, required: true },
    category: { type: String, required: false },
    issue_severity: { type: String, required: false },
    description: { type: String, required: false },
    picture: { type: [String], required: false },
    user_name: { type: String, ref: "Employee" },
    assigned_user: { type: Schema.Types.ObjectId, ref: "Employee" },
    department_level: { type: String, ref: "Employee" },
    created_user_status: { type: String, default: "Open" },
    assigned_user_status: { type: String, default: "Open" },
    closed_by: { type: String, required: false },
  },
  { timestamps: true, versionKey: false }
);

ticketsSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.createdAt = moment(ret.createdAt)
      .utcOffset("+05:30")
      .format("MMM D YYYY, h:mm a");
    ret.updatedAt = moment(ret.updatedAt)
      .utcOffset("+05:30")
      .format("MMM D YYYY, h:mm a");
    return ret;
  },
});

module.exports = ticketsSchema;
