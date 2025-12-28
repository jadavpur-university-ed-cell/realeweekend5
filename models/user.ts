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
      unique: true, 
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    rollNumber: {
      type: String,
      required: [true, "Roll Number is required"],
      unique: true, 
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, 
    },
    // The Array of Events
    eventsRegistered: {
      type: [String],
      enum: ["Technokraft", "PitchGenix", "Data Binge", "Corporate Devs"],
      default: [], 
    },
    // --- ADDED THIS FIELD ---
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team", // Must match the model name string in Team.ts
      default: null,
    },
    // Role based access
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    strictPopulate: false // Optional: Helps avoid errors if schema is slightly out of sync
  }
);

// CRITICAL FIX for Next.js hot-reloading:
// If the model exists but the schema has changed, delete it so it recompiles with the new field.
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = models.User || model("User", UserSchema);

export default User;
