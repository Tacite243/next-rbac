import { Request, Response, NextFunction } from 'express';
import { RbacEngine } from '@next-rbac/core';

export interface ExpressProtectionOptions {
    action: string;
    /** Nom de la ressource ou fonction résolvant la ressource à partir de la requête Express */
    resource: string | ((req: Request) => any);
    /** Clé de l'objet de requête contenant l'utilisateur. Par défaut: 'user' */
    userKey?: string;
    /** Message d'erreur personnalisé à renvoyer en cas d'interdiction */
    forbiddenMessage?: string;
}

/**
 * Crée un outil de protection d'API Express.
 */
export function createExpressProtector<
    TEngine extends RbacEngine<any, any, any>
>(engine: TEngine) {
    return function authorize(options: ExpressProtectionOptions) {
        return function (req: Request, res: Response, next: NextFunction): void {
            const userKey = options.userKey || 'user';
            const user = (req as any)[userKey];

            // Extraction dynamique de la ressource si une fonction est transmise
            const resource = typeof options.resource === 'function'
                ? options.resource(req)
                : options.resource;

            if (!user || engine.cannot(user, options.action, resource)) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: options.forbiddenMessage || 'You do not have permission to access this resource.'
                });
                return;
            }

            next();
        };
    };
}