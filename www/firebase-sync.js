// Minimal Firebase sync bridge
(function(){
  function showFirebaseError(message) {
    console.error(message);
    const render = () => {
      let overlay = document.getElementById('firebase-error-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'firebase-error-overlay';
        Object.assign(overlay.style, {
          position: 'fixed',
          left: '12px',
          right: '12px',
          top: '12px',
          zIndex: '99999',
          padding: '14px',
          borderRadius: '10px',
          backgroundColor: 'rgba(220, 20, 60, 0.95)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          lineHeight: '1.4',
          boxShadow: '0 0 20px rgba(0,0,0,0.4)'
        });
        document.body.appendChild(overlay);
      }
      overlay.textContent = message;
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => render(), { once: true });
    } else {
      render();
    }
  }

  window.addEventListener('error', (event) => {
    showFirebaseError('JS error: ' + (event.message || event.error || 'unknown'));
  });
  window.addEventListener('unhandledrejection', (event) => {
    showFirebaseError('Unhandled promise rejection: ' + (event.reason && event.reason.message ? event.reason.message : event.reason));
  });
  console.log('firebase-sync.js loaded', window.firebaseConfig);
  if (!window.firebaseConfig) {
    showFirebaseError('Firebase config not found. Copy firebase-config.example.js to firebase-config.js and fill values from a Firebase Web app.');
    return;
  }

  const missingFields = ['apiKey', 'authDomain', 'projectId', 'appId'].filter(field => !window.firebaseConfig[field]);
  if (missingFields.length) {
    showFirebaseError(`Firebase config incomplete: missing ${missingFields.join(', ')}. Use the web app config from Firebase Console.`);
    return;
  }

  if (typeof window.firebaseConfig.appId === 'string' && window.firebaseConfig.appId.includes(':android:')) {
    showFirebaseError('Firebase appId appears to be an Android app config. Please use Firebase Web app configuration for web/auth usage.');
    return;
  }

  const app = firebase.initializeApp(window.firebaseConfig);
  console.log('Firebase initialized', app.name, window.firebaseConfig.projectId);
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

  function isRemoteDataDifferent(remote) {
    const local = getLocalData() || { categories: [], recipes: [], shoppingList: {} };
    const remoteData = {
      categories: remote.categories || [],
      recipes: remote.recipes || [],
      shoppingList: remote.shoppingList || {}
    };
    return JSON.stringify(local) !== JSON.stringify(remoteData);
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
      const remoteDiffers = isRemoteDataDifferent(remote);
      console.log('Sync snapshot', { localUpdated, remoteUpdated: remote.lastUpdated, remoteDiffers });

      if (remoteDiffers && remote.lastUpdated >= localUpdated) {
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
      const handleAuthBtnClick = () => {
        const user = auth.currentUser;
        if (user) {
          if (confirm('Déconnexion ?')) auth.signOut();
          return;
        }
        console.log('Opening auth modal');
        openAuthModal();
      };
      authBtn.addEventListener('click', handleAuthBtnClick);
      authBtn.addEventListener('touchstart', handleAuthBtnClick, { passive: true });
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
          .then(() => {
            console.log('Google sign-in successful');
            closeAuthModal();
          })
          .catch(err => {
            showFirebaseError('Échec connexion Google : ' + err.message);
            console.error('Google sign-in error', err);
          });
      });
    }

    if (emailLoginBtn) {
      emailLoginBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
          showFirebaseError('Entrez un email et un mot de passe.');
          return;
        }
        auth.signInWithEmailAndPassword(email, password)
          .then(() => {
            console.log('Email login successful', email);
            closeAuthModal();
          })
          .catch(err => {
            showFirebaseError('Échec de connexion : ' + err.message);
            console.error('Email login error', err);
          });
      });
    }

    if (emailRegisterBtn) {
      emailRegisterBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
          showFirebaseError('Entrez un email et un mot de passe.');
          return;
        }
        if (password.length < 6) {
          showFirebaseError('Le mot de passe doit contenir au moins 6 caractères.');
          return;
        }
        auth.createUserWithEmailAndPassword(email, password)
          .then(() => {
            console.log('User registration successful', email);
            closeAuthModal();
          })
          .catch(err => {
            showFirebaseError('Échec de création : ' + err.message);
            console.error('User registration error', err);
          });
      });
    }

    auth.onAuthStateChanged(user => {
      console.log('Firebase auth state changed', user ? {uid: user.uid, email: user.email} : null);
      updateAuthUI(user);
      if (user) startSync(user.uid);
      else stopSync();
    });
  });

  window.addEventListener('app:save', syncSaveToCloud);
})();
