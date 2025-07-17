import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userDate: { type: String, required: true },
    docDate: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    cancelled: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    payment: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ docId: 1 });
appointmentSchema.index({ cancelled: 1 });
appointmentSchema.index({ payment: 1 });
appointmentSchema.index({ slotDate: 1 });
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ userId: 1, cancelled: 1 });
appointmentSchema.index({ docId: 1, cancelled: 1 });

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
export default Appointment;
