import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String }, // Not required for temp user
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Not required for temp user
    role: {
      type: String,
      enum: ["patient", "doctor"],
      default: "patient",
    },
    image: {
      type: String,
      default: "",
    },
    address: {
      line: { type: String, default: "" },
      line2: { type: String, default: "" },
    },
    gender: { type: String, default: "Not Selected" },
    dob: { type: String, default: "Not Selected" },
    phone: { type: String, default: "000000" },
    verificationCode: { type: String },
    isVerified: { type: Boolean, default: false },
    resetCode: { type: String },
  },
  {
    timestamps: true,
  }
); 

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
