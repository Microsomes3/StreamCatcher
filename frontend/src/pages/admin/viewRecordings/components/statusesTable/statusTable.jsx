import React, {useState, useEffect} from 'react';
import axios from 'axios';
import moment from 'moment';

import { Link } from 'react-router-dom';

function RecordStatusesTable({statuses}) {

    const [filteredStatuses, setFilteredStatuses] = useState(statuses);

    const [totalPending, setTotalPending] = useState(0);
    const [totalFailed, setTotalFailed] = useState(0);
    const [totalComplete, setComplete] = useState(0);

    useEffect(() => {
        const sortedStatuses = statuses.sort((a, b) => {
            if(a.timeended == null) {
                return -1;
            } else if(b.timeended == null) {
                return 1;
            } else {
                return 0;
            }
        });

      
        var totalPending = 0;
        var totalCompleted = 0;


        sortedStatuses.forEach((status) => {
            if(status.status == "PENDING"){
                totalPending++;
            }

            try{

            if (status.status.status == "success") {
                totalCompleted++;
            }
        }catch(e){

        }
        })


        setComplete(totalCompleted);
        setTotalPending(totalPending);
        setTotalFailed(sortedStatuses.length - totalPending - totalCompleted);
        setFilteredStatuses(sortedStatuses);
    }, [statuses]);

    return (
        <div className='px-12 overflow-x-auto'>

         



            <div className='p-2 bg-white rounded-md mt-2 text-black'>
                <div className='h-52 flex justify-around'>
                    <div className='h-52 space-y-2 w-52 flex items-center justify-center flex-col rounded-md bg-red-400'>
                        <p>Total Pending</p>
                        <p className='text-4xl font-bold'>{totalPending}</p>
                    </div>

                    <div className='h-52 space-y-2 w-52 flex items-center justify-center flex-col rounded-md bg-red-400'>
                        <p>Total Completed</p>
                        <p className='text-4xl font-bold'>{totalComplete}</p>
                    </div>

                    <div className='h-52 space-y-2 w-52 flex items-center justify-center flex-col rounded-md bg-red-400'>
                        <p>Total Failed</p>
                        <p className='text-4xl font-bold'>{totalFailed}</p>
                    </div>
                </div>
            </div>

            <table className="table-auto text-white mt-12 table-responsive">

                <thead>
                    <tr>
                    <th className="w-full border border-white">ID</th>
                    <th className="w-full border border-white">Username</th>
                        <th className="w-full border border-white">Date</th>
                        <th className="w-full border border-white">Time Started</th>
                        <th className="w-full border border-white">Time Finished</th>
                        <th className="w-full border border-white">Time Taken</th>
                        <th className="w-full border border-white">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredStatuses.map((status) => (
                        <tr key={status.id}>
                            <td className='border underline border-white text-center whitespace-nowrap'>
                               <Link to={'/viewrecordings/'+status.recordrequestid+'/'+status.username}><p>{status.id}</p></Link>
                            </td>
                            <td className='border border-white text-center whitespace-nowrap'>
                                <p>{status.username || '--'}</p>
                            </td>
                            <td className='border px-6 border-white text-center whitespace-nowrap'>
                                <p>{status.friendlyDate}</p>
                            </td>
                            <td className="border px-6 border-white text-center whitespace-nowrap">{moment.unix(status.timestarted).format("MMMM Do YYYY, h:mm:ss a")}</td>
                            <td className="border px-6 border-white text-center whitespace-nowrap">
                                {status.timeended != null ?
                                    moment.unix(status.timeended).format("MMMM Do YYYY, h:mm:ss a")
                                    :
                                    'not-finished'
                                }
                            </td>
                            <td className="whitespace-nowrap">
                               { status.timeended != null ?
                                <p className="border border-white text-center px-2 py-2">{moment.unix(status.timeended).diff(moment.unix(status.timestarted), 'minutes')} minutes</p> :
                                <p className="border border-white text-center">not-finished</p> }
                            </td>
                            <td className="border border-white text-center px-2 py-2 whitespace-nowrap">{status.status.status || 'pending'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RecordStatusesTable;
