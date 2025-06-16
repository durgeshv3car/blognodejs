const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Ensure a directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer storage (store in memory for processing)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log("Received file:", file.originalname);

    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
}).fields([
  { name: "web", maxCount: 1 },
  { name: "mobile", maxCount: 1 },

]);

// Process images with Sharp
const processImage = async (req, res, next) => {
  try {
   

    const uploadDir = path.join(__dirname, `../uploads/blog/`);
    const thumbnailDir = path.join(__dirname, `../uploads/blog/thumbnail/`);

    ensureDirExists(uploadDir);

    ensureDirExists(thumbnailDir);

    req.processedFiles = {};

    const processFile = async (
      file,
      prefix,
      fullSize,
      thumbSize,
      imageType
    ) => {
      const filename = `${Date.now()}_${prefix}.${imageType}`;
      const filePath = path.join(uploadDir, filename);
      const thumbPath = path.join(thumbnailDir, filename);

      // Save full-size image
      await sharp(file.buffer)
        .resize({ width: fullSize })
        .webp({ quality: 80 })
        .toFile(filePath);

      // Save thumbnail image
      await sharp(file.buffer)
        .resize({ width: thumbSize })
        .webp({ quality: 100 })
        .toFile(thumbPath);

      return {
        full: `/uploads/blog/${filename}`,
        thumb: `/uploads/blog/thumbnail/${filename}`,
      };
    };

    // Process web image
    if (req.files.web) {
      const webFile = req.files.web[0];
      const webImages = await processFile(webFile, "web", 1080, 100, "webp");
      req.processedFiles.web = webImages.full;
      req.processedFiles.webThumb = webImages.thumb;
    }

    // Process mobile image
    if (req.files.mobile) {
      const mobileFile = req.files.mobile[0];
      const mobileImages = await processFile(
        mobileFile,
        "mobile",
        400,
        100,
        "png"
      );
      req.processedFiles.mobile = mobileImages.full;
      req.processedFiles.mobileThumb = mobileImages.thumb;
    }



    next();
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ error: "Failed to process images" });
  }
};

module.exports = { upload, processImage };
