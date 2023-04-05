import React, { useEffect, useState } from 'react';
import { Elements, useStripe } from '@stripe/react-stripe-js'




function AddonForm() {

    // alert(import.meta.env.VITE_STRIPE_PUB);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("prcessing payment");
    }

    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    return (
        <div className='border-2 bg-gray-900 h-screen flex  justify-center rounded-md m-2'>
            <div className='flex items-center flex-col mt-12'>
                <input type='text' className='border-2 w-full rounded-md m-2 p-2' placeholder='Add-on Name' />
                <form onSubmit={(e)=>handleSubmit(e)} className='border-2 w-96 flex flex-col  rounded-md'>
                    <input type='submit' value='Add' className='bg-gray-800 text-white rounded-md ' />

                </form>
            </div>
        </div>
    )
}

export default AddonForm