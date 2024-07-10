
"use client"
import { Home, FileText, HardDrive, PenTool, Lightbulb, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: Home, label: 'Projects' },
  { icon: FileText, label: 'Tasks' },
  { icon: HardDrive, label: 'Storage' },
  { icon: PenTool, label: 'Scripting' },
  { icon: Lightbulb, label: 'Ideation' },
]

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-3xl font-bold text-blue-500">Versetta</h1>
      </div>
      <ul className="flex flex-col py-4">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Button
              variant="ghost"
              className="w-full justify-start text-lg font-medium transition-colors duration-150 hover:bg-gray-100 hover:text-blue-500"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-auto mb-4 px-4">
        <Button variant="outline" className="w-full" onClick={() => console.log('Logout')}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  )
}