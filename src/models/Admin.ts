import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, default: "doctor" },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
