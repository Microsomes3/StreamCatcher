import React, { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom'

import axios from 'axios';

import moment from 'moment';

function ViewAllRecordings() {

    const { rqid } = useParams();

    const [allRecordings, setAllRecordings] = useState([]);

    useEffect(() => {

        axios.get("https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GetAllRecordingsByRequestID/" + rqid).then((data) => {
            setAllRecordings(data.data.results);
        })

    }, []);

    return (
        <div className='bg-black h-screen'>

            <div className="h-12 flex items-center justify-center bg-white">
                <p className="font-bold">View all Recordings: {rqid}</p>
            </div>

            <div className='pl-12 pr-12'>

                <table className="w-full text-white mt-12">
                    <thead>
                        <tr>
                            <th className="border border-white">username</th>
                            <th className="border border-white">date</th>
                            <th className="border border-white">keys</th>
                            <th className="border border-white">recordrequestid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allRecordings.map((recording) => (
                            <tr key={recording.id}>
                                <td className="border border-white text-center">{recording.username}</td>
                                <td className="border border-white text-center">
                                    {moment(recording.date).format("MMMM Do YYYY")}
                                </td>
                                <td className="border border-white text-center">
                                    {recording.keys.map((key) => (
                                        <div key={key}>
                                           <a target='_blank' href={'https://d213lwr54yo0m8.cloudfront.net/'+key}>{key}</a> 
                                        </div>
                                    ))}
                                </td>
                                <td className="border border-white text-center">{recording.recordrequestid}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>


        </div>
    )
}


export default ViewAllRecordings