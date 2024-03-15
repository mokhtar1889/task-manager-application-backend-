import multer, { diskStorage } from "multer";

export const uploadFile = () => {
  const storage = diskStorage({});

  const multerReturn = multer({ storage });

  return multerReturn;
};
