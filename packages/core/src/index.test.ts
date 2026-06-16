import { describe, it, expect } from 'vitest';
import { createAuth } from './index.js';

describe('RbacEngine - Scénario Complet', () => {
    // 1. Définition de notre configuration de test
    const resources = {
        posts: ['create', 'read', 'update', 'delete'] as const,
        users: ['read', 'manage'] as const,
    };

    const auth = createAuth({
        resources,
        getUserRoles: (user) => user.roles,
        getResourceType: (res) => res.type || res.__typename,
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
                    users: ['read', 'manage'],
                },
            },
            superadmin: {
                permissions: {
                    '*': ['*'],
                },
            },
        },
    });

    // Définition d'une policy ABAC pour la modification de posts
    auth.definePolicy('posts', {
        update: (user, post) => post.authorId === user.id,
    });

    it('devrait valider le RBAC simple', () => {
        const user = { id: 1, roles: ['viewer'] };
        expect(auth.can(user, 'read', 'posts')).toBe(true);
        expect(auth.can(user, 'create', 'posts')).toBe(false);
    });

    it("devrait hériter correctement des permissions d'un rôle parent", () => {
        const user = { id: 2, roles: ['editor'] };
        // Hérité de viewer
        expect(auth.can(user, 'read', 'posts')).toBe(true);
        // Propre à editor
        expect(auth.can(user, 'create', 'posts')).toBe(true);
        // Non possédé
        expect(auth.can(user, 'manage', 'users')).toBe(false);
    });

    it("devrait valider les permissions d'un superadmin via wildcard '*'", () => {
        const user = { id: 3, roles: ['superadmin'] };
        expect(auth.can(user, 'manage', 'users')).toBe(true);
        expect(auth.can(user, 'delete', 'posts')).toBe(true);
    });

    it('devrait correctement évaluer les règles métiers ABAC (Policies)', () => {
        const owner = { id: 10, roles: ['editor'] };
        const stranger = { id: 99, roles: ['editor'] };
        const myPost = { type: 'posts', authorId: 10, content: 'Mon post' };

        // L'éditeur possède le droit RBAC "update" sur "posts"
        // Mais la policy ABAC vérifie si l'utilisateur est l'auteur
        expect(auth.can(owner, 'update', myPost)).toBe(true);
        expect(auth.can(stranger, 'update', myPost)).toBe(false);
    });

    it('devrait lever une erreur explicite en cas de boucle d’héritage', () => {
        expect(() => {
            createAuth({
                resources: { dummy: ['read'] },
                getUserRoles: (u) => u.roles,
                roles: {
                    roleA: {
                        extends: 'roleB',
                        permissions: { dummy: ['read'] },
                    },
                    roleB: {
                        extends: 'roleA',
                        permissions: { dummy: ['read'] },
                    },
                },
            });
        }).toThrowError(/Cycle d'héritage détecté/);
    });

    it('devrait lever une erreur avec authorize() en cas d’échec, ou s’exécuter sans retour en cas de succès', () => {
        const viewer = { id: 1, roles: ['viewer'] };

        // Succès silencieux
        expect(() => auth.authorize(viewer, 'read', 'posts')).not.toThrow();

        // Doit lever une exception AuthorizationError
        expect(() => auth.authorize(viewer, 'create', 'posts')).toThrow();
    });

    it('devrait filtrer récursivement une structure de menu', () => {
        const viewer = { id: 1, roles: ['viewer'] };
        const admin = { id: 3, roles: ['admin'] };

        const menu = [
            { label: 'Accueil', href: '/' },
            { label: 'Mes Articles', href: '/posts', permission: 'posts.read' },
            {
                label: 'Administration',
                href: '/admin',
                permission: 'users.manage',
                children: [
                    { label: 'Gérer les utilisateurs', href: '/admin/users', permission: 'users.manage' },
                    { label: 'Lecture simple', href: '/admin/stats', permission: 'posts.read' }
                ]
            },
        ];

        // Pour un simple viewer
        const filteredForViewer = auth.filterMenu(viewer, menu);
        expect(filteredForViewer).toHaveLength(2); // Accueil + Mes Articles
        expect(filteredForViewer.find(m => m.label === 'Administration')).toBeUndefined();

        // Pour un administrateur
        const filteredForAdmin = auth.filterMenu(admin, menu);
        expect(filteredForAdmin).toHaveLength(3); // Tout le menu
        const adminMenu = filteredForAdmin.find(m => m.label === 'Administration');
        expect(adminMenu?.children).toHaveLength(2); // Les deux sous-menus de l'admin sont visibles
    });
});