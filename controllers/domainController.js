const db = require("../models");
const Domain = require("../models/Domain");
const Blog = require("../models/Blog");

exports.getAllCategories = async (req, res) => {
  const { domain } = req.query;

  const categories = await Domain.findAll({
    where: domain ? { domain } : undefined,
    required: false,
  });

  res.json(categories);
};

exports.createDomain = async (req, res) => {
  const { title } = req.body;
  const domain = await Domain.create({ title });
  res.status(201).json(domain);
};

exports.deleteDomain = async (req, res) => {
  const { id } = req.params;
  const domain = await Domain.findByPk(id);
  if (!domain) {
    return res.status(404).json({ message: "Domain not found" });
  }
  await domain.destroy();
  res.status(201).send("Domain deleted successfully");
};
exports.updateDomain = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const domain = await Domain.findByPk(id);
  if (!domain) {
    return res.status(404).json({ message: "Domain not found" });
  }

  domain.title = title || domain.title;
  await domain.save();

  res.status(200).json(domain);
};
