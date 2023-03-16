// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKCihPOJ5er9fsl85BOtNQabKYi9y_9cE",
  authDomain: "streamcatcherui.firebaseapp.com",
  projectId: "streamcatcherui",
  storageBucket: "streamcatcherui.appspot.com",
  messagingSenderId: "716651623898",
  appId: "1:716651623898:web:a34fd39d690c6c92877ce3",
  measurementId: "G-8B1EBXZ46P"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

