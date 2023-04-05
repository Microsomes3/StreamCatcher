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


    useEffect(()=>{
      //store tablemode in localstorage
      localStorage.setItem("tableMode",tableMode)
    },[tableMode])


    function handleRequestDownload(rqid, setAllStatuses){
      setIsLoading(true);
        axios.post(`https://c3z399rsmd.execute-api.us-east-1.amazonaws.com/dev/RecordByRequestIDAdhoc/${rqid}`)
            .then((data) => {
                console.log(data)
                setIsLoading(false);
                alert("Request Sent, please check back in a few minutes")
                //change  tablemdoe to statuses
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
             <Link to={'/requests/'+username}>
                <button className="bg-red-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
                  Back to Record Requests
                </button>
              </Link>
           
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <button
                onClick={() => location.reload()}
                className="bg-green-600 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Refresh
              </button>
              <button
              onClick={() => handleRequestDownload(rqid, setAllStatuses)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md mb-4 md:mb-0 md:mr-4"
            >
              Request Download Now
            </button>
             
            </div>
          </div>
        )}
      </div>

      {requestDetails!=null ?
  <div className='bg-gray-800 rounded-md p-12 ml-12 mr-12 mt-6 hidden sm:block'>
    <p className='text-sm text-white'>Request Description.</p>
          
    <p className='text-white'>This record request will record <span className='text-2xl'>{requestDetails.username}</span> youtube channel for around {requestDetails.duration} seconds, the comments {requestDetails.isComments ? 'will be captured':'will not be captured'}</p>
  </div>
  :<div></div>}

    
      <div className='pl-4 pr-4 md:pl-12 md:pr-12'>
        <div className="overflow-x-auto text-white">
    
          {isLoading && <div className='text-white text-2xl mt-12'>
          <div role="status">
    <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span class="sr-only">Loading...</span>
</div>
          </div>}
    
          {(allStatuses.length > 0 && tableMode == "statuses") && <StatusesTable statuses={allStatuses} />}
          {(allRecordings.length > 0 && tableMode == "recordings") && <RecordingsTable isLoading={isLoading} recordings={allRecordings} />}
    
        </div>
      </div>
    
    </div>
    
    )
}


export default ViewAllRecordings