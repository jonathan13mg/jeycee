import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgMEodYhlPOkzmHBg9bDMX-Pi28WyqsJM",
  authDomain: "jeyce-b4a6e.firebaseapp.com",
  projectId: "jeyce-b4a6e",
  storageBucket: "jeyce-b4a6e.firebasestorage.app",
  messagingSenderId: "488863970055",
  appId: "1:488863970055:web:ae1054bb11ed7e11264ba2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
};
