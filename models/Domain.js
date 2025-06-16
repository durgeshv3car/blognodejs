const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const Domain = sequelize.define("domain", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
});

module.exports = Domain;
