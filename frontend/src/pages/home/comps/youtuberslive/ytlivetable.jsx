import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import "./yt.css";

import VideoCarosel from '../../../../comps/videoCarosel/caro';


function TYTable() {
  const [youtubers, setYoutubers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [tableSortMode, setTableSortMode] = useState('live');
  const [filteredYoutubers, setFilteredYoutubers] = useState([]);
  const [platformSelected, setPlatformSelected] = useState('youtube');
  const [newFilteredStreams, setNewFilteredStreams] = useState([]);

  // Filter the youtubers array based on the search term
  // const filteredYoutubers = youtubers.filter((youtuber) => {
  //   return youtuber.username.toLowerCase().includes(searchTerm.toLowerCase());
  // });


  useEffect(() => {

    const sortedYoutubers = [...youtubers];


    const allLive = sortedYoutubers.filter((youtuber) => {
      return youtuber.islive === true;
    });

    const allOffline = sortedYoutubers.filter((youtuber) => {
      return youtuber.islive === false;
    });

    if (tableSortMode === 'live') {
      const filteredLive = allLive.filter((youtuber) => {
        return youtuber.username.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredYoutubers(filteredLive)
    } else if (tableSortMode === 'offline') {

      const filteredOffline = allOffline.filter((youtuber) => {
        return youtuber.username.toLowerCase().includes(searchTerm.toLowerCase());
      });

      setFilteredYoutubers(filteredOffline)
    }


    //filter by search term





  }, [tableSortMode, youtubers, searchTerm])


  useEffect(()=>{
    const newT = filteredYoutubers.filter((youtuber) => {
      return youtuber.type === platformSelected;
    });

    setNewFilteredStreams(newT)
  },[filteredYoutubers, platformSelected])

  //sort by isLive



  //filter by total record requests

  const filteredYoutubersRecordRequests = filteredYoutubers.sort((a, b) => b.recordRequests - a.recordRequests);

  const totalRecordRequests = filteredYoutubersRecordRequests.reduce((acc, youtuber) => {
    return acc + youtuber.recordRequests;
  }, 0);

  useEffect(() => {

    const interval = setInterval(() => {
      if (autoRefresh) {
        handleRefresh()
      }
    }, 30000)

    return () => clearInterval(interval);
  })



  useEffect(() => {
    axios
      .get('https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatuses',{
        headers:{
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
      })
      .then((data) => {
        console.log(data.data.youtubers);
        const sortedData = data.data['youtubers'].sort((a, b) => b.islive - a.islive);

        console.log(">>",sortedData);
        setYoutubers(data.data.youtubers);
        setIsLoading(false);
      });
  }, []);

  const handleRefresh = () => {

    setYoutubers([]);
    setIsLoading(true);

    axios
      .get('https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatuses',{
        headers:{
          'Authorization' : 'Bearer ' + localStorage.getItem('token'),
        }
      })
      .then((data) => {
        const sortedData = data.data['youtubers'].sort((a, b) => b.islive - a.islive);
        setYoutubers(sortedData);
        setIsLoading(false);
      });
  };

  return (
    <div className=' mt-6 pb-24'>
      <div className="mt-6 pb-24 rounded-md">

        {/* <VideoCarosel></VideoCarosel> */}


        <div className="flex justify-between px-4 mb-6">
          <button
            className="block bg-black rounded-md z-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded md:hidden"
            onClick={() => { setAutoRefresh(!autoRefresh) }}
          >
            AutoRefresh: {autoRefresh ? 'On' : 'Off'}
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => handleRefresh()}
          >
            Refresh
          </button>
        </div>


        <div className="px-4 mb-6 flex space-x-3">
          <Link to="/addchannel/youtube">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md w-full transition-colors duration-300">
              Add Youtuber Channel
            </button>
          </Link>

          <Link to="/addchannel/twitch">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md w-full transition-colors duration-300">
              Add Twitch Channel
            </button>
          </Link>
        </div>

        <div className="px-4">
          <div className="flex justify-between mb-4">
            <button
              className={`bg-black rounded-md z-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/2 mr-1 ${tableSortMode === 'live' ? 'bg-blue-700' : ''}`}
              onClick={() => { setTableSortMode('live') }}
            >
              Live
            </button>
            <button
              className={`bg-black rounded-md z-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/2 ml-1 ${tableSortMode === 'offline' ? 'bg-blue-700' : ''}`}
              onClick={() => { setTableSortMode('offline') }}
            >
              Offline
            </button>
          </div>

          <div className="px-4 mb-6">
            <input
              className="w-full h-12 px-4  rounded-md text-white bg-gray-800"
              type="text"
              placeholder="Search... @griffin"
              onChange={(event) => { setSearchTerm(event.target.value) }}
            />
          </div>

          <select
            class="w-full h-12 px-4 rounded-md text-white bg-gray-800 mb-4 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600"
            onChange={(event) => { setPlatformSelected(event.target.value) }}
          >
            <option value="youtube">All Youtubers</option>
            <option value="twitch">All Twitch</option>
          </select>


          {isLoading ? (
            <div className="flex justify-center items-center h-6 text-white bg-black rounded-md mb-4">
              <div className="animate animate-spin">Loading</div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newFilteredStreams.map((youtuber) => (
              <Link
                className=""
                to={`/requests/${youtuber.username}`}
                key={youtuber.username}
              >
                <div className="cursor-pointer hover:bg-gray-700 hover:scale-90 bg-gray-800 rounded-md shadow mb-4">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <Link
                      to={`/requests/${youtuber.username}`}
                      className="font-bold space-x-3 flex text-blue-500"
                    >
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src="https://via.placeholder.com/150x150.png?text=Youtube+Icon"
                        alt="Youtube Channel"
                      />
                      <p>{youtuber.username}</p>
                    </Link>
                    <div
                      className={`w-4 h-4 rounded-full ${youtuber.islive ? "bg-green-500" : "bg-red-500"
                        }`}
                    ></div>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <div>Last Updated:</div>
                    <div>{youtuber.lastUpdated}</div>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <div>Platform:</div>
                    <div>
                      {youtuber.type === "youtube" &&
                        <img src='https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png?20220706172052'
                          className="h-8 w-8 rounded-full object-cover logo-img"
                          alt="Youtube Channel"
                        />
                      }

                      {youtuber.type === "twitch" &&
                        <img src='https://www.freepnglogos.com/uploads/purple-twitch-logo-png-18.png'
                          className="h-8 w-8 rounded-full object-cover logo-img"
                          alt="Twitch Channel"
                        />
                      }
                    </div>
                  </div>

                  <div className="px-4 py-3 flex justify-between">
                    <div>Record Requests:</div>
                    <div className="text-white bg-black rounded-md px-3 py-1">
                      {youtuber.recordRequests} record requests
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-b-md overflow-hidden"></div>
                </div>
              </Link>
            ))}


                {newFilteredStreams.length===0 && <div className='bg-gray-800 w-full cursor-pointer px-12 py-12 rounded-md'>
                  no results for {platformSelected}, why not add a twitch or youtube channel?
                  </div>}
            
          </div>

        </div>
      </div>
















    </div>
  );
}

export default TYTable;
