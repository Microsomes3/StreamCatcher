import React, { useState, useEffect } from 'react'

import { useParams,Link } from 'react-router-dom'
import axios from 'axios';

import RecordTable from '../viewRecordingsForRequests/components/recordingsTable/recordings'



function ViewAllRecordingsByUsername() {

    const { username } = useParams();

    const [recordings, setRecordings] = useState([])


    useEffect(() => {
        axios.get(`https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GetRecordingsByUsername/${username}`)
            .then((data) => {
                setRecordings(data.data.results)
            })
    }, [username])




    return (
        <div className='bg-black h-screen'>
            <div className="h-12 flex items-center justify-center bg-white">
                <p className="font-bold text-center">View all Recordings: {username}</p>
            </div>
            <div class="py-2 px-2 bg-gray-900 space-x-12 ml-12 mt-12 mr-12 rounded-md flex items-center justify-between sm:justify-center">
 <Link to={'/requests/'+username}><button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mr-2">
    Go Back to Requests
  </button></Link>
  <Link to={'/demo'}><button class="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
    Back to YouTube Statuses
  </button></Link>
</div>




            <div className='bg-gray-900 rounded-md p-12 m-12 mt-2'>
                <RecordTable recordings={recordings} />
            </div>

        </div>
    )

}



export default ViewAllRecordingsByUsername