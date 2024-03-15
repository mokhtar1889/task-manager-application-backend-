import { User } from "../../../DB/models/user.js";
import { Token } from "../../../DB/models/token.js";
import { Task } from "../../../DB/models/task.js";
import { asyncHandler } from "../../../util/asyncHandler.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "./../../../util/sendEmail.js";
import randomstring from "randomstring";
import cloudinary from "../../../util/cloudinary.js";

//1-signUp
export const signUp = asyncHandler(async (req, res, next) => {
  let { username, email, password, age, gender, phone } = req.body;

  // check user
  let user = await User.findOne({ email });
  console.log(user);

  if (user) return next(new Error("user is already exists!!", { cause: 400 }));

  // hash password
  let hashPassword = bcryptjs.hashSync(
    password,
    parseInt(process.env.SALT_ROUND)
  );

  // add user
  await User.create({
    username,
    email,
    password: hashPassword,
    age,
    gender,
    phone,
  });

  //create Token
  const token = jwt.sign({ email: req.body.email }, process.env.TOKEN_SECRET);

  // send email
  const html = `<a href = "http://localhost:3000/auth/activateAccount/${token}">press here to activate your account</a>`;
  const isSent = await sendEmail({
    to: req.body.email,
    subject: "Account activation",
    html,
  });

  if (!isSent) return next(new Error("message not sent", { cause: 400 }));
  console.log(isSent);
  //response
  return res
    .status(201)
    .json({ success: true, message: "user Added successfully" });
});

//2-signIn
export const signIn = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;

  let user = await User.findOne({ email });

  // check user existance
  console.log(user);
  if (!user || user.isDeleted == true)
    return next(new Error("user does not exists!", { cause: 404 }));

  // check password
  let isMatch = bcryptjs.compareSync(password, user.password);
  console.log(isMatch);
  if (!isMatch) return next(new Error("invalid password", { cause: 401 }));

  // check the activation of the account
  if (!user.isActivated)
    return next(new Error("this account is not activated !!", { cause: 401 }));

  // generate token
  let token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.TOKEN_SECRET
  );

  // add token to collection
  await Token.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });

  return res.status(200).json({
    success: true,
    message: `welcome ${user.username}`,
    token,
  });
});

//3-activate account
export const activateAccount = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  console.log(token);

  // decode token
  const payLoad = jwt.verify(token, process.env.TOKEN_SECRET);

  console.log(payLoad);

  // check user
  const user = await User.findOne({ email: payLoad.email });
  if (!user) return next(new Error("user is not exist !!", { cause: 404 }));

  // change activation state to true
  user.isActivated = true;
  await user.save();

  return res.json({
    success: true,
    message: "account activated successfully you can sign in now",
  });
});

//4-changePassword
export const changePassword = asyncHandler(async (req, res, next) => {
  let { oldPassword, newPassword, confirmNewPassword } = req.body;
  let { token } = req.headers;
  let user = req.user;
  console.log(user);
  // compare password with database
  let isMatch = bcryptjs.compareSync(oldPassword, user.password);
  console.log(isMatch);

  if (!isMatch) return next(new Error("invalid password !!", { cause: 401 }));

  // hash the new password
  let newPasswordHash = bcryptjs.hashSync(
    newPassword,
    parseInt(process.env.SALT_ROUND)
  );

  // add the new password to the database
  user.password = newPasswordHash;
  user.save();

  // invalidate the token
  token = token.split(process.env.BEARER_KEY)[1];
  await Token.findOneAndUpdate({ token }, { isValid: false });

  return res
    .status(200)
    .json({ success: true, message: "password changed successfully" });
});

//5-updateUser
export const updateUser = asyncHandler(async (req, res, next) => {
  let { username, age } = req.body;
  let user = req.user;
  console.log(user);
  user.username = username;
  user.age = age;
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "user updated successfully" });
});

//6-deleteUser
export const deleteUser = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let { token } = req.headers;

  // delete all data conserned with user in cloudinary
  let result = await cloudinary.api.delete_resources_by_prefix(
    `users/${user._id}`
  );

  // delete the empty folder of the user
  let deleteResult = await cloudinary.api.delete_folder(`users/${user._id}`);

  let response = await User.deleteOne(user._id);

  // delete all tasks belonges to this user
  await Task.deleteMany({ userId: user._id });

  // destroy token
  token = token.split(process.env.BEARER_KEY)[1];
  await Token.findOneAndUpdate({ token }, { isValid: false });

  if (response.deletedCount == 1)
    return res.status(200).json({
      success: true,
      message: "user deleted successfully",
    });
});

//7-softDelete
export const softDelete = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let { token } = req.headers;
  user.isDeleted = true;
  await user.save();

  // soft delete all tasks belongs to this user
  await Task.updateMany({ userId: user._id }, { isDeleted: true });

  // destroy token
  token = token.split(process.env.BEARER_KEY)[1];
  await Token.findOneAndUpdate({ token }, { isValid: false });

  console.log(user);
  if (user.isDeleted == true) {
    return res.status(200).json({
      success: true,
      message: "user deleted successfully you can recover it in 30 days",
    });
  }
});

//8-logout
export const logOut = asyncHandler(async (req, res, next) => {
  let { token } = req.headers;
  console.log(token);

  // make token invalid
  token = token.split(process.env.BEARER_KEY)[1];
  console.log(token);
  await Token.findOneAndUpdate({ token }, { isValid: false });

  return res.status(200).json({ success: true, message: "user logged out" });
});

//9- send forget password code
export const forgetPasswordCode = asyncHandler(async (req, res, next) => {
  // check if the user is exist
  let user = await User.findOne({ email: req.body.email });
  if (!user || user.isDeleted == true)
    return next(new Error("user is not existe !!", { cause: 404 }));

  //check if the account is activated
  if (user.isActivated == false)
    return next(new Error("this account is not activated", { cause: 401 }));

  // generate the reset code
  let resetCode = randomstring.generate({
    length: 5,
    charset: "numeric",
  });

  let html = `<div>
    <h2>password recover code is</h2>
    <h3>${resetCode}</h3>
  </div>`;

  // send message to email
  let emailSent = sendEmail({
    to: user.email,
    subject: "recover password code",
    html,
  });

  // put recover code in the data base
  user.forgetPasswordCode = resetCode;
  await user.save();

  if (!emailSent) return next(new Error("email is not sent", { cause: 404 }));

  return res.json({
    success: true,
    message: "reset code has been sent to your email successfully",
  });
});

//10- reset password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, resetCode, password, confirmPassword } = req.body;

  // check if the email exists
  let user = await User.findOne({ email });
  if (!user) return next(new Error("user is not exist!"));

  if (user.forgetPasswordCode !== resetCode)
    return next(new Error("invalid reset code", { cause: 400 }));

  //hash the new password
  let hashPassword = bcryptjs.hashSync(
    password,
    parseInt(process.env.SALT_ROUND)
  );

  //save the new password in the database
  user.password = hashPassword;

  // remove the  the reset code from the database
  await User.findOneAndUpdate(
    { email: user.email },
    { $unset: { forgetPasswordCode: 1 } }
  );
  await user.save();

  // make all tokens belongs to the user is invalid
  let tokens = await Token.find({ user: user._id });
  console.log(tokens);
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  res.json({
    success: true,
    message: "password has been reseted successfully",
  });
});
