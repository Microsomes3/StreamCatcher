
import React, { useEffect, useState } from 'react'

import { useParams, Link } from 'react-router-dom'

import axios from 'axios'

import moment from 'moment'

function handleDeleteRequest(id, setAllRequests, username) {



    axios.delete(`https://o7joskth5a.execute-api.us-east-1.amazonaws.com/dev/recordRequestd/` + id)
        .then((data) => {

            fetchRequests(username, setAllRequests, username);

        })
        .catch((err) => {
            console.log(err)
        });
}

function fetchRequests(username, setAllRequests, setIsLoading) {
    setAllRequests([])
    setIsLoading(true)
    axios.get(`https://o7joskth5a.execute-api.us-east-1.amazonaws.com/dev/recordRequest/` + username)
        .then((data) => {
            const recordRequests = data.data.data.Items;
            setAllRequests(recordRequests)
            setIsLoading(false)

        })
}

function recordRequests() {

    const { username } = useParams()

    const [allRequests, setAllRequests] = useState([])

    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        fetchRequests(username, setAllRequests, setIsLoading);
    }, [])

    const [filteredRequests, setFilteredRequests] = useState([])


    useEffect(() => {

        //filter using .createdAt

        const filtered = allRequests.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        })

        setFilteredRequests(filtered)

    }, [allRequests])

    return (
        <div className='bg-gray-800 min-h-screen '>
            <div className='h-12 bg-white flex items-center justify-center font-bold '>
                <p>Record Schedules for: <span className='text-2xl font-extrabold'>{username}</span></p>
            </div>

            <div className='bg-gray-900 p-2 mt-6 mx-2 py-3 rounded-md sm:ml-12 sm:mr-12'>
  {isLoading ? (
    <div className='flex mt-6 justify-center items-center h-6 pl-2 text-white mx-2 bg-transparent rounded-bl-md rounded-br-md'>
      <div role="status">
    <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span class="sr-only">Loading...</span>
</div>
    </div>
  ) : (
    <div className='flex hidden justify-center items-center h-6 pl-2 text-white mx-2 bg-black rounded-bl-md rounded-br-md'>
      <div></div>
    </div>
  )}

  <div className='flex flex-col sm:flex-row py-4'>
  
    <Link to={'/recordings/' + username + '/all'} className='mb-2 sm:mb-0'>
      <div className='py-2 pl-4 sm:pl-8'>
      
        <Link to={'/demo'}>
          <button className='bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md w-full sm:w-auto'>
            Back to YouTubers Status
          </button>
        </Link>
      </div>
    </Link>

    <Link to={'/addrecordrequest/' + username} className='mb-2 sm:mb-0'>
      <div className='py-2 pl-4 sm:pl-8'>
        <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto'>
          Add Record Request
        </button>
      </div>
    </Link>
    
    <div className='py-2 pl-4 sm:pl-8 space-x-3 ml-auto flex'>
    <Link to={'/recordings/'+username+'/all'}><button className='bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md w-full sm:w-auto'>
          View All Recordings
        </button></Link>
      <div className='pr-4'>
        
        <button
          onClick={() => fetchRequests(username, setAllRequests, setIsLoading)}
          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto'
        >
          Refresh
        </button>
      </div>
      <div>
     
      </div>
    </div>
  </div>
</div>


<div className='rounded-md ml-12 px-2 text-center mr-12 flex items-center justify-center text-3xl cursor-pointer bg-gray-700  text-white mt-6 h-52'>
    We will record {allRequests.length} videos for {username}
  </div>


            <div className='pl-12 pr-12'>

                {allRequests.length === 0 && <div className='text-white text-2xl mt-12'>No Record Requests for this user</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {allRequests.length > 0 &&
    filteredRequests.map((request) => (
      <Link
        key={request.id}
        to={"/viewrecordings/" + request.id + "/" + username}
        className="rounded-md text-center shadow-md space-y-3 flex flex-col items-center justify-center text-xl cursor-pointer hover:scale-105 bg-gray-700 text-white mt-6 py-4 px-6"
      >
        <p className="font-bold">{request.label}</p>
        <p className="text-sm">
          Will Record for {Math.floor(request.duration / 60)} minutes and{" "}
          {request.duration % 60} seconds everyday
        </p>
        <p className="text-sm">{request.friendlyCreatedAt}</p>

        {request.isComments && (
          <p className="text-xs bg-green-700 text-white px-2 py-1 rounded-md">
            Comments will be captured
          </p>
        )}

        {request.shouldRecordStart == true && (
          <p className="text-xs bg-green-700 text-white px-2 py-1 rounded-md">
            Will record from start
          </p>
        )}

        {request.shouldRecordStart == false && (
          <p className="text-xs bg-green-700 text-white px-2 py-1 rounded-md">
            Will record from current
          </p>
        )}

        {request.isComments == false && (
          <p className="text-xs bg-red-700 text-white px-2 py-1 rounded-md">
            Comments will not be captured
          </p>
        )}

        {request.trigger == "wheneverlive" && (
          <p className="px-2 py-1 bg-green-700 text-white rounded-md shadow-3xl">
            Record Whenever Live
          </p>
        )}

        {request.trigger == "specifictime" && (
          <p className="px-2 py-1 bg-green-700 text-white rounded-md shadow-3xl">
            Record At Specific Time at around: {request.triggerTime}
          </p>
        )}

        <p className="text-sm">Click to view recordings</p>
      </Link>
    ))}
</div>


            </div>

        </div>
    )
}


export default recordRequests