const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

router.get("/", blogController.getAllBlogs); //Get Recent Posts Blogs and pass domain
router.get("/:id", blogController.getBlogById); // Get a single blog by ID
router.post("/", blogController.createBlog);
router.put("/:id", blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);
router.get("/user/:userId",blogController.getAllBlogsByUserId)

module.exports = router;
