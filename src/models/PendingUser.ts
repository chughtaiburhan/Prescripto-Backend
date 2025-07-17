import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPendingUser extends Document {
  email: string;
  hashedPassword: string;
  name: string;
  verificationCode: string;
  createdAt: Date;
}

const PendingUserSchema: Schema = new Schema<IPendingUser>({
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  name: { type: String, required: true },
  verificationCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // expires in 24h
});

const PendingUser: Model<IPendingUser> =
  mongoose.models.PendingUser ||
  mongoose.model<IPendingUser>("PendingUser", PendingUserSchema);

export default PendingUser;
