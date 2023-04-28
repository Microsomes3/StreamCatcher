import React, { useState, useContext, useEffect } from "react";

import { AuthContext } from "../../pages/auth/authwatch";


import { app } from '../../assets/fb'

import { getAuth, signOut } from 'firebase/auth'

const auth = getAuth(app);

function handleLogout() {
  signOut(auth).then(() => {
    // Sign-out successful.
    console.log("signed out");
  }).catch((error) => {
    // An error happened.
    console.log(error);
  });
}

function Navigation() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const user = useContext(AuthContext);
  const [userEmail, setUserEmail] = useState();

 
  useEffect(() => {
    setUserEmail(user[0]);

    if(user==="---"){
      setIsLogin(true);
    }else{
      setIsLogin(false);
    }

  }, [user]);

  const [isLogin, setIsLogin] = useState(false);


  function handleHomeClick(e) {
    e.preventDefault();
    window.location.href = "/";
    // Handle navigation to home page here
  }

  function handleLoginClick(e) {
    e.preventDefault();

    //go to /auth

    window.location.href = "/auth";

    // Handle navigation to login page here
  }

  function handleLogoutClick(e) {
    e.preventDefault();
    handleLogout();
    // Handle navigation to logout page here
  }

  function handleDarkModeClick(e) {
    e.preventDefault();
    setIsDarkMode(!isDarkMode);
  }



  return (
    <nav className={`flex flex-wrap justify-between items-center ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'} py-4 md:px-6 lg:px-8`}>
    <div className="pl-3 text-2xl md:text-3xl font-bold">
      <a href="/" onClick={handleHomeClick}>Live Clipper</a>
    </div>
    
    <div className="mt-2 md:ml-auto flex items-center">
      {!isLogin && (
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Dashboard
        </button>
      )}
        <button
          onClick={handleLoginClick}
          className="bg-green-500 ml-6 md:ml-2 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
        >
          See Pricing First
        </button>
      {!isLogin ? (
        <button
          onClick={handleLogoutClick}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded md:ml-4"
        >
          Logout ({userEmail})
        </button>
      ) : (
        <button
          onClick={handleLoginClick}
          className="bg-blue-500 ml-6 md:ml-2 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
        >
          Login/Up
        </button>
      )}
    </div>
  </nav>
  
  );
}

export default Navigation;
