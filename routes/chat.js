import express from "express";
import {
  getChats,
  getChat,
  addChat,
  readChat,
  deleteChat,
} from "../controllers/chat.controller.js";

import { userAuthorization } from "../utils/authorization.js";

const router = express.Router();

router.get("/", userAuthorization, getChats);
router.get("/:id", userAuthorization, getChat);
router.post("/", userAuthorization, addChat);
router.put("/read/:id", userAuthorization, readChat);
router.delete("/:chatId", userAuthorization, deleteChat);

export default router;
