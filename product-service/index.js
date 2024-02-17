const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const Product = require("./Product");

app.use(express.json());

var channel, connection;

mongoose
  .connect("mongodb://localhost/product-service")
  .then(() => {
    console.log(`Product-Service DB Connected`);
    app.listen(PORT, () => {
      console.log(`Product-Service at ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = connection.createChannel();
  (await channel).assertQueue("PRODUCT");
}

connect();
