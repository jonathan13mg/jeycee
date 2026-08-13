// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Configuración de JEYCE
const firebaseConfig = {
    apiKey: "AIzaSyAgMEodYhlPOkzmHBg9bDMX-Pi28WyqsJM",
    authDomain: "jeyce-b4a6e.firebaseapp.com",
    projectId: "jeyce-b4a6e",
    storageBucket: "jeyce-b4a6e.firebasestorage.app",
    messagingSenderId: "488863970055",
    appId: "1:488863970055:web:ae1054bb11ed7e11264ba2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar para usar en otros archivos
export {
    db,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
};
