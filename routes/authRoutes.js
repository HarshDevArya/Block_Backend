const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  signOutUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", register);
router.post("/login", login);

// protected

router.get("/dashboard", protect, getCurrentUser);

router.post("/logout", signOutUser);

module.exports = router;
