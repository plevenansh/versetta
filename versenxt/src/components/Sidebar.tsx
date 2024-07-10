
"use client"
import { Home, FileText, HardDrive, PenTool, Lightbulb, BarChart2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Home, label: 'Projects' },
  { icon: FileText, label: 'Tasks' },
  { icon: HardDrive, label: 'Storage' },
  { icon: PenTool, label: 'Scripting' },
  { icon: Lightbulb, label: 'Ideation' },
  { icon: BarChart2, label: 'Analyzer' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-white bg-opacity-20 backdrop-blur-lg rounded-r-3xl shadow-lg`}>
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h1 className="text-2xl font-bold text-white">Versetta</h1>}
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
      <ul className="space-y-2 p-4">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white hover:bg-opacity-20 ${collapsed ? 'p-2' : 'px-4 py-2'}`}
            >
              <item.icon className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-auto p-4">
        <Button variant="ghost" className="w-full text-white hover:bg-white hover:bg-opacity-20">
          <LogOut className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}