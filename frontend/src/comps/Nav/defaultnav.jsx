import React, { useState } from "react";

let isLoggedIn = false;

function handleLogin() {
  isLoggedIn = true;
}

function handleLogout() {
  isLoggedIn = false;
}

function Navigation() {
  function handleHomeClick(e) {
    e.preventDefault();
    // Handle navigation to home page here
  }

  function handleLoginClick(e) {
    e.preventDefault();
    handleLogin();
    // Handle navigation to login page here
  }

  function handleLogoutClick(e) {
    e.preventDefault();
    handleLogout();
    // Handle navigation to logout page here
  }

  return (
    <nav className="flex justify-between items-center bg-black text-white py-4 md:px-6 lg:px-8">
      <div className="pl-3 text-2xl md:text-3xl font-bold">
        <a href="/" onClick={handleHomeClick}>Stream Catcher</a>
      </div>
      <div>
        {isLoggedIn ? (
          <button
            onClick={handleLogoutClick}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded md:ml-4"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={handleLoginClick}
            className="bg-blue-500 m-2 md:my-0 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Login/Up
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
