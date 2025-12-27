import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensures no duplicate emails
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    rollNumber: {
      type: String,
      required: [true, "Roll Number is required"],
      unique: true, // Ensures no duplicate roll numbers
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Prevents password from returning in queries by default
    },
    // The Array of Events
    eventsRegistered: {
      type: [String],
      enum: ["Technokraft", "PitchGenix", "Data Binge", "Corporate Devs"],
      default: [], // Starts empty
    },
    // Role based access
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Prevent compiling the model multiple times in Next.js
const User = models.User || model("User", UserSchema);

export default User;
