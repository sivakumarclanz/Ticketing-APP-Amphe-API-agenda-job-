const Aws = require("aws-sdk");
// const Aws3 = require('@aws-sdk/client-s3')

const region = "us-west-2";
const accessKeyId = "AKIA4YHVZOTBHMQRCWAX";
const secreteKey = "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";

//config
Aws.config.update({
  region,
  credentials: { accessKeyId: accessKeyId, secretAccessKey: secreteKey },
});

module.exports = {
  Aws,
};
