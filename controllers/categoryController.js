const db = require('../models');
const Category = require('../models/Category');
const  Blog  = require('../models/Blog');


exports.getAllCategories = async (req, res) => {
  const { domain } = req.query;

  const categories = await Category.findAll({
    where: domain ? { domain } : undefined,
    required: false,
  });

  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const { domain,title,description,userId } = req.body;
  const category = await Category.create({ domain,title, description,userId})
  res.status(201).json(category);
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  await category.destroy();
  res.status(201).send("Category deleted successfully");
}
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  category.title = title || category.title;
  category.description = description || category.description;
  await category.save();

  res.status(200).json(category);
}



exports.getBlogsWithCategory = async (req, res) => {
  try {
    const { domain } = req.query; 

    const categories = await Category.findAll({
      include: [
        {
          model: Blog,
          as: 'blogs',
          where: domain ? { domain } : undefined, 
          required: false 
        }
      ]
    });
 

    res.json({success:true,blogs:categories});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};

exports.getBlogsWithCategoryId = async (req, res) => {
  try {
    const { domain } = req.query;
    const { id } = req.params; 

    const category = await Category.findOne({
      where: { id },
      include: [
        {
          model: Blog,
          as: 'blogs',
          where: domain ? { domain } : undefined,
          required: false
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};

exports.getCategoryWithDomain = async (req, res) => {
  try {
    const { domain } = req.query; 

    const categories = await Category.findAll({
      include: [
        {
          where: domain ? { domain } : undefined, 
          required: false 
        }
      ]
    });
 

    res.json({success:true,blogs:categories});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};



exports.getCategoryById = async (req, res) => {
  try {
   
    const { userId } = req.params; 

    const category = await Category.findOne({
      where: { userId },
      include: [
        {
          model: Blog,
          as: 'blogs',
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};



