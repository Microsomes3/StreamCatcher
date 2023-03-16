import React,{useContext,useEffect, useState} from "react";

import { AuthContext } from "../../pages/auth/authwatch";

import TrackComp from './components/trackyoutubers/track';

import "./home.css";

function DashboardHome() {

  const user = useContext(AuthContext);

  const [userEmail,setEmail]= useState("");
  const [activeMenu, setActiveMenu] = useState("Track Youtubers");


  useEffect(()=>{
    setEmail(user[0])
  },[user])




  return (
    <div className="bg-gray-300 h-screen flex flex-col">
      <div className="ml-12 border-2 p-2 rounded-md mr-12 text-center text-2xl mt-3 flex items-center justify-center flex-col">
        <h1>Dashboard, Hi {userEmail} </h1>
        <p className="w-1/2 text-sm mt-2">This is your management dashboard, here you can add youtubers to track, submit a record request, view all your recorded livestreams, and manage billing</p>
      </div>

      <div className="h-12 bg-black ml-12 mr-12 rounded-md flex items-center justify-around">
  <div
    className={`menu-item ${activeMenu === "Track Youtubers" ? "active" : ""}`}
    onClick={() => setActiveMenu("Track Youtubers")}
  >
    Track Youtubers
  </div>
  <div
    className={`menu-item ${activeMenu === "Record Requests" ? "active" : ""}`}
    onClick={() => setActiveMenu("Record Requests")}
  >
    Record Requests
  </div>
  <div
    className={`menu-item ${activeMenu === "Recordings" ? "active" : ""}`}
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

    <div className="ml-12 ">

      {activeMenu==="Track Youtubers" && <TrackComp />}

    </div>



    </div>
  );
}


export default DashboardHome;