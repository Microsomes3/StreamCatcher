import axios from 'axios';

import moment from 'moment';

function RecordStatusesTable({statuses}){
    return (
       <table className="w-full table-auto text-white mt-12">

            <thead>
                <tr>
                <th className="border border-white">Date</th>
                <th className="border border-white">Time Started</th>
                <th className="border border-white">Time Finished</th>
                <th className="border border-white">Time Taken</th>
                <th className="border border-white">Status</th>
                </tr>
            </thead>

            <tbody>
                {statuses.map((status) => (
                    <tr key={status.id}>
                        <td className='border border-white text-center'>
                            <p>{status.friendlyDate}</p>
                        </td>
                        <td className="border border-white text-center">{moment.unix(status.timestarted).format("MMMM Do YYYY, h:mm:ss a")}</td>
                        <td className="border border-white text-center">
                            {status.timeended != null ?
                                moment.unix(status.timeended).format("MMMM Do YYYY, h:mm:ss a")
                                :
                                'not-finished'
                            }
                            
                            </td>
                        <td>
                            <p className="border border-white text-center">{moment.unix(status.timeended).diff(moment.unix(status.timestarted), 'hours')} hours</p>
                        </td>
                        <td className="border border-white text-center">{status.status.status || 'pending'}</td>
                    </tr>
                ))}
            </tbody>


        </table>
    )

}


export default RecordStatusesTable;