const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");



const Category = sequelize.define("category", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    domain:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
});



module.exports = Category;
