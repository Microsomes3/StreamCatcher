import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function RecordingsTable({ recordings }) {

    const [sortByDate, setSortByDate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [filteredRecordings, setFilteredRecordings] = useState([]);

    useEffect(() => {
        setFilteredRecordings(recordings);
    }, [recordings]);


const sortLabel = sortByDate ? 'Sort by oldest first' : 'Sort by newest first';


function handleSortByDate(){

    setFilteredRecordings((prev) => {
        return prev.sort((a, b) => {
            return sortByDate ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
        });
    });

    setSortByDate((prev) => !prev);

    

}

    

return (
    <div className="flex flex-col mt-12 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Recordings</h2>
        <button
          onClick={handleSortByDate}
          className="flex items-center px-2 py-1 rounded-md text-sm bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <span>{sortLabel}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ml-1 transform ${sortByDate ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 15a.997.997 0 01-.707-.293l-4-4a.999.999 0 111.414-1.414L10 12.586l3.293-3.293a.999.999 0 111.414 1.414l-4 4A.997.997 0 0110 15z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col space-y-6">
        {filteredRecordings.map((recording) => (
          <div
            key={recording.id}
            className="flex flex-col md:flex-row items-center justify-between bg-gray-800 rounded-md p-4"
          >
            <div className="flex  text-center items-center">
              <div className="text-gray-400 mr-4">
                {moment(recording.date).format('MMM D, YYYY')}
              </div>
              <div className="flex flex-col">
                
                {recording.keys.length ==0 && <div className="text-gray-400">Pending...</div>}

                {recording.keys.map((key) => (
                  <a
                    key={key}
                    href={`https://d213lwr54yo0m8.cloudfront.net/${key}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-500 hover:text-green-400"
                  >
                    {key}
                  </a>
                ))}
              </div>
            </div>
           
          </div>
        ))}
      </div>
    </div>
  );
  
}

export default RecordingsTable;
