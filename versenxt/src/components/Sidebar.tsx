import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, SquareCheck, Folder, Database, MessageSquare, Clapperboard, BarChart2, Menu, Users } from 'lucide-react';
import { Button } from "@/components/ui/button"

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/projects', icon: Folder, label: 'Projects' },
    { href: '/tasks', icon: SquareCheck, label: 'Tasks' },
    { href: '/comments', icon: MessageSquare, label: 'Comments' },
    { href: '/storage', icon: Database, label: 'Storage' },
    { href: '/production', icon: Clapperboard, label: 'Production' },
    { href: '/analyzer', icon: BarChart2, label: 'Analyzer' },
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out bg-[#f8f8f8] flex flex-col h-screen border-r border-gray-200`}>
      <div className="flex items-center p-4 pl-2 mt-[1px] h-14 ">
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-gray-600 hover:text-gray-900">
          <Menu className="h-6 w-6" />
        </Button>
        {!collapsed && (
          <Link href="/" passHref>
            <h1 className="ml-2 text-2xl font-bold text-gray-800 cursor-pointer">Versetta</h1>
          </Link>
        )}
      </div>
      <div className="flex-grow space-y-1 p-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
            <Button
              variant="ghost"
              className={`w-full mb-[6px] justify-start text-gray-600 hover:bg-gray-200 ${
                collapsed ? 'px-2 py-2' : 'px-4 py-2'
              } ${isActive(item.href) ? 'bg-gray-200 text-gray-900' : ''} text-base`}
            >
              <item.icon className={`${collapsed ? 'mr-0' : 'mr-3'} h-6 w-6`} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          </Link>
        ))}
      </div>
      <div className="p-2 border-t border-gray-200">
        <Link href="/teams" passHref>
          <Button
            variant="ghost"
            className={`w-full justify-start text-gray-600 hover:bg-gray-200 ${
              collapsed ? 'px-2 py-2' : 'px-4 py-2'
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