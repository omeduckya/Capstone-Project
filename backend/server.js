const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/users");
const Cake = require("./models/cakes");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB conection
mongoose.connect("mongodb://127.0.0.1:27017/capstone")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const JWT_SECRET = "cakecraftsecret123";

// ==========================
// user routes
// ==========================

// register
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid email or password" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ error: "Invalid email or password" });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token, role: user.role, name: user.name, id: user._id });
});

// ==========================
// cake order routes
// ==========================

// orser
app.post("/api/order", async (req, res) => {
  const { userId, flavor, shape, size, toppings } = req.body;

  let price = 20;
  if (size === "medium") price += 10;
  if (size === "large") price += 20;
  price += toppings.length * 2;

  const cake = new Cake({ userId, flavor, shape, size, toppings, price });
  await cake.save();

  res.json({ message: "Order placed", cake });
});

// get users order
app.get("/api/orders/:userId", async (req, res) => {
  const cakes = await Cake.find({ userId: req.params.userId });
  res.json(cakes);
});

// ==========================
// runserver
// ==========================
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
