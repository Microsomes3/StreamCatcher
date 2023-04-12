import { Fragment } from 'react';
import YTTable from './comps/youtuberslive/ytlivetable';

function Home() {
  return (
    <Fragment>
      <div className='bg-gray-900 px-12  text-white flex flex-col'>
 

        <div className=' border-white md:mx-6 md:my-6 rounded-md'>
        <YTTable />
        </div>
      </div>
    </Fragment>
  );
}

export default Home;
