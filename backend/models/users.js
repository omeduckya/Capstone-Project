const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentMethodSchema = new Schema(
  {
    id: { type: String, required: true },
    provider: { type: String, required: true }, // stripe | paypal
    type: { type: String, required: true }, // card | paypal
    brand: { type: String },
    last4: { type: String },
    expMonth: { type: Number },
    expYear: { type: Number },
    paypalEmail: { type: String },
    label: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const payoutAccountSchema = new Schema(
  {
    provider: { type: String, default: "stripe" },
    status: { type: String, default: "unlinked" },
    accountHolderName: { type: String },
    bankName: { type: String },
    bankAccountLast4: { type: String },
    stripeConnectAccountId: { type: String },
    linkedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // 'baker' or 'customer'
  businessName: { type: String },
  legalBusinessName: { type: String },
  businessEmail: { type: String },
  businessPhone: { type: String },
  businessAddress: { type: String },
  taxIdLast4: { type: String },
  publicProfileVisible: { type: Boolean, default: true },
  phone: { type: String },
  location: { type: String },
  description: { type: String },
  logo: { type: String },
  photo: { type: String },
  avatarPreset: { type: String },
  preferredRadius: { type: String },
  stripeCustomerId: { type: String },
  paypalEmail: { type: String },
  preferredPaymentMethod: { type: String },
  paymentMethods: [paymentMethodSchema],
  payoutAccount: payoutAccountSchema,
  passwordResetCode: { type: String },
  passwordResetExpiresAt: { type: Date },
  // baker settings
  minNotice: { type: String },
  maxOrdersPerDay: { type: String },
  rushFee: { type: String },
  cancellationPolicy: { type: String },
  deliveryFee: { type: String },
  deliveryRadius: { type: String },
  pickupOffered: { type: Boolean, default: true },
  minOrderValue: { type: String },
  consultationFee: { type: String },
  customizationOptions: { type: Schema.Types.Mixed, default: {} },
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
