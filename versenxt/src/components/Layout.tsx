"use client"

import { useState } from 'react'
import Appbar from './Appbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
    <div className="flex flex-col h-screen">
      <Appbar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-grow p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}