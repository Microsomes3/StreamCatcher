import { BeakerIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

import Home from './components/home'

function Play() {

    const [active, setActive] = useState('home')

  return (
    <div className="  mt-12">
      <div className='flex justify-center space-x-12 bg-black h-24 rounded-md mx-12 shadow-lg'>
     
      <div onClick={(e)=>{
        setActive('home')
      }} className='bg-hover cursor-pointer hover:border-2 hover:scale-75 rounded-md h-full flex flex-col w-24 justify-center  items-center'>
        <BeakerIcon width={30} color='purple' className={active =="home" ? 'animate animate-pulse' : ''}/>
        <p className='text-white pt-2 font-bold text-sm '>Home</p>
      </div>

      <div onClick={(e)=>{
        setActive('stream')
      }} className='h-full bg-hover cursor-pointer hover:border-2 hover:scale-75 rounded-md flex flex-col w-24 justify-center  items-center'>
      <BeakerIcon width={30} color='red' className={active =="stream" ? 'animate animate-pulse' : ''}/>
        <p className='text-white pt-2 font-bold text-sm '>Stream</p>
      </div>

     
        </div>
        <div className='pl-12'>
            
            {active=="home" &&  <Home/>}
            {active=="stream" &&  <Home/>}
        </div>


    </div>
  );
}


export default Play;