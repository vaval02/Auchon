// ==================== ENHANCED FIREBASE SYNC BRIDGE ====================
// Synchronise les données entre l'app locale et Firestore en temps réel
// Supporte Android et iOS avec la même base de données
(function(){
  if (!window.firebaseConfig) {
    console.warn('Firebase config not found. Copy firebase-config.example.js to firebase-config.js and fill values.');
    return;
  }

  const app = firebase.initializeApp(window.firebaseConfig);
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
    } catch (e) {
      console.error('Failed to apply remote data', e);
    }
  }

  function startSync(uid) {
    if (currentUnsub) currentUnsub();
    const docRef = db.collection('users').doc(uid);
    
    currentUnsub = docRef.onSnapshot(async snap => {
      if (!snap.exists) {
        console.log('Creating new user document...');
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
      
      // Remote is newer: pull from cloud
      if (remote.lastUpdated > localUpdated && remote.lastUpdated !== lastSyncTime) {
        applyRemoteData(remote);
      } 
      // Local is newer: push to cloud
      else if (remote.lastUpdated < localUpdated) {
        try {
          await pushLocalData(docRef);
        } catch (err) {
          console.error('Error pushing newer local data', err);
        }
      }
    }, err => {
      console.error('Firestore listener error', err);
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
      await db.collection('users').doc(user.uid).set({
        categories: payload.categories || [],
        recipes: payload.recipes || [],
        shoppingList: payload.shoppingList || {},
        lastUpdated,
        syncedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      lastSyncTime = lastUpdated;
    } catch (err) {
      console.error('Error syncing to Firestore', err);
    }
  }

  // ==================== AUTH MODAL MANAGEMENT ====================

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

  document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const emailLoginBtn = document.getElementById('emailLoginBtn');
    const emailRegisterBtn = document.getElementById('emailRegisterBtn');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    // Auth button click handler
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        const user = auth.currentUser;
        if (user) {
          if (confirm(`Déconnexion de ${user.email || user.uid} ?`)) {
            auth.signOut()
              .then(() => console.log('User signed out'))
              .catch(err => console.error('Sign out error', err));
          }
          return;
        }
        openAuthModal();
      });
    }

    // Modal close buttons
    if (authModal) {
      authModal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeAuthModal());
      });
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
      });
    }

    // Google Sign-In
    if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then(() => {
            console.log('Google sign-in successful');
            closeAuthModal();
          })
          .catch(err => alert('Échec connexion Google : ' + err.message));
      });
    }

    // Email Login
    if (emailLoginBtn) {
      emailLoginBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
          alert('Entrez un email et un mot de passe.');
          return;
        }
        auth.signInWithEmailAndPassword(email, password)
          .then(() => {
            console.log('Email login successful');
            closeAuthModal();
          })
          .catch(err => alert('Échec de connexion : ' + err.message));
      });

      // Enter key support for login
      if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') emailLoginBtn.click();
        });
      }
    }

    // Email Register
    if (emailRegisterBtn) {
      emailRegisterBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
          alert('Entrez un email et un mot de passe.');
          return;
        }
        if (password.length < 6) {
          alert('Le mot de passe doit contenir au moins 6 caractères.');
          return;
        }
        auth.createUserWithEmailAndPassword(email, password)
          .then(() => {
            console.log('User registration successful');
            closeAuthModal();
          })
          .catch(err => alert('Échec de création : ' + err.message));
      });
    }

    // Auth state listener - most important for sync
    auth.onAuthStateChanged(user => {
      updateAuthUI(user);
      if (user) {
        console.log(`Logged in as: ${user.email || user.uid}`);
        startSync(user.uid);
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
