import React, { useState, useEffect } from 'react';

import axios from 'axios';

import moment from 'moment';

import StatusTable from '../viewRecordings/components/statusesTable/statusTable'

import {useParams} from 'react-router-dom'


function ViewGlobalStatuses() {


    const [allStatuses, setAllStatuses] = useState([])

    const {date} = useParams();

    const [selectedDate, setSelectedDate] = useState(date)
    
    const handleRefreshClick = () => {
        setAllStatuses([])
        axios.get("https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GetAllStatusesByDate/" + selectedDate)
            .then((data) => {

                const allStatuses = data.data.results;

                //filter by .timestarted

            const filteredStatuses = allStatuses.sort((a,b)=>{
                return moment(a.timestarted).isBefore(moment(b.timestarted)) ? 1 : -1;
            });

            console.log(filteredStatuses);
               



                setAllStatuses(filteredStatuses);
            }).catch((err) => {
                console.log(err);
            })
    }

    useEffect(() => {
        handleRefreshClick();
    }, [selectedDate])


    return (
        <div className=' bg-black'>

            <div className='h-12 bg-white flex items-center justify-center font-bold '>
                <p>Global Sitewide Status </p>
            </div>



            <div className='flex mt-4 ml-12'>
                <button onClick={() => handleRefreshClick()} className='rounded-md bg-green-500 hover:bg-green-600 py-2 px-4 text-white font-medium'>
                    Refresh
                </button>
            </div>


            <div>

            <input value={selectedDate} type="date" className='border ml-12 mt-2 border-white rounded-md p-2' onChange={(e) => {
                const date = e.target.value;

                setSelectedDate(date);
              
            }}/>
                <StatusTable statuses={allStatuses}></StatusTable>
            </div>


        </div>
    )
}



export default ViewGlobalStatuses