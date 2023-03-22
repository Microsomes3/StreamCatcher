import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


function TYTable() {
  const [youtubers, setYoutubers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);


  // Filter the youtubers array based on the search term
  const filteredYoutubers = youtubers.filter((youtuber) => {
    return youtuber.username.toLowerCase().includes(searchTerm.toLowerCase());
  });


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
    <div className='w-full mt-6'>

      <div className='flex  justify-end space-x-3  items-center h-6 pl-2 text-white ml-12 mr-12 bg-black rounded-tl-md rounded-tr-md'>
        <div className='flex-grow pl-2'>Current Youtubers Tracked</div>
        <button
          className='bg-black rounded-md z-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={handleRefresh}
        >
          Refresh
        </button>

        <button className='bg-black rounded-md z-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={() => { setAutoRefresh(!autoRefresh) }}>AutoRefresh:{autoRefresh ? 'On' : 'Off'}</button>

      </div>





      <div className='h-12 bg-red-300 ml-12 mr-12 rounded-md'>
        <input className='w-full h-full p-2' type='text' placeholder='Search...' onChange={(event) => { setSearchTerm(event.target.value); }} />
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-6 pl-2 text-white ml-12 mr-12 bg-black rounded-bl-md rounded-br-md'>
          <div>Loading...</div>
        </div>
      ) : (
        <div className='flex hidden justify-center items-center h-6 pl-2 text-white ml-12 mr-12 bg-black rounded-bl-md rounded-br-md'>
          <div></div>
        </div>
      )}

      <div className='overflow-x-auto ml-12 mr-12'>

        <div className='p-12'>
          <Link to='/addyoutuber'><button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>
            Add Youtuber
          </button></Link>
        </div>

        <div className='p-12'>
          <p className='text-sm'>Tip: Click on youtuber to open all record requests</p>
        </div>

        <table className='table-auto w-full' style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className='overflow-none'>
              <th className='px-4 py-2' style={{ width: '33.33%' }}>
                Name
              </th>
              <th className='px-4 py-2' style={{ width: '33.33%' }}>
                Live
              </th>
              <th className='px-4 py-2' style={{ width: '33.33%' }}>
                Link
              </th>
              <th className='px-4 py-2' style={{ width: '10.33%' }}>
                Last Updated
              </th>

            </tr>
          </thead>
          <tbody>
            {filteredYoutubers.map((youtuber) => (
              <tr key={youtuber.username}>
                <td className='border px-4 py-2'>
                  <Link to={'/requests/' + youtuber.username} >{youtuber.username}</Link>
                </td>
                <td className='border px-4 py-2'>
                  <div className={`w-4 h-4 rounded-full mx-auto ${youtuber.islive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </td>
                <td className='border flex items-center justify-center px-4 py-2'>
                  <a href={youtuber.link} target='_blank' rel='noreferrer'>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                      Visit Video
                    </button>
                  </a>
                </td>
                <td>
                  <div className='border px-4 py-2 text-center'>{youtuber.lastUpdated}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TYTable;
