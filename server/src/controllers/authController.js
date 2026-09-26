import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { Contact } from '../models/Contact.js';
import Message from '../models/Message.js';

// Helper to ensure MongoDB is ready before querying
const ensureDBConnected = async (maxWaitMs = 6000) => {
  if (mongoose.connection.readyState === 1) return true;
  const start = Date.now();
  while (mongoose.connection.readyState !== 1 && Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 400));
  }
  return mongoose.connection.readyState === 1;
};

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'zyntra_secret_fallback', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const isReady = await ensureDBConnected();
    if (!isReady) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is initializing. Please click Create account again in a few seconds.',
      });
    }

    const { name, email, primaryUsername, password, avatar, bio } = req.body || {};

    if (!name || !email || !primaryUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, primaryUsername, password',
      });
    }

    const cleanUsername = primaryUsername.replace(/^@/, '').toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email address already exists',
      });
    }

    const existingUsername = await User.findOne({
      primaryUsername: cleanUsername,
    });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: `Username @${cleanUsername} is already taken`,
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      primaryUsername: cleanUsername,
      password,
      avatar: avatar || null,
      bio: bio || 'Building contextual communication',
      contexts: [
        {
          id: 'ctx-personal',
          type: 'personal',
          name: 'Personal',
          username: `${cleanUsername}.personal`,
        },
      ],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        primaryUsername: user.primaryUsername,
        avatar: user.avatar,
        avatarType: user.avatarType,
        bio: user.bio,
        contexts: user.contexts,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    const isReady = await ensureDBConnected();
    if (!isReady) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is initializing. Please try logging in again in a moment.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user by email and select password
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        primaryUsername: user.primaryUsername,
        avatar: user.avatar,
        avatarType: user.avatarType,
        bio: user.bio,
        contexts: user.contexts,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        primaryUsername: user.primaryUsername,
        avatar: user.avatar,
        avatarType: user.avatarType,
        bio: user.bio,
        contexts: user.contexts,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, avatarType } = req.body;

    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;
    if (avatarType !== undefined) fieldsToUpdate.avatarType = avatarType;

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (avatar !== undefined && user?.primaryUsername) {
      await Contact.updateMany(
        { username: user.primaryUsername },
        { avatar }
      ).catch(() => {});
      await Message.updateMany(
        { senderUsername: user.primaryUsername },
        { senderAvatar: avatar }
      ).catch(() => {});
    }

    if (name !== undefined && user?.primaryUsername) {
      await Contact.updateMany(
        { username: user.primaryUsername },
        { name }
      ).catch(() => {});
      await Message.updateMany(
        { senderUsername: user.primaryUsername },
        { senderName: name }
      ).catch(() => {});
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        primaryUsername: user.primaryUsername,
        avatar: user.avatar,
        avatarType: user.avatarType,
        bio: user.bio,
        contexts: user.contexts,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update user context
// @route   POST /api/auth/context
// @access  Private
export const addContext = async (req, res, next) => {
  try {
    const { id, type, name, username } = req.body;

    if (!id || !type || !name || !username) {
      return res.status(400).json({
        success: false,
        message: 'Context requires id, type, name, and username',
      });
    }

    const user = await User.findById(req.user._id);
    const filtered = user.contexts.filter((c) => c.id !== id);
    filtered.push({ id, type, name, username });
    user.contexts = filtered;
    await user.save();

    res.status(200).json({
      success: true,
      contexts: user.contexts,
    });
  } catch (error) {
    next(error);
  }
};
