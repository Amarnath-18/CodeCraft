import React from 'react'
import AppRoutes from './Routes/appRoutes'
import UserProvider from './context/user.context'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <UserProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <AppRoutes/>
    </UserProvider>
  )
}

export default App