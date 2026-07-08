// Firebase compat config – loaded before script.js in every page
// Uses the compat (non-module) SDK so `firebase` is available globally.
const firebaseConfig = {
  apiKey: "AIzaSyDIkjs9CKsXQN94dDz4rRAtwKovaQfSmSI",
  authDomain: "kgodisowrites.firebaseapp.com",
  projectId: "kgodisowrites",
  storageBucket: "kgodisowrites.firebasestorage.app",
  messagingSenderId: "65567270381",
  appId: "1:65567270381:web:32ca4fd7cdfa796d9ff3e4",
  measurementId: "G-RLRFRKRMW9"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
