// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch (error) {
  console.warn("nodemailer is not installed yet. Welcome emails are disabled.");
}

const User = require("./models/users");
const Cake = require("./models/cakes");

const app = express();
const PORT = process.env.PORT || 5000;
const {
  DB_URI,
  JWT_SECRET,
  CLOUDINARY_URL,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM,
  MAIL_SECURE,
} = process.env;
console.log("CLOUDINARY_URL from env:", CLOUDINARY_URL);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ensure uploads dir exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

function configureCloudinary(cloudinaryUrl) {
  if (!cloudinaryUrl) {
    return false;
  }

  try {
    const parsed = new URL(cloudinaryUrl);
    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: decodeURIComponent(parsed.username || ""),
      api_secret: decodeURIComponent(parsed.password || ""),
      secure: true,
    });
    return true;
  } catch (error) {
    console.error("Failed to parse CLOUDINARY_URL", error);
    return false;
  }
}

const hasCloudinaryConfig = configureCloudinary(CLOUDINARY_URL);

if (!hasCloudinaryConfig) {
  console.warn("CLOUDINARY_URL is not configured. Uploads to Cloudinary will fail.");
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      cb(null, true);
      return;
    }

    const error = new Error("Only image uploads are allowed.");
    error.code = "INVALID_FILE_TYPE";
    cb(error);
  },
});

const uploadFiles = upload.array("files", 5);
const ALLOWED_UPLOAD_CONTEXTS = new Set(["baker", "customer", "cake", "general"]);

function getRequestId() {
  return `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

function getUploadContext(value) {
  return ALLOWED_UPLOAD_CONTEXTS.has(value) ? value : "general";
}

function generateResetCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

function parseMoney(value) {
  if (value === undefined || value === null || value === "") return Number.NaN;
  if (typeof value === "number") return value;
  const normalized = String(value).replace(/[^0-9.-]/g, "");
  return Number(normalized);
}

function normalizeStringList(values) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );
}

function normalizeBakerCustomizationOptions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      flavours: [],
      frostings: [],
      fillings: [],
      shapes: [],
      dietary: [],
      tiers: [],
    };
  }

  return {
    flavours: normalizeStringList(value.flavours),
    frostings: normalizeStringList(value.frostings),
    fillings: normalizeStringList(value.fillings),
    shapes: normalizeStringList(value.shapes),
    dietary: normalizeStringList(value.dietary),
    tiers: normalizeStringList(value.tiers),
  };
}

const mailTransport =
  nodemailer && MAIL_HOST && MAIL_PORT && MAIL_USER && MAIL_PASS
    ? nodemailer.createTransport({
        host: MAIL_HOST,
        port: Number(MAIL_PORT),
        secure: String(MAIL_SECURE || "").toLowerCase() === "true" || Number(MAIL_PORT) === 465,
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASS,
        },
      })
    : null;

const welcomeLogoPath = path.join(__dirname, "..", "frontend", "src", "assets", "logo_horizontal.png");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderWelcomeEmailShell({
  eyebrow,
  title,
  intro,
  highlights,
  closingNote,
  ctaLabel,
  ctaHref,
  footerNote,
}) {
  const highlightHtml = highlights
    .map(
      (item) => `
        <tr>
          <td style="padding: 0 0 14px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td width="44" valign="top">
                  <div style="width: 32px; height: 32px; border-radius: 12px; background: #fff1f5; color: #ff3366; font-size: 18px; line-height: 32px; text-align: center; font-weight: 700;">
                    ${escapeHtml(item.icon)}
                  </div>
                </td>
                <td valign="top">
                  <div style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px;">
                    ${escapeHtml(item.title)}
                  </div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">
                    ${escapeHtml(item.copy)}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="margin: 0; padding: 24px 12px; background: #ffffff; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; border-collapse: collapse;">
        <tr>
          <td style="padding: 0 0 18px; text-align: center;">
            <img src="cid:cakecraft-logo" alt="CakeCraft Studio" style="display: inline-block; width: 180px; max-width: 100%;" />
          </td>
        </tr>
        <tr>
          <td style="padding: 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #fff7f5 0%, #ffe4ea 100%); border-radius: 28px; overflow: hidden; border-collapse: separate; box-shadow: 0 18px 48px rgba(17, 24, 39, 0.08);">
              <tr>
                <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #fff4ef 0%, #fff6fb 100%);">
                  <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: #ffffff; color: #ff3366; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 18px;">
                    ${escapeHtml(eyebrow)}
                  </div>
                  <h1 style="margin: 0 0 12px; font-size: 30px; line-height: 1.2; color: #111827;">
                    ${escapeHtml(title)}
                  </h1>
                  <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #4b5563;">
                    ${escapeHtml(intro)}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px 32px 8px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    ${highlightHtml}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 32px 0;">
                  <div style="padding: 18px 20px; border-radius: 20px; background: #fff7fa; border: 1px solid #ffd6e2; font-size: 14px; line-height: 1.7; color: #374151;">
                    ${escapeHtml(closingNote)}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 32px 18px;">
                  ${
                    ctaHref
                      ? `<a href="${escapeHtml(ctaHref)}" style="display: inline-block; padding: 14px 22px; border-radius: 999px; background: #ff3366; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none;">${escapeHtml(ctaLabel)}</a>`
                      : `<div style="display: inline-block; padding: 14px 22px; border-radius: 999px; background: #ff3366; color: #ffffff; font-size: 14px; font-weight: 700;">${escapeHtml(ctaLabel)}</div>`
                  }
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 30px; font-size: 12px; line-height: 1.7; color: #6b7280;">
                  ${escapeHtml(footerNote)}
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 32px; border-top: 1px solid #f3e8ee;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 18px;">
                    <tr>
                      <td style="font-size: 12px; color: #6b7280; line-height: 1.7;">
                        Need help? Reach us anytime at ${escapeHtml(MAIL_FROM || MAIL_USER || "CakeCraft Studio support")}.
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 6px; font-size: 12px; color: #9ca3af;">
                        CakeCraft Studio • Custom cakes, trusted bakers, sweeter celebrations.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function getWelcomeEmailContent({ role, name, businessName }) {
  if (role === "baker") {
    return {
      subject: "Welcome to CakeCraft Studio - important baker onboarding details",
      html: renderWelcomeEmailShell({
        eyebrow: "Baker onboarding",
        title: `Welcome to CakeCraft Studio, ${name || businessName || "Baker"}!`,
        intro:
          "We are excited to have you on the platform. Before you start selling, please make sure your shop and policies are ready for customers.",
        highlights: [
          {
            icon: "1",
            title: "Keep your profile accurate",
            copy: "Make sure your pricing, cake photos, availability, delivery range, and turnaround times stay current.",
          },
          {
            icon: "2",
            title: "Only accept what you can fulfill",
            copy: "Customers rely on your timing and quality. Accept orders only when you can deliver them confidently.",
          },
          {
            icon: "3",
            title: "Handle food details carefully",
            copy: "Ingredient accuracy, allergy communication, dietary notes, and food safety remain your responsibility.",
          },
          {
            icon: "4",
            title: "Complete your business setup",
            copy: "Review payout info, visibility settings, pickup or delivery policies, cancellation terms, and rush-order rules.",
          },
          {
            icon: "5",
            title: "Understand platform fees",
            copy: "CakeCraft Studio keeps a fee from each order processed on the platform, so please factor platform costs into your pricing strategy.",
          },
        ],
        closingNote:
          "By continuing to list and sell on CakeCraft Studio, you agree to follow seller expectations and keep your bakery information up to date.",
        ctaLabel: "Review your seller settings",
        ctaHref: "http://localhost:5173/settings",
        footerNote:
          "CakeCraft Studio is here to help you build trust with customers from the very first order.",
      }),
      text: `Welcome to CakeCraft Studio, ${name || businessName || "Baker"}!

We are excited to have you on the platform.

Before you start selling, please make sure you:
- keep your profile, pricing, availability, and cake photos accurate
- only accept orders you can fulfill on time
- handle ingredients, allergy communication, and food safety carefully
- complete your payout, delivery, cancellation, and rush-order setup
- understand that CakeCraft Studio keeps a fee from each platform order

Review your seller settings here:
http://localhost:5173/settings

By continuing to list and sell on CakeCraft Studio, you agree to follow seller expectations and keep your bakery information up to date.

CakeCraft Studio`,
    };
  }

  return {
    subject: "Welcome to CakeCraft Studio",
    html: renderWelcomeEmailShell({
      eyebrow: "Customer welcome",
      title: `Welcome to CakeCraft Studio, ${name || "Customer"}!`,
      intro:
        "You are all set to discover local bakers, browse beautiful cake galleries, and place orders with confidence.",
      highlights: [
        {
          icon: "1",
          title: "Browse bakers near you",
          copy: "Explore profiles, compare styles, and filter by your location to find the right bakery for your event.",
        },
        {
          icon: "2",
          title: "Order listed cakes or customize",
          copy: "Choose an available cake or request custom changes when a baker allows personalization.",
        },
        {
          icon: "3",
          title: "Track everything in one place",
          copy: "Save favorites, manage payment methods, follow order updates, and keep your account details current.",
        },
        {
          icon: "4",
          title: "Wait for baker approval",
          copy: "After checkout, the baker reviews the request before moving forward so expectations stay clear on both sides.",
        },
      ],
      closingNote:
        "A great first step is to add your photo or avatar, set your location, and start exploring baker profiles that match your style.",
      ctaLabel: "Start exploring bakers",
      ctaHref: "http://localhost:5173/home",
      footerNote:
        "Thanks for choosing CakeCraft Studio for your celebrations, birthdays, and big moments.",
    }),
    text: `Welcome to CakeCraft Studio, ${name || "Customer"}!

You are all set to discover local bakers, browse cake galleries, and place orders with confidence.

Here is how the platform works:
- browse bakers near you
- order listed cakes or customize when a baker allows it
- save favorites and manage payment methods
- track order updates in one place
- wait for baker approval after checkout

Start exploring bakers here:
http://localhost:5173/home

Thanks for choosing CakeCraft Studio for your celebrations and big moments.

CakeCraft Studio`,
  };
}

async function sendWelcomeEmail(user) {
  if (!mailTransport || !MAIL_FROM || !user?.email) {
    return false;
  }

  const { subject, html, text } = getWelcomeEmailContent({
    role: user.role,
    name: user.name,
    businessName: user.businessName,
  });

  await mailTransport.sendMail({
    from: MAIL_FROM,
    to: user.email,
    subject,
    html,
    text,
    attachments: fs.existsSync(welcomeLogoPath)
      ? [
          {
            filename: "cakecraft-logo.png",
            path: welcomeLogoPath,
            cid: "cakecraft-logo",
          },
        ]
      : [],
  });

  return true;
}

async function sendPlatformEmail({ to, subject, eyebrow, title, intro, highlights, closingNote, ctaLabel, ctaHref, footerNote }) {
  if (!mailTransport || !MAIL_FROM || !to) {
    return false;
  }

  await mailTransport.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    html: renderWelcomeEmailShell({
      eyebrow,
      title,
      intro,
      highlights,
      closingNote,
      ctaLabel,
      ctaHref,
      footerNote,
    }),
    text: [
      title,
      "",
      intro,
      "",
      ...highlights.map((item) => `- ${item.title}: ${item.copy}`),
      "",
      closingNote,
      ctaHref ? `\n${ctaLabel}: ${ctaHref}` : "",
      "",
      footerNote,
    ].filter(Boolean).join("\n"),
    attachments: fs.existsSync(welcomeLogoPath)
      ? [
          {
            filename: "cakecraft-logo.png",
            path: welcomeLogoPath,
            cid: "cakecraft-logo",
          },
        ]
      : [],
  });

  return true;
}

function formatOrderDateValue(raw) {
  if (!raw) return "Date to be confirmed";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return String(raw);
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildOrderEmailHighlights(order) {
  return [
    { icon: "1", title: "Cake", copy: order?.name || order?.flavor || "Custom cake" },
    { icon: "2", title: "Price", copy: `$${Number(order?.price || 0).toFixed(0)}` },
    { icon: "3", title: "Pickup / delivery date", copy: formatOrderDateValue(order?.deliveryDate || order?.createdAt) },
    { icon: "4", title: "Time", copy: order?.deliveryTime || "To be confirmed" },
  ];
}

async function sendBakerNewOrderEmail(order) {
  const baker = await User.findOne({ _id: order?.bakerId, role: "baker" }).select("email name businessName");
  if (!baker?.email) return false;

  return sendPlatformEmail({
    to: baker.email,
    subject: "New CakeCraft order received",
    eyebrow: "New order",
    title: `You received a new order${baker.businessName ? ` for ${baker.businessName}` : ""}`,
    intro: `${order?.customerName || "A customer"} placed an order and it is waiting for your review.`,
    highlights: buildOrderEmailHighlights(order),
    closingNote: "Open your dashboard to accept, adjust, or decline the request.",
    ctaLabel: "Review order",
    ctaHref: "http://localhost:5173/orders",
    footerNote: "CakeCraft Studio will keep your customer updated as you move the order forward.",
  });
}

async function getCustomerForOrder(order) {
  if (order?.customerId) {
    const customer = await User.findOne({ _id: order.customerId, role: "customer" }).select("email name");
    if (customer?.email) return customer;
  }

  if (order?.customerEmail) {
    const customer = await User.findOne({ email: order.customerEmail, role: "customer" }).select("email name");
    if (customer?.email) return customer;
  }

  return {
    email: order?.customerEmail || "",
    name: order?.customerName || "Customer",
  };
}

async function sendCustomerOrderStatusEmail(order, statusLabel, intro, closingNote) {
  const customer = await getCustomerForOrder(order);
  if (!customer?.email) return false;

  return sendPlatformEmail({
    to: customer.email,
    subject: `CakeCraft update: ${statusLabel}`,
    eyebrow: "Order update",
    title: `${order?.name || order?.flavor || "Your cake order"}: ${statusLabel}`,
    intro,
    highlights: buildOrderEmailHighlights(order),
    closingNote,
    ctaLabel: "View my orders",
    ctaHref: "http://localhost:5173/my-orders",
    footerNote: "Thank you for ordering through CakeCraft Studio.",
  });
}

async function sendBakerApprovalNeededEmail(order) {
  const baker = await User.findOne({ _id: order?.bakerId, role: "baker" }).select("email name businessName");
  if (!baker?.email) return false;

  return sendPlatformEmail({
    to: baker.email,
    subject: "Customer approved your updated price",
    eyebrow: "Customer approved",
    title: `${order?.customerName || "Your customer"} approved the updated price`,
    intro: "The customer accepted the new price you proposed. Please review the order again and continue the workflow.",
    highlights: buildOrderEmailHighlights(order),
    closingNote: "Open the order to accept it and continue with preparation.",
    ctaLabel: "Open order",
    ctaHref: `http://localhost:5173/orders/${order?._id}`,
    footerNote: "CakeCraft Studio keeps both sides in sync as order details change.",
  });
}

async function sendTomorrowReminderEmails() {
  if (!mailTransport || !MAIL_FROM) return;

  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().slice(0, 10);

  const candidateOrders = await Cake.find({
    recordType: "order",
    bakerId: { $exists: true, $ne: "" },
    deliveryDate: { $exists: true, $ne: "" },
    reminderSentForDate: { $ne: tomorrowKey },
    status: { $nin: ["declined", "completed", "delivered"] },
  });

  const ordersForTomorrow = candidateOrders.filter((order) => {
    const key = new Date(order.deliveryDate).toISOString().slice(0, 10);
    return key === tomorrowKey;
  });

  if (!ordersForTomorrow.length) return;

  const grouped = new Map();
  ordersForTomorrow.forEach((order) => {
    const current = grouped.get(order.bakerId) || [];
    current.push(order);
    grouped.set(order.bakerId, current);
  });

  for (const [bakerId, bakerOrders] of grouped.entries()) {
    const baker = await User.findOne({ _id: bakerId, role: "baker" }).select("email businessName name");
    if (!baker?.email) continue;

    await sendPlatformEmail({
      to: baker.email,
      subject: "Reminder: tomorrow's CakeCraft orders",
      eyebrow: "Tomorrow's cakes",
      title: `You have ${bakerOrders.length} cake order${bakerOrders.length === 1 ? "" : "s"} tomorrow`,
      intro: "Here is your quick reminder so tomorrow's pickups and deliveries stay on track.",
      highlights: bakerOrders.slice(0, 4).map((order, index) => ({
        icon: `${index + 1}`,
        title: `${order.name || order.flavor || "Custom cake"} for ${order.customerName || "Customer"}`,
        copy: `${formatOrderDateValue(order.deliveryDate)} at ${order.deliveryTime || "To be confirmed"} • $${Number(order.price || 0).toFixed(0)}`,
      })),
      closingNote: "Open your calendar or orders page tonight to double-check timing, notes, and delivery plans.",
      ctaLabel: "Open calendar",
      ctaHref: "http://localhost:5173/orders/calendar",
      footerNote: "CakeCraft Studio reminders help you stay one step ahead of tomorrow's schedule.",
    });

    await Cake.updateMany(
      { _id: { $in: bakerOrders.map((order) => order._id) } },
      { $set: { reminderSentForDate: tomorrowKey } }
    );
  }
}

let reminderLoopStarted = false;
function startReminderLoop() {
  if (reminderLoopStarted) return;
  reminderLoopStarted = true;

  const runSafely = () => {
    sendTomorrowReminderEmails().catch((error) => {
      console.error("Failed to send tomorrow reminder emails", error);
    });
  };

  runSafely();
  setInterval(runSafely, 60 * 60 * 1000);
}

function uploadToCloudinary(file, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 1600, crop: "limit" }, { quality: "auto" }],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
}

function handleUploadMiddleware(req, res, next) {
  uploadFiles(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "Each image must be 5MB or smaller." });
        return;
      }

      res.status(400).json({ error: err.message });
      return;
    }

    if (err.code === "INVALID_FILE_TYPE") {
      res.status(400).json({ error: err.message });
      return;
    }

    next(err);
  });
}

// --------------------
// MongoDB connection
// --------------------
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("MongoDB connected (Atlas)");
    startReminderLoop();
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
app.post("/api/register", async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    businessName,
    legalBusinessName,
    businessEmail,
    businessPhone,
    businessAddress,
    taxIdLast4,
    publicProfileVisible,
    phone,
    location,
    description,
    logo,
    photo,
    avatarPreset,
  } = req.body;
  if (!name || !email || !password || !role) {
    return response.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      businessName,
      legalBusinessName,
      businessEmail,
      businessPhone,
      businessAddress,
      taxIdLast4,
      publicProfileVisible,
      phone,
      location,
      description,
      logo,
      photo,
      avatarPreset,
    });
    await user.save();
    let welcomeEmailSent = false;
    try {
      welcomeEmailSent = await sendWelcomeEmail(user);
    } catch (mailError) {
      console.error("Failed to send welcome email", mailError);
    }
    res.status(201).json({ message: "User registered successfully", welcomeEmailSent });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
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
    res.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      id: user._id,
      businessName: user.businessName,
      legalBusinessName: user.legalBusinessName,
      businessEmail: user.businessEmail,
      businessPhone: user.businessPhone,
      businessAddress: user.businessAddress,
      taxIdLast4: user.taxIdLast4,
      publicProfileVisible: user.publicProfileVisible,
      phone: user.phone,
      location: user.location,
      preferredRadius: user.preferredRadius,
      paypalEmail: user.paypalEmail,
      preferredPaymentMethod: user.preferredPaymentMethod,
      paymentMethods: user.paymentMethods,
      payoutAccount: user.payoutAccount,
      description: user.description,
      logo: user.logo,
      photo: user.photo,
      avatarPreset: user.avatarPreset,
      minNotice: user.minNotice,
      maxOrdersPerDay: user.maxOrdersPerDay,
      rushFee: user.rushFee,
      cancellationPolicy: user.cancellationPolicy,
      deliveryFee: user.deliveryFee,
      deliveryRadius: user.deliveryRadius,
      pickupOffered: user.pickupOffered,
      minOrderValue: user.minOrderValue,
      consultationFee: user.consultationFee,
      customizationOptions: user.customizationOptions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required." });
  }

  try {
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ error: "No account matches that email." });
    }

    const resetCode = generateResetCode();
    user.passwordResetCode = resetCode;
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.json({
      message: "Reset code created.",
      resetCode,
      expiresInMinutes: 15,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { email, role, code, newPassword } = req.body;

  if (!email || !role || !code || !newPassword) {
    return res.status(400).json({ error: "Email, role, code, and new password are required." });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  try {
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ error: "Account not found." });
    }

    const isExpired =
      !user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt).getTime() < Date.now();

    if (!user.passwordResetCode || user.passwordResetCode !== String(code).trim() || isExpired) {
      return res.status(400).json({ error: "Reset code is invalid or expired." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetCode = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------
// Cake routes
// --------------------

// Image upload (single or multiple)
app.post("/api/upload", handleUploadMiddleware, async (req, res) => {
  const requestId = getRequestId();

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  if (!hasCloudinaryConfig) {
    return res.status(500).json({ error: "Cloudinary is not configured on the server." });
  }

  const context = getUploadContext(req.query.context);
  const folder = `cakecraft/${context}`;

  try {
    const results = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file, folder))
    );
    const urls = results.map((result) => result.secure_url);
    res.status(201).json({ urls });
  } catch (err) {
    console.error(`[upload:${requestId}] Cloudinary upload failed`, err);
    if (err.code === "EACCES") {
      res.status(502).json({
        error: "Cloudinary could not be reached from this server process. Restart the backend with network access and try again.",
      });
      return;
    }

    res.status(502).json({
      error:
        err.message ||
        "Image upload failed. Please try again.",
    });
  }
});

// Place order (customer)
app.post("/api/order", async (req, res) => {
  const {
    cakeId,
    userId,
    bakerId,
    bakerName,
    customerId,
    name,
    description,
    mainImage,
    galleryImages = [],
    price,
    flavor,
    shape,
    size,
    toppings = [],
    filling,
    tiers,
    frosting,
    customMessage,
    colorNotes,
    dietaryNotes,
    rushOrder,
    notes,
    customerInstructions,
    customerName,
    customerEmail,
    customerPhone,
    customerLocation,
    customerPhoto,
    customerAvatarPreset,
    deliveryMethod,
    deliveryDate,
    deliveryTime,
    inspirationImage,
    referenceImage,
  } = req.body;

  try {
    let customerProfile = null;
    if (customerId || userId) {
      customerProfile = await User.findOne({ _id: customerId || userId, role: "customer" }).select(
        "name email phone location photo avatarPreset"
      );
    }

    let listingCake = null;
    if (cakeId) {
      listingCake = await Cake.findOne({
        _id: cakeId,
        $or: [
          { recordType: "cake" },
          {
            $and: [
              { recordType: { $exists: false } },
              { customerId: { $exists: false } },
              { customerName: { $exists: false } },
            ],
          },
        ],
      });
    }

    let finalPrice = parseMoney(listingCake?.price ?? price);
    if (Number.isNaN(finalPrice) || finalPrice <= 0) {
      finalPrice = 20;
      if (size === "medium") finalPrice += 10;
      if (size === "large") finalPrice += 20;
      finalPrice += toppings.length * 2;
    }

    const cake = new Cake({
      recordType: "order",
      cakeId: cakeId || listingCake?._id?.toString() || "",
      userId: bakerId || userId,
      bakerId: bakerId || userId,
      bakerName: bakerName || "",
      customerId: customerId || "",
      name: listingCake?.name || name,
      description: listingCake?.description || description,
      flavor: listingCake?.flavor || flavor,
      shape: listingCake?.shape || shape,
      size,
      filling,
      fillings: filling ? [filling] : [],
      tiers,
      frosting,
      customMessage,
      colorNotes,
      dietaryNotes,
      rushOrder: Boolean(rushOrder),
      notes,
      customerInstructions: customerInstructions || "",
      toppings,
      customerName: customerName || customerProfile?.name || "",
      customerEmail: customerEmail || customerProfile?.email || "",
      customerPhone: customerPhone || customerProfile?.phone || "",
      customerLocation: customerLocation || customerProfile?.location || "",
      customerPhoto: customerPhoto || customerProfile?.photo || "",
      customerAvatarPreset: customerAvatarPreset || customerProfile?.avatarPreset || "",
      deliveryMethod,
      deliveryDate,
      deliveryTime,
      inspirationImage: inspirationImage || "",
      referenceImage: referenceImage || inspirationImage || "",
      mainImage: listingCake?.mainImage || mainImage,
      galleryImages: Array.isArray(listingCake?.galleryImages) && listingCake.galleryImages.length ? listingCake.galleryImages : galleryImages,
      price: finalPrice,
      status: "pending",
    });
    await cake.save();
    try {
      await sendBakerNewOrderEmail(cake);
    } catch (mailError) {
      console.error("Failed to send baker new-order email", mailError);
    }
    res.status(201).json({ message: "Order placed", cake });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user orders
app.get("/api/orders/:userId", async (request, response) => {
  try {
    const orders = await Cake.find({
      $and: [
        {
          $or: [
            { recordType: "order" },
            { customerId: { $exists: true, $ne: "" } },
            { customerName: { $exists: true, $ne: "" } },
          ],
        },
        {
          $or: [
            { customerId: req.params.userId },
            { userId: req.params.userId },
          ],
        },
      ],
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// List all orders (optional filter by userId)
app.get("/api/orders", async (req, res) => {
  try {
    const filter = {
      $or: [
        { recordType: "order" },
        { customerId: { $exists: true, $ne: "" } },
        { customerName: { $exists: true, $ne: "" } },
      ],
    };

    if (req.query.bakerId) {
      filter.$and = [
        {
          $or: [
            { bakerId: req.query.bakerId },
            { userId: req.query.bakerId, recordType: "order" },
          ],
        },
      ];
    }

    if (req.query.customerId) {
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { customerId: req.query.customerId },
            { userId: req.query.customerId, customerName: { $exists: true, $ne: "" } },
          ],
        },
      ];
    }

    const orders = await Cake.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/orders/order/:id", async (req, res) => {
  try {
    const order = await Cake.findOne({
      _id: req.params.id,
      $or: [
        { recordType: "order" },
        { customerId: { $exists: true, $ne: "" } },
        { customerName: { $exists: true, $ne: "" } },
      ],
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update order (price/status) by id
app.put("/api/orders/:id", async (req, res) => {
  const { price, status, adjustmentReason, cakeRating, bakerRating, reviewNote } = req.body;

  try {
    const cake = await Cake.findById(req.params.id);
    if (!cake) return res.status(404).json({ error: "Order not found" });

    if (status === "adjusted") {
      const proposedPrice = parseMoney(price);
      if (Number.isNaN(proposedPrice) || proposedPrice <= 0) {
        return res.status(400).json({ error: "Adjusted price must be a valid number" });
      }

      if (normalizeStatusValue(cake.status) === "completed") {
        return res.status(400).json({ error: "Completed orders cannot be adjusted" });
      }

      cake.previousPrice = Number(cake.price || 0);
      cake.proposedPrice = proposedPrice;
      cake.statusBeforeAdjustment =
        normalizeStatusValue(cake.status) === "adjusted" ? cake.statusBeforeAdjustment || "pending" : cake.status || "pending";
      cake.status = "adjusted";
      cake.customerApprovalStatus = "pending";
      cake.adjustmentRequestedAt = new Date();
      if (adjustmentReason !== undefined) cake.adjustmentReason = adjustmentReason;
      await cake.save();
      try {
        await sendCustomerOrderStatusEmail(
          cake,
          "Price updated",
          "Your baker updated the price for your order. Please review the new amount and approve or decline it in My Orders.",
          "You can approve the new price or decline the order from your customer dashboard."
        );
      } catch (mailError) {
        console.error("Failed to send adjusted-price email", mailError);
      }
      return res.json(cake);
    }

    if (price !== undefined) {
      const nextPrice = parseMoney(price);
      if (Number.isNaN(nextPrice)) {
        return res.status(400).json({ error: "price must be a number" });
      }
      cake.price = nextPrice;
    }

    if (cakeRating !== undefined || bakerRating !== undefined || reviewNote !== undefined) {
      const normalizedStatus = normalizeStatusValue(cake.status);
      if (!["completed", "delivered"].includes(normalizedStatus)) {
        return res.status(400).json({ error: "You can rate only completed orders" });
      }

      const normalizedCakeRating =
        cakeRating === undefined || cakeRating === null || cakeRating === "" ? undefined : Number(cakeRating);
      const normalizedBakerRating =
        bakerRating === undefined || bakerRating === null || bakerRating === "" ? undefined : Number(bakerRating);

      if (
        (normalizedCakeRating !== undefined &&
          (!Number.isInteger(normalizedCakeRating) || normalizedCakeRating < 1 || normalizedCakeRating > 5)) ||
        (normalizedBakerRating !== undefined &&
          (!Number.isInteger(normalizedBakerRating) || normalizedBakerRating < 1 || normalizedBakerRating > 5))
      ) {
        return res.status(400).json({ error: "Ratings must be whole numbers between 1 and 5" });
      }

      if (cakeRating !== undefined) cake.cakeRating = normalizedCakeRating;
      if (bakerRating !== undefined) cake.bakerRating = normalizedBakerRating;
      if (reviewNote !== undefined) cake.reviewNote = typeof reviewNote === "string" ? reviewNote.trim() : "";
      cake.reviewCreatedAt = new Date();
    }

    if (status) {
      cake.status = status;
      if (status !== "adjusted") {
        cake.customerApprovalStatus = "not_required";
        cake.proposedPrice = undefined;
        cake.previousPrice = undefined;
        cake.statusBeforeAdjustment = undefined;
        cake.adjustmentRequestedAt = undefined;
      }
    }

    if (adjustmentReason !== undefined) cake.adjustmentReason = adjustmentReason;

    await cake.save();

    const normalizedStatus = normalizeStatusValue(cake.status);
    if (["accepted", "declined", "completed", "ready for pickup", "delivered"].includes(normalizedStatus)) {
      const statusEmailCopy = {
        accepted: [
          "Order accepted",
          "Good news - your baker accepted the order and is ready to move forward.",
          "You can track the next steps anytime in My Orders.",
        ],
        declined: [
          "Order declined",
          "Your baker declined this order request.",
          "You can browse other bakers or place a different order anytime.",
        ],
        completed: [
          "Order completed",
          "Your baker marked this order as completed.",
          "We hope your celebration was extra sweet.",
        ],
        "ready for pickup": [
          "Ready for pickup",
          "Your cake is ready for pickup.",
          "Please head to My Orders for the final pickup details.",
        ],
        delivered: [
          "Order delivered",
          "Your cake was marked as delivered.",
          "We hope everything arrived perfectly.",
        ],
      }[normalizedStatus];

      try {
        await sendCustomerOrderStatusEmail(cake, statusEmailCopy[0], statusEmailCopy[1], statusEmailCopy[2]);
      } catch (mailError) {
        console.error("Failed to send order status email", mailError);
      }
    }

    res.json(cake);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

function normalizeStatusValue(status) {
  return String(status || "").toLowerCase().replace(/_/g, " ");
}

app.put("/api/orders/:id/customer-response", async (req, res) => {
  const { action } = req.body;

  if (!["approve", "decline"].includes(action)) {
    return res.status(400).json({ error: "action must be approve or decline" });
  }

  try {
    const order = await Cake.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (
      normalizeStatusValue(order.status) !== "adjusted" ||
      !["pending", undefined, null, ""].includes(order.customerApprovalStatus)
    ) {
      return res.status(400).json({ error: "This order does not have a pending price adjustment" });
    }

    if (action === "approve") {
      order.price = Number(order.proposedPrice || order.price || 0);
      order.status = "pending";
      order.customerApprovalStatus = "approved";
    } else {
      order.status = "declined";
      order.customerApprovalStatus = "declined";
    }

    order.proposedPrice = undefined;
    order.previousPrice = undefined;
    order.statusBeforeAdjustment = undefined;
    order.adjustmentRequestedAt = undefined;
    await order.save();

    if (action === "approve") {
      try {
        await sendBakerApprovalNeededEmail(order);
      } catch (mailError) {
        console.error("Failed to send baker approval-needed email", mailError);
      }
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/orders/:id/review", async (req, res) => {
  const { cakeRating, bakerRating, reviewNote } = req.body;

  const normalizedCakeRating = cakeRating === undefined || cakeRating === null || cakeRating === ""
    ? undefined
    : Number(cakeRating);
  const normalizedBakerRating = bakerRating === undefined || bakerRating === null || bakerRating === ""
    ? undefined
    : Number(bakerRating);

  if (
    (normalizedCakeRating !== undefined && (!Number.isInteger(normalizedCakeRating) || normalizedCakeRating < 1 || normalizedCakeRating > 5)) ||
    (normalizedBakerRating !== undefined && (!Number.isInteger(normalizedBakerRating) || normalizedBakerRating < 1 || normalizedBakerRating > 5))
  ) {
    return res.status(400).json({ error: "Ratings must be whole numbers between 1 and 5" });
  }

  if (normalizedCakeRating === undefined && normalizedBakerRating === undefined) {
    return res.status(400).json({ error: "Add at least one rating before saving" });
  }

  try {
    const order = await Cake.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const normalizedStatus = normalizeStatusValue(order.status);
    if (!["completed", "delivered"].includes(normalizedStatus)) {
      return res.status(400).json({ error: "You can rate only completed orders" });
    }

    order.cakeRating = normalizedCakeRating;
    order.bakerRating = normalizedBakerRating;
    order.reviewNote = typeof reviewNote === "string" ? reviewNote.trim() : "";
    order.reviewCreatedAt = new Date();
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update baker profile (basic fields and logo)
app.put("/api/bakers/:id", async (req, res) => {
  const {
    email,
    businessName,
    phone,
    location,
    description,
    logo,
    name,
    minNotice,
    maxOrdersPerDay,
    rushFee,
    cancellationPolicy,
    deliveryFee,
    deliveryRadius,
    pickupOffered,
    minOrderValue,
    consultationFee,
    customizationOptions,
    legalBusinessName,
    businessEmail,
    businessPhone,
    businessAddress,
    taxIdLast4,
    publicProfileVisible,
  } = req.body;
  try {
    const update = {};
    if (email !== undefined) update.email = email;
    if (businessName !== undefined) update.businessName = businessName;
    if (phone !== undefined) update.phone = phone;
    if (location !== undefined) update.location = location;
    if (description !== undefined) update.description = description;
    if (logo !== undefined) update.logo = logo;
    if (name !== undefined) update.name = name;
    if (minNotice !== undefined) update.minNotice = minNotice;
    if (maxOrdersPerDay !== undefined) update.maxOrdersPerDay = maxOrdersPerDay;
    if (rushFee !== undefined) update.rushFee = rushFee;
    if (cancellationPolicy !== undefined) update.cancellationPolicy = cancellationPolicy;
    if (deliveryFee !== undefined) update.deliveryFee = deliveryFee;
    if (deliveryRadius !== undefined) update.deliveryRadius = deliveryRadius;
    if (pickupOffered !== undefined) update.pickupOffered = pickupOffered;
    if (minOrderValue !== undefined) update.minOrderValue = minOrderValue;
    if (consultationFee !== undefined) update.consultationFee = consultationFee;
    if (customizationOptions !== undefined) {
      update.customizationOptions = normalizeBakerCustomizationOptions(customizationOptions);
    }
    if (legalBusinessName !== undefined) update.legalBusinessName = legalBusinessName;
    if (businessEmail !== undefined) update.businessEmail = businessEmail;
    if (businessPhone !== undefined) update.businessPhone = businessPhone;
    if (businessAddress !== undefined) update.businessAddress = businessAddress;
    if (taxIdLast4 !== undefined) update.taxIdLast4 = taxIdLast4;
    if (publicProfileVisible !== undefined) update.publicProfileVisible = publicProfileVisible;

    const baker = await User.findOneAndUpdate(
      { _id: req.params.id, role: "baker" },
      update,
      { new: true }
    ).select("name email businessName legalBusinessName businessEmail businessPhone businessAddress taxIdLast4 publicProfileVisible phone location description logo minNotice maxOrdersPerDay rushFee cancellationPolicy deliveryFee deliveryRadius pickupOffered minOrderValue consultationFee customizationOptions");
    if (!baker) return res.status(404).json({ error: "Baker not found" });
    res.json(baker);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Update customer profile fields including avatar
app.put("/api/customers/:id", async (req, res) => {
  const {
    name,
    email,
    phone,
    location,
    photo,
    avatarPreset,
    preferredRadius,
    paypalEmail,
    preferredPaymentMethod,
  } = req.body;

  try {
    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (location !== undefined) update.location = location;
    if (photo !== undefined) update.photo = photo;
    if (avatarPreset !== undefined) update.avatarPreset = avatarPreset;
    if (preferredRadius !== undefined) update.preferredRadius = preferredRadius;
    if (paypalEmail !== undefined) update.paypalEmail = paypalEmail;
    if (preferredPaymentMethod !== undefined) update.preferredPaymentMethod = preferredPaymentMethod;

    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "customer" },
      update,
      { new: true }
    ).select("name email phone location photo avatarPreset preferredRadius paypalEmail preferredPaymentMethod paymentMethods");

    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/customers/:id/payment-methods", async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" })
      .select("paymentMethods paypalEmail preferredPaymentMethod");
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({
      paymentMethods: customer.paymentMethods || [],
      paypalEmail: customer.paypalEmail || "",
      preferredPaymentMethod: customer.preferredPaymentMethod || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/customers/:id/payment-methods/card", async (req, res) => {
  const { paymentMethodId, brand, last4, expMonth, expYear } = req.body;

  if (!paymentMethodId) {
    return res.status(400).json({ error: "paymentMethodId is required" });
  }

  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const existing = Array.isArray(customer.paymentMethods) ? customer.paymentMethods : [];
    const withoutCurrent = existing.filter((method) => method.id !== paymentMethodId);
    const hasDefault = withoutCurrent.some((method) => method.isDefault);
    const nextMethod = {
      id: paymentMethodId,
      provider: "stripe",
      type: "card",
      brand: brand || "Card",
      last4: last4 || "",
      expMonth: expMonth ? Number(expMonth) : undefined,
      expYear: expYear ? Number(expYear) : undefined,
      label: brand && last4 ? `${brand} ending in ${last4}` : "Saved card",
      isDefault: !hasDefault,
    };

    customer.paymentMethods = [nextMethod, ...withoutCurrent.map((method) => ({ ...method.toObject?.() || method, isDefault: method.isDefault && hasDefault }))];
    if (!customer.preferredPaymentMethod || nextMethod.isDefault) {
      customer.preferredPaymentMethod = paymentMethodId;
    }
    await customer.save();

    res.status(201).json({
      paymentMethods: customer.paymentMethods,
      preferredPaymentMethod: customer.preferredPaymentMethod || "",
      paypalEmail: customer.paypalEmail || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/customers/:id/payment-methods/paypal", async (req, res) => {
  const { paypalEmail } = req.body;
  if (!paypalEmail) {
    return res.status(400).json({ error: "paypalEmail is required" });
  }

  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const existing = Array.isArray(customer.paymentMethods) ? customer.paymentMethods : [];
    const paypalId = `paypal_${paypalEmail.trim().toLowerCase()}`;
    const withoutPaypal = existing.filter((method) => method.provider !== "paypal");
    const hasDefault = withoutPaypal.some((method) => method.isDefault);
    const paypalMethod = {
      id: paypalId,
      provider: "paypal",
      type: "paypal",
      paypalEmail,
      label: `PayPal (${paypalEmail})`,
      isDefault: !hasDefault,
    };

    customer.paypalEmail = paypalEmail;
    customer.paymentMethods = [...withoutPaypal, paypalMethod];
    if (!customer.preferredPaymentMethod || paypalMethod.isDefault) {
      customer.preferredPaymentMethod = paypalId;
    }
    await customer.save();

    res.status(201).json({
      paymentMethods: customer.paymentMethods,
      preferredPaymentMethod: customer.preferredPaymentMethod || "",
      paypalEmail: customer.paypalEmail || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/customers/:id/payment-methods/default", async (req, res) => {
  const { paymentMethodId } = req.body;
  if (!paymentMethodId) {
    return res.status(400).json({ error: "paymentMethodId is required" });
  }

  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    customer.paymentMethods = (customer.paymentMethods || []).map((method) => ({
      ...method.toObject?.() || method,
      isDefault: method.id === paymentMethodId,
    }));
    customer.preferredPaymentMethod = paymentMethodId;
    await customer.save();

    res.json({
      paymentMethods: customer.paymentMethods,
      preferredPaymentMethod: customer.preferredPaymentMethod || "",
      paypalEmail: customer.paypalEmail || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/customers/:id/payment-methods/:paymentMethodId", async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const paymentMethodId = req.params.paymentMethodId;
    const nextMethods = (customer.paymentMethods || []).filter((method) => method.id !== paymentMethodId);
    if (nextMethods.length > 0 && !nextMethods.some((method) => method.isDefault)) {
      nextMethods[0] = { ...nextMethods[0].toObject?.() || nextMethods[0], isDefault: true };
    }

    customer.paymentMethods = nextMethods;
    if (customer.preferredPaymentMethod === paymentMethodId) {
      customer.preferredPaymentMethod = nextMethods[0]?.id || "";
    }
    if (!nextMethods.some((method) => method.provider === "paypal")) {
      customer.paypalEmail = "";
    }
    await customer.save();

    res.json({
      paymentMethods: customer.paymentMethods,
      preferredPaymentMethod: customer.preferredPaymentMethod || "",
      paypalEmail: customer.paypalEmail || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/bakers/:id/payout-method", async (req, res) => {
  try {
    const baker = await User.findOne({ _id: req.params.id, role: "baker" })
      .select("payoutAccount");
    if (!baker) return res.status(404).json({ error: "Baker not found" });
    res.json({
      payoutAccount: baker.payoutAccount || { provider: "stripe", status: "unlinked" },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/bakers/:id/payout-method", async (req, res) => {
  const { accountHolderName, bankName, bankAccountLast4, stripeConnectAccountId } = req.body;

  if (!accountHolderName || !bankName || !bankAccountLast4) {
    return res.status(400).json({ error: "accountHolderName, bankName, and bankAccountLast4 are required" });
  }

  try {
    const baker = await User.findOne({ _id: req.params.id, role: "baker" });
    if (!baker) return res.status(404).json({ error: "Baker not found" });

    baker.payoutAccount = {
      provider: "stripe",
      status: "linked",
      accountHolderName,
      bankName,
      bankAccountLast4: String(bankAccountLast4).slice(-4),
      stripeConnectAccountId: stripeConnectAccountId || baker.payoutAccount?.stripeConnectAccountId || "",
      linkedAt: new Date(),
    };
    await baker.save();

    res.json({ payoutAccount: baker.payoutAccount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------
// Cake listings
// --------------------

// Create a cake listing
app.post("/api/cakes", async (req, res) => {
  const {
    userId,
    name,
    description,
    flavor,
    shape,
    size,
    toppings = [],
    price,
    servings,
    prepTime,
    filling,
    tiers,
    frosting,
    notes,
    mainImage,
    galleryImages = [],
    allowCustomMessage = false,
    allowColorCustomization = false,
    availableForRushOrders = false,
    dietaryOptionsAvailable = false,
  } = req.body;

  if (!userId || !flavor || !shape || !size || price === undefined || price === null) {
    return res.status(400).json({ error: "userId, flavor, shape, size, and price are required" });
  }

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) {
    return res.status(400).json({ error: "price must be a number" });
  }

  try {
    const cake = new Cake({
      recordType: "cake",
      userId,
      name,
      description,
      flavor,
      shape,
      size,
      toppings,
      price: numericPrice,
      servings,
      prepTime,
      filling,
      fillings: filling ? [filling] : [],
      tiers,
      frosting,
      notes,
      mainImage,
      galleryImages,
      allowCustomMessage,
      allowColorCustomization,
      availableForRushOrders,
      dietaryOptionsAvailable,
    });

    await cake.save();
    res.status(201).json(cake);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// List cakes (optionally filtered by user)
app.get("/api/cakes", async (req, res) => {
  const filter = {
    $and: [
      req.query.userId ? { userId: req.query.userId } : {},
      {
        $or: [
          { recordType: "cake" },
          {
            $and: [
              { recordType: { $exists: false } },
              { customerId: { $exists: false } },
              { customerName: { $exists: false } },
            ],
          },
        ],
      },
    ],
  };
  try {
    const cakes = await Cake.find(filter).sort({ createdAt: -1 });
    res.json(cakes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// List all bakers
app.get("/api/bakers", async (_req, res) => {
  try {
    const bakers = await User.find({ role: "baker", publicProfileVisible: { $ne: false } }).select("name businessName location description phone logo deliveryRadius publicProfileVisible");
    res.json(bakers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/bakers/:id/settings", async (req, res) => {
  try {
    const baker = await User.findOne({ _id: req.params.id, role: "baker" }).select(
      "name businessName legalBusinessName businessEmail businessPhone businessAddress taxIdLast4 publicProfileVisible phone location description email logo minNotice maxOrdersPerDay rushFee cancellationPolicy deliveryFee deliveryRadius pickupOffered minOrderValue consultationFee customizationOptions"
    );
    if (!baker) return res.status(404).json({ error: "Baker not found" });
    res.json(baker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single baker
app.get("/api/bakers/:id", async (req, res) => {
  try {
    const baker = await User.findOne({
      _id: req.params.id,
      role: "baker",
      publicProfileVisible: { $ne: false },
    }).select(
      "name businessName publicProfileVisible location description phone email logo minNotice maxOrdersPerDay rushFee cancellationPolicy deliveryFee deliveryRadius pickupOffered minOrderValue consultationFee customizationOptions"
    );
    if (!baker) return res.status(404).json({ error: "Baker not found or not publicly visible" });
    res.json(baker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single cake by id
app.get("/api/cakes/:id", async (req, res) => {
  try {
    const cake = await Cake.findOne({
      _id: req.params.id,
      $or: [
        { recordType: "cake" },
        {
          $and: [
            { recordType: { $exists: false } },
            { customerId: { $exists: false } },
            { customerName: { $exists: false } },
          ],
        },
      ],
    });
    if (!cake) return res.status(404).json({ error: "Cake not found" });
    res.json(cake);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update cake by id
app.put("/api/cakes/:id", async (req, res) => {
  const {
    name,
    description,
    flavor,
    shape,
    size,
    toppings = [],
    price,
    servings,
    prepTime,
    filling,
    tiers,
    frosting,
    notes,
    mainImage,
    galleryImages = [],
    allowCustomMessage,
    allowColorCustomization,
    availableForRushOrders,
    dietaryOptionsAvailable,
  } = req.body;

  if (price !== undefined && Number.isNaN(Number(price))) {
    return res.status(400).json({ error: "price must be a number" });
  }

  try {
    const update = {
      name,
      description,
      flavor,
      shape,
      size,
      toppings,
      servings,
      prepTime,
      filling,
      tiers,
      frosting,
      notes,
      mainImage,
      galleryImages,
      allowCustomMessage,
      allowColorCustomization,
      availableForRushOrders,
      dietaryOptionsAvailable,
    };
    if (price !== undefined) update.price = Number(price);

    const cake = await Cake.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!cake) return res.status(404).json({ error: "Cake not found" });
    res.json(cake);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
