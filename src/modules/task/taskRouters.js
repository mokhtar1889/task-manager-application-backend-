import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.js";
import * as taskControllers from "./taskControllers.js";
import * as taskValidation from "./../../modules/task/taskValidationSchemas.js";
import { validation } from "../../middlewares/validation.js";

let router = Router();

// add task
router.post(
  "/addTask",
  authMiddleWare,
  validation(taskValidation.addTaskSchama),
  taskControllers.addTask
);

// update task
router.patch(
  "/updateTask",
  authMiddleWare,
  validation(taskValidation.updateTaskSchema),
  taskControllers.updateTask
);

//delete task
router.delete(
  "/deleteTask/:taskId",
  authMiddleWare,
  validation(taskValidation.taskIdSchema),
  taskControllers.deleteTask
);

// get all tasks with users data
router.get("/getAllTasks", taskControllers.getAllTasks);

// get tasks of one user with user data
router.get("/getUserTasks", authMiddleWare, taskControllers.getTasksOfUser);

// get tasks that not done after deadline
router.get("/getTasksBydeadLine", taskControllers.getTasksBydeadLine);

export default router;
