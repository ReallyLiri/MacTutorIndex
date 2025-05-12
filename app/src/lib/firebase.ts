import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBn17Wz3Cpkc0vS8IWbOICzh_lZaskPztE",
  authDomain: "mactutorindex.firebaseapp.com",
  projectId: "mactutorindex",
  storageBucket: "mactutorindex.firebasestorage.app",
  messagingSenderId: "674227868361",
  appId: "1:674227868361:web:d5cf60fe714267786ab318",
  measurementId: "G-DPXBS0RNNG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };