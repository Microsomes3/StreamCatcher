import axios from 'axios';
import { useEffect, useState } from 'react';

function TYTable() {
  const [youtubers, setYoutubers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

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
      <div className='flex justify-between items-center h-6 pl-2 text-white ml-12 mr-12 bg-black rounded-tl-md rounded-tr-md'>
        <div>Current Youtubers Tracked</div>
        <button
          className='bg-black rounded-md  hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={handleRefresh}
        >
          Refresh
        </button>
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
            {youtubers.map((youtuber) => (
              <tr key={youtuber.username}>
                <td className='border px-4 py-2'>{youtuber.username}</td>
                <td className='border px-4 py-2' style={{ backgroundColor: youtuber.islive ? 'lightgreen' : 'lightred' }}>
                  {youtuber.islive ? <div className="w-4 h-4 rounded-full  mx-auto"></div> : <div className="w-4 h-4 rounded-full  mx-auto"></div>}
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
