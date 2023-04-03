import React, { useState } from "react";

const INTERVAL_OPTIONS = ["10m", "20m", "30m", "1hr", "2hr", "3hr"];
const MAX_DURATION = 360; // in minutes

function RecordRequests() {
    const [openRecordRequests, setOpenRecordRequests] = useState(false);
    const [youtuber, setYoutuber] = useState("");
    const [trigger, setTrigger] = useState("live");
    const [intervalValue, setIntervalValue] = useState("");
    const [specificTime, setSpecificTime] = useState("");
    const [duration, setDuration] = useState(30); // default to 30 minutes

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit record request logic here
    };

    return (
        <div className="bg-gray-900 flex flex-col  text-white mt-6 rounded-md shadow-2xl">
            {!openRecordRequests && (
                <div
                    onClick={() => setOpenRecordRequests(true)}
                    className="text-center bg-gray-800 text-white cursor-pointer hover:bg-gray-700 px-4 py-2 rounded-md text-2xl"
                >
                    Add Record Schedule
                </div>
            )}

            {openRecordRequests && (
                <form onSubmit={handleSubmit} className="px-6 py-4">
                    <div className="mb-4">
                        <label htmlFor="youtuber" className="block text-lg mb-2">
                            Youtuber:
                        </label>
                        <input
                            type="text"
                            id="youtuber"
                            value={youtuber}
                            onChange={(e) => setYoutuber(e.target.value)}
                            placeholder="Youtuber name"
                            className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-full"
                        />
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
                            <option value="specific">At specific time</option>
                        </select>
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
                            min="0"
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
        </div>
    );
}

export default RecordRequests;


