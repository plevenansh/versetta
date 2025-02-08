// components/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, SquareCheck,CircleCheckBig, Video,ChartSpline, Brush,PenTool,CalendarDays, Film,MessageCircleMore, NotebookPen, Folder, Tv, GalleryThumbnails, Database, NotepadTextDashed, MessageSquare, Clapperboard, BarChart2, Users, PanelRightOpen, PanelRightClose, Lock } from 'lucide-react';
import { Button } from "./ui/button"
import Image from 'next/image'

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  href: string;
  icon: React.ElementType;
  label: string;
  locked?: boolean;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const menuItems: MenuItem[] = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/projects', icon: Folder, label: 'Videos' },
    { href: '/tasks', icon: CircleCheckBig, label: 'Tasks' },
    { href: '/comments', icon: MessageSquare, label: 'Comments Analyser' },
    { href: '/storage', icon: Database, label: 'Storage'},
    { href: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { href: '/chat', icon: MessageCircleMore, label: 'Chat' , locked: true},
    { href: '/notes', icon: NotebookPen, label: 'Notes' , locked: true},
    { href: '/thumbnail', icon: GalleryThumbnails, label: 'Thumbnail Lab',locked: true},
    { href: '/analyzer', icon: ChartSpline, label: 'Analytics', locked: true },
    { href: '/script', icon: NotepadTextDashed, label: 'Script', locked: true },
    { href: '/production', icon: Clapperboard, label: 'AI  Production', locked: true },
    { href: '/platform', icon: Tv, label: 'Platforms' , locked: true},
    { href: '/editing', icon: Film, label: 'Editing', locked: true },
   
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out flex flex-col h-screen border-r`}>
      <div className="flex items-center justify-between p-4 h-14">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" passHref className="flex items-center">
            <Image
              src="/ver.png"
              alt="Versetta Logo"
              width={24}
              height={24}
              className="mr-1"
            />
            {!collapsed && <Image
      src="/verlongb.png"
      alt="Versetta Logo"
      width={130}
      height={24}
      className="hidden sm:block"
    />}
          </Link>
        </div>
        {!collapsed && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="hover:text-gray-900">
            <PanelRightOpen className="h-6 w-6" />
          </Button>
        )}
      </div>
      <div className="flex-grow space-y-1 p-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
            <Button
              variant="ghost"
              className={`w-full mb-[3px] justify-start font-semibold hover:bg-gray-200 hover:text-black ${
                collapsed ? 'px-2 py-2' : 'px-4 py-2'
              } ${isActive(item.href) ? 'bg-gray-200 text-gray-900' : ''} text-base relative`}
            >
              <item.icon className={`${collapsed ? 'mr-0' : 'mr-3'} h-6 w-6`} />
              {!collapsed && <span>{item.label}</span>}
              {item.locked && (
                <Lock className={`absolute right-2 h-4 w-4 ${collapsed ? 'top-1/2 -translate-y-1/2' : ''}`} />
              )}
            </Button>
          </Link>
        ))}
      </div>
      <div className="p-2 border-t border-gray-200">
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full mb-2 justify-center text-gray-600 hover:bg-gray-200"
          >
            <PanelRightClose className="h-6 w-6" />
          </Button>
        )}
        <Link href="/teams" passHref>
          <Button
            variant="ghost"
            className={`w-full justify-start hover:bg-gray-200 ${
              collapsed ? 'px-2 py-2 ml-1' : 'px-4 py-2'
            } ${isActive('/teams') ? 'bg-gray-200 text-gray-900' : ''} text-base`}
          >
            <Users className={`${collapsed ? 'mr-0' : 'mr-3'} h-6 w-6`} />
            {!collapsed && <span>Teams</span>}
          </Button>
        </Link>
      </div>
    </div>
  );
}


// 'use client'

// import * as React from 'react'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import Image from 'next/image'
// import { Home, SquareCheck, CircleCheckBig, Video, BarChartIcon as ChartSpline, Brush, PenTool, CalendarDays, Film, MessageCircleMore, NotebookPen, Folder, Tv, GalleryThumbnails, Database, NotepadTextDashed, MessageSquare, Clapperboard, BarChart2, Users, PanelRightOpen, PanelRightClose } from 'lucide-react'

// import { Button } from "@/components/ui/button"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
//   SidebarRail,
//   SidebarTrigger,
//   useSidebar,
// } from "@/components/ui/sidebar"

// const menuItems = [
//   { href: '/dashboard', icon: Home, label: 'Home' },
//   { href: '/projects', icon: Folder, label: 'Videos' },
//   { href: '/tasks', icon: CircleCheckBig, label: 'Tasks' },
//   { href: '/comments', icon: MessageSquare, label: 'Comments Analyser' },
//   { href: '/storage', icon: Database, label: 'Storage'},
//   { href: '/calendar', icon: CalendarDays, label: 'Calendar' },
//   { href: '/chat', icon: MessageCircleMore, label: 'Chat' },
//   { href: '/notes', icon: NotebookPen, label: 'Notes' },
//   { href: '/thumbnail', icon: GalleryThumbnails, label: 'Thumbnail Lab'},
//   { href: '/analyzer', icon: ChartSpline, label: 'Analytics' },
//   { href: '/script', icon: NotepadTextDashed, label: 'Script' },
//   { href: '/production', icon: Clapperboard, label: 'AI  Production' },
//   { href: '/platform', icon: Tv, label: 'Platforms' },
//   { href: '/editing', icon: Film, label: 'Editing' },
// ]

// export default function AppSidebar() {
//   const pathname = usePathname()
//   const { state, toggleSidebar } = useSidebar()

//   return (
//     <Sidebar collapsible="icon">
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" asChild>
//               <Link href="/dashboard" className="flex items-center">
//                 <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
//                   <Image
//                     src="/ver.png"
//                     alt="Versetta Logo"
//                     width={24}
//                     height={24}
//                   />
//                 </div>
//                 <div className="ml-2 flex flex-col gap-0.5 leading-none">
//                   <Image
//                     src="/verlongb.png"
//                     alt="Versetta Logo"
//                     width={130}
//                     height={24}
//                     className="hidden sm:block"
//                   />
//                 </div>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent>
//         <SidebarMenu>
//           {menuItems.map((item) => (
//             <SidebarMenuItem key={item.href}>
//               <SidebarMenuButton asChild isActive={pathname === item.href} className="text-lg">
//                 <Link href={item.href} className="flex items-center">
//                   <item.icon className="mr-3 h-7 w-7" />
//                   <span>{item.label}</span>
//                 </Link>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           ))}
//         </SidebarMenu>
//       </SidebarContent>
//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton asChild isActive={pathname === '/teams'} className="text-lg">
//               <Link href="/teams" className="flex items-center">
//                 <Users className="mr-3 h-7 w-7" />
//                 <span>Teams</span>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//   )
// }