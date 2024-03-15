import { Task } from "./../../../DB/models/task.js";
import { User } from "./../../../DB/models/user.js";
import { asyncHandler } from "../../../util/asyncHandler.js";
import cloudinary from "../../../util/cloudinary.js";

//1-add task
export const addTask = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let { title, description, status, deadline } = req.body;
  let date = new Date(deadline);
  let task = await Task.create({
    title,
    description,
    status,
    userId: user._id,
    assignTo: user._id,
    deadline: date,
  });
  user.tasks.push(task._id);
  user.save();
  return res.status(201).json({
    success: true,
    message: `task added to ${user.username} successfully `,
  });
});

//2-update task
export const updateTask = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let { title, description, status, taskId, assignTo } = req.body;

  // check if the user own this task
  let task = user.tasks.find((task) => task == taskId);
  if (!task)
    return next(
      new Error("sorry you are not the owner of this task to update", {
        cause: 403,
      })
    );

  // check if the user who task will assign to is exists
  let userAssignTo = await User.findById({ _id: assignTo });
  if (!userAssignTo)
    return next(
      new Error("this user does not exists to assign to this task", {
        cause: 404,
      })
    );

  // update the task
  let respose = await Task.findByIdAndUpdate(
    task,
    {
      title,
      description,
      status,
      assignTo,
    },
    { returnDocument: "after" }
  );
  return res
    .status(200)
    .json({ success: true, message: "task updated successfully" });
});

//3-delete task
export const deleteTask = asyncHandler(async (req, res, next) => {
  let { taskId } = req.params;
  let user = req.user;
  console.log(user);
  let task = await Task.findById({ _id: taskId });
  console.log(task);
  // check if task is exist
  if (!task) return next(new Error("Task does not exists", { cause: 404 }));

  // check the ownership of the task
  if (task.userId.toString() != user._id.toString())
    return next(
      new Error("you are not the owner of this note to delete", { cause: 403 })
    );

  // delete task attachments from cloudinary
  let result = await cloudinary.api.delete_resources_by_prefix(
    `users/${user._id}/tasksAttachments/${taskId}`
  );
  // delete task folder from user
  let deleteResult = await cloudinary.api.delete_folder(
    `users/${user._id}/tasksAttachments/${taskId}`
  );

  // delete task from collection
  let response = await task.deleteOne();

  // delete task from user's tasks
  let taskIndex = user.tasks.indexOf(task._id);
  user.tasks.splice(taskIndex, 1);
  user.save();

  return res
    .status(200)
    .json({ success: true, message: "task deleted successfully" });
});

//4- get all tasks with user data
export const getAllTasks = asyncHandler(async (req, res, next) => {
  let tasks = await Task.find({ isDeleted: false }).populate("userId");
  console.log(tasks.length);
  if (tasks.length == 0)
    return res.status(200).json({ message: "there is no tasks to show" });
  res.status(200).json({ success: true, numberOfTasks: tasks.length, tasks });
});

//5- get tasks of one user with user data
export const getTasksOfUser = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let tasks = await Task.find({ userId: user._id, isDeleted: false }).populate(
    "userId"
  );

  if (tasks.length == 0)
    return res
      .status(200)
      .json({ numberOfResults: tasks.length, message: "user has no tasks" });
  return res
    .status(200)
    .json({ success: true, numberOfResults: tasks.length, tasks });
});

//6-get all tasks that not done after deadline
export const getTasksBydeadLine = asyncHandler(async (req, res, next) => {
  let allTasks = await Task.find({
    isDeleted: false,
    status: "done",
  });

  // find all tasks that the owner of tasks update their status to done before the deadline
  let tasks = allTasks.filter(
    (task) => task.deadline > task.updatedAt && task.status == "done"
  );

  if (tasks.length == 0) {
    return res
      .status(200)
      .json({ success: true, message: "no tasks done after deadline" });
  }
  return res
    .status(200)
    .json({ success: true, numberOfTasks: tasks.length, tasks });
});
