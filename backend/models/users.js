const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // 'baker' or 'customer'


  // baker only(optional)
  businessName: String,
  phone: String,
  location: String,
  description: String,

  settings: {
    minNotice: String,
    maxOrdersPerDay: Number,
    rushFee: Number,
    cancellationPolicy: String,

    deliveryFee: Number,
    deliveryRadius: Number,
    offerPickup: Boolean,

    minOrderValue: Number,             
    consultationFee: Number,

    customization: {
      flavors: [String],
      fillings: [String],
      shapes: [String],
      dietary: [String]
    }
  }
});


const User = mongoose.model("User", userSchema, "users");

module.exports = User;
