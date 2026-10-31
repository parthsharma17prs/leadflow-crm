import express from "express";
import { register, login, googleLogin, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/schemas.js";

const router = express.Router();

// Public auth endpoints
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google", googleLogin);

// Protected endpoint (needs Bearer token)
router.get("/me", protect, getMe);

export default router;
