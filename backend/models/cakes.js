const mongoose = require("mongoose");
const { Schema } = mongoose;

const cakeSchema = new Schema({
  userId: { type: String, required: true },
  flavor: { type: String, required: true },
  shape: { type: String, required: true },
  size: { type: String, required: true },
  toppings: [{ type: String }],
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});


const Cake = mongoose.model("Cake", cakeSchema, "cakes");

module.exports = Cake;
