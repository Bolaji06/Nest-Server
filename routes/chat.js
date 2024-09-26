import express from "express";
import { getUsersChat } from "../controllers/chat.controller.js";

import { userAuthorization } from "../utils/authorization.js";

const router = express.Router();

router.get("/", getUsersChat)
//router.get("/", userAuthorization, getChats);
// router.get("/:id", userAuthorization, getChat);
// router.post("/", userAuthorization, addChat);
// router.put("/read/:id", userAuthorization, readChat);
// router.delete("/:chatId", userAuthorization, deleteChat);

export default router;
