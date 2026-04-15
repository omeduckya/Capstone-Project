const mongoose = require("mongoose");
const { Schema } = mongoose;

const cakeSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  servings: String,
  prepTime: String,
  size: String,
  shape: String,
  flavor: String,
  filling: String,
  orders: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  notes: String
});


const Cake = mongoose.model("Cake", cakeSchema, "cakes");

module.exports = Cake;
