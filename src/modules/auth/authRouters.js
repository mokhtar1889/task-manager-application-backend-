import { Router } from "express";
import * as authControllers from "./authControllers.js";
import { authMiddleWare } from "../../middlewares/auth.js";
import * as validationSchemas from "../auth/authValidationSchemas.js";
import { validation } from "../../middlewares/validation.js";

let router = Router();

//1-signUp
router.post(
  "/signUp",
  validation(validationSchemas.signupSchema),
  authControllers.signUp
);

//2-activate Account
router.get(
  "/activateAccount/:token",
  validation(validationSchemas.tokenSchema),
  authControllers.activateAccount
);

//3-signIn
router.post(
  "/signIn",
  validation(validationSchemas.signinSchema),
  authControllers.signIn
);

//4-change password
router.patch(
  "/changePassword",
  authMiddleWare,
  validation(validationSchemas.changePasswordSchema),
  authControllers.changePassword
);

//5-updata user
router.patch(
  "/updateUser",
  authMiddleWare,
  validation(validationSchemas.updateUserSchema),
  authControllers.updateUser
);

//6-deleteUser
router.delete("/deleteUser", authMiddleWare, authControllers.deleteUser);

//7-softDelete
router.patch("/softDelete", authMiddleWare, authControllers.softDelete);

//8-logOut
router.post("/logOut", authMiddleWare, authControllers.logOut);

//9- forget password (send reset password code)
router.patch(
  "/forgetPassword",
  validation(validationSchemas.forgetPasswordSchema),
  authControllers.forgetPasswordCode
);

//10-reset password
router.patch(
  "/resetPassword",
  validation(validationSchemas.resetCodeSchema),
  authControllers.resetPassword
);

export default router;
