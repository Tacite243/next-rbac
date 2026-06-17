import { createAuth } from '@next-rbac/core';
import { createExpressProtector } from '@next-rbac/express';

// Définition des ressources de notre API
export const resources = {
    posts: ['create', 'read', 'update', 'delete'] as const,
    users: ['read', 'manage'] as const,
};

// Initialisation du moteur d'autorisation
export const auth = createAuth({
    resources,
    getUserRoles: (user) => user.roles,
    getResourceType: (resource) => resource.type || 'posts',
    roles: {
        viewer: {
            permissions: {
                posts: ['read'],
            },
        },
        editor: {
            extends: 'viewer',
            permissions: {
                posts: ['create', 'update'],
            },
        },
        admin: {
            extends: 'editor',
            permissions: {
                posts: ['delete'],
                users: ['read', 'manage'],
            },
        },
    },
});

// Définition de règles métiers dynamiques (ABAC)
auth.definePolicy('posts', {
    // Seul l'auteur d'un post peut le modifier
    update: (user, post) => post.authorId === user.id,

    // Un administrateur peut supprimer n'importe quel post, 
    // tandis qu'un éditeur ne peut supprimer que les siens.
    delete: (user, post) => {
        if (user.roles.includes('admin')) return true;
        return post.authorId === user.id;
    },
});

// Exportation du middleware d'autorisation Express pré-configuré
export const authorize = createExpressProtector(auth);