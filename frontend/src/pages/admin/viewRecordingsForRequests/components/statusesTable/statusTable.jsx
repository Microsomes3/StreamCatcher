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

            <div class="grid grid-cols-8 gap-4 bg-gray-800 text-white mt-12 p-4">

             
                {filteredStatuses.map((status) => (
                    <div class="col-span-8 sm:col-span-4 lg:col-span-8 grid grid-cols-8 gap-4 border-t mt-12 rounded-md border-gray-600 pt-4" key={status.id}>
                       
                       
                    </div>

                ))}
            </div>
        </div>
    );
}

export default RecordStatusesTable;
