
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import ProjectCard from './ProjectCard'
import TaskList from './TaskList'

export default function Dashboard() {
  return (
    // <div className="p-6 space-y-6">
    //   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    //     <Card>
    //       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    //         <CardTitle className="text-sm font-medium">Videos in Production</CardTitle>
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           viewBox="0 0 24 24"
    //           fill="none"
    //           stroke="currentColor"
    //           strokeLinecap="round"
    //           strokeLinejoin="round"
    //           strokeWidth="2"
    //           className="h-4 w-4 text-muted-foreground"
    //         >
    //           <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5" />
    //           <path d="M9 21h6" />
    //           <path d="M12 17v4" />
    //           <path d="M3 12h18" />
    //         </svg>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="text-2xl font-bold">12</div>
    //         <p className="text-xs text-muted-foreground">+2 from last week</p>
    //       </CardContent>
    //     </Card>
    //     <Card>
    //       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    //         <CardTitle className="text-sm font-medium">Views on Last Video</CardTitle>
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           viewBox="0 0 24 24"
    //           fill="none"
    //           stroke="currentColor"
    //           strokeLinecap="round"
    //           strokeLinejoin="round"
    //           strokeWidth="2"
    //           className="h-4 w-4 text-muted-foreground"
    //         >
    //           <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    //         </svg>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="text-2xl font-bold">54,231</div>
    //         <p className="text-xs text-muted-foreground">+20% from last video</p>
    //       </CardContent>
    //     </Card>
    //     <Card>
    //       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    //         <CardTitle className="text-sm font-medium">Next Project Progress</CardTitle>
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           viewBox="0 0 24 24"
    //           fill="none"
    //           stroke="currentColor"
    //           strokeLinecap="round"
    //           strokeLinejoin="round"
    //           strokeWidth="2"
    //           className="h-4 w-4 text-muted-foreground"
    //         >
    //           <path d="M12 2v20" />
    //           <path d="M2 12h20" />
    //         </svg>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="text-2xl font-bold">68%</div>
    //         <Progress value={68} className="mt-2" />
    //       </CardContent>
    //     </Card>
    //   </div>
    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
    //   <div className="space-y-4">
    //     <ProjectCard
    //       name="Summer Vlog Series"
    //       currentStage="Editing"
    //       percentageDone={75}
    //       expectedPublishDate="2024-07-15"
    //       expanded={true}
    //     />
    //     <ProjectCard
    //       name="Product Review: New Tech Gadgets"
    //       currentStage="Shooting"
    //       percentageDone={30}
    //       expectedPublishDate="2024-07-22"
    //       expanded={false}
    //     />
    //     <ProjectCard
    //       name="Travel Documentary: Hidden Gems"
    //       currentStage="Scripting"
    //       percentageDone={15}
    //       expectedPublishDate="2024-08-05"
    //       expanded={false}
    //     />
    //   </div>
    //   <TaskList />
    // </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {/* Project cards */}
        <ProjectCard
          name="Summer Vlog Series"
          currentStage="Editing"
          percentageDone={75}
          expectedPublishDate="2024-07-15"
          expanded={true}
        />
        {/* Add more ProjectCard components as needed */}
      </div>
      <div className="md:col-span-1">
        <TaskList />
      </div>
    </div>
  )
}