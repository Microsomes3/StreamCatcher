import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

import { Link } from 'react-router-dom';

function RecordStatusesTable({ statuses }) {

    const [filteredStatuses, setFilteredStatuses] = useState(statuses);

    const [totalPending, setTotalPending] = useState(0);
    const [totalFailed, setTotalFailed] = useState(0);
    const [totalComplete, setComplete] = useState(0);


    function getParcentage(status) {
        var toReturn = 0;

        try {
            toReturn = status.progressState.parcentage

            if (toReturn == undefined) {
                toReturn = 0
            }

        } catch (e) { }

        return parseFloat(toReturn).toFixed(2);
    }

    useEffect(() => {
        const sortedStatuses = statuses.sort((a, b) => {
            if (a.timeended == null) {
                return -1;
            } else if (b.timeended == null) {
                return 1;
            } else {
                return 0;
            }
        });


        var totalPending = 0;
        var totalCompleted = 0;
        var totalFailed = 0;


        sortedStatuses.forEach(job=>{
            if(job.status == "PENDING"){
                totalPending++;
            }else if(job.status == "done"){
                totalCompleted++;
            }else if(job.status == "error"){
                totalFailed++;
            }
        })

        setTotalPending(totalPending);
        setComplete(totalCompleted);
        setTotalFailed(totalFailed);


    
        setFilteredStatuses(sortedStatuses);
    }, [statuses]);

    return (
        <div className='px-12 bg-gray-900 py-3 rounded-md mt-2 overflow-x-auto'>
          
          <div class="p-2 rounded-md mt-6 text-white">
  <div class="flex flex-col sm:flex-row justify-around">
    <div class="w-full sm:w-52 h-52 mb-4 sm:mb-0 flex items-center justify-center flex-col rounded-md bg-red-600">
      <p class="text-base font-medium">Total Pending</p>
      <p class="text-2xl sm:text-4xl font-bold">{totalPending}</p>
    </div>

    <div class="w-full sm:w-52 h-52 mb-4 sm:mb-0 flex items-center justify-center flex-col rounded-md bg-green-600">
      <p class="text-base font-medium">Total Completed</p>
      <p class="text-2xl sm:text-4xl font-bold">{totalComplete}</p>
    </div>

    <div class="w-full sm:w-52 h-52 flex items-center justify-center flex-col rounded-md bg-yellow-600">
      <p class="text-base font-medium">Total Failed</p>
      <p class="text-2xl sm:text-4xl font-bold">{totalFailed}</p>
    </div>
  </div>
</div>



            <div class="grid grid-cols-8 gap-4 bg-gray-800 text-white mt-12 p-4">

             
                {filteredStatuses.map((status) => (
                    <div class="col-span-8 sm:col-span-4 lg:col-span-8 grid grid-cols-8 gap-4 border-t mt-12 rounded-md border-gray-600 pt-4" key={status.id}>
                       
                       <div class="col-span-8 sm:col-span-4 lg:col-span-2 text-center flex items-center justify-center flex-col">
                            <p class="text-base font-medium">Channel</p>
                            <p class="text-2xl font-bold">{status.username}</p>
                            <p class="text-2xl font-bold px-2 py-1 mt-2 bg-green-700  hover:bg-green-800 cursor-pointer rounded-md">Status:{status.status}</p>
                            </div>
                            
                        <div class="col-span-8 sm:col-span-4 lg:col-span-2 text-center flex items-center justify-center flex-col">
                            <p class="text-base font-medium">Record Id ID</p>
                            <p class="text-2xl font-bold">{status.id}</p>
                            </div>


                            <div class="col-span-8 sm:col-span-4 lg:col-span-2 text-center flex items-center justify-center flex-col">
                            <p class="text-base font-medium">Record Date</p>
                            <p class="text-2xl font-bold">{status.friendlyDate}</p>
                            <p>{moment.unix(status.timeended).format('YYYY-MM-DD HH:MM a')}</p>
                            </div>

                            <div class="col-span-8 sm:col-span-4 lg:col-span-2 text-center flex items-center justify-center flex-col">
                            <p class="text-base font-medium">Taken</p>
                            {status.timeended!=null ?<p class="text-2xl font-bold">
                             {moment.unix(status.timeended).diff(moment.unix(status.timestarted), 'minutes')}
                            </p>:<p>Pending</p>}
                            </div>

                          
                       
                    </div>

                ))}
            </div>
        </div>
    );
}

export default RecordStatusesTable;
