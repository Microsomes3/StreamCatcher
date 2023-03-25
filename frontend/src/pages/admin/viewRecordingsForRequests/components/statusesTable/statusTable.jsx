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


        sortedStatuses.forEach((status) => {
            if (status.status == "PENDING") {
                totalPending++;
            }

            try {

                if (status.status.status == "success") {
                    totalCompleted++;
                }
            } catch (e) {

            }
        })


        setComplete(totalCompleted);
        setTotalPending(totalPending);
        setTotalFailed(sortedStatuses.length - totalPending - totalCompleted);
        setFilteredStatuses(sortedStatuses);
    }, [statuses]);

    return (
        <div className='px-12 bg-gray-900 py-3 rounded-md mt-2 overflow-x-auto'>
          <div class="p-2 rounded-md mt-6 text-white">
  <div class="flex flex-col sm:flex-row justify-around">
    <div class="w-52 h-52 mb-4 sm:mb-0 flex items-center justify-center flex-col rounded-md bg-red-600">
      <p class="text-base font-medium">Total Pending</p>
      <p class="text-4xl font-bold">{totalPending}</p>
    </div>

    <div class="w-52 h-52 mb-4 sm:mb-0 flex items-center justify-center flex-col rounded-md bg-green-600">
      <p class="text-base font-medium">Total Completed</p>
      <p class="text-4xl font-bold">{totalComplete}</p>
    </div>

    <div class="w-52 h-52 flex items-center justify-center flex-col rounded-md bg-yellow-600">
      <p class="text-base font-medium">Total Failed</p>
      <p class="text-4xl font-bold">{totalFailed}</p>
    </div>
  </div>
</div>


            <table className="table-auto text-white mt-12 table-responsive">

                <thead>
                    <tr>
                        <th className="w-full border border-white">ID</th>
                        <th className="w-full border border-white">Username</th>
                        <th className="w-full border border-white">Time Started</th>
                        <th className="w-full border border-white">Time Finished</th>
                        <th className="w-full border border-white">Time Taken</th>
                        <th className="w-full border border-white">Status</th>
                        <th className="w-full border border-white">Percentage</th>
                        <th className="w-full border border-white">Kill</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredStatuses.map((status) => (
                        <tr key={status.id}>
                            <td className='border underline border-white text-center whitespace-nowrap'>
                                <Link to={'/viewrecordings/' + status.recordrequestid + '/' + status.username}><p>{status.id}</p></Link>
                            </td>
                            <td className='border border-white text-center whitespace-nowrap'>
                                <p>{status.username || '--'}</p>
                            </td>
                            <td className='border px-6 border-white text-center whitespace-nowrap'>
                                <p>{status.friendlyDate}</p>
                            </td>
                            <td className="border px-6 border-white text-center whitespace-nowrap">
                                {status.timeended != null ?
                                    moment.unix(status.timeended).format("MMMM Do YYYY, h:mm:ss a")
                                    :
                                    'not-finished'
                                }
                            </td>

                            <td className="whitespace-nowrap">
                                {status.timeended != null ?
                                    <p className="border border-white text-center px-2 py-2">{moment.unix(status.timeended).diff(moment.unix(status.timestarted), 'minutes')} minutes</p> :
                                    <p className="border border-white text-center">not-finished</p>}
                            </td>

                            <td className="border border-white text-center px-2 py-2 whitespace-nowrap">{status.status.status || <p>
                                {status.status}
                            </p>}</td>

                            <td className="border border-white text-center px-2 py-2 whitespace-nowrap">
                                {getParcentage(status)} %
                            </td>
                            <td className="border border-white text-center px-2 py-2 whitespace-nowrap">
                                <button className='bg-red-400 rounded-md px-2 py-2' onClick={() => {
                                    if (status.status == "PENDING") {



                                        axios.put(' https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/KillRecording/' + status.id).then((res) => {
                                            console.log(res.data);


                                            alert('Killed Recording');
                                        })
                                    } else {
                                        alert('Recording is not pending, cannot kill')
                                    }
                                }}>Kill</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RecordStatusesTable;
