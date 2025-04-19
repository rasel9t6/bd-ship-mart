// models/User.ts
import mongoose from "mongoose";

// Slugify function to create URL-friendly strings
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin", "super_admin"],
    default: "user",
  },
  profilePicture: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  customerType: {
    type: String,
    enum: ["regular", "wholesale", "vip"],
    default: "regular",
  },
});

// Pre-save middleware to generate userId
userSchema.pre("save", function (next) {
  if (!this.userId) {
    const nameSlug = slugify(this.name);
    const timestamp = Date.now().toString().slice(-6);
    this.userId = `${nameSlug}-k2b-${timestamp}`;
  }
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
