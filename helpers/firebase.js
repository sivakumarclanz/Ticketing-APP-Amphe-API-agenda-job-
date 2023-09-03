const admin = require("firebase-admin");
const serviceAccount = require("../firebase.json");
const logger = require("../helpers/logger");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  messagingSenderId: "593579597343", // Replace with your sender ID
});

const sendNotification = (
  title = "test",
  body = "test",
  token,
  status,
  id,
  trigger
) => {
  logger.info("sendNotification");
  const data = {
    ticket_id: id ? id.toString() : "", // Convert to string or use an empty string if null/undefined.
    status: status ? status.toString() : "", // Convert to string or use an empty string if null/undefined.
    trigger: trigger ? trigger.toString() : "",
  };

  const message = {
    data: data,
    notification: {
      title: title,
      body: body,
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: title,
            body: body,
          },
        },
      },
    },
    token: token,
  };

  // console.log("message:", message);

  if (!token) {
    logger.info(message, "pushNotification:tokenNotFound");
    return;
  }

  // Send a message to the device corresponding to the provided registration token.
  admin
    .messaging()
    .send(message)
    .then((response) => {
      //console.log("Successfully sent message:", response);
      logger.info({ response, message }, "pushNotification:success");
    })
    .catch((error) => {
      //console.log(`Error sending message to token ${token}:`, error);
      logger.error({ error, message }, "pushNotification:error");
    });
};

module.exports = {
  sendNotification,
  admin,
};
