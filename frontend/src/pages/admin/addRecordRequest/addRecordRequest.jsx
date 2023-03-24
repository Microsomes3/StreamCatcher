import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function AddYoutuber() {
    const [youtubers, setYoutubers] = useState([]);
    const [duration, setDuration] = useState(30);

    const [enableComments, setEnableComments] = useState(false);
    const [label, setLabel] = useState('');


    const { username } = useParams();


    useEffect(() => {
        axios
            .get('https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatuses')
            .then((data) => {
                const usernames = data.data.youtubers.map((youtuber) => youtuber.username);

                //filter and make username is first
                const filteredUsernames = usernames.filter((username) => username !== username);
                filteredUsernames.unshift(username);



                setYoutubers(filteredUsernames);
            });
    }, [username]);

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Duration:', duration);
        // console.log('Max Parts:', maxParts);
        // do something with the form data

        axios.post("https://o7joskth5a.execute-api.us-east-1.amazonaws.com/dev/recordRequest",{
            username: username,
            duration: parseInt(duration),
            from:"mon0-24",
            to:"sun0-24",
            trigger:"onceperday",
            callback:"",
            maxparts:1,
            minruntime:parseInt(duration/4),
            isComments:enableComments,
            label:label
        }).then((data)=>{
            console.log(data);
            alert('Record request added successfully, it may take a few minutes to show up');

            //go back to view recordings
            window.location.href = `/requests/${username}`;


        }).catch((err)=>{
            console.log(err);
            alert('Error adding record request');
        })

    };

    return (
        <div className="bg-black h-screen">
            <div className="h-12 flex items-center justify-center bg-white">
                <p className="font-bold">Add Record Requests</p>
            </div>
           
            <div className="flex  justify-center mt-8">
            <form onSubmit={handleSubmit} className="flex flex-col items-center bg-gray-900 p-8 rounded-lg">
  <label htmlFor="youtuber" className="text-white font-bold mb-2">
    Select a Youtuber:
  </label>
  <select
    name="youtuber"
    id="youtuber"
    className="block appearance-none w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-700 focus:border-gray-500 mb-4"
  >
    {youtubers.map((username) => (
      <option key={username} value={username}>
        {username}
      </option>
    ))}
  </select>

  <label htmlFor="duration" className="text-white font-bold mb-2">
    Duration:
</label>


<div className="relative w-full">
    <input
        type="range"
        id="duration"
        name="duration"
        min="15" // minimum duration of 30 minutes in seconds
        max="21600" // maximum duration of 6 hours in seconds
        value={duration}
        onChange={(event) => setDuration(event.target.value)}
        className="absolute w-full h-2 opacity-0"
    />
    <div className="h-2 bg-gray-700 rounded-full">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((duration - 1800) / 19800) * 100}%` }}></div>
    </div>

    <div className="text-white text-xs flex justify-between mt-1">
        <span>15 sec</span>
        <span>6 hours</span>
    </div>

    <div className="text-white text-xs flex justify-between mt-1">
        <span>{duration} seconds</span>
        <span>{Math.floor(duration / 60)} minutes</span>
    </div>
</div>

<div className="flex mt-6 flex-col items-start">
    <label htmlFor="label" className="text-white font-bold mb-2">
        Label:
    </label>
    <div className="relative">
        <input
            type="text"
            id="label"
            name="label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="block w-full bg-gray-900 border border-gray-700 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-800 focus:border-gray-500"
            placeholder="record fat gabe..."
            required
        />
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M12.707 6.293a1 1 0 0 1 1.414 1.414L8.414 13H11a1 1 0 0 1 0 2H7a1 1 0 1 1 0-2h2.586l-2.293-2.293a1 1 0 1 1 1.414-1.414L11 12.586l1.293-1.293a1 1 0 0 1 1.414 0zM3 3h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
            </svg>
        </div>
    </div>
</div>


<label htmlFor="enable-comments" className="text-white mt-6 font-bold mb-2 flex items-center">
    <input
        type="checkbox"
        id="enable-comments"
        name="enable-comments"
        checked={enableComments}
        onChange={() => setEnableComments(!enableComments)}
        className="appearance-none w-5 h-5 border border-gray-400 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
    />
    <span className="text-sm ml-2">Enable Capture Comments</span>
</label>


 

  <button
    type="submit"
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
  >
    Submit
  </button>
</form>


<div className="hidden sm:block bg-gray-400 w-96 rounded-tr-md">
    <p className="px-4 py-2">
        Every Record request is currently triggered at around 00:00 if the streamer is live, or if youtuber is not live, it will trigger within 15 minutes when he is live
    </p>
</div>


            </div>
            <div className="flex justify-center mt-8">
                <Link to={'/requests/'+username} className="text-white underline">
                    Back to Record Requests for {username}
                </Link>
            </div>
        </div>
    );
}

export default AddYoutuber;
