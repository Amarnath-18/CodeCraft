import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { UserContext } from '../context/user.context'

const Layout = () => {

  return (
    <div>
        <Navbar/>
        <div className='pt-16'>
            <Outlet/>
        </div>
        
    </div>
  )
}

export default Layout
