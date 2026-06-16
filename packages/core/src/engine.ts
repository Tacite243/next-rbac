import {
    BaseUser,
    ResourceConfig,
    RoleDefinition,
    AuthConfig,
    CompiledPermissions,
    PolicyFn
} from './types.js';

export class RbacEngine<
    TResources extends ResourceConfig,
    TRoles extends Record<string, RoleDefinition<TResources, Extract<keyof TRoles, string>>>,
    TUser extends BaseUser = BaseUser
> {
    private compiledPermissions: CompiledPermissions = new Map();
    private policies = new Map<string, Map<string, PolicyFn<TUser, any>>>();

    constructor(private config: AuthConfig<TResources, TRoles, TUser>) {
        this.compile();
    }

    /**
     * Compile l'arbre d'héritage des permissions pour un accès en O(1) à l'exécution.
     */
    private compile(): void {
        const roles = this.config.roles;
        const visited = new Set<string>();
        const resolving = new Set<string>();

        const resolveRolePermissions = (roleName: string): Map<string, Set<string>> => {
            // Détection de cycle d'héritage
            if (resolving.has(roleName)) {
                throw new Error(`Cycle d'héritage détecté impliquant le rôle : "${roleName}"`);
            }

            // Si le rôle est déjà résolu, on retourne sa carte de permissions compilée
            if (visited.has(roleName)) {
                return this.compiledPermissions.get(roleName) || new Map();
            }

            resolving.add(roleName);

            const roleDef = roles[roleName];
            const mergedPermissions = new Map<string, Set<string>>();

            if (!roleDef) {
                resolving.delete(roleName);
                return mergedPermissions;
            }

            // 1. Résoudre d'abord les permissions héritées des rôles parents
            if (roleDef.extends) {
                const parents = Array.isArray(roleDef.extends) ? roleDef.extends : [roleDef.extends];
                for (const parent of parents) {
                    const parentPerms = resolveRolePermissions(parent as string);
                    for (const [resource, actions] of parentPerms.entries()) {
                        if (!mergedPermissions.has(resource)) {
                            mergedPermissions.set(resource, new Set());
                        }
                        const currentActions = mergedPermissions.get(resource)!;
                        for (const action of actions) {
                            currentActions.add(action);
                        }
                    }
                }
            }

            // 2. Fusionner avec les permissions propres au rôle actuel
            const permissions = roleDef.permissions;
            for (const [resource, actions] of Object.entries(permissions)) {
                if (!mergedPermissions.has(resource)) {
                    mergedPermissions.set(resource, new Set());
                }
                const currentActions = mergedPermissions.get(resource)!;
                if (actions) {
                    for (const action of actions) {
                        currentActions.add(action);
                    }
                }
            }

            // Enregistrer le rôle compilé
            this.compiledPermissions.set(roleName, mergedPermissions);
            resolving.delete(roleName);
            visited.add(roleName);

            return mergedPermissions;
        };

        // Compiler chaque rôle défini dans la configuration
        for (const roleName of Object.keys(roles)) {
            resolveRolePermissions(roleName);
        }
    }

    /**
     * Enregistre une règle métier dynamique (Policy) pour l'ABAC.
     */
    public definePolicy<TKey extends keyof TResources>(
        resource: TKey & string,
        policies: Record<TResources[TKey][number] | string, PolicyFn<TUser, any>>
    ): void {
        if (!this.policies.has(resource)) {
            this.policies.set(resource, new Map());
        }
        const resourcePolicies = this.policies.get(resource)!;
        for (const [action, policyFn] of Object.entries(policies)) {
            resourcePolicies.set(action, policyFn);
        }
    }

    /**
     * Évalue si l'utilisateur possède l'accès requis.
     */
    public can<TKey extends keyof TResources & string>(
        user: TUser,
        action: TResources[TKey][number] | "*",
        resourceOrData: TKey | any,
        context?: any
    ): boolean {
        if (!user) return false;

        // Détermination du type de ressource (si c'est une chaîne de caractères ou un objet)
        let resourceType: string;
        let resourceData: any = null;

        if (typeof resourceOrData === 'string') {
            resourceType = resourceOrData;
        } else if (resourceOrData && typeof resourceOrData === 'object') {
            resourceData = resourceOrData;
            if (this.config.getResourceType) {
                resourceType = this.config.getResourceType(resourceOrData) as string;
            } else {
                resourceType = (resourceOrData.type || resourceOrData.__typename || '') as string;
            }
        } else {
            return false;
        }

        if (!resourceType) return false;

        // Récupération des rôles de l'utilisateur
        const userRoles = this.config.getUserRoles(user);
        let hasRbacAccess = false;

        // Vérification de l'accès RBAC parmi tous les rôles compilés de l'utilisateur
        for (const role of userRoles) {
            const rolePerms = this.compiledPermissions.get(role as string);
            if (!rolePerms) continue;

            // Cas 1 : Super Admin avec wildcard total sur tout le système
            if (rolePerms.has('*') && rolePerms.get('*')?.has('*')) {
                hasRbacAccess = true;
                break;
            }

            // Cas 2 : Accès direct à la ressource demandée (ou wildcard sur la ressource)
            const allowedActions = rolePerms.get(resourceType);
            if (allowedActions) {
                if (allowedActions.has('*') || allowedActions.has(action as string)) {
                    hasRbacAccess = true;
                    break;
                }
            }
        }

        // Si le RBAC refuse l'accès, inutile d'aller plus loin
        if (!hasRbacAccess) return false;

        // Si nous évaluons une chaîne brute sans données, l'accès RBAC suffit
        if (resourceData === null) return true;

        // Cas 3 : Vérification de la règle ABAC (Policy) associée à cette action/ressource
        const resourcePolicies = this.policies.get(resourceType);
        if (resourcePolicies) {
            const policyFn = resourcePolicies.get(action as string);
            if (policyFn) {
                // Exécution de la policy
                const result = policyFn(user, resourceData, context);
                // Note : pour préserver le caractère synchrone de `can`, nous gérons uniquement 
                // les retours synchrones ici. Une méthode asynchrone dédiée pourra être ajoutée si nécessaire.
                return result === true;
            }
        }

        return true;
    }

    /**
     * Négation stricte de la méthode `can`.
     */
    public cannot<TKey extends keyof TResources & string>(
        user: TUser,
        action: TResources[TKey][number] | "*",
        resourceOrData: TKey | any,
        context?: any
    ): boolean {
        return !this.can(user, action, resourceOrData, context);
    }
}

/**
 * Point d'entrée de l'API publique pour instancier le moteur.
 */
export function createAuth<
    TResources extends ResourceConfig,
    TRoles extends Record<string, RoleDefinition<TResources, Extract<keyof TRoles, string>>>,
    TUser extends BaseUser = BaseUser
>(config: AuthConfig<TResources, TRoles, TUser>) {
    return new RbacEngine<TResources, TRoles, TUser>(config);
}
