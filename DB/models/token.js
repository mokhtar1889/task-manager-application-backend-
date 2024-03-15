import mongoose, { Schema } from "mongoose";

const tokenSchema = new Schema(
  {
    token: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    isValid: { type: Boolean, default: true },
    agent: String,
    expiredAt: String,
  },
  { timestamps: true }
);

export const Token = mongoose.model("token", tokenSchema);
