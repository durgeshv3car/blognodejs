const express = require('express');
const { register, login,getUser,updateUser,getDescendants, loginByOtp, verifyOtpLogin } = require('../controllers/authController');
const authMiddleware=require("../middleware/authMiddleware")

const router = express.Router();

router.post('/register',authMiddleware, register);
router.post('/login', login);
router.post('/login-otp', loginByOtp);
router.post('/verify-otp', verifyOtpLogin);
router.get('/user/:id', getUser); 
router.put("/update/:id",updateUser)
router.get('/descendants',authMiddleware,getDescendants);

module.exports = router;
