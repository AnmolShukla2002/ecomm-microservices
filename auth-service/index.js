const express = require("express");
const mongoose = require("mongoose");
const User = require("./User");
const app = express();
const PORT = process.env.PORT_ONE || 7070;
const jwt = require("jsonwebtoken");

app.use(express.json());

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

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User doesn't exists." });
    } else {
      if (password !== user.password) {
        return res.json({ message: "Password Incorrect" });
      }
      const payload = {
        email,
        name: user.name,
      };
      jwt.sign(payload, "secret", (err, token) => {
        if (err) {
          console.log(err);
        } else {
          return res.json({ token: token });
        }
      });
    }
  } catch (error) {}
});

app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.json({ message: "User Already Exists" });
    } else {
      const newUser = new User({ name, email, password });
      newUser.save();
      return res.json(newUser);
    }
  } catch (error) {
    console.log(error);
  }
});
