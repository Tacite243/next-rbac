export const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'next-rbac Express Demo API',
        version: '1.0.0',
        description: 'API de démonstration démontrant les capacités de contrôle d\'accès (RBAC & ABAC) de next-rbac.',
    },
    components: {
        securitySchemes: {
            UserHeader: {
                type: 'apiKey',
                in: 'header',
                name: 'X-User-Id',
                description: 'ID de l\'utilisateur fictif pour tester les permissions (1: Alice/Viewer, 2: Bob/Editor, 3: Charlie/Admin)',
            },
        },
        schemas: {
            Post: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    authorId: { type: 'string' },
                    type: { type: 'string', example: 'posts' },
                },
            },
        },
    },
    // Appliquer l'en-tête de sécurité globalement sur toutes les routes de l'interface
    security: [
        {
            UserHeader: [],
        },
    ],
    paths: {
        '/api/posts': {
            get: {
                summary: 'Récupérer tous les articles (Requiert: posts:read)',
                description: 'Accessible à tous les profils (Viewer, Editor, Admin).',
                responses: {
                    200: {
                        description: 'Succès',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { $ref: '#/components/schemas/Post' } },
                            },
                        },
                    },
                    403: { description: 'Non autorisé' },
                },
            },
            post: {
                summary: 'Créer un nouvel article (Requiert: posts:create)',
                description: 'Accessible aux profils Editor et Admin. L\'article créé appartiendra à l\'utilisateur actuellement connecté.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'content'],
                                properties: {
                                    title: { type: 'string', example: 'Mon premier article' },
                                    content: { type: 'string', example: 'Voici le contenu de cet article...' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Article créé',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/Post' } },
                        },
                    },
                    403: { description: 'Non autorisé' },
                },
            },
        },
        '/api/posts/{id}': {
            get: {
                summary: 'Récupérer un article spécifique (Requiert: posts:read)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '101' }],
                responses: {
                    200: {
                        description: 'Succès',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/Post' } },
                        },
                    },
                    404: { description: 'Article introuvable' },
                    403: { description: 'Non autorisé' },
                },
            },
            put: {
                summary: 'Modifier un article (Requiert: posts:update & règle ABAC de propriété)',
                description: 'Seul l\'auteur du post (Bob, ID: 2) peut le modifier. Charlie (Admin) sera refusé par ABAC car il n\'est pas l\'auteur.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '101' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string', example: 'Titre mis à jour' },
                                    content: { type: 'string', example: 'Nouveau contenu...' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Article modifié' },
                    403: { description: 'Non autorisé (RBAC ou ABAC refusé)' },
                    404: { description: 'Article introuvable' },
                },
            },
            delete: {
                summary: 'Supprimer un article (Requiert: posts:delete & [Admin ou auteur propriétaire])',
                description: 'Les administrateurs (Charlie) peuvent supprimer n\'importe quel post. Les éditeurs ne peuvent supprimer que le leur.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '101' }],
                responses: {
                    200: { description: 'Article supprimé' },
                    403: { description: 'Non autorisé (Règle ABAC non respectée)' },
                    404: { description: 'Article introuvable' },
                },
            },
        },
    },
};