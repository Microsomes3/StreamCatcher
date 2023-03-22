import {} from 'react';

import  YTTable from './comps/youtuberslive/ytlivetable'

function Home(){
    return (
        <div className='bg-black text-white flex flex-col'>
            
            <div className='ml-12 text-center text-2xl mt-3'>
                If you would like to add a channel, or a callback please login or sign up.
            </div>
            
            <YTTable></YTTable>

        </div>
    )
}



export default Home