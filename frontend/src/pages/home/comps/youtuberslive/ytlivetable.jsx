import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


function TYTable() {
  const [youtubers, setYoutubers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [tableSortMode, setTableSortMode] = useState('live');
  

  const [filteredYoutubers, setFilteredYoutubers] = useState([]);

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

    if(tableSortMode === 'live'){
      const filteredLive = allLive.filter((youtuber) => {
        return youtuber.username.toLowerCase().includes(searchTerm.toLowerCase());
      });
     setFilteredYoutubers(filteredLive)
    }else if(tableSortMode === 'offline'){

      const filteredOffline = allOffline.filter((youtuber) => {
        return youtuber.username.toLowerCase().includes(searchTerm.toLowerCase());
      });

      setFilteredYoutubers(filteredOffline)
    }


    //filter by search term

   


  
  }, [tableSortMode, youtubers, searchTerm])


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
      .get('https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatuses')
      .then((data) => {
        const sortedData = data.data['youtubers'].sort((a, b) => b.islive - a.islive);
        setYoutubers(sortedData);
        setIsLoading(false);
      });
  }, []);

  const handleRefresh = () => {

    setYoutubers([]);
    setIsLoading(true);

    axios
      .get('https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatuses')
      .then((data) => {
        const sortedData = data.data['youtubers'].sort((a, b) => b.islive - a.islive);
        setYoutubers(sortedData);
        setIsLoading(false);
      });
  };

  return (
    <div className=' mt-6 pb-24'>



      <div className='flex mt-6  justify-end space-x-3  items-center h-6 pl-2 text-white ml-12 mr-12 bg-black rounded-tl-md rounded-tr-md'>       

      <button className='hidden md:block bg-black rounded-md z-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={() => { setAutoRefresh(!autoRefresh) }}>AutoRefresh:{autoRefresh ? 'On' : 'Off'}</button>

      </div>





      <div className=' px-5  rounded-md'>
        <input className='w-full h-12 pl-2 text-black  rounded-md' type='text' placeholder='Search... @griffin' onChange={(event) => { setSearchTerm(event.target.value); }} />
      </div>

      <div className='flex'>


      <div className='p-12'>
          <Link to='/addyoutuber'><button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>
            Add Youtuber
          </button></Link>
        </div>
        <div className='p-12'>
          <button onClick={(e)=> handleRefresh()} className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>
            Refresh
          </button>
        </div>

        

       


      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-6 pl-2 text-white ml-12 mr-12 bg-black rounded-bl-md rounded-br-md'>
          <div className='animate animate-spin'>Loading</div>
        </div>
      ) : (
        <div className='flex hidden justify-center items-center h-6 pl-2 text-white ml-12 mr-12 bg-black rounded-bl-md rounded-br-md'>
          <div></div>
        </div>
      )}

      

      <div className='overflow-x-auto ml-12 mr-12'>

     
   

  <div className='flex space-x-3'>
    <button className={`bg-black rounded-md z-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${tableSortMode === 'live' ? 'bg-blue-700' : ''}`} onClick={() => { setTableSortMode('live') }}>Live</button>
    <button className={`bg-black rounded-md z-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${tableSortMode === 'offline' ? 'bg-blue-700' : ''}`} onClick={() => { setTableSortMode('offline') }}>Offline</button>
  </div>
  

        

        <div class="overflow-x-auto">
  <table class="table-auto w-full">
          <thead>
            <tr className='overflow-none'>
              <th className='px-4 py-2' style={{ width: '33.33%' }}>
                Name
              </th>
              <th className='px-4 py-2' style={{ width: '33.33%' }}>
                Live
              </th>
             
              <th className='px-4 py-2' style={{ width: '10.33%' }}>
                Last Updated
              </th>

              <th className='px-4 py-2' style={{ width: '10.33%' }}>
                Record Requests 
              </th>

            </tr>
          </thead>
          <tbody>
            {filteredYoutubers.map((youtuber) => (
              <tr key={youtuber.username}>
                <td className='border px-4 py-2 underline'>
                  <Link to={'/requests/' + youtuber.username} >{youtuber.username}</Link>
                </td>
                <td className='border px-4 py-2'>
                  <div className={`w-4 h-4 rounded-full mx-auto ${youtuber.islive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </td>
             
                <td>
                  <div className='border px-4 py-2 text-center'>{youtuber.lastUpdated}</div>
                </td>

                <td>
                  <div className='border text-white px-4 py-2 text-center'>
                    {youtuber.recordRequests} requests
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default TYTable;
