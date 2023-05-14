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
import ViewAllRecordings from './pages/admin/viewRecordingsForRequests/viewRecordings'

import ViewGlobalStatuses from './pages/admin/viewglobalstatuses/viewStatuses'

import ViewAllRecordingsByUsername from './pages/admin/viewAllRecordingsUsername/viewAllRecordingsUsername'

import LandingPage from './pages/landing/landing'

import BillingAddForm from './pages/dashboard/billingpage/addonForm';

import { AuthProvider } from './pages/auth/authwatch'

import PrivateRoute from './routes/privateRouter'


import { Route, Routes, BrowserRouter } from 'react-router-dom';

import Play from './pages/playaround/play'


ReactDOM.createRoot(document.getElementById('root')).render(
  <>
  <AuthProvider>
    <NavigationComp></NavigationComp>

    <BrowserRouter>
      <Routes>
      <Route  path='/' element={<LandingPage />} />

      <Route path='/play' element={<Play />} />
      
      <Route element={<PrivateRoute/>}>
        <Route path='/dashboard' element={<Home />} />
        <Route path='/requests/:username' element={<ViewRecordRequests></ViewRecordRequests>} />
      <Route path='/addchannel/:platform' element={<AddYoutuber></AddYoutuber>} />
      <Route path='/addrecordrequest/:username' element={<AddRecordRequest></AddRecordRequest>} />
      <Route path='/viewrecordings/:rqid/:username' element={<ViewAllRecordings></ViewAllRecordings>} />
      <Route path='/status/:date' element={<ViewGlobalStatuses></ViewGlobalStatuses>} />
      <Route path='/status' element={<ViewGlobalStatuses></ViewGlobalStatuses>} />
      <Route path='/recordings/:username/:filter' element={<ViewAllRecordingsByUsername></ViewAllRecordingsByUsername>} />
      <Route path='/billing/addon' element={<BillingAddForm></BillingAddForm>} />
      </Route>

      <Route path='/auth' element={<SignUp />} />
      {/* <Route path='/dashboard' element={<DashboardHome></DashboardHome>} ></Route> */}
      {/* <Route path='/dashboard/:comp' element={<DashboardHome></DashboardHome>} ></Route> */}
      {/* <Route path='/dashboard/:comp/:section' element={<DashboardHome></DashboardHome>} ></Route> */}
    
      </Routes>
    </BrowserRouter>
    </AuthProvider>

  </>,

)
