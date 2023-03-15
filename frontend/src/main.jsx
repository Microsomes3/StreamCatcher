import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import NavigationComp from './comps/Nav/defaultnav'

import SignUp from './pages/auth/signup'


import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";


const router = createBrowserRouter([
  {
    path:"/",
    element: <div>Home</div>
  },
  {
    path:"/signup",
    element:<SignUp></SignUp>
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
  <NavigationComp></NavigationComp>
    <RouterProvider router={router}></RouterProvider>
  </>,
)
