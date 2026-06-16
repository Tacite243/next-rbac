import { useAuthContext } from './context.js';

export function useAuth() {
    const { engine, user } = useAuthContext();

    return {
        user,
        engine,
        /**
         * Vérifie si l'utilisateur courant possède le droit spécifié.
         */
        can: (action: string, resourceOrData: any, context?: any): boolean => {
            return engine.can(user, action, resourceOrData, context);
        },
        /**
         * Négation logique de can().
         */
        cannot: (action: string, resourceOrData: any, context?: any): boolean => {
            return engine.cannot(user, action, resourceOrData, context);
        },
    };
}