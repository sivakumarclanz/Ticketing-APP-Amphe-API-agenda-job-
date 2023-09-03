const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");

const s3 = new S3Client({
  region: "us-west-2",
  credentials: {
    accessKeyId: "AKIA4YHVZOTBHMQRCWAX",
    secretAccessKey: "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",
  },
});

// function to sanitize files and send error for unsupported files
function sanitizeFile(file, cb) {
  // Define the allowed extension
  const fileExts = [".png", ".jpg", ".jpeg", ".gif"];

  // Check allowed extensions
  const isAllowedExt = fileExts.includes(
    path.extname(file.originalname.toLowerCase())
  );

  // Mime type must be an image
  const isAllowedMimeType = file.mimetype.startsWith("image/");

  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true); // no errors
  } else {
    // pass error msg to callback, which can be displayed in frontend
    cb("Error: File type not allowed!");
  }
}
const s3Storage = multerS3({
  s3,
  acl: "public-read", // Update with the desired ACL (e.g., "private" for private files)
  bucket: "employeportal", // Update with your desired AWS S3 bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName =
      Date.now() + "_" + file.fieldname + "_" + file.originalname;
    cb(null, fileName); // Update the file naming strategy if needed
  },
});

const upload = multer({
  storage: s3Storage,
  fileFilter: (req, file, callback) => {
    sanitizeFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 50, // 2mb file size
  },
});

module.exports = {
  upload,
  s3,
};
