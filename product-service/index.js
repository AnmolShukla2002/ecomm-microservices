const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const Product = require("./Product");
const isAuthenticated = require("../isAuthenticated");

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
  channel = await connection.createChannel(); // Await the creation of the channel
  channel.assertQueue("PRODUCT");
}

connect();

app.post("/product/create", isAuthenticated, async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const newProduct = new Product({
      name,
      description,
      price,
    });
    await newProduct.save();
    return res.json(newProduct);
  } catch (error) {
    console.log(error);
  }
});

app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  try {
    const products = await Product.find({ _id: { $in: ids } });
    // Check if channel is initialized
    if (channel) {
      channel.sendToQueue(
        "ORDER",
        Buffer.from(
          JSON.stringify({
            products,
            userEmail: req.user.email,
          })
        )
      );
    } else {
      console.error("Channel is not initialized");
    }
  } catch (error) {
    console.log(error);
  }
});
