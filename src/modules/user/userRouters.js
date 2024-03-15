import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.js";
import { uploadFile } from "../../../util/multer.js";
import * as userControllers from "./userControllers.js";
import { validation } from "../../middlewares/validation.js";
import * as validationSchemas from "../../modules/task/taskValidationSchemas.js";

const router = new Router();

//1- upload profile picture
router.post(
  "/uploadProfilePicture",
  authMiddleWare,
  uploadFile().single("profilePicture"),
  userControllers.uploadProfilePicture
);

//2-upload cover pictures
router.post(
  "/uploadCoverPictures",
  authMiddleWare,
  uploadFile().array("coverPictures"),
  userControllers.uploadCoverPictures
);

//3-add attachments to task
router.post(
  "/addAttachments/:taskId",
  authMiddleWare,
  validation(validationSchemas.taskIdSchema),
  uploadFile().array("attachments"),
  userControllers.addAttachmets
);

//4-delete profile picture
router.delete(
  "/deleteProfilePicture",
  authMiddleWare,
  userControllers.deleteProfilePicture
);

export default router;
