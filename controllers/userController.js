const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

class UserController {

  async getAllUsers(req, res) {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error retrieving users', 
            error: error.message 
        });
    }
  }

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

      res.status(201).json({
        message: 'User registered successfully',
        userId: savedUser._id
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Error registering user', 
        error: error.message 
      });
    }
  }

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid credentials',
          redirect: '/login'
        });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          message: 'Invalid credentials',
          redirect: '/login'
        });
      }
  
      // Send user details
      res.json({ 
        message: 'Login successful',
        userId: user._id,
        username: user.username,
        email: user.email,
        redirect: '/profile'
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error logging in', 
        error: error.message,
        redirect: '/login'
      });
    }
  }

  async getUserProfile(req, res) {
    try {
      const userId = req.query.userId;
      console.log('Requested User ID:', userId);
      
      // Check if it's a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ 
          message: 'Invalid User ID',
          redirect: '/login'
        });
      }

      // Find user by ID
      const user = await User.findById(userId);
  
      console.log('Database Query User:', user);

      if (!user) {
        return res.status(404).json({ 
          message: 'User not found',
          redirect: '/login'
        });
      }
  
      // Return user details
      return res.json({ 
        user: {
          username: user.username,
          email: user.email,
          interests: user.interests,
          connectionGoals: user.connectionGoals
        }
      });
    } catch (error) {
      console.error('Profile retrieval ERROR:', error);
      res.status(500).json({ 
        message: 'Error retrieving profile', 
        error: error.message,
        redirect: '/login'
      });
    }
}
}

module.exports = {
  registerUser: (req, res) => new UserController().registerUser(req, res),
  loginUser: (req, res) => new UserController().loginUser(req, res),
  getUserProfile: (req, res) => new UserController().getUserProfile(req, res)
};