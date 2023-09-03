const express = require("express");
const checkReq = require("../middlewares/validate");
const router = express.Router();
const {
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getAllEmployee,
  createEmployee,
} = require("../controllers/Employee");
const { employeePOST, employeeGET } = require("../schemas/Employee");

//Create new record Method
router.post("/employee", createEmployee);

//Get all Method
router.get("/employee", getAllEmployee);

//Get by ID Method
router.get("/employee/:id", checkReq(employeeGET, "params"), getEmployeeById);

//Update by ID Method
router.patch("/employee/:id", updateEmployee);

//Delete by ID Method
router.delete("/employee/:id", deleteEmployee);

module.exports = router;
