import React, { useContext, useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { AuthContext } from "../../pages/auth/authwatch";
import TrackComp from "./components/trackyoutubers/track";
import RecordRequestComp from "./components/recordrequests/recordrequests";
import BillingComp from "./components/billing/billing";
import RecodingComp from './components/recordings/recordings';

import "./home.css";

function DashboardHome() {
  const user = useContext(AuthContext);
  const [userEmail, setEmail] = useState("");
  const [activeMenu, setActiveMenu] = useState("Track Youtubers");

  useEffect(() => {
    setEmail(user[0]);
  }, [user]);


  function setActiveMenuFunc(menu) {
    setActiveMenu(menu);
    window.location.href = `/dashboard/${menu}`;
  }

  const { comp= "Track Youtubers" } = useParams();

  useEffect(() => {
    setActiveMenu(comp);
  }, [comp]);

  return (
    <div className="bg-gray-900 text-white flex flex-col min-h-screen">
      <div className=" mt-12 mb-3 bg-gray-900 ml-12 mr-12  rounded-t-md flex items-center justify-around">
        <div
          className={`menu-item ${
            activeMenu === "Track Youtubers" ? "active" : ""
          }`}
          onClick={() => setActiveMenuFunc("Track Youtubers")}
        >
          Track Youtubers
        </div>
        <div
          className={`menu-item ${
            activeMenu === "Record Requests" ? "active" : ""
          }`}
          onClick={() => setActiveMenuFunc("Record Requests")}
        >
          Record Requests
        </div>
        <div
          className={`menu-item ${
            activeMenu === "Recordings" ? "active" : ""
          }`}
          onClick={() => setActiveMenuFunc("Recordings")}
        >
          Recordings
        </div>
        <div
          className={`menu-item ${activeMenu === "Billing" ? "active" : ""}`}
          onClick={() => setActiveMenuFunc("Billing")}
        >
          Billing
        </div>
      </div>

      <div className="ml-12 mr-12 bg-gray-800 rounded-b-md p-6 flex-grow">
        {activeMenu === "Track Youtubers" && <TrackComp />}
        {activeMenu === "Record Requests" && <RecordRequestComp />}
        {activeMenu === "Recordings" && <RecodingComp />}
        {activeMenu === "Billing" && <BillingComp />}
        {/* Add other menu components here */}
      </div>
    </div>
  );
}

export default DashboardHome;
