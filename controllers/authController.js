require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, profileImage } = req.body;
    console.log("email", email);
    console.log("password", password);

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate the Base64 string if provided
    let profileImageData = profileImage;
    if (profileImage) {
      // Basic check to see if string starts with "data:image/"
      if (!profileImage.startsWith("data:image/")) {
        return res.status(400).json({ message: "Invalid image format" });
      }
    } else {
      // Use the default if no image is provided
      profileImageData = "default-profile.png";
    }
    // Create user
    const user = await User.create({
      email,
      password,
      profileImage: profileImageData,
    });

    if (user) {
      const token = generateToken(user._id);
      // Production ONLY
      res.cookie("jwt", token, {
        httpOnly: true, // Prevent access via JavaScript
        secure: true, // Make sure to set this to true if using HTTPS
        sameSite: "None", // Use 'None' for cross-site cookies
        maxAge: 3600000, // 1 hour in milliseconds
      });

      // Developement ONLY
      // res.cookie("jwt", token, {
      //   httpOnly: true, // Prevent access via JavaScript
      //   sameSite: "Lax", // Adjust according to your needs
      //   maxAge: 3600000, // 1 hour in milliseconds
      // });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        // token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select("+password");
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      // Production ONLY
      res.cookie("jwt", token, {
        httpOnly: true, // Prevent access via JavaScript
        secure: true, // Make sure to set this to true if using HTTPS
        sameSite: "None", // Use 'None' for cross-site cookies
        maxAge: 3600000, // 1 hour in milliseconds
      });

      // Developement ONLY
      // res.cookie("jwt", token, {
      //   httpOnly: true, // Prevent access via JavaScript
      //   sameSite: "Lax", // Adjust according to your needs
      //   maxAge: 3600000, // 1 hour in milliseconds
      // });

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // console.log("req.userId", req.userId);
    // console.log("req.userId", req.user);
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signOutUser = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  // ONLY in DEVELOPMENT
  // res.clearCookie("jwt", {
  //   httpOnly: true,
  //   sameSite: "Lax",
  // });
  res.status(200).json({
    status: "ok",
    message: "Sign out successful",
  });
};
