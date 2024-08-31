
import express from "express";
import { shareListingEmail } from "../controllers/email.controller.js";

const router = express.Router();

router.post('/share', shareListingEmail);

export default router;