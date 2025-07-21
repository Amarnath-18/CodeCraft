import React from 'react'
import {Route  , Routes , BrowserRouter} from 'react-router-dom'
import Home from '../components/Home'
import Register from '../components/Register'
import Login from '../components/Login'
import ProjectPage from '../components/ProjectPage'
import Layout from '../components/Layout'
const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes >
            <Route path='/' element={<Layout/>} >
              <Route index element={<Home/>} />
              <Route path='/login' element={<Login/>} />
              <Route path='/register' element={<Register/>} />
              <Route path='/project' element={<ProjectPage/>} />
            </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes