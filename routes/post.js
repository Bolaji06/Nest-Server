
import express from 'express';
import { userAuthorization } from '../utils/authorization.js';

import { getPost, getPosts, addPost, deletePost, updatePost } from '../controllers/post.controller.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', userAuthorization,  addPost);
router.delete('/:id', userAuthorization, deletePost);
router.patch('/:id', userAuthorization, updatePost);

export default router;