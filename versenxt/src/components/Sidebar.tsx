import { Home, FileText, HardDrive, MessageSquare, Settings, BarChart2, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const menuItems = [
  { icon: Home, label: 'Projects' },
  { icon: FileText, label: 'Tasks' },
  { icon: HardDrive, label: 'Storage' },
  { icon: MessageSquare, label: 'Comments' },
  { icon: Settings, label: 'Production' },
  { icon: BarChart2, label: 'Analyzer' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-white shadow-md flex flex-col h-screen`}>
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h1 className="text-2xl font-bold text-gray-800">Versetta</h1>}
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
      <div className="flex-grow space-y-4 p-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? 'p-2' : 'px-4 py-2'}`}
              >
                <item.icon className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </CardContent>
          </Card>
        ))}
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