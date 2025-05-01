import React from 'react'
import Navbar from './_components/Navbar'
import Footer from './_components/Footer'

const MainLayout = ({ children }) => {
  return (
    <div className=''>
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}

export default MainLayout
