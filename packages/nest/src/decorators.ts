import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const NEXT_RBAC_METADATA_KEY = 'next_rbac_auth_requirement';

export interface AuthorizeOptions {
    action: string;
    resource: string;
}

/**
 * Spécifie l'action et la ressource requises pour accéder à un contrôleur ou une méthode.
 */
export const Authorize = (action: string, resource: string) =>
    SetMetadata(NEXT_RBAC_METADATA_KEY, { action, resource });

/**
 * Extrait l'utilisateur connecté du contexte d'exécution HTTP.
 */
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);