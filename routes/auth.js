import express from "express";
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controllers.js";
import { loginRateLimit, registerRateLimit } from "../utils/rateLimit.js";

const router = express.Router();

router.post("/register", registerRateLimit, register);

router.post("/login", loginRateLimit, login);

router.post("/logout", logout);

router.post("/verify", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

export default router;
