import React, { useEffect, useState, useContext } from "react";

import { AuthContext } from "../auth/authwatch";

import { app } from "../../assets/fb.js";
import axios from 'axios';

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
  const [isLoading,setLoading] = useState(false);

  useEffect(()=>{
    setLoading(false);
  },[errorMessage])


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

      setErrorMessage("");

      setLoading(true);

      axios.post("https://21tk2wt1ye.execute-api.us-east-1.amazonaws.com/dev/login",{
        email: email,
        password: password
      }).then((resp)=>{
        const token = resp.data.token
        const userId = resp.data.user.id;
        localStorage.setItem("token",token);
        localStorage.setItem("email",email);
        localStorage.setItem("userId",userId);
        setLoading(false);
        location.href = "/dashboard";
      }).catch((err)=>{
        setErrorMessage(err.response.data.message);
      })
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
          className="space-y-4  p-12 rounded-md bg-gray-800 mx-auto w-full max-w-md"
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
          
          
          {isLoading==false &&<button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>}

            <div className="flex justify-center">
          {isLoading == true && <div className='text-white text-2xl mt-12'>
                        <div role="status">
                            <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>}
                    </div>

          {errorMessage && (
            <div className="text-bold text-black bg-yellow-500 shadow-2xl rounded-md border-2 font-semibold text-sm mt-4 text-center">
              {errorMessage}
            </div>
          )}
        </form>
       
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