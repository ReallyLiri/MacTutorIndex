import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBn17Wz3Cpkc0vS8IWbOICzh_lZaskPztE",
  authDomain: "mactutorindex.firebaseapp.com",
  projectId: "mactutorindex",
  storageBucket: "mactutorindex.firebasestorage.app",
  messagingSenderId: "674227868361",
  appId: "1:674227868361:web:d5cf60fe714267786ab318",
  measurementId: "G-DPXBS0RNNG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const getMathematicianById = async (id: string) => {
  try {
    const docRef = doc(db, 'l2', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching mathematician:", error);
    return null;
  }
};

export { db };