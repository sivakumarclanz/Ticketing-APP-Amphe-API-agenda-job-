const logger = require("../helpers/logger");
const { success, error } = require("../helpers/response");
const { Employee } = require("../models");
const bcrypt = require("bcryptjs");

//getAll

const getAllEmployee = async (req, res) => {
  logger.info("Get all Employee Called");
  try {
    let result = await Employee.find({});
    res.status(200).json(success("OK", result, res.status));
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.status));
  }
};

//getByID
const getEmployeeById = async (req, res) => {
  logger.info("Get Employeeby Id Called");
  try {
    const data = await Employee.find({ user_id: req.params.id });
    res.status(200).json(success("OK", data, res.status));
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.status));
  }
};

const createEmployee = async (req, res) => {
  logger.info("Employee created");
  try {
    let { password, user_name, email_address, mobile_number, emp_Id_no } =
      req.body;

    // Remove leading and trailing spaces
    user_name = user_name.trim();
    email_address = email_address.trim();
    emp_Id_no = emp_Id_no.trim();

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await Employee.findOne({
      user_name: { $regex: new RegExp(`^${escapeRegExp(user_name)}$`, "i") },
    });
    if (existingUser) {
      return res
        .status(409)
        .json(error("Username already exists", res.statusCode));
    }

    if (email_address) {
      const existingEmail = await Employee.findOne({
        email_address: {
          $regex: new RegExp(`^${escapeRegExp(email_address)}$`, "i"),
        },
      });
      if (existingEmail) {
        return res
          .status(409)
          .json(error("Email already exists", res.statusCode));
      }
    }
    if (mobile_number) {
      const existingMobile = await Employee.findOne({
        mobile_number: mobile_number,
      });

      if (existingMobile) {
        return res
          .status(409)
          .json(error("Mobile number already exists", res.statusCode));
      }
    }

    if (emp_Id_no) {
      const existingEmpId = await Employee.findOne({
        emp_Id_no: { $regex: new RegExp(`^${escapeRegExp(emp_Id_no)}$`, "i") },
      });
      if (existingEmpId) {
        return res
          .status(409)
          .json(error("Employee ID already exists", res.statusCode));
      }
    }

    let newEmployee = new Employee(req.body);
    newEmployee.user_name = user_name;
    newEmployee.email_address = email_address;
    newEmployee.emp_Id_no = emp_Id_no; // Update the emp_Id_no field with the trimmed value
    newEmployee.password = hashedPassword;
    let result = await newEmployee.save();
    res.status(200).json(success("CREATED", result, req.status));
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};

// Helper function to escape regular expression special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//update
const updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    // Check if the password field exists in the updatedData
    if (updatedData.password) {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      updatedData.password = hashedPassword;
    }
    const options = { new: true };
    const result = await Employee.findByIdAndUpdate(id, updatedData, options);
    res.status(200).json(success("Updated", result, res.status));
  } catch (err) {
    res.status(500).json(error(err.message, res.status));
  }
};

//delete
const deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Employee.findByIdAndDelete(id);
    res.status(200).json(success("Deleted", result, res.status));
  } catch (err) {
    res.status(500).json(error(err.message, res.status));
  }
};

module.exports = {
  createEmployee,
  getAllEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
