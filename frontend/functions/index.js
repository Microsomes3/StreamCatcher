const functions = require("firebase-functions");
const axios = require("axios");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.exampleSchedule= functions.pubsub.schedule('every 5 minutes').onRun((context) => {
    console.log('This will be run every 5 minutes!');
    return null;
});

//schedule


// exports.callbackFromSteamerSystem = functions.https.onRequest(async (req, res) => {
//     const data = req.body;
//     console.log(data);
//     res.send("Hello from Firebase!!");
// });
