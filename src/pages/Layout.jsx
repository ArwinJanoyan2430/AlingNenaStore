import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const Layout = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-2 w-full">
          <Outlet />
        </div>
      </main>

    </div>
  )
}

export default Layout;