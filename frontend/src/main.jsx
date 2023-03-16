import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import NavigationComp from './comps/Nav/defaultnav'
import Home from './pages/home/home'
import SignUp from './pages/auth/signup'
import DashboardHome from './pages/dashboard/home'

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
      </Routes>
    </BrowserRouter>
    </AuthProvider>

  </>,

)
