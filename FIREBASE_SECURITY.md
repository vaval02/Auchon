# 🔐 Configuration Firebase Sécurisée

## ⚠️ IMPORTANT: Règles Firestore

Pour protéger les données de chaque utilisateur, il faut configurer les règles Firestore.

---

## 📋 Accédez aux règles

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet `courses-b3e0e`
3. À gauche : **Firestore Database**
4. Cliquez l'onglet **"Rules"**

---

## 🔒 Copiez ces règles

**Remplacez le contenu actuel par ceci** :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ✅ Données privées par utilisateur
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }

    // ✅ Liste partagée entre les appareils du même compte
    match /sharedLists/{document=**} {
      allow read, write: if request.auth != null;
    }

    // ✅ Recettes publiques si besoin
    match /public_recipes/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📝 Ce que ça signifie

| Règle | Effet |
|-------|-------|
| `request.auth.uid == uid` | Seulement l'utilisateur propriétaire peut voir/modifier |
| `/users/{uid}` | Chaque utilisateur a un dossier personnel |
| `if true` | Lecture publique (pour recettes partagées) |
| `if request.auth != null` | Faut être loggé pour écrire |

---

## ✅ Appuyez sur "Publish"

1. Vérifiez que les règles sont correctes
2. Cliquez **"Publish"**
3. Attendez confirmation

---

## 🛡️ Vérification de sécurité

### Test 1: Authentification requise
```javascript
// Ouvrez la console (F12) et testez:
db.collection('users').doc('random-uid').get()
// ❌ Erreur: Permission denied (attendu)
```

### Test 2: Accès utilisateur
```javascript
// Si vous êtes loggé comme user1:
db.collection('users').doc(user1_uid).get()
// ✅ Fonctionne!

db.collection('users').doc(autre_user_uid).get()
// ❌ Permission denied (sécurité OK)
```

---

## 🔓 Règles permissives (ATTENTION: Danger!)

⚠️ **NE PAS UTILISER EN PRODUCTION** :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ❌ TRÈS DANGEREUX!
    }
  }
}
```

Cela permet à **n'importe qui** de lire/modifier/supprimer toutes les données!

---

## 📱 Pour Android

Firebase gère automatiquement l'authentification. Tant que les règles sont bonnes, Android ne peut voir que **ses propres données**.

---

## 📱 Pour iPhone (PWA)

**Même règles Firebase** : L'app web utilise le même Firestore.

La sécurité est garantie par :
- ✅ Authentification email/password
- ✅ Règles Firestore (`request.auth.uid`)
- ✅ Tokens JWT automatiques

---

## 🔄 Workflow de sécurité

```
1. Utilisateur se connecte
2. Firebase Auth crée un JWT token
3. Token envoyé avec chaque requête
4. Firestore vérifie: ce user_id = ce token_id?
5. Si oui ✅ → Autorisé
6. Si non ❌ → Permission denied
```

---

## 🚨 Indices de problèmes

| Symptôme | Cause |
|----------|-------|
| **"Permission denied"** | Règles Firestore mal configurées |
| **Données de l'autre user visibles** | Règles trop permissives |
| **Pas d'erreur mais rien ne sauvegarde** | Vérifiez Firebase config |
| **App très lente** | Trop de listeners Firestore actifs |

---

## 💡 Conseils de sécurité

1. **Ne partagez jamais votre Firebase config**
   - Elle est publique (c'est normal!)
   - Mais les clés API doivent avoir des restrictions

2. **Testez les règles**
   - Utilisez Firestore Emulator localement
   - Testez chaque scénario avant prod

3. **Versionnez vos règles**
   ```
   # Dans un fichier firestore.rules
   rules_version = '2';
   service cloud.firestore {
     ...
   }
   ```

4. **Monitoring**
   - Allez dans Firebase Console → Security
   - Vérifiez les alertes de sécurité

---

## 📞 Support Firebase

Si vous avez des erreurs Firebase :

1. **Console** (F12) → Onglet **Console**
2. Cherchez les erreurs en rouge
3. Consultez https://firebase.google.com/docs

---

## ✅ Checklist avant production

- [ ] Règles Firestore configurées
- [ ] Authentification testée
- [ ] Chaque user voit que ses données
- [ ] Pas d'avertissements Firebase
- [ ] HTTPS forcé (Netlify/Vercel)
- [ ] Backup enabled dans Firebase

---

**Vous êtes maintenant sécurisé!** 🔒
