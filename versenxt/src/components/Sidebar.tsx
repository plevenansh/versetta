import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, HardDrive, MessageSquare, Settings, BarChart2, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-white shadow-md flex flex-col h-screen`}>
      <div className="flex items-center justify-between p-4">
      {!collapsed && (
          <Link href="/" passHref>
            <h1 className="text-2xl font-bold text-gray-800 cursor-pointer">Versetta</h1>
          </Link>
        )}
         <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
      <div className="flex-grow space-y-4 p-4 overflow-y-auto">

      <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <Link href="/" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? 'p-2' : 'px-4 py-2'} ${isActive('/') ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                <Home className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
                {!collapsed && <span>Home</span>}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <Link href="/projects" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? 'p-2' : 'px-4 py-2'} ${isActive('/projects') ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                <Home className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
                {!collapsed && <span>Projects</span>}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <Link href="/tasks" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? 'p-2' : 'px-4 py-2'} ${isActive('/tasks') ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                <FileText className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
                {!collapsed && <span>Tasks</span>}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <Link href="/comments" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? 'p-2' : 'px-4 py-2'} ${isActive('/comments') ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                <MessageSquare className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
                {!collapsed && <span>Comments</span>}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <Link href="/storage" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? 'p-2' : 'px-4 py-2'} ${isActive('/storage') ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                <HardDrive className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
                {!collapsed && <span>Storage</span>}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <Link href="/production" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? 'p-2' : 'px-4 py-2'} ${isActive('/production') ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                <Settings className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
                {!collapsed && <span>Production</span>}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <Link href="/analyzer" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? 'p-2' : 'px-4 py-2'} ${isActive('/analyzer') ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                <BarChart2 className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
                {!collapsed && <span>Analyzer</span>}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <div className="p-4 flex justify-center">
        <Card className="shadow-sm hover:shadow-md transition-shadow w-full">
          <CardContent className="p-0">
            <Button variant="ghost" className="w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <LogOut className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
              {!collapsed && <span>Logout</span>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}