import express from "express";
import { addMessage, getMessages } from "../controllers/message.controller.js";
import { userAuthorization } from "../utils/authorization.js";

const router = express.Router();

router.post("/:chatId", userAuthorization, addMessage);
router.get('/', getMessages);

export default router;
