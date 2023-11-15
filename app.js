const express = require("express");
const axios = require("axios");
const base64 = require("base-64");
const https = require("https");
const fs = require("fs");

const app = express();
app.use(express.json());

// Encode your credentials
const username = "your_whatsapp_business_username";
const password = "your_whatsapp_business_password";
const encodedCredentials = base64.encode(`${username}:${password}`);

// Set up the HTTP request headers
const headers = {
  Authorization: `Basic ${encodedCredentials}`,
};

// Send a POST request to the WhatsApp API login endpoint
axios
  .post("https://your-whatsapp-api-endpoint/login", {}, { headers: headers })
  .then((response) => {
    // Here you'll receive the bearer token in the response
    const bearerToken = response.data.token;
    // Store the bearer token securely and use it for subsequent requests
  })
  .catch((error) => {
    // Handle errors here
  });

// Replace with your actual file paths and names for SSL certificate and private key
const privateKey = fs.readFileSync("./credentials/private-key.pem", "utf8");
const certificate = fs.readFileSync("./credentials/certificate.pem", "utf8");

const credentials = { key: privateKey, cert: certificate };

// console.log("credentials", credentials);

app.post("/v1/users/login", async (req, res) => {
  try {
    // Replace 'your-whatsapp-api-endpoint' with your WhatsApp Business API endpoint
    const response = await axios.post(
      "your-whatsapp-api-endpoint/v1/users/login",
      {
        username: "your-username",
        password: "your-password",
      }
    );

    // Send back the token to the client
    res.json({ token: response.data.token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Authentication failed", error: error.response.data });
  }
});

// Verification handler
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "YOUR_VERIFY_TOKEN"; // Replace with your verify token

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.get("/health", (req, res) => {
  res.send("Health is fines");
});

// Event notification handler
app.post("/webhook", (req, res) => {
  console.log("Incoming webhook:", req.body);

  // Process the incoming webhook event notification here

  // Respond to WhatsApp servers
  res.status(200).send("EVENT_RECEIVED");
});

// Start https server
// const httpsServer = https.createServer(credentials, app);
// httpsServer.listen(443, () => {
//   console.log("HTTPS Server running on port 443");
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
