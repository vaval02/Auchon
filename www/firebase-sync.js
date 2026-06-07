// Minimal Firebase sync bridge
(function(){
  if (!window.firebaseConfig) {
    console.error('Firebase config not found. Copy firebase-config.example.js to firebase-config.js and fill values from a Firebase Web app.');
    return;
  }

  const missingFields = ['apiKey', 'authDomain', 'projectId', 'appId'].filter(field => !window.firebaseConfig[field]);
  if (missingFields.length) {
    console.error(`Firebase config incomplete: missing ${missingFields.join(', ')}. Use the web app config from Firebase Console.`);
    return;
  }

  if (typeof window.firebaseConfig.appId === 'string' && window.firebaseConfig.appId.includes(':android:')) {
    console.error('Firebase appId appears to be an Android app config. Please use Firebase Web app configuration for web/auth usage.');
    return;
  }

  const app = firebase.initializeApp(window.firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  let currentUnsub = null;

  function updateAuthUI(user) {
    const authBtn = document.getElementById('authBtn');
    if (!authBtn) return;
    if (user) {
      authBtn.title = `Connecté: ${user.email || user.uid}`;
      authBtn.innerHTML = '<i class="fas fa-user-check"></i>';
    } else {
      authBtn.title = 'Se connecter';
      authBtn.innerHTML = '<i class="fas fa-user"></i>';
    }
  }

  function getLocalData() {
    const savedData = localStorage.getItem('shoppingListData');
    if (!savedData) return null;
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.warn('Invalid local shopping data', e);
      return null;
    }
  }

  function getLocalLastUpdated() {
    return Number(localStorage.getItem('shoppingListLastUpdated')) || 0;
  }

  function saveLocalTimestamp(timestamp) {
    localStorage.setItem('shoppingListLastUpdated', timestamp.toString());
  }

  async function pushLocalData(docRef) {
    const localData = getLocalData();
    if (!localData) return;
    const timestamp = Date.now();
    saveLocalTimestamp(timestamp);
    await docRef.set({
      categories: localData.categories || [],
      recipes: localData.recipes || [],
      shoppingList: localData.shoppingList || {},
      lastUpdated: timestamp
    });
  }

  function applyRemoteData(data) {
    if (!data || typeof data !== 'object') return;
    const local = {
      categories: data.categories || [],
      recipes: data.recipes || [],
      shoppingList: data.shoppingList || {}
    };
    try {
      localStorage.setItem('shoppingListData', JSON.stringify(local));
      saveLocalTimestamp(data.lastUpdated || Date.now());
      window.dispatchEvent(new Event('app:remoteUpdate'));
    } catch (e) {
      console.error('Failed to apply remote data', e);
    }
  }

  function startSync(uid) {
    if (currentUnsub) currentUnsub();
    const docRef = db.collection('users').doc(uid);
    currentUnsub = docRef.onSnapshot(async snap => {
      if (!snap.exists) {
        try {
          await pushLocalData(docRef);
        } catch (err) {
          console.error('Error initializing remote data', err);
        }
        return;
      }

      const remote = snap.data();
      if (!remote || !remote.lastUpdated) return;

      const localUpdated = getLocalLastUpdated();
      if (remote.lastUpdated > localUpdated) {
        applyRemoteData(remote);
      } else if (remote.lastUpdated < localUpdated) {
        try {
          await pushLocalData(docRef);
        } catch (err) {
          console.error('Error pushing newer local data', err);
        }
      }
    });
  }

  function stopSync() {
    if (currentUnsub) currentUnsub();
    currentUnsub = null;
  }

  async function syncSaveToCloud(event) {
    const user = auth.currentUser;
    if (!user) return;
    const payload = event.detail && event.detail.payload;
    const lastUpdated = event.detail && event.detail.lastUpdated;
    if (!payload || !lastUpdated) return;
    try {
      await db.collection('users').doc(user.uid).set({
        categories: payload.categories || [],
        recipes: payload.recipes || [],
        shoppingList: payload.shoppingList || {},
        lastUpdated
      });
    } catch (err) {
      console.error('Error syncing to Firestore', err);
    }
  }

  function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('active');
  }

  function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('active');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const emailLoginBtn = document.getElementById('emailLoginBtn');
    const emailRegisterBtn = document.getElementById('emailRegisterBtn');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    if (authBtn) {
      authBtn.addEventListener('click', () => {
        const user = auth.currentUser;
        if (user) {
          if (confirm('Déconnexion ?')) auth.signOut();
          return;
        }
        openAuthModal();
      });
    }

    if (authModal) {
      authModal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeAuthModal());
      });
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
      });
    }

    if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then(() => closeAuthModal())
          .catch(err => alert('Échec connexion Google : ' + err.message));
      });
    }

    if (emailLoginBtn) {
      emailLoginBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
          alert('Entrez un email et un mot de passe.');
          return;
        }
        auth.signInWithEmailAndPassword(email, password)
          .then(() => closeAuthModal())
          .catch(err => alert('Échec de connexion : ' + err.message));
      });
    }

    if (emailRegisterBtn) {
      emailRegisterBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
          alert('Entrez un email et un mot de passe.');
          return;
        }
        auth.createUserWithEmailAndPassword(email, password)
          .then(() => closeAuthModal())
          .catch(err => alert('Échec de création : ' + err.message));
      });
    }

    auth.onAuthStateChanged(user => {
      updateAuthUI(user);
      if (user) startSync(user.uid);
      else stopSync();
    });
  });

  window.addEventListener('app:save', syncSaveToCloud);
})();
