import React,{useState, useContext, useEffect} from 'react';

import { AuthContext } from '../../../../pages/auth/authwatch';

import {app} from '../../../../assets/fb';

import { getFirestore,getDocs, collection } from 'firebase/firestore';


function Track() {


    const fb = getFirestore(app);
    

    return (
        <div>
            hi welcome to track
        </div>
    )
}

export default Track;