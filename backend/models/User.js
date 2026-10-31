import mongoose from "mongoose";

// 1. Define how a User document looks in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Prevents two users from sharing the same email
      lowercase: true,
      trim: true,
    },
    // Optional for users who sign up via Google
    passwordHash: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "agent"],
      default: "agent",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// 2. Hide passwordHash when converting the document to JSON response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

export const User = mongoose.model("User", userSchema);
