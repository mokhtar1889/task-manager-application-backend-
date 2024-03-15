import mongoose from "mongoose";

export async function connectDB() {
  return await mongoose
    .connect(process.env.DB_CONNECTION)
    .then(() => {
      console.log("database connect successfully");
    })
    .catch(() => {
      console.log("error in connection");
    });
}
