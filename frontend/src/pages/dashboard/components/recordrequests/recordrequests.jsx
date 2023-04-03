import React, { useState, useContext, useEffect} from "react";
import { AuthContext } from "../../../../pages/auth/authwatch";
import moment from "moment";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { app } from "../../../../assets/fb";
import {
    getFirestore,
    getDocs,
    collection,
    addDoc,
    setDoc,
    deleteDoc,
} from "firebase/firestore";

const INTERVAL_OPTIONS = ["10m", "20m", "30m", "1hr", "2hr", "3hr"];
const MAX_DURATION = 360; // in minutes

function RecordRequests() {

    const fb = getFirestore(app);

    const [youtubers, setYoutubers] = useState([]);

    const [allRequests, setAllRequests] = useState([]);

    const [openRecordRequests, setOpenRecordRequests] = useState(false);
    const [selectedYoutuberId, setSelectedYoutuberId] = useState("");
    const [trigger, setTrigger] = useState("live");
    const [intervalValue, setIntervalValue] = useState("");
    const [specificTime, setSpecificTime] = useState("");
    const [duration, setDuration] = useState(2); // default to 30 minutes


    const user = useContext(AuthContext);


    useEffect(()=>{
        const userId = user[1];

        const docRef = collection(fb, "users", userId, "youtubers");

        const getDoc = async () => {
            const docSnap = await getDocs(docRef);

            const youtubers = [];

            docSnap.forEach((doc) => {
                youtubers.push({
                    id: doc.id,
                    name: doc.data().name,
                });
            });


            setYoutubers(youtubers);

        };

       
        getDoc();
    },[user])

    useEffect(()=>{
        const userId = user[1];

        const docRef = collection(fb, "users", userId, "recordrequests");

        const getDoc = async () => {
            const docSnap = await getDocs(docRef);

            const recordrequests = [];

            docSnap.forEach((doc) => {
                recordrequests.push({
                    id: doc.id,
                    youtuberId: doc.data().youtuberId,
                    trigger: doc.data().trigger,
                    intervalValue: doc.data().intervalValue,
                    specificTime: doc.data().specificTime,
                    duration: doc.data().duration,
                    created: doc.data().created,
                });
            });

            console.log(">>>", recordrequests);

            setAllRequests(recordrequests);

        }

        getDoc();
    },[user])

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Submit record request logic here
        const userId = user[1];

        if (selectedYoutuberId === "") {
            alert("Please select a youtuber");
            return;
        }

        if (trigger === "interval" && intervalValue === "") {
            alert("Please select an interval");
            return;
        }

        if (trigger === "specific" && specificTime === "") {
            alert("Please select a specific time");
            return;
        }

        if (duration > MAX_DURATION) {
            alert(`Duration cannot be more than ${MAX_DURATION} minutes`);
            return;
        }

        const docRef = collection(fb, "users", userId, "recordrequests");

        const doc = await addDoc(docRef, {
            youtuberId: selectedYoutuberId,
            youtubeName: youtubers.find((y) => y.id === selectedYoutuberId).name,
            trigger: trigger,
            intervalValue: intervalValue,
            specificTime: specificTime,
            duration: duration,
            created: moment().format("YYYY-MM-DD HH:mm:ss"),
        });

        if (doc.id) {
            setOpenRecordRequests(false);
            setSelectedYoutuberId("");
            setTrigger("live");
            setIntervalValue("");
            setSpecificTime("");
            setDuration(30);

            alert("Record request submitted successfully");
        }

    };

    return (
        <div className="bg-gray-900 flex flex-col  text-white mt-6 rounded-md shadow-2xl">
            <div className="container mx-auto py-12 px-4">
            {!openRecordRequests && (
                <div
                    onClick={() => setOpenRecordRequests(true)}
                        className="text-center bg-gray-800 text-white cursor-pointer hover:bg-gray-700 px-4 py-2 rounded-md text-2xl"
                >
                    Add Record Schedule
                </div>
            )}
            </div>

            {openRecordRequests && (
                <form onSubmit={handleSubmit} className="px-6 py-4">
                     <div className="mb-4">
                        <label htmlFor="youtuber" className="block text-lg mb-2">
                            Youtuber:
                        </label>
                        <select
                            id="youtuber"
                            value={selectedYoutuberId}
                            onChange={(e) => setSelectedYoutuberId(e.target.value)}
                            className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-full"
                        >
                            <option value="">Choose a youtuber</option>
                            {youtubers.map((youtuber) => (
                                <option key={youtuber.id} value={youtuber.id}>
                                    {youtuber.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="trigger" className="block text-lg mb-2">
                            Trigger:
                        </label>
                        <select
                            id="trigger"
                            value={trigger}
                            onChange={(e) => setTrigger(e.target.value)}
                            className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-full"
                        >
                            <option value="live">Whenever live</option>
                            <option value="interval">At intervals</option>
                            {/* <option value="specific">At specific time</option> */}
                        </select>
                       {trigger === "interval"&& <p className="text-gray-500 text-sm italic mt-2">
                                Note: This option will only record when the youtuber is live.
                            </p>}
                    </div>
                    {trigger === "interval" && (
                        <div className="mb-4">
                            <label htmlFor="interval" className="block text-lg mb-2">
                                Interval:
                            </label>
                            <select
                                id="interval"
                                value={intervalValue}
                                onChange={(e) => setIntervalValue(e.target.value)}
                                className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-full"
                            >
                                <option value="">Choose an interval</option>
                                {INTERVAL_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            
                        </div>
                    )}
                    {trigger === "specific" && (
                        <div className="mb-4">
                            <label htmlFor="specificTime" className="block text-lg mb-2">
                                Specific time:
                            </label>
                            <input
                                type="datetime-local"
                                id="specificTime"
                                value={specificTime}
                                onChange={(e) => setSpecificTime(e.target.value)}
                                className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-full"
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="duration" className="block text-lg mb-2">
                            Duration:
                        </label>
                        <input
                            type="range"
                            id="duration"
                            min="1"
                            max={MAX_DURATION}
                            step="1"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between">
                            <span>0 minutes</span>
                            <span>{duration} minutes</span>
                            <span>{MAX_DURATION} minutes</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Submit Record Request
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpenRecordRequests(false)}
                        className="text-blue-500 mt-4 text-center hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                </form>
            )}

{openRecordRequests && (
            <form onSubmit={handleSubmit} className="px-6 py-4">
                {/* form fields */}
            </form>
        )}

        <div className="px-6 py-4 mt-4 rounded-md">
            <h2 className="text-2xl font-bold mb-4">Record Requests</h2>
            
            
            {allRequests.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                    <div className="font-bold">Youtuber</div>
                    <div className="font-bold">Trigger</div>
                    <div className="font-bold">Interval / Specific Time</div>
                    <div className="font-bold">Duration</div>

                    {allRequests.map((recordRequest) => (
                        <React.Fragment key={recordRequest.id}>
                            <div>{recordRequest.youtuberId}</div>
                            <div>{recordRequest.trigger}</div>
                            <div>
                                {recordRequest.trigger === "interval"
                                    ? recordRequest.intervalValue
                                    : recordRequest.specificTime}
                                {recordRequest.trigger !== "interval" && <p>--</p>}
                            </div>
                            <div>{recordRequest.duration} minutes</div>
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <p>No record requests found.</p>
            )}
        </div>
        </div>
    );
}

export default RecordRequests;


