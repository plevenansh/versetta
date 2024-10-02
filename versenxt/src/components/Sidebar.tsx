import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, SquareCheck, Video, CalendarDays, Film, NotebookPen, Folder, Tv, GalleryThumbnails, Database, NotepadTextDashed, MessageSquare, Clapperboard, BarChart2, Users, PanelRightOpen, PanelRightClose, Lock } from 'lucide-react';
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
    { href: '/tasks', icon: SquareCheck, label: 'Tasks' },
    { href: '/comments', icon: MessageSquare, label: 'Comments' },
    { href: '/storage', icon: Database, label: 'Storage', locked: true },
    { href: '/production', icon: Clapperboard, label: 'Production' },
    { href: '/analyzer', icon: BarChart2, label: 'Analyzer', locked: true },
    { href: '/storage', icon: NotepadTextDashed, label: 'Script', locked: true },
    { href: '/production', icon: GalleryThumbnails, label: 'Thumbnail', locked: true },
    { href: '/platform', icon: Tv, label: 'Platforms' , locked: true},
    { href: '/storage', icon: CalendarDays, label: 'Calendar' },
    { href: '/analyzer', icon: Film, label: 'Editing', locked: true },
    { href: '/production', icon: NotebookPen, label: 'Production Notes' , locked: true},
    { href: '/videos', icon: Video, label: 'Shooting' , locked: true},
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out flex flex-col h-screen border-r`}>
      <div className="flex items-center justify-between p-4 h-14">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" passHref className="flex items-center">
            <Image
              src="/ver.png"
              alt="Versetta Logo"
              width={28}
              height={28}
              className="mr-1"
            />
            {!collapsed && <h1 className="text-2xl font-bold cursor-pointer">Versetta</h1>}
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