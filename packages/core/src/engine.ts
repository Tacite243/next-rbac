import {
    BaseUser,
    ResourceConfig,
    RoleDefinition,
    AuthConfig,
    CompiledPermissions,
    PolicyFn,
    MenuItem
} from './types.js';



/**
 * Erreur spécifique levée en cas de refus d'accès par la méthode authorize().
 */
export class AuthorizationError extends Error {
    constructor(message = "Accès non autorisé") {
        super(message);
        this.name = "AuthorizationError";
    }
}

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

    private compile(): void {
        const roles = this.config.roles;
        const visited = new Set<string>();
        const resolving = new Set<string>();

        const resolveRolePermissions = (roleName: string): Map<string, Set<string>> => {
            if (resolving.has(roleName)) {
                throw new Error(`Cycle d'héritage détecté impliquant le rôle : "${roleName}"`);
            }

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

            this.compiledPermissions.set(roleName, mergedPermissions);
            resolving.delete(roleName);
            visited.add(roleName);

            return mergedPermissions;
        };

        for (const roleName of Object.keys(roles)) {
            resolveRolePermissions(roleName);
        }
    }

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

    public can<TKey extends keyof TResources & string>(
        user: TUser,
        action: TResources[TKey][number] | "*",
        resourceOrData: TKey | any,
        context?: any
    ): boolean {
        if (!user) return false;

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

        const userRoles = this.config.getUserRoles(user);
        let hasRbacAccess = false;

        for (const role of userRoles) {
            const rolePerms = this.compiledPermissions.get(role as string);
            if (!rolePerms) continue;

            if (rolePerms.has('*') && rolePerms.get('*')?.has('*')) {
                hasRbacAccess = true;
                break;
            }

            const allowedActions = rolePerms.get(resourceType);
            if (allowedActions) {
                if (allowedActions.has('*') || allowedActions.has(action as string)) {
                    hasRbacAccess = true;
                    break;
                }
            }
        }

        if (!hasRbacAccess) return false;
        if (resourceData === null) return true;

        const resourcePolicies = this.policies.get(resourceType);
        if (resourcePolicies) {
            const policyFn = resourcePolicies.get(action as string);
            if (policyFn) {
                return policyFn(user, resourceData, context) === true;
            }
        }

        return true;
    }

    public cannot<TKey extends keyof TResources & string>(
        user: TUser,
        action: TResources[TKey][number] | "*",
        resourceOrData: TKey | any,
        context?: any
    ): boolean {
        return !this.can(user, action, resourceOrData, context);
    }

    /**
     * Valide l'accès et lève une exception en cas d'échec.
     */
    public authorize<TKey extends keyof TResources & string>(
        user: TUser,
        action: TResources[TKey][number] | "*",
        resourceOrData: TKey | any,
        context?: any
    ): void {
        if (this.cannot(user, action, resourceOrData, context)) {
            throw new AuthorizationError();
        }
    }

    /**
     * Filtre de manière récursive un menu pour ne conserver que les liens autorisés.
     */
    public filterMenu<T extends MenuItem>(user: TUser, menu: T[]): T[] {
        return menu
            .filter((item) => {
                // S'il n'y a pas de contrainte de permission, le menu est affiché par défaut
                if (!item.permission) return true;

                // Découpe de la permission (support de "resource.action" ou "resource:action")
                const delimiter = item.permission.includes('.') ? '.' : ':';
                const parts = item.permission.split(delimiter);

                if (parts.length !== 2) return false;
                const [resource, action] = parts;

                return this.can(user, action as any, resource as any);
            })
            .map((item) => {
                // Filtrage récursif des sous-menus (s'il y en a)
                if (item.children && item.children.length > 0) {
                    return {
                        ...item,
                        children: this.filterMenu(user, item.children as T[]),
                    };
                }
                return item;
            });
    }
}

export function createAuth<
    TResources extends ResourceConfig,
    TRoles extends Record<string, RoleDefinition<TResources, Extract<keyof TRoles, string>>>,
    TUser extends BaseUser = BaseUser
>(config: AuthConfig<TResources, TRoles, TUser>) {
    return new RbacEngine<TResources, TRoles, TUser>(config);
}