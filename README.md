# next-rbac

Un moteur d'autorisation performant, léger et TypeScript-first pour les applications modernes. Gère à la fois le contrôle d'accès basé sur les rôles (**RBAC**) et sur les attributs (**ABAC**), du frontend au backend.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Vision et Objectifs

La gestion des permissions devient souvent complexe lorsque la logique est dupliquée entre le frontend (pour masquer des menus), le backend (pour sécuriser des routes), et les middlewares. 

**next-rbac** offre une source unique de vérité. Vous définissez vos règles d'accès une seule fois, et vous les appliquez de manière identique partout.

### Caractéristiques clés
- **0 dépendance de production** au cœur du moteur (`@next-rbac/core`).
- **Taille minimale** (< 10 KB gzip pour le core).
- **Lookup en $O(1)$** : Les permissions et l'héritage sont précompilés sous forme de `Map` et `Set` à l'initialisation.
- **Type-safe** : Inférence automatique des ressources et actions définies dans votre configuration.
- **Support hybride** : Modèles d'autorisations statiques (RBAC) et règles dynamiques (ABAC).
- **Framework-agnostic** : Fonctionne sur le client et le serveur (Next.js, React, Express, NestJS).

---

## Architecture du projet

Ce projet est structuré sous forme de monorepo géré par `pnpm` :

*   `@next-rbac/core` : Le moteur d'évaluation indépendant de tout framework.
*   `@next-rbac/react` : Composants et hooks d'affichage conditionnel (`<Can />`, `useAuth()`).
*   `@next-rbac/next` : Intégrations pour Next.js (Middlewares, Server Actions, protection de routes).
*   `@next-rbac/express` : Middlewares d'autorisation pour Express.js.
*   `@next-rbac/nest` : Guards et décorateurs pour NestJS.

---

next-rbac/
├── packages/
│   ├── core/                  # Moteur d'autorisation indépendant
│   │   ├── src/
│   │   │   ├── index.ts       # Point d'entrée de l'API publique
│   │   │   ├── types.ts       # Définitions de types TypeScript (Configuration, User, Rules)
│   │   │   ├── engine.ts      # Logique de compilation et d'évaluation O(1)
│   │   │   ├── policy.ts      # Gestionnaire des règles métiers (ABAC)
│   │   │   └── utils.ts       # Utilitaires d'optimisation
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts     # Configuration de build (ESM, CJS, d.ts)
│   │
│   ├── react/                 # Composants et Hooks pour applications React
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── context.tsx    # Fournisseur de contexte (AuthProvider)
│   │   │   ├── components.tsx # Composants d'affichage conditionnel (<Can>, <Cannot>)
│   │   │   └── hooks.ts       # Hook d'évaluation (useAuth)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   │
│   ├── next/                  # Intégrations spécifiques à Next.js (App Router, Server Actions)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts  # Utilitaires de protection pour les middlewares
│   │   │   ├── actions.ts     # Wrapper sécurisé pour les Server Actions
│   │   │   └── navigation.ts  # Aide à la navigation sécurisée côté serveur
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── express/               # Middleware pour Express.js
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── middleware.ts  # Middleware d'autorisation Express
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── nest/                  # Guards et décorateurs pour NestJS
│       ├── src/
│       │   ├── index.ts
│       │   ├── rbac.guard.ts  # Guard d'évaluation
│       │   └── decorators.ts  # Décorateurs @Authorize et @CurrentUser
│       ├── package.json
│       └── tsconfig.json
│
├── examples/                  # Exemples d'implémentation
│   ├── next-app/              # Exemple complet avec Next.js App Router
│   └── express-api/           # API d'exemple utilisant Express
│
├── .gitignore
├── LICENSE                    # Licence MIT (recommandée pour l'open-source)
├── package.json               # Configuration du monorepo racine
├── pnpm-workspace.yaml        # Configuration du workspace pnpm
├── tsconfig.json              # Configuration TypeScript globale
└── README.md                  # Documentation principale du projet

---

## Installation (Aperçu)

Chaque module est installable séparément selon vos besoins.

```bash
# Avec pnpm
pnpm add @next-rbac/core

# Avec npm
npm install @next-rbac/core

# Avec yarn
yarn add @next-rbac/core