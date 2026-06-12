import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDPsCYwxqCb7OvF99j7SZQmSpaYeObZoVw",
    authDomain: "lista-azul.firebaseapp.com",
    projectId: "lista-azul",
    storageBucket: "lista-azul.firebasestorage.app",
    messagingSenderId: "306682622476",
    appId: "1:306682622476:web:a8388180a8ac4f84fc3429",
    measurementId: "G-1K9N1RFZES"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
