import { RbacEngine } from '@next-rbac/core';

/**
 * Crée un décorateur fonctionnel pour sécuriser les Server Actions.
 */
export function createServerActionProtector<
    TEngine extends RbacEngine<any, any, any>
>(engine: TEngine) {
    return function withServerAction<TArgs extends any[], TResult>(
        getActor: () => Promise<any> | any,
        requirement: {
            action: string;
            // La ressource peut être une chaîne brute ou résolue dynamiquement à partir des arguments reçus par l'action
            resource: string | ((...args: TArgs) => any);
        },
        actionFn: (...args: TArgs) => Promise<TResult> | TResult
    ) {
        return async function (...args: TArgs): Promise<TResult> {
            const user = await getActor();

            const resource = typeof requirement.resource === 'function'
                ? requirement.resource(...args)
                : requirement.resource;

            if (!user || engine.cannot(user, requirement.action, resource)) {
                throw new Error('Unauthorized');
            }

            return actionFn(...args);
        };
    };
}