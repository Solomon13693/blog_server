const multer = require("multer");
const path = require('path');

const fileUpload = (storagePath) => {
  return multer({
    storage: multer.diskStorage({
      destination: storagePath,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExt = path.extname(file.originalname);
        const filename = uniqueSuffix + fileExt;
        cb(null, filename);
      }
    }),
    fileFilter: (req, file, cb) => {
      let ext = path.extname(file.originalname);  
      if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
        cb(new Error("File type is not supported"), false);
        return;
      }
      cb(null, true);
    }
  });
};

module.exports = fileUpload;
