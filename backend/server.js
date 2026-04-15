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
  .catch((error) => console.log("MongoDB connection error:", error));

// --------------------
// Health check
// --------------------
app.get("/", (request, response) => {
  response.send("Server is live!");
});

// --------------------
// User routes
// --------------------

// Register
app.post("/api/register", async (request, response) => {
  const { name, email, password, role } = request.body;
  if (!name || !email || !password || !role) {
    return response.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    response.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      response.status(400).json({ error: "Email already exists" });
    } else {
      response.status(500).json({ error: "Server error" });
    }
  }
});

// Login
app.post("/api/login", async (request, response) => {
  const { email, password } = request.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return response.status(400).json({ error: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return response.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    response.json({ message: "Login successful", token, role: user.role, name: user.name, id: user._id });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Server error" });
  }
});

// --------------------
// Cake routes
// --------------------

// Place order
app.post("/api/order", async (request, response) => {
  const { userId, flavor, shape, size, toppings } = request.body;

  try {
    let price = 20;
    if (size === "medium") price += 10;
    if (size === "large") price += 20;
    price += toppings.length * 2;

    const cake = new Cake({ userId, flavor, shape, size, toppings, price });
    await cake.save();
    response.status(201).json({ message: "Order placed", cake });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Server error" });
  }
});

// Get user orders
app.get("/api/orders/:userId", async (request, response) => {
  try {
    const cakes = await Cake.find({ userId: request.params.userId });
    response.json(cakes);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Server error" });
  }
});


// server.js

// Add new cake
app.post("/api/cakes", async (request, response) => {
  const { userId, name, description, price, size, shape, flavor, filling, tiers, frosting } = request.body;
  if (!userId || !name || !price) {
    return response.status(400).json({ error: "userId, name and price are required" });
  }

  try {
    const cake = new Cake({
      userId,
      name,
      description,
      price,
      size,
      shape,
      flavor,
      filling,
      tiers,
      frosting,
      orders: 0,
      rating: 5.0,
    });
    await cake.save();
    response.status(201).json(cake);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Server error" });
  }
});

app.get("/api/cakes", async (request, response) => {
  try {
    const { userId } = request.query;
    const filter = userId ? { userId } : {};
    const cakes = await Cake.find(filter);
    response.json(cakes); 
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});



// renew cake
app.put("/api/cakes/:id", async (request, response) => {
  try {
    const updatedCake = await Cake.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true }
    );

    if (!updatedCake) {
      return response.status(404).json({ error: "Cake not found" });
    }

    response.json(updatedCake);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to update cake" });
  }
});

// delete cake
app.delete("/api/cakes/:id", async (request, response) => {
  try {
    const cake = await Cake.findByIdAndDelete(request.params.id);

    if (!cake) {
      return response.status(404).json({ error: "Cake not found" });
    }

    response.json({ message: "Deleted successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});