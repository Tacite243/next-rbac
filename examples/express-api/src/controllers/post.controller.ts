import { Request, Response, NextFunction } from 'express';
import { mockPosts, Post } from '../models/post.model.js';

export const postController = {
    // Liste tous les posts
    getAll(req: Request, res: Response): void {
        res.json(mockPosts);
    },

    // Récupère un post par son ID
    getOne(req: Request, res: Response): void {
        const post = mockPosts.find(p => p.id === req.params.id);
        if (!post) {
            res.status(404).json({ error: 'NotFound', message: 'Article introuvable' });
            return;
        }
        res.json(post);
    },

    // Crée un nouveau post
    create(req: Request, res: Response): void {
        const user = (req as any).user;
        const { title, content } = req.body;

        if (!title || !content) {
            res.status(400).json({ error: 'BadRequest', message: 'Titre et contenu requis' });
            return;
        }

        const newPost: Post = {
            id: String(Date.now()),
            title,
            content,
            authorId: String(user.id),
            type: 'posts'
        };

        mockPosts.push(newPost);
        res.status(201).json(newPost);
    },

    // Met à jour un post
    update(req: Request, res: Response): void {
        const { title, content } = req.body;
        const postIndex = mockPosts.findIndex(p => p.id === req.params.id);

        if (postIndex === -1) {
            res.status(404).json({ error: 'NotFound', message: 'Article introuvable' });
            return;
        }

        mockPosts[postIndex] = {
            ...mockPosts[postIndex],
            title: title || mockPosts[postIndex].title,
            content: content || mockPosts[postIndex].content,
        };

        res.json(mockPosts[postIndex]);
    },

    // Supprime un post
    delete(req: Request, res: Response): void {
        const postIndex = mockPosts.findIndex(p => p.id === req.params.id);

        if (postIndex === -1) {
            res.status(404).json({ error: 'NotFound', message: 'Article introuvable' });
            return;
        }

        const deletedPost = mockPosts.splice(postIndex, 1);
        res.json({ message: 'Article supprimé avec succès', post: deletedPost[0] });
    }
};