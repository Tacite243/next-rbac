import { Router } from 'express';
import postRoutes from './post.routes.js';

const router = Router();

// Monter les routes de posts sur le préfixe /api/posts
router.use('/posts', postRoutes);

export default router;