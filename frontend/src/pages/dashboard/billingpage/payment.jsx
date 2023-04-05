import { useEffect, useState } from "react";

import { loadStripe } from "@stripe/stripe-js";


function payment(props){
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);

    useEffect(()=>{
        setStripePromise(loadStripe(import.meta.env.VITE_STRIPE_PUB));
    },[])

    return (
        <>
            <h1>react payment element</h1>
        </>
    )
}