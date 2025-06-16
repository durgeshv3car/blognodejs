const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router.get("/", categoryController.getAllCategories); // Get all categories
router.get("/blogs", categoryController.getBlogsWithCategory); // Get all blogs with their associated Category and pass domain
router.post("/", categoryController.createCategory);
router.get("/blogs/:id", categoryController.getBlogsWithCategoryId); // Get all blogs for a specific Category and pass domain
router.delete("/:id", categoryController.deleteCategory);
router.put("/:id", categoryController.updateCategory);
router.get("/:userId", categoryController.getCategoryById); // Get all
router.get("/", categoryController.getCategoryWithDomain); // Get category with domain


module.exports = router;
