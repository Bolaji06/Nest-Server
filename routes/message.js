import express from "express";
import { addMessage } from "../controllers/message.controller.js";
import { userAuthorization } from "../utils/authorization.js";

const router = express.Router();

router.post("/:chatId", userAuthorization, addMessage);

export default router;
