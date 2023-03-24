
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


           <Link to={'/addrecordrequest/'+username}> <div className='py-2 pl-12 mt-6'>
                <button
                    className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
                >
                    Add Record Request
                </button>
            </div></Link>

          <div className='pl-12'>
                <button
                onClick={() => fetchRequests(username, setAllRequests, setIsLoading)}
                    className='bg-red-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
                >
                    Refresh
                </button>
            </div>

            <div class="pl-12 py-2">
                <Link to={'/recordings/'+username} ><button  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
                    View All Recordings
                </button></Link>
            </div>
            

            <div class="pl-12 py-1">
                <Link to={'/'} ><button  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
                    Back to Youtubers Status
                </button></Link>
            </div>

            <div className='pl-12 pr-12'>

                {allRequests.length === 0 && <div className='text-white text-2xl mt-12'>No Record Requests for this user</div>}

                {allRequests.length > 0 ?
                        <div className="overflow-x-auto">

                    <table className='w-full table-auto text-white  mt-12'>
                        <thead>
                            <tr>
                                <th className='border border-white'>Username</th>
                                <th className='border border-white'>RequestId</th>
                                <th className='border border-white'>Created</th>
                                <th className='border border-white'>duration</th>
                                <th className='border border-white'>minruntime</th>
                                <th className='border border-white'>maxparts</th>
                                <th className='border border-white'>View Recordings</th>
                            </tr>
                        </thead>

                        <tbody>
                            {allRequests.map((request) => {
                                return (
                                    <tr className='text-center' key={request.id}>
                                        <td className='border border-white'>{request.username}</td>
                                        <td className='border border-white'>{request.id}</td>
                                        <td className='border border-white text-center'>{request.friendlyCreatedAt}</td>
                                        <td className='border border-white'>{request.duration} ({Math.floor(request.duration/3600*60)} minutes)</td>
                                        <td className='border border-white'>{request.minruntime}</td>
                                        <td className='border border-white'>{request.maxparts}</td>
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