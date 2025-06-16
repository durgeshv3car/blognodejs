const express = require("express");
const router = express.Router();
const s3Controller = require("../controllers/s3Controller");

// Define routes
router.get("/list", s3Controller.listDirectory);
router.post("/upload", s3Controller.uploadFile);
router.post("/folder/create", s3Controller.createFolder);
router.delete("/folder/delete", s3Controller.deleteFolder);

module.exports = router;
