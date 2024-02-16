const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT_ONE || 7070;

mongoose
  .connect("mongodb://localhost/auth-service")
  .then(() => {
    console.log(`Auth-Service DB Connected`);
    app.listen(PORT, () => {
      console.log(`Auth-Service at ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

app.use(express.json());
