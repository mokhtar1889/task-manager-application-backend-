import authRouters from "./src/modules/auth/authRouters.js";
import taskRouters from "./src/modules/task/taskRouters.js";
import express from "express";
import { connectDB } from "./DB/connection.js";
import { globalErrorHandler } from "./util/globalErrorHandler.js";
import { notFoundPageHandler } from "./util/notFoundPageHandler.js";
import userRouters from "./src/modules/user/userRouters.js";
import cors from "cors";

export let bootstrap = async (app) => {
  await connectDB();
  app.use(express.json());
  app.use(cors());
  app.use("/auth", authRouters);
  app.use("/task", taskRouters);
  app.use("/user", userRouters);
  app.all("*", notFoundPageHandler);
  app.use(globalErrorHandler);
};
