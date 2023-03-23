import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function AddYoutuber() {
    const [youtubers, setYoutubers] = useState([]);
    const [duration, setDuration] = useState(30);
    const [maxParts, setMaxParts] = useState(1);
    const [minRuntime, setMinRuntime] = useState(10);

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
        console.log('Max Parts:', maxParts);
        console.log('Min Runtime:', minRuntime);
        // do something with the form data

        axios.post("https://o7joskth5a.execute-api.us-east-1.amazonaws.com/dev/recordRequest",{
            username: username,
            duration: parseInt(duration),
            from:"mon0-24",
            to:"sun0-24",
            trigger:"onceperday",
            callback:"",
            maxparts:parseInt(maxParts),
            minruntime:parseInt(minRuntime)
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
            <div className="flex justify-center mt-8">
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
    Duration (in seconds):
  </label>
  <input
    type="number"
    id="duration"
    name="duration"
    value={duration}
    onChange={(event) => setDuration(event.target.value)}
    className="block appearance-none w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-700 focus:border-gray-500 mb-4"
    placeholder="Enter duration"
    required
  />

  <label htmlFor="maxParts" className="text-white font-bold mb-2">
    Max Parts:
  </label>
  <input
    type="number"
    id="maxParts"
    name="maxParts"
    value={maxParts}
    onChange={(event) => setMaxParts(event.target.value)}
    className="block appearance-none w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-700 focus:border-gray-500 mb-4"
    placeholder="Enter max parts"
    required
  />

  <label htmlFor="minRuntime" className="text-white font-bold mb-2">
    Min Runtime (in seconds):
  </label>
  <input
    type="number"
    id="minRuntime"
    name="minRuntime"
    value={minRuntime}
    onChange={(event) => setMinRuntime(event.target.value)}
    className="block appearance-none w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-700 focus:border-gray-500 mb-4"
    placeholder="Enter min runtime"
    required
  />

  <button
    type="submit"
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
  >
    Submit
  </button>
</form>

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
