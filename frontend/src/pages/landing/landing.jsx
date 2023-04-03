import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import axios from "axios";

function LandingPage() {
  const [username, setUsername] = useState("");
  const [streamInfo, setStreamInfo] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  function handleUsernameChange(e) {
    setUsername(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (username[0] !== "@") {
      alert("Username must start with @");
      return;
    }

    if (username.indexOf(".com") !== -1) {
      alert("Username must not contain .com");
      return;
    }

    setIsLoading(true);

    axios
      .get(
        "https://5pyt5gawvk.execute-api.us-east-1.amazonaws.com/dev/getLiveStatusFromYoutube/" +
          username
      )
      .then((data) => {
        setStreamInfo(data.data);
        setIsLoading(false);
      });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center">Live Clipper</h1>
        <p className="text-xl text-center mt-4">
          Capture live streams from all the popular YouTubers automatically
        </p>
        <div className="flex flex-row space-x-4 mt-8 justify-center">
          <a
            href="/auth"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </a>
          <a
            href="/demo"
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Visit Demo
          </a>
        </div>

        <div className="mt-16 w-full max-w-lg mx-auto flex flex-col items-center">
          <p className="text-sm">
            It takes around 12-15 seconds to capture the status, but try it out
          </p>
          {streamInfo === null ? (
            <form onSubmit={(e) => handleSubmit(e)} className="flex w-full mt-4">
              <input
                type="text"
                placeholder="Enter YouTuber @username to search"
                onChange={(e) => handleUsernameChange(e)}
                value={username}
                className="w-full px-4 py-2 rounded-l-md border-t border-b border-l text-gray-900 border-gray-500 bg-white"
              />
              {isLoading === false && (
                <button
                  type="submit"
                  className="px-4 py-2 rounded-r-md bg-blue-500 hover:bg-blue-600 text-white font-bold"
                >
                  Search
                </button>
              )}

              {isLoading === true && (
                <p className="animate animate-pulse font-extrabold ml-2">
                  Loading
                </p>
              )}
            </form>
          ) : null}

          {streamInfo !== null ? (
            <div className="mt-4 px-4 py-2 rounded-md border border-gray-500 text-center w-full">
              <p>
                {username} {streamInfo.isLive ? "is live wanna record?" : "is offline"}
              </p>

              <div className="space-x-3 mt-2">
                {streamInfo.isLive && (
                  <button
                    onClick={(e) => alert("working on")}
                    className="bg-green-700 hover:bg-green-600 px-4 py-1 rounded-md"
                  >
                    Record 30 Second Demo
                  </button>
                )}

                {streamInfo.isLive === false && (
                  <p className="text-white px-3 mb-2">
                    Register and set up an automatic recording for this YouTuber, when they go live, we will record the stream and send you a link to download it.
                  </p>
                )}

                <button
                  onClick={(e) => setStreamInfo(null)}
                  className="bg-red-700 hover:bg-red-600 px-4 py-1 rounded-md"
                >
                  Clear Results
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="bg-gray-700 rounded-lg overflow-hidden shadow-lg"
            >
              <div className="h-48 bg-gray-800"></div>
              <div className="px-6 py-4">
                <div className="text-xl font-bold mb-2">
                  Video Placeholder
                </div>
                <p className="text-gray-300 text-base">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
                  risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
                  nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas
                  ligula massa, varius a, semper congue, euismod non, mi.
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default LandingPage;