import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacEngine } from '@next-rbac/core';
import { NEXT_RBAC_METADATA_KEY, AuthorizeOptions } from './decorators.js';

/** Clé d'injection (Token) pour fournir l'instance de l'engine dans le module NestJS */
export const NEXT_RBAC_ENGINE_TOKEN = 'NEXT_RBAC_ENGINE_TOKEN';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @Inject(NEXT_RBAC_ENGINE_TOKEN) private engine: RbacEngine<any, any, any>
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Récupérer les métadonnées @Authorize définies sur la méthode ou sur le contrôleur global
        const requirement = this.reflector.getAllAndOverride<AuthorizeOptions>(
            NEXT_RBAC_METADATA_KEY,
            [context.getHandler(), context.getClass()]
        );

        // Si aucune métadonnée n'est définie, la route est publique par défaut
        if (!requirement) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Si aucun utilisateur n'est attaché à la requête, l'accès est refusé
        if (!user) {
            return false;
        }

        return this.engine.can(user, requirement.action, requirement.resource);
    }
}