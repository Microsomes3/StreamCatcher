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


    const { filter = "old" } = useParams();

    useEffect(() => {
        axios.get(`https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GetAllRecordingsByRequestID/${rqid}`)
            .then((data) => {
                setAllRecordings(data.data.results);
            });
    }, [rqid,tableMode]);


    useEffect(()=>{

        if(filter == "all"){
            axios("https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GetRecordingsByUsername/"+username)
            .then((d)=>{
                setAllRecordings(d.data.results)
            })
        }

    },[
        filter
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
        <div className='bg-black min-h-screen'>

            <div className="h-12 flex items-center justify-center bg-white">
                <p className="font-bold text-center">View {filter == "old"? "request":"all"} Recordings: {username}</p>
            </div>

     

            {filter =="old"?
            <div class="py-2 mt-6 pl-12">
                <button onClick={(e)=> handleRequestDownload(rqid, setAllStatuses)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
                    Request Download Now
                </button>
            </div>:<div></div>}

            <div class="pl-12 py-2">
                <button onClick={(e)=> location.reload()} className="bg-green-600 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
                    Refresh
                </button>
            </div>

            <div class="pl-12 py-2">
                <Link to={'/requests/'+username} ><button  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
                    Back to Record Requests
                </button></Link>
            </div>

            {filter =="old"? <div class="relative inline-block w-64 px-12">
                <select value={tableMode}  onChange={(e)=>{
                    setTableMode(e.target.value);

                    localStorage.setItem("tableMode", e.target.value);

                    setAllRecordings([]);
                }} class="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                    <option value={'recordings'}>Recordings</option>
                    <option value={'statuses'}>Statuses</option>
                </select>

            </div>:<div></div>}


            <div className='pl-12 pr-12'>
                <div className="overflow-x-auto text-white">
                {allRecordings.length === 0 && <div className='text-white text-2xl mt-12'>No Recordings for this request</div>}
                
                {(allStatuses.length >0 && tableMode == "statuses") &&  <StatusesTable statuses={allStatuses} ></StatusesTable>} 

                {(allRecordings.length > 0 && tableMode == "recordings") && <RecordingsTable recordings={allRecordings} ></RecordingsTable>}
               

             
                
                </div>

            </div>


        </div>
    )
}


export default ViewAllRecordings