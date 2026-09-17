import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-MBeyRdYImuqaOVZrKf_SOCBZwwX-7xo",
  authDomain: "fir-powerbi-72371.firebaseapp.com",
  databaseURL: "https://fir-powerbi-72371-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fir-powerbi-72371",
  storageBucket: "fir-powerbi-72371.firebasestorage.app",
  messagingSenderId: "641058539581",
  appId: "1:641058539581:web:a68e8f6a09fb2a06bb0254"
};

try {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  window.LIVE_POLLS = { db, ref, onValue, runTransaction };
  console.info("[polls] live sync enabled (Firebase)");
} catch (err) {
  console.warn("[polls] Firebase init failed, falling back to local mode:", err);
}
