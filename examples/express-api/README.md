# next-rbac - Express Demo API

Cette API de démonstration montre comment sécuriser une API REST complète en utilisant les packages `@next-rbac/core` (moteur principal) et `@next-rbac/express` (middleware Express).

## Fonctionnalités démontrées
1. **Contrôle d'accès basé sur les Rôles (RBAC)** :
   - Un utilisateur `viewer` ne peut que lire des articles.
   - Un utilisateur `editor` peut créer et lire.
   - Un utilisateur `admin` possède tous les droits de base et de gestion.
2. **Héritage des Rôles** :
   - `editor` hérite automatiquement des permissions de `viewer`.
   - `admin` hérite de toutes les permissions de `editor`.
3. **Contrôle d'accès basé sur les Attributs (ABAC)** :
   - **Politique de modification** : Seul l'auteur d'un article peut le modifier.
   - **Politique de suppression** : Un administrateur peut supprimer n'importe quel article, mais un éditeur ne peut supprimer que son propre article.

---

## Profils de test (Mock Auth)
Pour tester facilement les permissions, vous pouvez ajouter l'en-tête HTTP `X-User-Id` dans vos requêtes pour usurper l'identité d'un utilisateur de test :

| ID de l'utilisateur (`X-User-Id`) | Nom d'utilisateur | Rôle | Droits assignés |
| :--- | :--- | :--- | :--- |
| `1` | Alice | `viewer` | Lecture d'articles |
| `2` | Bob | `editor` | Lecture, Création, Modification de ses propres articles |
| `3` | Charlie | `admin` | Tous les droits + Droits de gestion |

---

## Démarrage rapide

### 1. Installation des dépendances
Depuis la racine du monorepo :
```bash
pnpm install