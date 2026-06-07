// ==================== ENHANCED FIREBASE SYNC BRIDGE ====================
// Synchronise les données entre l'app locale et Firestore en temps réel
// Supporte Android et iOS avec la même base de données
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
  let isSyncing = false;
  let lastSyncTime = 0;

  // ==================== UI UPDATES ====================

  function updateAuthUI(user) {
    const authBtn = document.getElementById('authBtn');
    if (!authBtn) return;
    if (user) {
      authBtn.title = `Connecté: ${user.email || user.uid}`;
      authBtn.innerHTML = '<i class="fas fa-user-check"></i>';
      authBtn.style.color = '#4CAF50';
    } else {
      authBtn.title = 'Se connecter';
      authBtn.innerHTML = '<i class="fas fa-user"></i>';
      authBtn.style.color = 'inherit';
    }
  }

  // ==================== LOCAL STORAGE HELPERS ====================

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

  // ==================== SYNC OPERATIONS ====================

  async function pushLocalData(docRef) {
    if (isSyncing) return;
    isSyncing = true;
    try {
      const localData = getLocalData();
      if (!localData) {
        isSyncing = false;
        return;
      }
      const timestamp = Date.now();
      saveLocalTimestamp(timestamp);
      await docRef.set({
        categories: localData.categories || [],
        recipes: localData.recipes || [],
        shoppingList: localData.shoppingList || {},
        lastUpdated: timestamp,
        syncedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      lastSyncTime = timestamp;
      console.log('✓ Données synchronisées vers le cloud');
    } catch (err) {
      console.error('Error pushing local data to cloud', err);
    } finally {
      isSyncing = false;
    }
  }

  function showFirebaseNotice(message) {
    const render = () => {
      let overlay = document.getElementById('firebase-notice-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'firebase-notice-overlay';
        Object.assign(overlay.style, {
          position: 'fixed',
          left: '12px',
          right: '12px',
          bottom: '12px',
          zIndex: '99999',
          padding: '14px',
          borderRadius: '10px',
          backgroundColor: 'rgba(46, 204, 113, 0.95)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          lineHeight: '1.4',
          boxShadow: '0 0 20px rgba(0,0,0,0.4)'
        });
        document.body.appendChild(overlay);
      }
      overlay.textContent = message;
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 2500);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => render(), { once: true });
    } else {
      render();
    }
  }

  function applyRemoteData(data) {
    if (!data || typeof data !== 'object' || isSyncing) return;
    const local = {
      categories: data.categories || [],
      recipes: data.recipes || [],
      shoppingList: data.shoppingList || {}
    };
    try {
      localStorage.setItem('shoppingListData', JSON.stringify(local));
      saveLocalTimestamp(data.lastUpdated || Date.now());
      // Signal to the app that remote data has been updated
      window.dispatchEvent(new Event('app:remoteUpdate'));
      console.log('✓ Données synchronisées depuis le cloud');
      showFirebaseNotice('Mise à jour cloud reçue');
    } catch (e) {
      console.error('Failed to apply remote data', e);
    }
  }

  function getUserDocId(user) {
    if (!user) return null;
    return user.email ? user.email.toLowerCase() : user.uid;
  }

  function getUserDocRef(user) {
    const docId = getUserDocId(user);
    return db.collection('users').doc(docId);
  }

  function normalizeTimestamp(value) {
    if (value && typeof value.toMillis === 'function') {
      return value.toMillis();
    }
    return Number(value) || 0;
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

  function startSync(user) {
    if (currentUnsub) currentUnsub();
    const docRef = getUserDocRef(user);
    if (!docRef) return;
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
      const remoteUpdated = normalizeTimestamp(remote.lastUpdated);
      const remoteDiffers = isRemoteDataDifferent(remote);
      console.log('Sync snapshot', { localUpdated, remoteUpdated, remoteDiffers, lastSyncTime, docId: getUserDocId(user) });

      if (remoteDiffers && remoteUpdated >= localUpdated && remoteUpdated !== lastSyncTime) {
        applyRemoteData(remote);
      } else if (remoteUpdated < localUpdated) {
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
    isSyncing = false;
  }

  async function syncSaveToCloud(event) {
    const user = auth.currentUser;
    if (!user || isSyncing) return;
    
    const payload = event.detail && event.detail.payload;
    const lastUpdated = event.detail && event.detail.lastUpdated;
    if (!payload || !lastUpdated) return;
    
    // Throttle rapid updates to avoid excessive writes
    if (lastUpdated < lastSyncTime + 500) return;
    
    try {
      const docRef = getUserDocRef(user);
      if (!docRef) return;
      await docRef.set({
        categories: payload.categories || [],
        recipes: payload.recipes || [],
        shoppingList: payload.shoppingList || {},
        lastUpdated,
        syncedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      lastSyncTime = lastUpdated;
      console.log('Sync pushed to Firestore', { user: getUserDocId(user), lastUpdated });
    } catch (err) {
      console.error('Error syncing to Firestore', err);
    }
  }

  // ==================== AUTH MODAL MANAGEMENT ====
  function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('active');
      // Focus on email input for better UX
      const emailInput = document.getElementById('emailInput');
      if (emailInput) setTimeout(() => emailInput.focus(), 100);
    }
  }

  function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('active');
    // Clear inputs
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
  }

  // ==================== DOM READY & EVENT LISTENERS ====================
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const emailLoginBtn = document.getElementById('emailLoginBtn');
    const emailRegisterBtn = document.getElementById('emailRegisterBtn');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    // Auth button click handler
    if (authBtn) {
      const handleAuthBtnClick = () => {
        const user = auth.currentUser;
        if (user) {
          if (confirm(`Déconnexion de ${user.email || user.uid} ?`)) {
            auth.signOut()
              .then(() => console.log('User signed out'))
              .catch(err => console.error('Sign out error', err));
          }
          return;
        }
        console.log('Opening auth modal');
        openAuthModal();
      };
      authBtn.addEventListener('click', handleAuthBtnClick);
      authBtn.addEventListener('touchstart', handleAuthBtnClick, { passive: true });
    }

    // Modal close buttons
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

    // Email Login
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
            console.log('Email login successful');
            closeAuthModal();
          })
          .catch(err => {
            showFirebaseError('Échec de connexion : ' + err.message);
            console.error('Email login error', err);
          });
      });

      // Enter key support for login
      if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') emailLoginBtn.click();
        });
      }
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

    // Auth state listener - most important for sync
    auth.onAuthStateChanged(user => {
      updateAuthUI(user);
      if (user) {
        const docId = getUserDocId(user);
        console.log(`Logged in as: ${user.email || user.uid}`, { docId });
        startSync(user);
      } else {
        console.log('User not logged in');
        stopSync();
      }
    });
  });

  // ==================== APP EVENTS ====================

  // Listen for app save events and sync to cloud
  window.addEventListener('app:save', syncSaveToCloud);

  // Handle remote updates to refresh UI
  window.addEventListener('app:remoteUpdate', () => {
    console.log('Remote update received, app will refresh...');
  });

  // Export for console debugging
  window.firebaseSync = {
    startSync,
    stopSync,
    pushLocalData,
    applyRemoteData,
    getLocalData,
    getCurrentUser: () => auth.currentUser,
    signOut: () => auth.signOut()
  };
})();
