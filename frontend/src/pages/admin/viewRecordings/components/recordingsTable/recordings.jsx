import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function RecordingsTable({ recordings }) {
    

    return (
        <table className="w-full table-auto text-white mt-12">
            <thead>
                <tr>
                    <th className="border border-white">username</th>
                    <th className="border border-white">date</th>
                    <th className="border border-white">keys</th>
                    <th className="border border-white">record id</th>
                </tr>
            </thead>
            <tbody>
                {recordings.map((recording) => (
                    <tr key={recording.id}>
                        <td className="border border-white text-center">{recording.username}</td>
                        <td className="border border-white text-center">
                            {moment(recording.date).format("MMMM Do YYYY")}
                        </td>
                        <td className="border border-white text-center">
                            {recording.keys.map((key) => (
                                <div className='px-2 underline' key={key}>
                                    <a target='_blank' href={'https://d213lwr54yo0m8.cloudfront.net/' + key}>{key}</a>
                                </div>
                            ))}
                        </td>
                        <td className="border border-white text-center">{recording.id}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default RecordingsTable;
