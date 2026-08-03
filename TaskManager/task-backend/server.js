const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Paste the keys you generated in Step 2 here
const publicVapidKey = "BBGmyIpedRglvEvNpr7JS3JuKLblmXcm1Iy2O7_-4kDKNa2sjlmYVxK-Uh0nCna2Y3P-r9H7yRlp4aJ2q6TGqUY";
const privateVapidKey = "vALwNTCxqFHqDCEWlNcgZCbKw_ZTtFul12aq6HpeVfA";

// Set up web-push with your keys and an email address
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  publicVapidKey,
  privateVapidKey
);

// We will temporarily store subscriptions here. 
// In a real app, save this to a database linked to the user!
let dummyDatabase = [];

// 1. Endpoint for React to send its subscription object
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  dummyDatabase.push(subscription);
  
  res.status(201).json({ message: "Subscription saved!" });
  console.log("New user subscribed!");
});

// 2. Endpoint to manually trigger a notification
app.post("/send-notification", (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body, url: "/" });

  // Loop through all saved subscriptions and send the push
  dummyDatabase.forEach(subscription => {
    webpush.sendNotification(subscription, payload).catch(err => {
      console.error("Error sending notification:", err);
    });
  });

  res.status(200).json({ message: "Notifications sent!" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));