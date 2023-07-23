import path from 'path';

import multer from 'multer';

const upload = multer({
    dest: "uploads/",
    limits: {fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
    storage: multer.diskStorage({
        destination: "uploads/",
        filename: (_req, file, cb) => {
            cb(null, file.originalname);
        },
    }),
    fileFilter: (_req, file, cb) => {
        let ext = path.extname(file.originalname);

        if(
            ext != ".jpg" &&
            ext != ".jpeg" &&
            ext != ".png" &&
            ext != ".mp4" &&
            ext != ".webp"
        ) {
           cb(new Error(`Unssupported file type! ${ext}`), false);
        }

        cb(null, true);
    },
});

export default upload;