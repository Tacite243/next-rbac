export interface User {
    id: string;
    username: string;
    roles: string[];
}

// 3 profils de tests : un simple lecteur, un auteur et un administrateur global
export const mockUsers: Record<string, User> = {
    '1': { id: '1', username: 'alice_viewer', roles: ['viewer'] },
    '2': { id: '2', username: 'bob_editor', roles: ['editor'] },
    '3': { id: '3', username: 'charlie_admin', roles: ['admin'] },
};