const Blog = require("../models/Blog");

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, image, description } = req.body;
    if (!title || !image || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const blog = await Blog.create({
      title,
      image,
      description,
      author: req.user,
    });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title, image, description } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this blog" });
    }
    blog.title = title || blog.title;
    blog.image = image || blog.image;
    blog.description = description || blog.description;
    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // Check if the current user is the author
    if (blog.author.toString() !== req.user.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this blog" });
    }
    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
