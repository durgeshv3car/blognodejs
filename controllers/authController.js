const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const getDescendants = require("../utils/getDescendants");
require("dotenv").config();
const roleHierarchy = {
  owner: ["sub_owner"],
  sub_owner: ["master"],
  master: ["super_admin"],
  super_admin: ["admin"],
  admin: ["teacher", "student", "worker"],
};
function canCreateRole(creatorRole, targetRole) {
  if (!roleHierarchy[creatorRole]) return false;
  return roleHierarchy[creatorRole].includes(targetRole);
}

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, domain } = req.body;
    const creator = req.user;

    const protectedRoles = [
      "owner",
      "sub_owner",
      "master",
      "super_admin",
      "admin",
    ];

    // Agent: allow only custom roles (not in protected list)
    if (creator.role === "admin" && protectedRoles.includes(role)) {
      return res
        .status(403)
        .json({ error: "Agent not allowed to create this role" });
    }

    // Others: follow hierarchy rules
    if (creator.role !== "admin" && !canCreateRole(creator.role, role)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to create this role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use creator's domain if available, otherwise fallback to req.body domain
    const newDomain = creator.domain || domain;

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      parentId: creator.id,
      domain: newDomain,
    });

    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user", details: err.message });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ id: user.id, token, permissions: user.permissions,domain: user.domain });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err });
  }
};

exports.loginByOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP
    await user.update({ email, otp, expiresAt });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

exports.verifyOtpLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpRecord = await User.findOne({
      where: { email, otp },
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    await otpRecord.update({ isUsed: true });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ id: user.id, token, permissions: user.permissions });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, role, permissions } = req.body;
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    user.permissions = permissions || user.permissions;

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err });
  }
};

// exports.getDescendants = async (req, res) => {
//     try {
//         const authHeader = req.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "Authorization token missing" });
//         }

//         const token = authHeader.split(" ")[1];
//         let decoded;
//         try {
//             decoded = jwt.verify(token, process.env.JWT_SECRET);
//         } catch (err) {
//             return res.status(401).json({ message: "Invalid or expired token" });
//         }

//         const userId = decoded.id;
//         const descendants = await getDescendants(userId);
//         res.status(200).json(descendants);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching descendants', error });
//     }
// };

exports.getDescendants = async (req, res) => {
  try {
    const userId = req.user.id;
    const descendants = await getDescendants(userId);
    res.status(200).json(descendants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching descendants", error });
  }
};
