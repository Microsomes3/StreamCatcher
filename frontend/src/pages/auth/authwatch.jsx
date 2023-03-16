import React,{useEffect,useState} from 'react';
import {app} from '../../assets/fb'
import { onAuthStateChanged, getAuth } from 'firebase/auth'

export const AuthContext = React.createContext();

export const AuthProvider = ({children})=>{

    const auth = getAuth(app);

    const [currentUser,setCurrentUser] = useState('---');

    useEffect(()=>{
        onAuthStateChanged(auth,(auth)=>{
            //check if logged in
            console.log(auth);
            if(auth){
                setCurrentUser([auth.email, auth.uid]);
            }else{
                setCurrentUser('---');
            }
        })
        
    },[])

    return (
        <AuthContext.Provider
            value={currentUser}
        >
            {children}
        </AuthContext.Provider>
    )

}