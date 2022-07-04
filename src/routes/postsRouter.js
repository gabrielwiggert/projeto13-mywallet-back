import { getPosts, createPost } from '../controllers/postsController.js';
import validateUser from '../middlewares/validateUser.js';
import { Router } from 'express';

const router = Router();

router.get('/posts', validateUser, getPosts);
router.post('/posts', createPost);

export default router;
