const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Blog = sequelize.define("Blog", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  blogImage: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  thumbnail: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  redirectUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  detailDescription: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

module.exports = Blog;
