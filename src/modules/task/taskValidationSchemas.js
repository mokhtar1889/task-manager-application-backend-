import joi from "joi";
import * as validationErrors from "../../../util/validationErrorsMessages.js";
import mongoose, { Types } from "mongoose";

// add task schema
export const addTaskSchama = joi
  .object({
    title: joi.string().messages(validationErrors.titleError),
    description: joi
      .string()
      .min(5)
      .required()
      .messages(validationErrors.descriptionError),
    status: joi
      .string()
      .valid("toDo", "doing", "done")
      .required()
      .messages(validationErrors.statusError),
    deadline: joi.date().messages(validationErrors.dateError),
  })
  .required();

// update task schema
export const updateTaskSchema = joi
  .object({
    // title
    title: joi.string().messages(validationErrors.titleError),
    //description
    description: joi
      .string()
      .min(5)
      .required()
      .messages(validationErrors.descriptionError),
    // status
    status: joi
      .string()
      .valid("toDo", "doing", "done")
      .messages(validationErrors.statusError),
    //taskId
    taskId: joi
      .custom((value, helper) => {
        if (Types.ObjectId.isValid(value)) return true;
        return helper.message("invalid id");
      })
      .required()
      .messages(validationErrors.taskIdError),
    //assignTo
    assignTo: joi.custom((value, helper) => {
      if (Types.ObjectId.isValid(value)) return true;
      return helper.message("invalid id");
    }),
  })
  .required();

// delete task schema
export const taskIdSchema = joi.object({
  taskId: joi
    .custom((value, helper) => {
      if (Types.ObjectId.isValid(value)) return true;
      return helper.message("invalid task id");
    })
    .required()
    .messages(validationErrors.taskIdError),
});
