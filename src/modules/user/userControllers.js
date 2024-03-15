import { asyncHandler } from "./../../../util/asyncHandler.js";
import { Task } from "../../../DB/models/task.js";
import cloudinary from "../../../util/cloudinary.js";
import { fileTypeValidation } from "../../../util/fileMimeTypeValidation.js";

//1- upolaod profile picture
export const uploadProfilePicture = asyncHandler(async (req, res, next) => {
  const profilePicture = req.file;
  const user = req.user;
  console.log(profilePicture);

  // check if the file exists
  if (!profilePicture)
    return next(new Error("uploaded picture is missing !!", { cause: 400 }));

  // check the file type
  if (!fileTypeValidation.image.includes(profilePicture.mimetype))
    return next(new Error("file must be an image!!", { cause: 400 }));

  // upload profile picture to cloudinary
  const result = await cloudinary.uploader.upload(profilePicture.path, {
    folder: `users/${user._id}/profilePicture`,
  });

  // check if the file uploaded
  if (!result) return next(new Error("profile picture did not uploaded"));

  // add profile picture in the database
  user.profilePicture = {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
  await user.save();

  return res.json({
    success: true,
    message: "profile picture uploaded successfully",
  });
});

//2-upload cover pictures
export const uploadCoverPictures = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const coverPictures = req.files;
  console.log(coverPictures);

  // check if the file exists
  if (!coverPictures || coverPictures.length == 0)
    return next(new Error("uploaded picture is missing !!", { cause: 400 }));

  // check the type of the images
  for (let i = 0; i < coverPictures.length; i++) {
    if (!fileTypeValidation.image.includes(coverPictures[i].mimetype))
      return next(new Error("all files must be a images", { cause: 400 }));
  }

  //upload files to cloudinary
  for (let i = 0; i < coverPictures.length; i++) {
    const result = await cloudinary.uploader.upload(coverPictures[i].path, {
      folder: `users/${user._id}/coverPictures`,
    });
    // check if files uploaded
    if (!result) return next(new Error("failed to upload files"));

    //add cover pictures to database
    user.coverPictures.push({
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  }
  await user.save();

  res.json({ success: true, message: "cover pictures uploaded successfully" });
});

//3-add attachments to task
export const addAttachmets = asyncHandler(async (req, res, next) => {
  let attachments = req.files;
  let user = req.user;
  let { taskId } = req.params;

  // check if the files exists
  if (!attachments || attachments.length == 0)
    return next(new Error("there is no file to upload!!", { cause: 400 }));

  // check if the task exists
  let task = await Task.findById(taskId);
  if (!task) return next(new Error("task is not exists!!", { cause: 400 }));

  //check task owner
  if (user._id.toString() !== task.userId.toString())
    return next(
      new Error("you are not the owner of the task to attach file to !!", {
        cause: 401,
      })
    );

  // upload attachments to cloudinary
  for (let i = 0; i < attachments.length; i++) {
    let results = await cloudinary.uploader.upload(attachments[i].path, {
      folder: `users/${user._id}/tasksAttachments/${task._id}`,
      resource_type: "auto",
      //resource_type: 'raw'
    });

    // check if files uploaded
    if (!results) return next(new Error("failed to upload files!!"));

    // add attachments to task in the database
    task.attachments.push({
      secure_url: results.secure_url,
      public_id: results.public_id,
    });
  }
  await task.save();
  return res.json({ success: true, message: "attachments added successfully" });
});

//4-delete profile picture of user
export const deleteProfilePicture = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let profilePicturePublicId = user.profilePicture.public_id;
  console.log(profilePicturePublicId);

  // check if profile picture exists
  if (!profilePicturePublicId)
    return next(
      new Error("there is no profile picture to delete!", { cause: 400 })
    );

  // delete profile picture from cloudinary
  const cloudinaryResult = await cloudinary.uploader.destroy(
    profilePicturePublicId
  );

  // delete the empty folder of the user profilePicture
  let deleteResult = await cloudinary.api.delete_folder(
    `users/${user._id}/profilePicture`
  );

  // delete profile picture from database
  const databaseResult = await user.updateOne({
    $unset: { profilePicture: 1 },
  });
  console.log(databaseResult);

  res.json({ success: true, message: "profile Picture deleted successfully" });
});
