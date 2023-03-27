
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
    <div className='flex mt-6 justify-center items-center h-6 pl-2 text-white mx-2 bg-black rounded-bl-md rounded-br-md'>
      <div className='animate animate-spin'>Loading</div>
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
    <button className='bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md w-full sm:w-auto'>
          View All Recordings
        </button>
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

                {allRequests.length > 0 ?
                    <div className="overflow-x-auto">

{allRequests.length > 0 &&
  filteredRequests.map((request) => (
  <Link key={request.id} to={'/viewrecordings/'+request.id+'/'+username}>  <div className='rounded-md text-center shadow-md space-y-3 flex flex-col items-center justify-center text-xl cursor-pointer hover:scale-105 bg-gray-700 text-white mt-6 py-4 px-6'>
      <p className='font-bold'>{request.label}</p>
      <p className='text-sm'>Will Record for {Math.floor(request.duration / 60)} minutes and {request.duration % 60} seconds everyday</p>
      <p className='text-sm'>{request.friendlyCreatedAt}</p>

      {request.isComments &&
      <p className='text-xs bg-green-700 text-white px-2 py-1 rounded-md'> Comments will be captured </p>
      }

      {request.shouldRecordStart == true &&
              <p className='text-xs bg-green-700 text-white px-2 py-1 rounded-md'>Will record from start</p>
      }

{request.shouldRecordStart == false &&
              <p className='text-xs bg-green-700 text-white px-2 py-1 rounded-md'>Will record from current</p>
      }


{request.isComments==false &&
      <p className='text-xs bg-red-700 text-white px-2 py-1 rounded-md'> Comments will not captured </p>
      }

      {request.trigger == 'wheneverlive' &&
        <p className='px-2 py-1 bg-green-700 text-white rounded-md shadow-3xl'>Record Whenever Live</p>
      }

{request.trigger == 'specifictime' &&
        <p className='px-2 py-1 bg-green-700 text-white rounded-md shadow-3xl'>Record At Specific Time at around: {request.triggerTime}</p>
      }


      <p className='text-sm'>Click to view recordings</p>
    </div></Link>
  ))


  }






                      





                     
                    </div>
                    : <div></div>}

            </div>

        </div>
    )
}


export default recordRequests