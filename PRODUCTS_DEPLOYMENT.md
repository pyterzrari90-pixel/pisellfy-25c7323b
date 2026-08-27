# Guide de déploiement du système de produits

## Vue d'ensemble

Le système de produits a été créé avec succès. Il inclut :
- Types TypeScript pour les produits
- API functions pour le CRUD (Create, Read, Update, Delete)
- Hooks React pour la gestion des produits
- Pages de création et de gestion des produits
- Migration SQL pour créer la table dans Supabase

## Fichiers créés

### Types et API
- `src/lib/products/types.ts` - Types TypeScript pour les produits
- `src/lib/products/api.ts` - Fonctions d'accès aux données

### Hooks React
- `src/hooks/useProducts.ts` - Hooks pour gérer les produits

### Pages
- `src/pages/CreateProduct.tsx` - Page de création de produit
- `src/pages/SellerProducts.tsx` - Tableau de bord vendeur

### Mise à jour
- `src/App.tsx` - Routes ajoutées pour `/products/create` et `/products/dashboard`
- `src/components/sections/FeaturedProducts.tsx` - Catalogue maintenant dynamique

### Base de données
- `supabase/migrations/20260827_create_products_table.sql` - Script SQL pour créer la table

## Étapes de déploiement

### 1. Appliquer la migration SQL dans Supabase

Connectez-vous à votre dashboard Supabase :

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **Pisellfy**
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New query**
5. Copiez-collez le contenu de `supabase/migrations/20260827_create_products_table.sql`
6. Cliquez sur **Run** (ou `Ctrl+Enter`)

La table `products` sera créée avec :
- Tous les champs nécessaires
- Index pour les performances
- Row Level Security (RLS) activé
- Politiques de sécurité pour que chaque vendeur ne puisse gérer que ses propres produits

### 2. Vérifier les politiques RLS

Dans Supabase, allez dans **Authentication > Policies** et vérifiez que les politiques suivantes sont actives :
- "Anyone can view active products"
- "Sellers can view their own products"
- "Sellers can create products"
- "Sellers can update their own products"
- "Sellers can delete their own products"

### 3. Tester l'application

1. Lancez le serveur de développement : `npm run dev`
2. Ouvrez l'application dans le Pi Browser
3. Connectez-vous avec votre compte Pi
4. Allez sur `/products/create` pour créer un produit
5. Vérifiez qu'il apparaît dans le catalogue sur la page d'accueil

## Scénario de test complet

### Test de création et partage

1. **Avec le compte Vendeur A** :
   - Ouvrez l'app dans Pi Browser
   - Connectez-vous avec Pi
   - Allez sur `/products/create`
   - Créez un produit :
     - Titre: "Test UI Kit"
     - Prix: 10 Pi
     - Catégorie: "Design"
     - Image: `https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop`
   - Cliquez sur "Publier le produit"

2. **Avec le compte Acheteur B** (ou navigation privée) :
   - Ouvrez l'app
   - Allez sur la page d'accueil (#marketplace)
   - **Vérifiez que le produit "Test UI Kit" apparaît**
   - Cliquez sur "Buy for π 10"
   - Effectuez le paiement Pi

3. **Résultat attendu** :
   - Le produit créé par le Vendeur A est visible pour l'Acheteur B
   - Le paiement Pi fonctionne
   - L'achat est enregistré dans la table `purchases`

## Structure de la base de données

### Table `products`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `seller_id` | UUID | Référence vers `profiles.id` |
| `title` | TEXT | Titre du produit |
| `description` | TEXT | Description détaillée |
| `price` | DECIMAL | Prix actuel en Pi |
| `original_price` | DECIMAL | Prix original (optionnel) |
| `category` | TEXT | Catégorie du produit |
| `image_url` | TEXT | URL de l'image |
| `creator_name` | TEXT | Nom du créateur |
| `rating` | DECIMAL | Note moyenne (0-5) |
| `reviews_count` | INTEGER | Nombre d'avis |
| `is_featured` | BOOLEAN | Produit en vedette |
| `is_active` | BOOLEAN | Produit visible |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de mise à jour |

## Routes disponibles

- `/` - Page d'accueil avec catalogue de produits
- `/products/create` - Créer un nouveau produit
- `/products/dashboard` - Gérer vos produits (vendeur)

## Sécurité

### Row Level Security (RLS)

La table `products` est protégée par RLS :
- Tout le monde peut voir les produits actifs
- Seul le vendeur peut modifier/supprimer ses produits
- Les produits inactifs ne sont visibles que par leur créateur

### Paiements Pi

Le système de paiement Pi existant n'a **pas été modifié** :
- `usePiPayment` hook reste inchangé
- Le bouton "Buy with Pi" fonctionne comme avant
- Les achats sont enregistrés dans `purchases` (table existante)

## Dépannage

### Les produits ne s'affichent pas

1. Vérifiez que la migration SQL a été appliquée
2. Vérifiez que le produit a `is_active = true`
3. Vérifiez les politiques RLS dans Supabase
4. Regardez les erreurs dans la console du navigateur

### Erreur de création de produit

1. Vérifiez que l'utilisateur est connecté avec Pi
2. Vérifiez que tous les champs requis sont remplis
3. Vérifiez que l'URL de l'image est valide
4. Regardez les erreurs dans Supabase > Logs

## Prochaines étapes

1. **Page d'édition de produit** - Créer `EditProduct.tsx` pour modifier les produits existants
2. **Page de détail produit** - Créer `ProductDetail.tsx` pour afficher un produit en détail
3. **Système de recherche** - Ajouter un filtre par catégorie et une barre de recherche
4. **Système d'avis** - Permettre aux acheteurs de noter les produits
5. **Upload d'images** - Intégrer Supabase Storage pour l'upload d'images

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Supabase Dashboard > Logs
2. Vérifiez la console du navigateur
3. Vérifiez que toutes les variables d'environnement sont configurées
4. Contactez-moi pour obtenir de l'aide supplémentaire
