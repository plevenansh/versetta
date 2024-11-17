"use client"

import { useState } from 'react'
import Appbar from './Appbar'
import Sidebar from './Sidebar'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex flex-col flex-grow">
        <Appbar collapsed={sidebarCollapsed} />
        <main className="flex-grow p-6 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  )
}
// // components/layout.tsx
// "use client"

// import { ReactNode } from 'react'
// import Appbar from './Appbar'
// import Sidebar from './Sidebar'
// import { SidebarProvider } from '@/components/ui/sidebar'

// interface LayoutProps {
//   children: ReactNode
// }

// export default function Layout({ children }: LayoutProps) {
//   return (
//     <SidebarProvider>
//       <div className="flex h-screen">
//         <Sidebar />
//         <div className="flex flex-col flex-grow">
//           <Appbar />
//           <main className="flex-grow p-6 overflow-auto">
//             {children}
//           </main>
//         </div>
//       </div>
//     </SidebarProvider>
//   )
// }