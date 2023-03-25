import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function RecordingsTable({ recordings }) {

    const [sortByDate, setSortByDate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleSortByDate = () => {
        setSortByDate(!sortByDate);
    };

    const sortedRecordings = sortByDate
    ? recordings.sort((a, b) => {
        if (moment(a.date).valueOf() === moment(b.date).valueOf()) {
          return a.keys[0].localeCompare(b.keys[0]);
        }
        return moment(a.date).valueOf() - moment(b.date).valueOf();
      })
    : recordings;

const sortLabel = sortByDate ? 'Sort by oldest first' : 'Sort by newest first';

    

    return (
        <div>


        <table className="w-full table-auto text-white mt-12">
            <thead>
                <tr>
                    <th className="border border-white">Date</th>
                    <th className="border border-white">Links</th>
                </tr>
            </thead>
            <tbody>
                {sortedRecordings.map((recording) => (
                    <tr key={recording.id}>
                        <td className="border border-white text-center">
                            {moment(recording.date).format("MMMM Do YYYY")}
                        </td>
                        <td className="border border-white text-center">
                            {recording.keys.map((key) => (
                                <div className='px-2 underline'>
                                    <a target='_blank' href={'https://d213lwr54yo0m8.cloudfront.net/' + key}>{key}</a>
                                </div>
                            ))}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
}

export default RecordingsTable;
