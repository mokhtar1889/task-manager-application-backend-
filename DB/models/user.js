import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    age: Number,
    gender: { type: String, enum: ["male", "female"] },
    phone: String,
    isDeleted: { type: Boolean, default: false },
    tasks: [{ type: Schema.Types.ObjectId, ref: "task" }],
    isActivated: { type: Boolean, default: false },
    forgetPasswordCode: String,
    profilePicture: { secure_url: String, public_id: String },
    coverPictures: [{ secure_url: String, public_id: String, _id: false }],
  },
  {
    timestamps: true,
  }
);

export let User = mongoose.model("user", userSchema);
