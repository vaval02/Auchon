# 🛒 Gestionnaire de Liste de Courses

Une application web minimaliste et intuitive pour gérer votre liste de courses avec support des recettes et personnalisation complète.

## 🎯 Fonctionnalités

### ✅ Gestion des Catégories
- **8 catégories pré-définies** :
  - Santé et hygiène
  - Fruits et légumes
  - Viandes et poissons
  - Produits laitiers
  - Épicerie
  - Boissons
  - Surgelés
  - Autres

- Ajoutez facilement vos propres catégories
- Navigation simple par onglets

### 🍎 Gestion des Produits
- Chaque catégorie contient une liste complète de produits
- Cochez les produits pour les ajouter à votre liste
- Modifiez, ajoutez ou supprimez des produits
- Mise à jour instantanée de la liste de courses

### 📖 Gestion des Recettes
- **3 recettes pré-définies** :
  - Pâtes Bolognaise
  - Chili Con Carne
  - Salade César

- Créez vos propres recettes avec ingrédients et quantités
- Sélectionnez les ingrédients à ajouter à votre liste
- Les quantités s'additionnent automatiquement

### 📋 Liste de Courses Finale
- Affichage en temps réel de tous les produits sélectionnés
- Gestion des quantités automatique
- Suppression facile d'éléments
- Copie de la liste au presse-papiers
- Partage via protocole natif (mobiles)

## 🚀 Guide Utilisateur

### Étape 1 : Sélectionner des Produits
1. Cliquez sur une catégorie dans la barre latérale gauche
2. Cochez les produits que vous souhaitez ajouter
3. Ils apparaissent immédiatement dans la liste finale (à droite)

### Étape 2 : Ajouter une Recette
1. Allez dans l'onglet **"Recettes"**
2. Cliquez sur **"👁️ Voir"** sur une recette
3. Cochez les ingrédients que vous voulez
4. Cliquez sur **"Ajouter à la liste"**
5. Les quantités s'ajoutent automatiquement

### Étape 3 : Personnaliser
- **Ajouter une catégorie** : Cliquez sur **"+"** dans la barre latérale
- **Ajouter un produit** : Cliquez sur **"+ Ajouter un produit"** dans une catégorie
- **Ajouter une recette** : Cliquez sur **"+ Ajouter une recette"** dans l'onglet recettes

## 💾 Stockage et Persistance

L'application utilise **localStorage** pour sauvegarder automatiquement :
- Vos catégories personnalisées
- Vos produits
- Vos recettes
- Votre liste de courses

Les données sont conservées même après la fermeture du navigateur.

## ☁️ Synchronisation Cloud (optionnel)

L'application peut synchroniser vos données entre plusieurs appareils via Firebase.
- Copiez `firebase-config.example.js` en `firebase-config.js`
- Remplissez la configuration depuis la console Firebase
- Activez Firestore et Authentication (Google et/ou Email/Password)
- Connectez-vous via le bouton utilisateur en haut à droite

Les modifications sont alors synchronisées automatiquement lorsque vous êtes connecté.

## 🎨 Design et Personnalisation

### Thème
- **Mode clair** : Design minimaliste et épuré
- **Mode sombre** : Activez via le bouton 🌙 dans l'en-tête
- Les préférences sont mémorisées

### Responsive
- **Desktop** : Disposition 3 colonnes (catégories, produits, liste)
- **Tablette** : Disposition 2 colonnes
- **Mobile** : Disposition empilée verticalement

### Couleurs
- **Primaire** : Vert (#4CAF50) - Actions principales
- **Secondaire** : Bleu (#2196F3) - Informations
- **Accents** : Gris clair pour les sections

## ⌨️ Raccourcis Clavier

| Action | Raccourci |
|--------|-----------|
| Ajouter une catégorie | `+` + Entrée |
| Ajouter un produit | `+` + Entrée |
| Ajouter une recette | `+` + Entrée |
| Fermer un modal | `Échap` |
| Valider un champ | `Entrée` |

## 🔧 Boutons d'Action

### En-tête
- 🌙 **Mode sombre** : Basculer le thème
- ↻ **Réinitialiser** : Effacer toutes les données (avec confirmation)

### Barre latérale gauche
- **+** : Ajouter une nouvelle catégorie

### Zone de produits
- **+ Ajouter un produit** : Ajouter un produit à la catégorie actuelle
- **✕** : Supprimer un produit (dans la rangée du produit)

### Onglet Recettes
- **+ Ajouter une recette** : Créer une nouvelle recette
- **👁️ Voir** : Afficher les détails et sélectionner les ingrédients
- **✕** : Supprimer une recette

### Liste de Courses
- **✕** (en haut) : Vider complètement la liste
- **📋 Copier** : Copier la liste au presse-papiers
- **📤 Partager** : Partager la liste (sur mobiles)
- **✕** (par produit) : Supprimer un produit individual

## 📊 Exemple de Workflow

1. **Lundi** : Vous ouvrez l'onglet "Fruits et légumes"
   - Vous cochez "carottes" et "courgettes"
   - Liste affichée : carottes (1), courgettes (1)

2. **Toujours lundi** : Vous décidez de cuisiner
   - Allez dans "Recettes"
   - Cliquez sur "Pâtes Bolognaise" et cochez "viande hachée" et "sauce tomate"
   - Liste mise à jour : carottes (1), courgettes (1), viande hachée (1), sauce tomate (1)

3. **Le lendemain** : Vous ajoutez un chili
   - Cliquez sur "Chili Con Carne" et cochez "viande hachée"
   - Viande hachée passe à (2) automatiquement ✨

## 💡 Astuces

- Vous pouvez ajouter des quantités dans les recettes (ex: "500g", "1 boîte")
- Les produits cochés restent mémorisés quand vous changez de catégorie
- Vous pouvez réinitialiser l'app complètement avec le bouton ↻
- La liste se met à jour en temps réel
- Les quantités s'additionnent toujours quand vous sélectionnez le même produit plusieurs fois

## 📱 Compatibilité

- ✅ Chrome / Chromium (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Tous les navigateurs modernes

## 🎯 Bonus Inclus

- ✨ Mode sombre
- 🔄 Synchronisation automatique via localStorage
- 📋 Copie facile de la liste
- 📤 Partage natif (mobiles)
- 📱 Design entièrement responsive
- ⚡ Aucune dépendance externe
- 🚀 Chargement ultra-rapide

## 📝 Notes Techniques

- **Technologie** : Vanilla JavaScript (aucun framework)
- **Stockage** : localStorage (données persistantes)
- **CSS** : Flexbox et Grid pour la mise en page
- **Taille** : ~50 KB (HTML + CSS + JS)
- **Performance** : Chargement instantané, zéro latence

## 🔐 Confidentialité

Par défaut, toutes les données restent sur votre ordinateur/téléphone grâce à `localStorage`.
Si vous activez la synchronisation Firebase, les données sont stockées uniquement dans votre projet Firebase privé.

---

**Créé avec ❤️ | Libre d'utilisation**

## 🛠️ Démarrage local (mock server + site statique)

Pour tester rapidement l'application localement :

- Installer les dépendances (si nécessaire) :

```bash
npm install
```

- Lancer le mock server (API fuzzy search) :

```bash
npm run start-server
# puis ouvrir http://localhost:3000 si vous voulez tester l'API
```

- Servir le dossier `www/` (UI) :

```bash
npm run serve-www
# puis ouvrir http://localhost:8080
```

Le mock server fournit des endpoints simples :

- `GET /categories` — liste des catégories
- `GET /products?q=terme` — recherche de produits
- `POST /products` — ajouter un produit (body JSON: `{ categoryId, name }`)
- `GET /search?q=terme` — recherche fuzzy (retourne les meilleurs candidats)

Ces endpoints sont fournis uniquement pour faciliter les tests locaux et peuvent être remplacés par un backend réel (Firebase, Node.js, etc.).
