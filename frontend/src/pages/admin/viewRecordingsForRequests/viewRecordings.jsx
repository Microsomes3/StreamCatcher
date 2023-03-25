import React, { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom'

import RecordingsTable from './components/recordingsTable/recordings'
import StatusesTable from './components/statusesTable/statusTable'

import { Link } from 'react-router-dom';

import axios from 'axios';

import moment from 'moment';

function ViewAllRecordings() {

    const { rqid, username } = useParams();

    const [tableMode, setTableMode] = useState("recordings");

    const [allRecordings, setAllRecordings] = useState([]);

    const [allStatuses, setAllStatuses] = useState([]);

    const [requestDetails, setRequestDetails] = useState(null);


    const { filter = "old" } = useParams();

    const [isLoading, setIsLoading] = useState(true);

  

    useEffect(()=>{

        if(filter == "all"){
            axios("https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GetRecordingsByUsername/"+username)
            .then((d)=>{
                setAllRecordings(d.data.results)
                setIsLoading(false)

            })
        }else{
            axios.get(`https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GetAllRecordingsByRequestID/${rqid}`)
            .then((data) => {
                setAllRecordings(data.data.results);
                setIsLoading(false)

            });
        }


    },[
        filter,rqid,tableMode
    ])

    useEffect(()=>{
       const t = setTimeout(()=>{
        const ltablemode= localStorage.getItem("tableMode");

        console.log(">",ltablemode)

         if(ltablemode){
                setTableMode(ltablemode)
                setAllRecordings([]);

        }
       },100)

         return ()=> clearTimeout(t);  
    },[])


    useEffect(()=>{

      axios.get("https://o7joskth5a.execute-api.us-east-1.amazonaws.com/dev/recordRequestById/"+rqid)
      .then((data)=>{
        console.log(data.data.results[0]);
        setRequestDetails(data.data.results[0])
      })

    },[
      rqid
    ])


    function handleGetAllStatuses({rqid, setAllStatuses}){
        axios.get(`https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GetAllRecordStatusesByRequestID/${rqid}`)
        .then((data) => {
            console.log(data.data.results);
            setAllStatuses(data.data.results);
        });
    }

    useEffect(() => {
        handleGetAllStatuses({rqid, setAllStatuses});
    }, [rqid,tableMode]);


    function handleRequestDownload(rqid, setAllStatuses){
        axios.post(`https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/RecordByRequestIDAdhoc/${rqid}`)
            .then((data) => {
                console.log(data)
                alert("Request Sent, please check back in a few minutes")
                handleGetAllStatuses({rqid, setAllStatuses});
            }).catch((err) => {
                console.log(err)
                alert("try again in a few minutes")
            });
    }

    return (
      <div className='bg-gray-900 min-h-screen'>

      <div className="h-12 flex items-center justify-center bg-white text-black">
        <p className="font-bold text-center">View {filter == "old"? "request":"all"} Recordings: {username}</p>
      </div>
    
      <div className='px-2 mt-12 mx-2 py-3 rounded-md bg-gray-800'>
        {filter === "old" && (
          <div className="flex flex-col md:flex-row items-center justify-between md:px-12">
            <button
              onClick={() => handleRequestDownload(rqid, setAllStatuses)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md mb-4 md:mb-0 md:mr-4"
            >
              Request Download Now
            </button>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <button
                onClick={() => location.reload()}
                className="bg-green-600 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Refresh
              </button>
              <Link to={'/requests/'+username}>
                <button className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
                  Back to Record Requests
                </button>
              </Link>
              <div className="relative inline-block w-64">
                <select
                  value={tableMode}
                  onChange={(e) => {
                    setTableMode(e.target.value);
                    localStorage.setItem('tableMode', e.target.value);
                    setAllRecordings([]);
                  }}
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="recordings">Recordings</option>
                  <option value="statuses">Statuses</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {requestDetails!=null ?
      <div className='bg-gray-800 rounded-md p-12 ml-12 mr-12 mt-6'>
        <p className='text-sm text-white'>Request Description.</p>
              
              <p className='text-white'>This record request will record <span className='text-2xl'>{requestDetails.username}</span> youtube channel for around {requestDetails.duration} seconds, the comments {requestDetails.isComments ? 'will be captured':'will not be captured'}</p>

      </div>
      :<div></div>}
    
      <div className='pl-4 pr-4 md:pl-12 md:pr-12'>
        <div className="overflow-x-auto text-white">
    
          {isLoading && <div className='text-white text-2xl mt-12'>
            <p className='animate animate-pulse'>Loading</p>
          </div>}
    
          {(allStatuses.length > 0 && tableMode == "statuses") && <StatusesTable statuses={allStatuses} />}
          {(allRecordings.length > 0 && tableMode == "recordings") && <RecordingsTable recordings={allRecordings} />}
    
        </div>
      </div>
    
    </div>
    
    )
}


export default ViewAllRecordings