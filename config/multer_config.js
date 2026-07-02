const path = require("path")
const multer = require("multer")
const jwt = require("jsonwebtoken")
const fs = require("fs")

const uploadPath = path.join(
    __dirname,
    "../public/images/uploads"
)

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },

    filename: (req, file, cb) => {
        try {
            const token = req.cookies.token
            const decoded = jwt.verify(token,process.env.JWT_SECRET)
            const filename = `${Date.now()}-${decoded._id}${path.extname(file.originalname)}`
            cb(null, filename)
        } catch (err) {
            cb(new Error("Invalid authentication token"))
        }
    }
})

// const fileFilter = (req,file,cb) => {

//     const allowed = [
//         "image/jpeg",
//         "image/png",
//         "image/webp",
//         "image/jpg"
//     ]
//     if (allowed.includes(file.mimetype))
//     {
//         cb(null, true)
//     }
//     else {
//         cb(new Error("Only images allowed"),false)
//     }
//}

const upload = multer({
    storage
    // fileFilter,
    // limits: {
    //     fileSize:
    //     5 * 1024 * 1024
    // }
})

module.exports = upload