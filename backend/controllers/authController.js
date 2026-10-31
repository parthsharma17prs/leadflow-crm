import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";

// Helper function: Create a signed JWT token containing the user's ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret", {
    expiresIn: "7d", // Token is valid for 7 days
  });
};

// ==========================================
// 1. REGISTER (Email + Password)
// ==========================================
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Step A: Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Step B: Hash password with bcryptjs (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Step C: Save user in MongoDB
    const user = await User.create({
      name,
      email,
      passwordHash,
      authProvider: "local",
      role: "agent",
    });

    // Step D: Generate token for immediate login
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. LOGIN (Email + Password)
// ==========================================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Step A: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // If user signed up via Google with no password set
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: "This account was created with Google. Please use Google Login.",
      });
    }

    // Step B: Compare plain password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Step C: Password matched! Create token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. GOOGLE LOGIN (OAuth Token Verification)
// ==========================================
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body; // credential is the JWT sent by Google Identity Services

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential token is required",
      });
    }

    // Initialize Google OAuth Client
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(googleClientId);

    // Verify Google ID token signature and extract user payload
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Step A: Check if user already exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, link googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Step B: Create a new user from Google profile
      user = await User.create({
        name: name || "Google User",
        email,
        authProvider: "google",
        googleId,
        role: "agent",
      });
    }

    // Step C: Issue our LeadFlow CRM JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid Google token: " + error.message,
    });
  }
};

// ==========================================
// 4. GET CURRENT LOGGED-IN USER (/auth/me)
// ==========================================
export const getMe = async (req, res) => {
  // req.user is attached by the 'protect' middleware
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
