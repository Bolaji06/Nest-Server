import express from "express";
import { userAuthorization } from "../utils/authorization.js";

// import swaggerUi from "swagger-ui-express";
// import swaggerDocument from '../utils/swaggerDocument.json' assert { type: 'json' };

import {
  getPost,
  getPosts,
  addPost,
  deletePost,
  updatePost,
  deleteAllPost,
  getAmenities,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", userAuthorization, addPost);
router.delete("/:id", userAuthorization, deletePost);
router.patch("/:id", userAuthorization, updatePost);
router.delete("/", deleteAllPost);

router.get("/amenities/:id", getAmenities);

export default router;
