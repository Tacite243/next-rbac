import { Router } from 'express';
import { postController } from '../controllers/post.controller.js';
import { authorize } from '../security/rbac.js';
import { mockPosts } from '../models/post.model.js';

const router = Router();

// 1. Lire les articles : Accessible au rôle 'viewer' (et par héritage aux rôles 'editor' et 'admin')
router.get('/', authorize({ action: 'read', resource: 'posts' }), postController.getAll);
router.get('/:id', authorize({ action: 'read', resource: 'posts' }), postController.getOne);

// 2. Créer un article : Accessible uniquement au rôle 'editor' (et 'admin' par héritage)
router.post('/', authorize({ action: 'create', resource: 'posts' }), postController.create);

// 3. Modifier un article : Nécessite le droit RBAC 'update' ET valide la règle ABAC d'auteur.
// Nous extrayons dynamiquement l'article depuis la base de données fictive en fonction du paramètre de route :
router.put(
    '/:id',
    authorize({
        action: 'update',
        resource: (req) => mockPosts.find(p => p.id === req.params.id) || 'posts'
    }),
    postController.update
);

// 4. Supprimer un article : Nécessite le droit 'delete' (Admin ou Éditeur propriétaire de l'article)
router.delete(
    '/:id',
    authorize({
        action: 'delete',
        resource: (req) => mockPosts.find(p => p.id === req.params.id) || 'posts'
    }),
    postController.delete
);

export default router;