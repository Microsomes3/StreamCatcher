import React,{useContext} from 'react';
import { Route, Routes, BrowserRouter, redirect } from 'react-router-dom';
import { Outlet, } from 'react-router';
import {AuthContext} from '../pages/auth/authwatch';


const PrivateRoute= ({component:ReactComponent,...rest})=>{

    const user = useContext(AuthContext);
    var isAuth = true;

    if (user === "---") {
       isAuth = false;
    }


    return isAuth == true ? <Outlet/> : <div className='h-screen bg-black text-white flex items-center justify-center'>sorry, invalid path. Try Logging In</div>
}

export default PrivateRoute;