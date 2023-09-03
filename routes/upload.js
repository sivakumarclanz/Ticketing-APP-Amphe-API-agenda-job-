const express = require("express");
const router = express.Router();
const { upload } = require("../helpers/s3");
const {
  uploadSingle,
  uploadMultiple,
  uploadSingleV2,
} = require("../controllers/upload");

router.post(
  "/file/upload-multiple",
  upload.array("pictures", 50),
  uploadMultiple
);

router.post("/file/upload-single", upload.single("picture"), uploadSingle);

module.exports = router;
