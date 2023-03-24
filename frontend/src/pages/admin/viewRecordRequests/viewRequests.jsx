
import React, { useEffect, useState } from 'react'

import { useParams, Link } from 'react-router-dom'

import axios from 'axios'

function handleDeleteRequest(id, setAllRequests, username) {



    axios.delete(`https://o7joskth5a.execute-api.us-east-1.amazonaws.com/dev/recordRequestd/` + id)
        .then((data) => {

            fetchRequests(username, setAllRequests, username);
            
        })
        .catch((err) => {
            console.log(err)
        });
}

function fetchRequests(username, setAllRequests, setIsLoading){
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
        <div className='bg-black min-h-screen '>
            <div className='h-12 bg-white flex items-center justify-center font-bold '>
                <p>Record Requests for: <span className='text-2xl font-extrabold'>{username}</span></p>
            </div>


           
      {isLoading ? (
        <div className='flex mt-6 justify-center items-center h-6 pl-2 text-white ml-12 mr-12 bg-black rounded-bl-md rounded-br-md'>
          <div className='animate animate-spin'>Loading</div>
        </div>
      ) : (
        <div className='flex hidden justify-center items-center h-6 pl-2 text-white ml-12 mr-12 bg-black rounded-bl-md rounded-br-md'>
          <div></div>
        </div>
      )}

<div className='flex flex-col sm:flex-row py-12'>
  <Link to={'/addrecordrequest/'+username}>
    <div className='py-2 pl-4 sm:pl-12'>
      <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>
        Add Record Request
      </button>
    </div>
  </Link>
  
  <div className='py-2 pl-4 sm:pl-12'>
    <button onClick={() => fetchRequests(username, setAllRequests, setIsLoading)} className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>
      Refresh
    </button>
  </div>

  <div className='py-2 pl-4 sm:pl-12'>
    <Link to={'/recordings/'+username+'/all'}>
      <button className='bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md'>
        View All Recordings
      </button>
    </Link>
  </div>

  <div className='py-2 pl-4 sm:pl-12'>
    <Link to={'/'}>
      <button className='bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md'>
        Back to Youtubers Status
      </button>
    </Link>
  </div>
</div>


            <div className='pl-12 pr-12'>

                {allRequests.length === 0 && <div className='text-white text-2xl mt-12'>No Record Requests for this user</div>}

                {allRequests.length > 0 ?
                        <div className="overflow-x-auto">

                    <table className='w-full table-auto text-white  mt-12'>
                        <thead>
                            <tr>
                                <th className='border border-white'>Username</th>
                                <th className='border border-white'>Created</th>
                                <th className='border border-white'>duration</th>
                                <th className='border border-white'> Label </th>
                        
                                <th className='border border-white'>View Recordings</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRequests.map((request) => {
                                return (
                                    <tr className='text-center' key={request.id}>
                                        <td className='border border-white'>{request.username}</td>
                                        <td className='border border-white text-center'>{request.friendlyCreatedAt}</td>
                                        <td className='border border-white'>{request.duration} ({Math.floor(request.duration/3600*60)} minutes)</td>

                                        <td className='border border-white'>{request.label || 'no-label'}</td>
                          
                                        <tr className=' border border-white flex justify-center p-2 '>
                                            <Link to={'/viewrecordings/'+request.id+'/'+request.username}><button className='bg-white rounded-md text-black px-2 py-1'>View Recordings</button></Link>
                                        </tr>
                                        <tr className=' border border-white flex justify-center p-2 '>
                                            <button onClick={(e)=> handleDeleteRequest(request.id, setAllRequests,username)} className='bg-white rounded-md text-black px-2 py-1'>Delete</button>
                                            </tr>
                                    </tr>
                                )
                            }
                            )}
                        </tbody>
                    </table>
                    </div>
                    : <div></div>}

            </div>

        </div>
    )
}


export default recordRequests