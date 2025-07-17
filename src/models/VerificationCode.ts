import mongoose, { Schema, models, model } from "mongoose";

const VerificationCodeSchema = new Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // expires in 10 min
});

const VerificationCode =
  models.VerificationCode || model("VerificationCode", VerificationCodeSchema);
export default VerificationCode;
