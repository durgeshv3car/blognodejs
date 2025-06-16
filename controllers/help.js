
const roleHierarchy = {
   owner: ['super_admin'],
  super_admin: ['admin'],
  admin: ['sub_admin'],
  sub_admin: ['agent'],
  agent: ['teacher', 'student', 'worker']
};
function canCreateRole(creatorRole, targetRole) {
  if (!roleHierarchy[creatorRole]) return false;
  return roleHierarchy[creatorRole].includes(targetRole);
}


async function getDescendants(userId) {
  const allUsers = await User.findAll();
  const map = {};
  allUsers.forEach(u => {
    if (!map[u.parentId]) map[u.parentId] = [];
    map[u.parentId].push(u);
  });
  const result = [];
  function dfs(id) {
    const children = map[id] || [];
    for (const child of children) {
      result.push(child);
      dfs(child.id);
    }
  }
  dfs(userId);
  return result;
}

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const creator = req.user;

  if (!canCreateRole(creator.role, role)) {
    return res.status(403).json({ error: 'Unauthorized role creation' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role, parentId: creator.id });
  res.status(201).json(user);
};

exports.getDescendants = async (req, res) => {
  const userId = req.user.id;
  const descendants = await getDescendants(userId);
  res.json(descendants);
};

exports.getUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findByPk(userId);
  const descendants = await getDescendants(req.user.id);
  if (!descendants.map(u => u.id).includes(userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1d' });
  res.json({ token });
};


// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', userController.login);
router.use(authMiddleware);

router.post('/', userController.createUser);
router.get('/descendants', userController.getDescendants);
router.get('/:id', userController.getUser);

module.exports = router;


// middlewares/authMiddleware.js


