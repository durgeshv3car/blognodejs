const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    otp:{ type: DataTypes.STRING, allowNull: true },
    domain: { type: DataTypes.STRING, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    permissions: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE'
  }
        
});

User.associate = models => {
  User.hasMany(models.User, { as: 'children', foreignKey: 'parentId' });
  User.belongsTo(models.User, { as: 'parent', foreignKey: 'parentId' });
};

module.exports = User;
