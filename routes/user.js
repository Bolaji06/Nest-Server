
import express from 'express';
import { userAuthorization } from '../utils/authorization.js';
import { getUser, getUsers, updateUser, deleteUser, savedPost, findUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', userAuthorization, getUser);
router.get('/agent/:id', findUser);
router.patch('/:id', userAuthorization, updateUser);
router.delete('/:id', userAuthorization, deleteUser);
router.post('/save', userAuthorization, savedPost);

export default router;
