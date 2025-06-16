const User = require("../models/User");

const getDescendants = async (userId) => {
  const allUsers = await User.findAll({ raw: true }); // raw for plain objects
  const map = {};

  // Initialize children array and map users by ID
  allUsers.forEach(user => {
    user.children = [];
    map[user.id] = user;
  });

  const root = map[userId];
  if (!root) return [];

  // Build the tree
  const tree = [];

  allUsers.forEach(user => {
    if (user.parentId === userId) {
      tree.push(map[user.id]);
    } else if (map[user.parentId]) {
      map[user.parentId].children.push(map[user.id]);
    }
  });

  return tree;
};

module.exports = getDescendants;
