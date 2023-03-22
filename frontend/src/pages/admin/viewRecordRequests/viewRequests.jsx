
import React, { useEffect, useState } from 'react'

import { useParams, Link } from 'react-router-dom'

import axios from 'axios'


function recordRequests() {

    const { username } = useParams()

    const [allRequests, setAllRequests] = useState([])


    useEffect(() => {
        axios.get(`https://o7joskth5a.execute-api.us-east-1.amazonaws.com/dev/recordRequest/` + username)
            .then((data) => {
                const recordRequests = data.data.data.Items;
                setAllRequests(recordRequests)
            })
    }, [])


    return (
        <div className='bg-black '>
            <div className='h-12 bg-white flex items-center justify-center font-bold '>
                <p>Record Requests for: <span className='text-2xl font-extrabold'>{username}</span></p>
            </div>

           <Link to={'/addrecordrequest/'+username}> <div className='p-12'>
                <button
                    className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
                >
                    Add Record Request
                </button>
            </div></Link>

            <div className='pl-12 pr-12'>

                {allRequests.length === 0 && <div className='text-white text-2xl mt-12'>No Record Requests for this user</div>}

                {allRequests.length > 0 ?
                    <table className='w-full text-white  mt-12'>
                        <thead>
                            <tr>
                                <th className='border border-white'>Username</th>
                                <th className='border border-white'>RequestId</th>
                                <th className='border border-white'>duration</th>
                                <th className='border border-white'>minruntime</th>
                                <th className='border border-white'>maxparts</th>
                                <th className='border border-white'>View Recordings</th>
                            </tr>
                        </thead>

                        <tbody>
                            {allRequests.map((request) => {
                                return (
                                    <tr key={request.id}>
                                        <td className='border border-white'>{request.username}</td>
                                        <td className='border border-white'>{request.id}</td>
                                        <td className='border border-white'>{request.duration}</td>
                                        <td className='border border-white'>{request.minruntime}</td>
                                        <td className='border border-white'>{request.maxparts}</td>
                                        <tr className=' border border-white flex justify-center p-2 '>
                                            <Link to={'/viewrecordings/'+request.id}><button className='bg-white rounded-md text-black'>View Recordings</button></Link>
                                        </tr>
                                    </tr>
                                )
                            }
                            )}
                        </tbody>
                    </table>
                    : <div></div>}

            </div>

        </div>
    )
}


export default recordRequests