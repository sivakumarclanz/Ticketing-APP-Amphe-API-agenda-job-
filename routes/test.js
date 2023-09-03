const express = require("express");
const router = express.Router();
router.all("/test", (req, res) => {
  res.json("Working :>");
});

module.exports = router;
