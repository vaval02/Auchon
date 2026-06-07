# 📱 Installation Native iOS avec Capacitor (Sans Mac)

## ✅ Vous avez 2 alternatives

Vous n'avez **pas de Mac**, donc voici vos options pour avoir l'app native iOS :

---

## **Option A : Ionic AppFlow (Build cloud) ☁️ - RECOMMANDÉE**

### Avantages :
- ✅ Pas besoin de Mac
- ✅ Compilation dans le cloud
- ✅ App native vraie
- ✅ Gratuit les 30 premières minutes/mois

### Étapes :

1. **Préparez votre code**

```powershell
# Windows PowerShell
npm install
npm run build:ios
```

2. **Allez sur Ionic AppFlow**
   - https://ionic.io/appflow
   - Sign up gratuitement
   - Connectez votre GitHub repo
   - New Build → iOS → Build

3. **Attendez ~15 minutes**
   - AppFlow compile votre app
   - Génère un fichier `.ipa`

4. **Téléchargez le fichier `.ipa`**

5. **Installez sur votre iPhone**

   **Méthode 1 : Avec un Mac d'ami**
   ```bash
   xcode-select --install
   # Puis trainez le fichier .ipa dans Xcode
   ```

   **Méthode 2 : Windows via Altstore**
   - Téléchargez AltStore : https://altstore.io/
   - Installez sur votre ordinateur
   - Connectez votre iPhone en USB
   - Ajoutez le fichier `.ipa`
   - ✅ App installée!

   **Méthode 3 : Via TestFlight (simple)**
   - Uploadez le `.ipa` sur TestFlight
   - Invitez-vous en tant que testeur
   - Installez depuis l'app TestFlight

---

## **Option B : EAS Build (Expo) ☁️**

Alternative à Ionic AppFlow :

```powershell
npm install -g eas-cli
eas build --platform ios --auto-submit
```

---

## **Option C : GitHub Actions (Automatisé) ⚡**

Si vous voulez que ça se compile à chaque push :

**Créez `.github/workflows/ios-build.yml`** :

```yaml
name: iOS Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:ios
      - uses: actions/upload-artifact@v3
        with:
          name: ios-build
          path: ios/App/build/outputs
```

---

## 🔴 **ATTENTION : Vous avez BESOIN d'un Mac pour**

❌ Compiler directement (`xcodebuild`)
❌ Signer l'app (certificats Apple)
❌ Publier sur l'App Store

**MAIS** : AppFlow/EAS font ça pour vous sur leurs serveurs!

---

## 📦 Structure du build iOS (auto-généré)

Une fois Capacitor sync, vous aurez :

```
ios/
├── App/
│   ├── App.xcworkspace       ← Ouvrir avec Xcode (sur Mac)
│   ├── Podfile               ← Dépendances iOS
│   └── build/
│        └── outputs/
│            └── App.ipa      ← Le fichier final
└── Capacitor.xcconfig
```

---

## 🚀 Résumé du flux Windows → iPhone

1. **Votre PC (Windows)** :
   ```
   npm run build:ios
   ```

2. **Ionic AppFlow** :
   ```
   Cloud compute: Génère .ipa
   ```

3. **Votre iPhone** :
   ```
   AltStore ou TestFlight : Installe l'app
   ```

4. **La synchronisation** :
   ```
   Firebase gère la sync autom
   ```

---

## 🆘 Si AppFlow dépasse 30 min gratuites

### Solutions :

**A. Attendez le mois prochain**
- Votre quota se réinitialise

**B. Utilisez PWA** (notre Option 1 recommandée!)
- Pas de limitation
- Synchronisation identique

**C. Payez Ionic AppFlow**
- ~$20/mois illimitée

---

## ✅ Check-list avant de commencer

- [ ] Repo GitHub créé
- [ ] `www/` dossier rempli de votre app
- [ ] `capacitor.config.json` configuré ✅ (déjà fait)
- [ ] `package.json` mis à jour ✅ (déjà fait)
- [ ] Compte Ionic AppFlow gratuit créé
- [ ] Firebase config valide ✅ (déjà fait)

---

## 🎯 Commandes rapides

```powershell
# Tester localement
npm run build

# Build pour iOS
npm run build:ios

# Ouvrir Xcode sur Mac
npm run open:ios

# Ouvrir Android Studio
npm run open:android
```

---

**💡 TIP** : PWA (Option 1 du premier guide) est plus facile pour débuter!
