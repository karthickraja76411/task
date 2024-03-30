import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const dir = path.join(path.dirname(__filename), '..');

function mkdirDynamic(Dir) {
    if (!fs.existsSync(Dir)) {
        try {
            fs.mkdirSync(Dir, { recursive: true });
            return Dir;
        } catch (error) {
            console.error("Error creating directory:", error);
        }
    } else {
        return Dir;
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, mkdirDynamic(`${dir}/upload/userProfiles/${req.body.name}`))
    },
})

var maxSize = 5000 * 1000 * 1000 // file size

export const uploads = multer({
    storage: storage,
    limits: {
        fileSize: maxSize
    },
    fileFilter: function (req, file, cb) {
        let fileTypes = /jpeg|jpg|png/;
        let mimeType = fileTypes.test(file.mimetype)
        let extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
        if (mimeType && extname) {
            return cb(null, true)
        }
        cb("ERROR : ---")
    }
})