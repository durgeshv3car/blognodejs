const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Blog = require('./Blog'); // Directly import the Blog model
db.Category = require('./Category'); // Directly import the Category model

// Relations
db.Category.hasMany(db.Blog, { foreignKey: 'categoryId', as: 'blogs' });
db.Blog.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = db;