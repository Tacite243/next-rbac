/**
 * Contrat de base pour un utilisateur du système.
 */
export interface BaseUser {
    id: string | number;
    [key: string]: any;
}

/**
 * Définition des ressources et de leurs actions associées.
 * Exemple : { posts: ["create", "read"] }
 */
export type ResourceConfig = Record<string, readonly string[]>;

/**
 * Définition générique des permissions associées aux rôles.
 */
export type RolePermissions<TResources extends ResourceConfig> = {
    [Resource in keyof TResources]?: readonly TResources[Resource][number][] | readonly ["*"];
} & {
    "*"?: readonly ["*"];
};

/**
 * Définition d'un rôle individuel contenant ses permissions et ses héritages optionnels.
 */
export interface RoleDefinition<TResources extends ResourceConfig, TRoleNames extends string> {
    extends?: TRoleNames | readonly TRoleNames[];
    permissions: RolePermissions<TResources>;
}

/**
 * Configuration globale transmise à createAuth.
 */
export interface AuthConfig<
    TResources extends ResourceConfig,
    TRoles extends Record<string, RoleDefinition<TResources, Extract<keyof TRoles, string>>>,
    TUser extends BaseUser = BaseUser
> {
    /** Un dictionnaire décrivant l'ensemble des ressources et de leurs actions autorisées */
    resources: TResources;

    /** Un dictionnaire définissant les rôles, leurs permissions et leur héritage */
    roles: TRoles;

    /** Fonction permettant de récupérer la liste des rôles associés à un utilisateur donné */
    getUserRoles: (user: TUser) => (keyof TRoles | string)[];

    /** Fonction optionnelle permettant d'identifier le type de ressource pour l'évaluation ABAC (ex: post.__typename) */
    getResourceType?: (resource: any) => keyof TResources | string;
}

/**
 * Type représentant une règle métier dynamique (Policy) pour l'ABAC.
 */
export type PolicyFn<TUser extends BaseUser = any, TResourceData = any> = (
    user: TUser,
    resourceData: TResourceData,
    context?: any
) => boolean | Promise<boolean>;

/**
 * Dictionnaire contenant les politiques d'accès pour chaque ressource.
 */
export type ResourcePolicies<TUser extends BaseUser = any> = {
    [action: string]: PolicyFn<TUser, any>;
};

/**
 * Structure interne optimisée pour la vérification rapide en O(1) après compilation.
 */
export type CompiledPermissions = Map<string, Map<string, Set<string>>>;

/**
 * Représente un élément du menu de navigation pour l'autorisation visuelle.
 */
export interface MenuItem {
    /** Permission au format "ressource.action" ou "ressource:action" (ex: "posts.read") */
    permission?: string;
    /** Sous-menus récursifs */
    children?: MenuItem[];
    [key: string]: any;
}