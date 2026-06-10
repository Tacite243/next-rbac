# Contribuer à next-rbac

Merci de l'intérêt que vous portez à **next-rbac**.

Notre objectif est de construire le moteur d'autorisation le plus rapide, le plus léger et le plus agréable à utiliser pour l'écosystème TypeScript.

Chaque contribution doit contribuer à améliorer au moins l'un des aspects suivants :

* Les performances
* L'expérience développeur (DX)
* La sûreté du typage (Type Safety)
* La maintenabilité
* La documentation
* Les intégrations avec l'écosystème

---

# Code de conduite

En participant à ce projet, vous acceptez de :

* Faire preuve de respect et de bienveillance.
* Accueillir et aider les nouveaux contributeurs.
* Favoriser les discussions techniques constructives.
* Éviter toute attaque personnelle ou comportement toxique.
* Contribuer à maintenir un environnement professionnel et inclusif.

---

# Avant de contribuer

Avant d'ouvrir une Pull Request :

1. Vérifiez si une Issue similaire existe déjà.
2. Vérifiez si une Pull Request similaire est déjà en cours.
3. Ouvrez une Issue avant de développer une fonctionnalité importante.
4. Discutez de toute modification d'API publique avant de commencer l'implémentation.

Les changements architecturaux majeurs qui n'ont pas été discutés au préalable peuvent être refusés.

---

# Mise en place de l'environnement de développement

Clonez le dépôt :

```bash
git clone https://github.com/your-org/next-rbac.git

cd next-rbac
```

Installez les dépendances :

```bash
pnpm install
```

Construisez tous les packages :

```bash
pnpm build
```

Exécutez les tests :

```bash
pnpm test
```

Lancez l'analyse statique :

```bash
pnpm lint
```

Vérifiez les types TypeScript :

```bash
pnpm typecheck
```

---

# Structure du monorepo

```text
packages/

core/
react/
next/
express/
nest/
examples/
```

## Responsabilités des packages

### @next-rbac/core

Contient :

* Le moteur d'autorisation
* La résolution des permissions
* L'héritage des rôles
* L'évaluation des policies
* Les définitions de types

Le package `core` doit rester totalement indépendant de tout framework.

### @next-rbac/react

Contient :

* Les composants React
* Les hooks React
* Les fournisseurs de contexte

### @next-rbac/next

Contient :

* Les utilitaires pour les middlewares
* La protection des routes
* Les helpers pour les Server Actions

### @next-rbac/express

Contient :

* Les middlewares Express

### @next-rbac/nest

Contient :

* Les Guards
* Les Décorateurs
* Les Modules dynamiques

---

# Règles de performance

Les performances sont une priorité absolue du projet.

Les contributeurs doivent privilégier :

```ts
Map
Set
```

plutôt que :

```ts
Array.includes()
Array.find()
Array.filter()
```

pour l'évaluation des permissions.

Évitez :

* La réflexion dynamique (Reflection)
* L'évaluation dynamique de code
* La génération de code à l'exécution
* Les allocations mémoire inutiles

---

## Principes de performance

Une vérification de permission doit :

* S'exécuter en O(1)
* Éviter les allocations mémoire lorsque possible
* Éviter les récursions profondes
* Éviter les normalisations répétées

Si une modification impacte les performances :

* Ajoutez des benchmarks.
* Documentez les compromis éventuels.
* Incluez les résultats dans la Pull Request.

---

# Standards TypeScript

Le projet est conçu selon une approche TypeScript-first.

Toutes les API publiques doivent :

* Posséder des types explicites.
* Préserver l'inférence TypeScript.
* Éviter l'utilisation de `any`.
* Utiliser `unknown` lorsque cela est pertinent.

Interdit :

```ts
any
```

L'utilisation de `any` n'est autorisée qu'avec une justification claire et l'approbation des mainteneurs.

---

## Conception des API publiques

Toutes les API exportées doivent être :

* Prévisibles
* Composables
* Compatibles avec le tree-shaking
* Aussi indépendantes que possible des frameworks

Évitez les abstractions qui augmentent inutilement la taille du bundle.

---

# Conventions de code

## Formatage

Le projet utilise :

* TypeScript
* ESLint
* Prettier

Avant toute soumission :

```bash
pnpm lint
pnpm format
```

---

## Conventions de nommage

### Variables

```ts
camelCase
```

Exemples :

```ts
permissionMap
userRole
```

### Types et Interfaces

```ts
PascalCase
```

Exemples :

```ts
Permission
RoleDefinition
PolicyContext
```

### Constantes

```ts
UPPER_SNAKE_CASE
```

Exemples :

```ts
DEFAULT_CACHE_SIZE
```

---

# Tests

Chaque fonctionnalité doit être accompagnée de tests.

Exigences minimales :

* Tests unitaires
* Tests de typage lorsque nécessaire

Exemple :

```text
core/
 ├── role.test.ts
 ├── permissions.test.ts
 ├── policies.test.ts
```

---

## Couverture de tests

Objectif minimal :

```text
>= 95 %
```

pour le package `@next-rbac/core`.

Toute logique critique liée aux permissions doit être couverte par des tests.

---

# Documentation

La documentation fait partie intégrante du produit.

Toute nouvelle fonctionnalité doit inclure :

* Une documentation de l'API
* Des exemples d'utilisation
* Des exemples TypeScript

Dans la mesure du possible :

* Rédigez la documentation avant l'implémentation.
* Fournissez des exemples en JavaScript et TypeScript.

---

# Convention des commits

Le projet suit la convention **Conventional Commits**.

Exemples :

```text
feat(core): ajout du support des permissions génériques

fix(next): correction d'un cas limite dans le middleware

docs(readme): amélioration du guide d'installation

test(core): ajout des tests d'évaluation des policies

refactor(core): optimisation de la résolution des rôles
```

Types autorisés :

```text
feat
fix
docs
test
refactor
perf
chore
build
ci
```

---

# Règles pour les Pull Requests

Chaque Pull Request doit :

* Être centrée sur une seule modification logique.
* Inclure les tests associés.
* Passer l'ensemble de la CI.
* Mettre à jour la documentation si nécessaire.

Modèle recommandé :

```markdown
## Résumé

Description courte de la modification.

## Changements

- Changement A
- Changement B

## Tests

- [ ] Tests unitaires
- [ ] Tests de typage
- [ ] Vérification manuelle

## Impact sur les performances

Décrire l'impact éventuel.

## Breaking Changes

Aucun / Décrire les changements
```

---

# Sécurité

next-rbac étant un framework d'autorisation, la sécurité est prioritaire sur la commodité.

Ne jamais :

* Stocker des identifiants
* Stocker des secrets
* Exécuter du code arbitraire
* Introduire des mécanismes permettant de contourner les permissions

Toute vulnérabilité ou problème de sécurité doit être signalé de manière privée avant toute divulgation publique.

---

# Philosophie des versions

Les priorités du projet sont :

1. Exactitude
2. Sécurité
3. Performances
4. Expérience développeur
5. Nouvelles fonctionnalités

Une fonctionnalité rapide mais incorrecte sera systématiquement rejetée.

---

# Principes de décision

Lors de l'évaluation des contributions :

* Plus simple est préférable.
* Plus rapide est préférable.
* Plus léger est préférable.
* Plus sûr est préférable.
* Plus explicite est préférable à la magie.

Si deux implémentations offrent les mêmes fonctionnalités, privilégiez celle qui présente :

* Le moins de dépendances
* La plus petite taille de bundle
* Le plus faible coût à l'exécution
* La maintenance la plus simple

---

# Merci ❤️

next-rbac est construit par sa communauté.

Chaque rapport de bug, suggestion d'amélioration, benchmark, test, amélioration de documentation ou Pull Request contribue à rendre l'autorisation plus rapide, plus sûre et plus simple pour tous.
