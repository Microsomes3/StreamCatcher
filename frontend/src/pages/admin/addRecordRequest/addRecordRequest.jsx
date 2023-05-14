import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function AddYoutuber() {
    const [youtubers, setYoutubers] = useState([]);
    const [duration, setDuration] = useState(30);
    const [triggerOptions, setTriggerOptions] = useState('manual')
    const [triggerTime, setTriggerTime] = useState('1');
    const [shouldRecordStart, setShouldRecordStart] = useState(false);
    const [triggerInterval, setTriggerInterval] = useState('5m');
    const [isLoading, setIsLoading] = useState(false);

    const [enableComments, setEnableComments] = useState(false);
    const [label, setLabel] = useState('');

    const [channelType, setChannelType] = useState('youtube');


    const { username } = useParams();


    useEffect(() => {
        axios
            .get('https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatuses',{
                headers: {
                    'Authorization' : 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then((data) => {
                const usernames = data.data.youtubers.map((youtuber) => youtuber.username);

                //filter and make username is first
                const filteredUsernames = usernames.filter((username) => username !== username);
                filteredUsernames.unshift(username);


                try {
                    const ct = data.data.youtubers.filter((item) => {
                        return item.username === filteredUsernames[0];
                    })

                    setChannelType(ct[0].type)
                } catch (err) { }


                console.log(">>", filteredUsernames);

                setYoutubers(filteredUsernames);
            });
    }, [username]);

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsLoading(true);
        console.log('Duration:', duration);
        // console.log('Max Parts:', maxParts);
        // do something with the form data

        axios.post("https://o7joskth5a.execute-api.us-east-1.amazonaws.com/dev/recordRequest", {
            "label": label,
            "username": username,
            "duration": parseInt(duration),
            "trigger": triggerOptions,
            "isComments": enableComments,
            "triggerTime": triggerTime,
            "triggerInterval": triggerInterval,
            "shouldRecordStart": shouldRecordStart,
            "provider": channelType
        },{
            headers: {
                'Authorization' : 'Bearer ' + localStorage.getItem('token')
            }
        }).then((data) => {
            console.log(data);

            toast('Record request added successfully', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              });

              setLabel('');

            setIsLoading(false);

            //go back to view recordings
            // window.location.href = `/requests/${username}`;


        }).catch((err) => {
            console.log(err);
            alert('Error adding record request');
            setIsLoading(false);
        })

    };

    return (
        <div className="bg-black h-screen">
                  <ToastContainer />

            <div className="h-12 flex items-center justify-center bg-white">
                <p className="font-bold">Add Record Schedule for {username}</p>
            </div>

            <div className="flex  justify-center mt-8">
                <form onSubmit={handleSubmit} className="flex flex-col items-center bg-gray-900 p-8 rounded-lg">
                    <label htmlFor="youtuber" className="text-white font-bold mb-2">
                        Select a Streamer:
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


                    <div className='mt-5 flex flex-col space-x-3'>
                        <label className='text-white px-2 text-sm pb-2 pl-3 font-bold'>Duration (seconds)</label>
                        <input value={duration} onChange={(e) => {

                            //make sure it's a number
                            if (isNaN(e.target.value)) {
                                return;
                            }

                            //make sure it's not less than 15 seconds
                            // if(e.target.value < 15){
                            //     return;
                            // }

                            //make sure it's not more than 6 hours
                            if (e.target.value > 40000) {
                                return;
                            }

                            setDuration(e.target.value);
                        }} className='rounded-md pl-2' placeholder='seconds...' type='text'>
                        </input>
                    </div>

                    <div class="flex flex-col mt-6 items-center">

                        <label htmlFor="youtuber" className="text-white font-bold mb-2">
                            Select Trigger Option: {triggerInterval}
                        </label>

                        <select
                            name="youtuber"
                            id="youtuber"
                            className="block appearance-none w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-700 focus:border-gray-500 mb-4"
                            onChange={(e) => { setTriggerOptions(e.target.value) }}
                        >
                             <option value={'manual'}>Manual</option>
                            <option value={'wheneverlive'}>Whenever Live</option>
                            <option value={'specifictime'}>Specific Time</option>
                            <option value={'interval'}>Interval</option>
                        </select>

                    </div>

                    {triggerOptions == "interval" &&
                        <select
                            name="youtuber"
                            id="youtuber"
                            className="block appearance-none w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-700 focus:border-gray-500 mb-4"
                            onChange={(e) => { setTriggerInterval(e.target.value) }}
                        >
                            <option value={'5m'}>Every 5 minutes</option>
                            <option value={'10m'}>Every 10 minutes</option>
                            <option value={'20m'}>Every 20 minutes</option>
                            <option value={'30m'}>Every 30 minutes</option>
                            <option value={'1hr'}>Every 1 hour</option>
                            <option value={'2hr'}>Every 2 hours</option>
                            <option value={'3hr'}>Every 3 hours</option>
                        </select>
                    }

                    {triggerOptions == "specifictime" ? <div>

                        <div className="flex flex-col mt-2 items-center">

                            <label htmlFor="youtuber" className="text-white font-bold mb-2">
                                Select Time
                            </label>
                            <input type="time" id="appt" name="appt" min="00:00" max="24:00" required class="bg-gray-800 text-white rounded-md p-2 w-40"
                                onChange={(e) => { setTriggerTime(e.target.value) }}
                            />
                            <p className="text-xs	 text-white w-1/2 text-center mt-2">Will trigger only when online, at around the specifc time. UTC Time</p>
                        </div>
                    </div> : null}



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

                    {channelType == "youtube" && <label htmlFor="enable-comments" className="text-white mt-6 font-bold mb-2 flex items-center">
                        <input
                            type="checkbox"
                            id="enable-comments"
                            name="enable-comments"
                            checked={shouldRecordStart}
                            onChange={() => setShouldRecordStart(!shouldRecordStart)}
                            className="appearance-none w-5 h-5 border border-gray-400 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                        />
                        <span className="text-sm ml-2">Record From Start (experimental)</span>
                    </label>}





                    {isLoading == true && <div className='text-white text-2xl mt-12'>
                        <div role="status">
                            <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>}

                    {!isLoading && <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                    >
                        Add Record Schedule
                    </button>}
                </form>





            </div>
            <div className="flex justify-center mt-8">
                <Link to={'/requests/' + username} className="text-white underline">
                    Back to Record Requests for {username}
                </Link>
            </div>
        </div>
    );
}

export default AddYoutuber;
