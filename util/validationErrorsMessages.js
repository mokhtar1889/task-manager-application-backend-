///////////////////// user validation error messages ////////////////////////////
export const usernameErrors = {
  "string.base": "name must be a string",
  "string.alphanum": "name must contain only numbers or letters",
  "any.required": "username is required",
  "string.empty": "username not allowed to be empty",
};

export const emailErrors = {
  "string.base": "email must be a string",
  "string.email": "invalid email",
  "any.required": "email is required",
  "string.empty": "email not allowed to be empty",
};
export const passwordErrors = {
  "string.base": "password must be a string",
  "any.required": "password is required",
  "string.empty": "password not allowed to be empty",
};

export const ageErrors = {
  "number.base": "age must be a number",
  "any.required": "age is required",
};

export const genderErrors = {
  "string.base": "gender must be string",
  "any.only": "gender must be male or female only",
  "string.empty": "gender not allowed to be empty",
};

export const phoneErrors = {
  "string.base": "phone must be string",
  "string.pattern.base": "invalid phone number",
  "string.empty": "phone not allowed to be empty",
};

export const confirmPasswordErrors = {
  "string.base": "confirmed password must be a string",
  "any.only": "passwords must match each other",
  "any.required": "confirmed password is required",
  "string.empty": "confirmed password not allowed to be empty",
};

export const newPasswordErrors = {
  "string.base": "new password must be a string",
  "any.required": "new password is required",
  "string.empty": "new password not allowed to be empty",
};

export const tokenErrors = {
  "string.base": "token must be a string",
  "any.required": "token is required",
};

export const resetCodeErrors = {
  "string.base": "reset code must be a string",
  "any.required": "reset code is required",
  "string.length": "reset code length must be 5 character",
  "string.empty": "reset code not allowed to be empty",
};
////////////////////////////task validation error messages/////////////////////////////////////
export const titleError = {
  "string.base": "title must be a string",
  "string.empty": "title not allowed to be empty",
};
export const descriptionError = {
  "string.base": "description must be string",
  "string.min": " description length must be greater than 5 character",
  "any.required": "description is required",
  "string.empty": "description not allowed to be empty",
};

export const statusError = {
  "string.base": "status must be string",
  "any.required": "status is required",
  "any.only": "status must be one of these three values (toDo , doing , done)",
  "string.empty": "status not allowed to be empty",
};

export const dateError = {
  "date.base": "invalid date please Enter date in this manner (year/month/day)",
};

export const taskIdError = {
  "any.required": "task Id is required",
};
