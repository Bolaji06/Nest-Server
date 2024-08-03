
import express from "express";
import { userAuthorization } from "../utils/authorization.js";
import { addSavedPost, getAllSavedPost, getSavedPost } from "../controllers/save_post.controller.js";

const router = express.Router();

router.get('/', userAuthorization, getAllSavedPost);
router.get("/:id", userAuthorization, getSavedPost);
router.post("/", userAuthorization, addSavedPost);


export default router