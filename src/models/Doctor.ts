import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    speciality: { type: String, default: "General Physician" },
    degree: { type: String, default: "MBBS" },
    experience: { type: String, default: "5 years" },
    about: {
      type: String,
      default:
        "Experienced doctor with expertise in various medical conditions.",
    },
    available: { type: Boolean, default: true },
    fees: { type: Number, default: 100 },
    address: { type: String, default: "" },
    slot_booked: { type: Object, default: {} },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance (removed duplicate email index)
doctorSchema.index({ available: 1 });
doctorSchema.index({ speciality: 1 });
doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ slot_booked: 1 });

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
export default Doctor;
