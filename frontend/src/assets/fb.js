// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9bNOJuKHxzqpFvrsWQan-GVnKNgvFQjs",
  authDomain: "streamcatcherui.firebaseapp.com",
  projectId: "streamcatcherui",
  storageBucket: "streamcatcherui.appspot.com",
  messagingSenderId: "716651623898",
  appId: "1:716651623898:web:00a20d1229b32cdc877ce3",
  measurementId: "G-LPEJZ9NVQL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

module.exports = {
    app,
    analytics
}