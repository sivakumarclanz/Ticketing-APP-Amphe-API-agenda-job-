const logger = require("../helpers/logger");
const { success, error } = require("../helpers/response");
const { upload } = require("../helpers/s3");
const util = require("util");

exports.uploadSingle = (req, res) => {
  // req.file contains a file object
  let data = {};
  if (req.file) {
    data.url = req.file.location;
    logger.info(data, "data");
    res.status(200).json(success("Ok", data));
  } else {
    res.status(500).json(error("Upload Failed", res.statusCode));
  }
};

exports.uploadMultiple = (req, res) => {
  // req.files contains an array of file object
  //res.json(req.files);
  let data = {};
  if (req.files) {
    data.files = req.files;
    logger.info(data, "data");
    res.status(200).json(success("Ok", data));
  } else {
    res.status(500).json(error("Upload Failed", res.statusCode));
  }
};

exports.uploadSingleV2 = async (req, res) => {
  const uploadFile = util.promisify(upload.single("file"));
  try {
    await uploadFile(req, res);
    logger.info(req.file, "uploadSingleV2response");
    res.status(200).json(
      success("Ok", {
        file: req.file,
      })
    );
    // res.json(req.file);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message, res.statusCode));
  }
};
