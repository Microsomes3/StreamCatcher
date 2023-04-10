import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function RecordingsTable({ recordings, isLoading=false }) {

  const [sortByDate, setSortByDate] = useState(true);

  const [filteredRecordings, setFilteredRecordings] = useState([]);


 const isNewFormat = (key)=>{
  //check if key is an array
  if(Array.isArray(key)){
    return key[0].includes("https")
  }else{
    return key.includes("https")
  }
 }

  useEffect(() => {

    const filter = recordings.sort((a, b) => {
      //createdAt
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      return dateB - dateA;
    });
    
    setFilteredRecordings(filter);
  }, [recordings]);

  function handleSortByDate() {
    setSortByDate((prev) => !prev);
  
    setFilteredRecordings((prev) => {
      const sortedRecordings = [...prev];
  
      sortedRecordings.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
  
        return sortByDate ? dateA - dateB : dateB - dateA;
      });
  
      return sortedRecordings;
    });
  }

  const sortLabel = sortByDate ? 'Sort by oldest first' : 'Sort by newest first';



  return (
    <div className="flex flex-col mt-12 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Recordings</h2>
        {isLoading == true && <div role="status">
    <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span class="sr-only">Loading...</span>
</div>}
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
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredRecordings.map((recording) => (
    <div
      key={recording.id}
      className="flex flex-col md:flex-row items-center justify-between bg-gray-800 rounded-md p-4"
    >
      <div className="flex text-center items-center">
        <div className="text-gray-400 mr-4">
          {moment(recording.createdAt).format("MMM D, YYYY h:mm A")}
        </div>
      {recording.keys &&  <div className="flex flex-col">
          {recording.keys?.length == 0 && (
            <div className="text-gray-400">
              {recording.status}
            </div>
          )}
          {recording.keys?.map((key) => (
            <div className="flex space-x-3" key={key}>
              <button onClick={()=>{
                alert('This feature is not available yet. Please download the recording instead.')
              }} className="bg-green-700 text-black px-2 py-1 rounded-md hover:bg-green-600 dark:bg-green-900 dark:text-white dark:hover:bg-green-800">
                Watch
              </button>
             
             {isNewFormat(key) ? 
             <a href={key[0]}
             target="_blank"
                rel="noreferrer"
                className="text-green-500 hover:text-green-400"
             ><button className="bg-red-700 text-white px-2 py-1 rounded-md hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-800">
             Download
           </button></a>: 
             <a
                href={`https://d213lwr54yo0m8.cloudfront.net/${key}`}
                target="_blank"
                rel="noreferrer"
                className="text-green-500 hover:text-green-400"
              >
                <button className="bg-red-700 text-white px-2 py-1 rounded-md hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-800">
                  Download
                </button>
              </a>}
            </div>
          ))}
        </div>}
      </div>
    </div>
  ))}
</div>


    </div>
  );

}

export default RecordingsTable;
