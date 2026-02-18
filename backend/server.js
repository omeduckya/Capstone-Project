// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/users");
const Cake = require("./models/cakes");

const app = express();
const PORT = process.env.PORT || 5000;
const { DB_URI, JWT_SECRET } = process.env;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// MongoDB connection
// --------------------
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("MongoDB connected (Atlas)");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("MongoDB connection error:", err));

// --------------------
// Health check
// --------------------
app.get("/", (req, res) => {
  res.send("Server is live!");
});

// --------------------
// User routes
// --------------------

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token, role: user.role, name: user.name, id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------
// Cake routes
// --------------------

// Place order
app.post("/api/order", async (req, res) => {
  const { userId, flavor, shape, size, toppings } = req.body;

  try {
    let price = 20;
    if (size === "medium") price += 10;
    if (size === "large") price += 20;
    price += toppings.length * 2;

    const cake = new Cake({ userId, flavor, shape, size, toppings, price });
    await cake.save();
    res.status(201).json({ message: "Order placed", cake });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user orders
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const cakes = await Cake.find({ userId: req.params.userId });
    res.json(cakes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
