const express = require("express");
const router = express.Router();
const DomainController = require("../controllers/domainController");

router.get("/", DomainController.getAllCategories); // Get all categories
router.post("/", DomainController.createDomain);
router.delete("/:id", DomainController.deleteDomain);
router.put("/:id", DomainController.updateDomain);

module.exports = router;
