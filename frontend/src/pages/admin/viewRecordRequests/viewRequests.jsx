
import React,{useEffect,useState} from 'react'

import {useParams} from 'react-router-dom'

import axios from 'axios'


function recordRequests(){

    const {username} = useParams()

    const [allRequests,setAllRequests] = useState([])


    useEffect(()=>{
        
        axios.get(`https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getRecordRequests?username=${username}`)
        .then((data)=>{
            console.log(data);
        })
    },[])


    return (
        <div>
            hi
        </div>
    )
}


export default recordRequests