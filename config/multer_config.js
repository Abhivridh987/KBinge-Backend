const multer = require("multer")
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kbinge_profiles",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => {
      // Use user's ID as filename to automatically overwrite old profile pics
      // req.user is set by jwtAuthMiddleware before this middleware
      if (req.user && req.user._id) {
        return `${req.user._id}`;
      }
      return `${Date.now()}`;
    }
  },
});

const upload = multer({ storage: storage });

module.exports = upload;