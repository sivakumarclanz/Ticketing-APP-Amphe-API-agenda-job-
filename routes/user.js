const express = require("express");
const checkReq = require("../middlewares/validate");
const router = express.Router();
const { signIn, adminSignIn } = require("../controllers/user");
const verifyToken = require("../middlewares/verify.token");

//Get all Method
router.post("/signIn", signIn);

router.post("/adminSignIn", adminSignIn);

module.exports = router;
