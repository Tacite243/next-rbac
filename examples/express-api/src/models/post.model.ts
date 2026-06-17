export interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
    type: 'posts'; // Le discriminateur utilisé par next-rbac
}

export let mockPosts: Post[] = [
    { id: '101', title: 'Débuter avec next-rbac', content: 'Un moteur léger...', authorId: '2', type: 'posts' },
    { id: '102', title: 'Sécuriser une API', content: 'L\'art du contrôle d\'accès...', authorId: '3', type: 'posts' },
];