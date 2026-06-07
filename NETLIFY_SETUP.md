# 🚀 Netlify Setup : Mettre votre app en ligne

## 📋 Prérequis

- [ ] Compte GitHub avec votre repo Auchon
- [ ] npm installé sur votre PC Windows
- [ ] 10 minutes

---

## **Étape 1 : Préparez votre code localement**

```powershell
# Ouvrez PowerShell dans votre dossier Auchon
cd "C:\Users\vaval\Auchon"

# Installez les dépendances
npm install

# Compilez l'app web dans le dossier www
npm run build

# Vérifiez que www/ a maintenant l'app compilée
ls www
```

✅ Vous devriez voir : `index.html`, `app.js`, `styles.css`, `firebase-config.js`, etc.

---

## **Étape 2 : Créez un repo GitHub** (si pas encore)

1. Allez sur https://github.com/new
2. Nommez-le `auchon` ou `shopping-list`
3. ✅ Créez le repo
4. Suivez les instructions pour pusher votre code :

```powershell
# Si vous n'avez pas encore initialisé git
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/auchon.git
git push -u origin main
```

✅ Votre code est maintenant sur GitHub

---

## **Étape 3 : Créer un compte Netlify**

1. Allez sur https://app.netlify.com/signup
2. Cliquez **"Sign up with GitHub"**
3. Autorisez Netlify à accéder à votre GitHub
4. Vérifiez votre email

✅ Vous êtes connecté à Netlify

---

## **Étape 4 : Déployer votre app**

1. Sur la page d'accueil Netlify, cliquez **"Add new site"** → **"Import an existing project"**
2. Choisissez **GitHub**
3. Sélectionnez votre repo `auchon`
4. **Configurations** :
   - **Branch to deploy** : `main`
   - **Build command** : `npm install && npm run build`
   - **Publish directory** : `www`
5. Cliquez **"Deploy site"**

⏳ **Attendez 2-3 minutes** pour que Netlify compile et déploie

✅ Une URL vous sera donnée comme : `https://your-app-abc123.netlify.app`

---

## **Étape 5 : Testez votre app en ligne**

1. Ouvrez l'URL Netlify dans votre navigateur
2. L'app devrait charger complètement
3. Testez les fonctionnalités locales (sans login)

✅ Ça marche? Continue...

---

## **Étape 6 : Installez sur iPhone (PWA)**

**Sur votre iPhone** :

1. Ouvrez **Safari**
2. Allez à votre URL : `https://your-app-abc123.netlify.app`
3. L'app charge (ça peut prendre 10-15 secondes)
4. Tapez le bouton **Partage** en bas (icône avec flèches)
5. Faites défiler et tapez **"Sur l'écran d'accueil"**
6. Tapez **"Ajouter"**

✅ L'app est maintenant sur votre accueil iPhone!

---

## **Étape 7 : Testez la synchronisation**

### Préparation

**Sur l'appareil Android** (de l'utilisateur):
```
1. Ouvrir l'app
2. Cliquer le bouton user (👤)
3. Créer un compte ou se connecter
   Email: test@valentine.com
   Password: testtest123
4. Ajouter des produits : Pommes, Pain, Lait
5. Laisser l'app ouverte
```

**Sur iPhone** (votre app):
```
1. Ouvrir l'app depuis l'écran d'accueil
2. Cliquer le bouton user (👤)
3. Se connecter avec le MÊME email/password
   Email: test@valentine.com
   Password: testtest123
4. 🎉 Vous devriez voir la liste!
```

### Test de synchronisation en temps réel

1. **Android** : Ajoutez un nouveau produit → "Fromage"
2. **iPhone** : Attendez 2-3 secondes, rechargez l'app (pull down)
3. **Vérifiez** : "Fromage" est apparu? ✅ SUCCÈS!

---

## 🔧 Paramètres Netlify avancés

### Custom Domain (optionnel)

Si vous voulez `https://votreapp.com` au lieu de `netlify.app` :

1. Sur Netlify, allez à **Domain settings**
2. Cliquez **"Add domain"**
3. Suivez les instructions (configurer DNS)

### Deploy automatique

À chaque `git push` sur `main`, Netlify redéploie automatiquement! ✅

```powershell
# Après modification locale
git add .
git commit -m "Update app"
git push

# Netlify détecte le push et redéploie en 1-2 minutes
```

---

## 📱 Résultat final

| Android App | ↔️ Firebase | ↔️ iPhone PWA |
|-------------|-----------|-------------|
| Desktop | → Netlify | ← Windows PWA |
| | Sync auto | Sync auto |
| Même compte | Même données | Même compte |

---

## ⚠️ Dépannage Netlify

| Problème | Solution |
|----------|----------|
| **"Build failed"** | Vérifiez que `npm run build` fonctionne localement |
| **Rien n'apparaît** | Attendez 3 min après deployment |
| **404 Not Found** | Vérifiez publish directory = `www` |
| **App charge but pas de contenu** | Ouvrez DevTools (F12) et cherchez erreurs |

---

## 🎉 Bravo!

Vous avez maintenant :
✅ App en ligne sur Netlify
✅ PWA installée sur iPhone
✅ Synchronisation Firebase en temps réel
✅ Même app sur Android & iOS

---

**Besoin d'aide ?**
- Consultez `GUIDE_SYNC_MULTIPLATEFORME.md` pour plus de détails
- Vérifiez votre email dans la console Netlify

**Prochaine étape ?** → Testez la synchronisation avec un ami! 🚀
