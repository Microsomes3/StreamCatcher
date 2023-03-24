import { Fragment } from 'react';
import YTTable from './comps/youtuberslive/ytlivetable';

function Home() {
  return (
    <Fragment>
      <div className='bg-black text-white flex flex-col'>
        <div className='px-5 py-6 text-center text-2xl mt-3'>
          If you would like to add a channel, or a callback please login or sign up.
        </div>

        <div className=' border-white md:mx-6 md:my-6 rounded-md'>
        <YTTable />
        </div>
      </div>
    </Fragment>
  );
}

export default Home;
