// userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Add JWT for login

class UserController {
  // User registration method
  async registerUser(req, res) {
    try {
      const { username, email, password, interests, connectionGoals } = req.body;

      // Check if user already exists
      let existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists' 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        interests: interests || [],
        connectionGoals: connectionGoals || []
      });

      // Save user to database
      const savedUser = await newUser.save();

      // Remove password from response
      savedUser.password = undefined;

      res.status(201).json({
        message: 'User registered successfully',
        user: savedUser
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Error registering user', 
        error: error.message 
      });
    }
  }

  // Add login method
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Error logging in', 
        error: error.message 
      });
    }
  }
}

// Export methods directly
module.exports = {
  registerUser: (req, res) => new UserController().registerUser(req, res),
  loginUser: (req, res) => new UserController().loginUser(req, res)
};