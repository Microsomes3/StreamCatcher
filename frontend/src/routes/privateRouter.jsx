import React,{useContext} from 'react';
import { Route, Routes, BrowserRouter, redirect } from 'react-router-dom';


const PrivateRoute= ({component:ReactComponent,...rest})=>{
    const currentUser = useContext(AuthContext);
    return (
        <Route
            {...rest}
            render={routeProps=>{
                return currentUser ? <ReactComponent {...routeProps} /> : <redirect to="/auth" />
            }}
        />
    )
}

export default PrivateRoute;