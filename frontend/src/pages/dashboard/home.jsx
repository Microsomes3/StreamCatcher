import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../pages/auth/authwatch";
import TrackComp from "./components/trackyoutubers/track";
import RecordRequestComp from "./components/recordrequests/recordrequests";
import "./home.css";

function DashboardHome() {
  const user = useContext(AuthContext);
  const [userEmail, setEmail] = useState("");
  const [activeMenu, setActiveMenu] = useState("Track Youtubers");

  useEffect(() => {
    setEmail(user[0]);
  }, [user]);

  return (
    <div className="bg-gray-900 h-screen text-white flex flex-col">
      <div className="h-12 mt-4 py-12 bg-gray-800 ml-12 mr-12 rounded-t-md flex items-center justify-around">
        <div
          className={`menu-item ${
            activeMenu === "Track Youtubers" ? "active" : ""
          }`}
          onClick={() => setActiveMenu("Track Youtubers")}
        >
          Track Youtubers
        </div>
        <div
          className={`menu-item ${
            activeMenu === "Record Requests" ? "active" : ""
          }`}
          onClick={() => setActiveMenu("Record Requests")}
        >
          Record Requests
        </div>
        <div
          className={`menu-item ${
            activeMenu === "Recordings" ? "active" : ""
          }`}
          onClick={() => setActiveMenu("Recordings")}
        >
          Recordings
        </div>
        <div
          className={`menu-item ${activeMenu === "Billing" ? "active" : ""}`}
          onClick={() => setActiveMenu("Billing")}
        >
          Billing
        </div>
      </div>

      <div className="ml-12 mr-12 bg-gray-800 rounded-b-md p-6 flex-grow">
        {activeMenu === "Track Youtubers" && <TrackComp />}
        {activeMenu === "Record Requests" && <RecordRequestComp />}
        {/* Add other menu components here */}
      </div>
    </div>
  );
}

export default DashboardHome;
