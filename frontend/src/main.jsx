import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import './App.css'
import NavigationComp from './comps/Nav/defaultnav'
import Home from './pages/home/home'
import SignUp from './pages/auth/signup'
import DashboardHome from './pages/dashboard/home'

import ViewRecordRequests from './pages/admin/viewRecordRequests/viewRequests'
import AddYoutuber from './pages/admin/addYoutuberToTrack/addyoutuber'
import AddRecordRequest from './pages/admin/addRecordRequest/addRecordRequest'
import ViewAllRecordings from './pages/admin/viewRecordings/viewRecordings'

import ViewGlobalStatuses from './pages/admin/viewglobalstatuses/viewStatuses'

import { AuthProvider } from './pages/auth/authwatch'

import PrivateRoute from './routes/privateRouter'


import { Route, Routes, BrowserRouter } from 'react-router-dom';


ReactDOM.createRoot(document.getElementById('root')).render(
  <>
  <AuthProvider>
    <NavigationComp></NavigationComp>

    <BrowserRouter>
      <Routes>
      <Route  path='/' element={<Home />} />
      <Route path='/auth' element={<SignUp />} />
      <Route path='/dashboard' element={<DashboardHome></DashboardHome>} ></Route>
      <Route path='/requests/:username' element={<ViewRecordRequests></ViewRecordRequests>} />
      <Route path='/addyoutuber' element={<AddYoutuber></AddYoutuber>} />
      <Route path='/addrecordrequest/:username' element={<AddRecordRequest></AddRecordRequest>} />
      <Route path='/viewrecordings/:rqid/:username' element={<ViewAllRecordings></ViewAllRecordings>} />
      <Route path='/status/:date' element={<ViewGlobalStatuses></ViewGlobalStatuses>} />
      <Route path='/status' element={<ViewGlobalStatuses></ViewGlobalStatuses>} />
      <Route path='/recordings/:username/:filter' element={<ViewAllRecordings></ViewAllRecordings>} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>

  </>,

)
