import bcrypt from 'bcrypt';
import UserModel from '../models/userModel.js';
import { signToken, getCookieOptions } from '../utils/tokenUtils.js';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Controller: Register User
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check for existing account
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Save to database
    const newUser = await UserModel.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
    });

    // Generate JWT
    const token = signToken(newUser);

    // Set secure cookie
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: {
          id: newUser.id,
          fullName: newUser.full_name,
          email: newUser.email,
          role: newUser.role,
          accountStatus: newUser.account_status,
        },
        token, // Also send in payload for flexibility
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Login User
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await UserModel.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Check account status
    if (user.account_status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.account_status.toLowerCase()}. Please contact support.`,
      });
    }

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Generate JWT
    const token = signToken(user);

    // Set secure cookie
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          accountStatus: user.account_status,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Current Authenticated User (Session verification)
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          accountStatus: user.account_status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Logout User
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  // Clear the HttpOnly token cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
