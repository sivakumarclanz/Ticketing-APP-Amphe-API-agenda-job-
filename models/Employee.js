const mongoose = require("mongoose");
const { Schema } = mongoose;

const employeeSchema = new mongoose.Schema(
  {
    user_name: { type: String, required: true },
    email_address: { type: String, required: false },
    mobile_number: { type: Number, required: false },
    emp_Id_no: { type: String, required: false },
    password: { type: String, required: true },
    department: [{ type: String, required: true }],
    department_level: { type: String, required: true },
    fcm_token: { type: String, required: false, default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = employeeSchema;
