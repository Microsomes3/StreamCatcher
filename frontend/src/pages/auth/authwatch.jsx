import React, { useEffect, useState } from 'react';
import axios from 'axios';

const onAuthStateChanged = (auth, cb) => {

}

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {


    const [currentUser, setCurrentUser] = useState('---');

    useEffect(() => {

        const token = localStorage.getItem("token")

        if (token) {
            try {
                axios.get("https://21tk2wt1ye.execute-api.us-east-1.amazonaws.com/dev/me", {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }).catch((err)=>{
                    console.log(err);
                    console.log("----");
                }).then((data) => {
                    const {id,email}=(data.data.user);
                    console.log(id,email);
                    setCurrentUser([email, id]);
                })
            } catch (err) {
                console.log(err);
                console.log("----");
             }
        }


        //check if logged in
        // console.log(auth);
        // if(auth){
        //     setCurrentUser([auth.email, auth.uid]);
        // }else{
        //     setCurrentUser('---');
        // }

    }, [])

    return (
        <AuthContext.Provider
            value={currentUser}
        >
            {children}
        </AuthContext.Provider>
    )

}

