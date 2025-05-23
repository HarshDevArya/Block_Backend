const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByBlog,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createComment);
router.get("/", protect, getCommentsByBlog);

module.exports = router;
