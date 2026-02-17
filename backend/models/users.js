const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true } // 'baker' 或 'customer'
});


const User = mongoose.model("User", userSchema, "users");

module.exports = User;
