import React, { useEffect, useState, useContext } from "react";

import { AuthContext } from "../auth/authwatch";

import { app } from "../../assets/fb.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const auth = getAuth(app);

function SignUp() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const user = useContext(AuthContext);

  useEffect(() => {
    if (user !== "---") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      if (password === confirmPassword) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          console.log("User signed up successfully");
        } catch (error) {
          setErrorMessage(error.message);
          console.error("Error signing up:", error.message);
        }
      } else {
        console.error("Passwords do not match");
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in successfully");
      } catch (error) {
        setErrorMessage(error.message);
        console.error("Error signing in:", error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("User signed in with Google successfully");
    } catch (error) {
      setErrorMessage(error.message);
      console.error("Error signing in with Google:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container flex flex-col mx-auto py-12 px-4">
        <h2 className="text-4xl mb-6 text-center">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border-2 p-12 rounded-md bg-gray-800 mx-auto w-full max-w-md"
        >
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          {isSignUp && (
            <div className="flex flex-col">
              <label htmlFor="confirmPassword" className="text-sm">
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
          {errorMessage && (
            <div className="text-red-500 font-semibold text-lg mt-4 text-center">
              {errorMessage}
            </div>
          )}
        </form>
        <button
          onClick={handleGoogleSignIn}
          className="bg-red-500 text-white px-4 py-2 rounded w-full max-w-md mx-auto hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mt-6"
        >
          Sign In with Google
        </button>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-500 mt-4 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Switch to {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default SignUp;