const Comment = require("../models/Comment");

exports.createComment = async (req, res) => {
  try {
    const { content, blog, parentComment } = req.body;
    if (!content || !blog) {
      return res.status(400).json({ message: "Content and blog are required" });
    }

    const comment = await Comment.create({
      content,
      blog,
      parentComment: parentComment || null,
      author: req.user,
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommentsByBlog = async (req, res) => {
  try {
    const blogId = req.query.blog;
    if (!blogId) {
      return res.status(400).json({ message: "Blog id is required" });
    }
    // Find comments for this blog and populate author details
    const comments = await Comment.find({ blog: blogId })
      .populate("author", "email profileImage")
      .sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
