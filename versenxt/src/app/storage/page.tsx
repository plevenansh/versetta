"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Folder, File, Upload, Download, Star, Play, Image as ImageIcon, Video, Clock, RefreshCw, Search, Settings, AlertTriangle, Trash2 } from 'lucide-react'

export default function StoragePage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [autoBackup, setAutoBackup] = useState(true)

  useEffect(() => {
    toast({
      title: "Development in Progress",
      description: "This page contains dummy content. The full feature set is currently under development.",
      duration: 5000,
    })
  }, [toast])

  const dummyFiles = [
    { name: "Intro_v2.mp4", type: "video", size: "15 MB", lastModified: "2 days ago" },
    { name: "Thumbnail_Template.psd", type: "image", size: "5 MB", lastModified: "1 week ago" },
    { name: "Background_Music.mp3", type: "audio", size: "8 MB", lastModified: "3 days ago" },
    { name: "Script_Draft.docx", type: "document", size: "1 MB", lastModified: "1 day ago" },
  ]

  return (
    <div className="w-full max-w-full p-2 sm:p-4 md:p-6 space-y-6">
      <Alert variant="default" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Development in Progress</AlertTitle>
        <AlertDescription>
          This page contains dummy content for demonstration purposes. The full feature set is currently under active development.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#2f66dd]">Creator Storage Hub</h1>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Storage Overview</CardTitle>
            <CardDescription>Monitor and manage your storage usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Used Space</span>
                <span>755 GB / 1 TB</span>
              </div>
              <Progress value={75.5} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-semibold">Videos</div>
                  <div className="text-muted-foreground">523 GB</div>
                </div>
                <div>
                  <div className="font-semibold">Images</div>
                  <div className="text-muted-foreground">130 GB</div>
                </div>
                <div>
                  <div className="font-semibold">Other</div>
                  <div className="text-muted-foreground">108 GB</div>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button className="flex-1">
                  <Upload className="mr-2 h-4 w-4" /> Upload Files
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" /> Download All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Star className="mr-2 h-4 w-4" /> Favorites
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" /> Recent
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <RefreshCw className="mr-2 h-4 w-4" /> Sync Status
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" /> Trash
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team-assets">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="team-assets">Team Assets</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="frequently-used">Frequently Used</TabsTrigger>
        </TabsList>
        <TabsContent value="team-assets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Assets</CardTitle>
              <CardDescription>Shared resources for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Brand Guidelines', 'Logo Pack', 'Channel Art', 'Sound Effects', 'Stock Footage', 'Fonts', 'Color Palettes', 'Templates'].map((folder) => (
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center" key={folder}>
                      <Folder className="h-8 w-8 mb-2" />
                      <span className="text-sm text-center">{folder}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Your video projects and related files</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Summer Vlog Series', 'Product Review: Tech Gadgets', 'Cooking Show: Season 2', 'Travel Diaries: Europe', 'Gaming Highlights', 'DIY Crafts Tutorials', 'Fitness Challenge'].map((project) => (
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center" key={project}>
                      <Folder className="h-8 w-8 mb-2" />
                      <span className="text-sm text-center">{project}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="media" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thumbnails</CardTitle>
                <CardDescription>Custom thumbnails for your videos</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <div key={i} className="aspect-video bg-muted rounded-md flex items-center justify-center relative group">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="secondary" size="sm">Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Videos</CardTitle>
                <CardDescription>Your uploaded and processed videos</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {['Summer_Vlog_Ep1.mp4', 'Tech_Review_Laptop.mp4', 'Cooking_Show_Pasta.mp4', 'Europe_Travel_Paris.mp4', 'Gaming_Stream_Highlights.mp4', 'DIY_Craft_Tutorial.mp4', 'Fitness_Workout_Routine.mp4'].map((video) => (
                      <div key={video} className="flex items-center justify-between space-x-2 p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4" />
                          <span className="text-sm">{video}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="frequently-used" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Frequently Used Assets</CardTitle>
                <CardDescription>Quick access to your most-used files</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Channel_Logo.png', 'Intro_Music.mp3', 'Outro_Template.mp4', 'Green_Screen_BG.mp4', 'Transition_Effect.mov', 'Soundbite_Applause.mp3', 'Lower_Third.png', 'Endscreen_Template.psd'].map((asset) => (
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center" key={asset}>
                        <File className="h-6 w-6 mb-2" />
                        <span className="text-xs text-center">{asset}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Intro/Outro</CardTitle>
                <CardDescription>Manage your video openings and closings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="mr-2 h-4 w-4" /> Standard Intro (0:15)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="mr-2 h-4 w-4" /> Short Intro (0:05)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="mr-2 h-4 w-4" /> Standard Outro (0:20)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="mr-2 h-4 w-4" /> Sponsor Outro (0:30)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Backup & Sync</CardTitle>
          <CardDescription>Manage your data backup and synchronization settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Last Backup: 2 days ago</h3>
                <p className="text-sm text-muted-foreground">Next scheduled backup: Tomorrow at 02:00 AM</p>
              </div>
              <Button>
                <RefreshCw className="mr-2 h-4 w-4" /> Backup Now
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
              <Label htmlFor="auto-backup">Enable automatic backups</Label>
            </div>
            <div>
              <Label htmlFor="backup-frequency" className="mb-2 block">Backup Frequency (days)</Label>
              <Slider
                id="backup-frequency"
                max={30}
                defaultValue={[7]}
                step={1}
                className="w-[60%]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
          <CardDescription>Your most recently modified files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dummyFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                <div className="flex items-center space-x-4">
                  {file.type === 'video' && <Video className="h-4 w-4" />}
                  {file.type === 'image' && <ImageIcon className="h-4 w-4" />}
                  {file.type === 'audio' && <Play className="h-4 w-4" />}
                  {file.type === 'document' && <File className="h-4 w-4" />}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size} • Modified {file.lastModified}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



// 'use client'

// import * as React from 'react'
// import {
//   Activity,
//   Building2,
//   ChevronDown,
//   Code2,
//   Cog,
//   FileKey,
//   FolderGit2,
//   Globe,
//   Home,
//   KeyRound,
//   LayoutDashboard,
//   Link2,
//   LogOut,
//   PaintBucket,
//   Settings,
//   Shield,
//   Users,
//   Webhook,
// } from 'lucide-react'
// import Link from 'next/link'

// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from '@/components/ui/collapsible'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { Progress } from '@/components/ui/progress'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubItem,
//   SidebarMenuSubButton,
//   SidebarProvider,
//   SidebarTrigger,
// } from '@/components/ui/sidebar'

// export default function Component() {
//   const [environment, setEnvironment] = React.useState('production')

//   return (
//     <SidebarProvider>
//       <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
//         <Sidebar className="hidden border-r lg:block">
//           <SidebarHeader>
//             <div className="flex items-center gap-2 px-4 py-2">
//               <Shield className="h-6 w-6" />
//               <h2 className="text-lg font-semibold">Versetta</h2>
//             </div>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <Select
//                   defaultValue={environment}
//                   onValueChange={(value) => setEnvironment(value)}
//                 >
//                   <SelectTrigger className="w-full">
//                     <Globe className="mr-2 h-4 w-4" />
//                     <SelectValue placeholder="Select environment" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="production">Production</SelectItem>
//                     <SelectItem value="staging">Staging</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarHeader>
//           <SidebarContent>
//             <SidebarGroup>
//               <SidebarGroupLabel>Overview</SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton asChild>
//                       <Link href="#home">
//                         <Home className="h-4 w-4" />
//                         <span>Home</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                   <SidebarMenuItem>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <SidebarMenuButton>
//                           <Building2 className="h-4 w-4" />
//                           <span>Organizations</span>
//                           <ChevronDown className="ml-auto h-4 w-4" />
//                         </SidebarMenuButton>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent>
//                         <DropdownMenuItem>View Organizations</DropdownMenuItem>
//                         <DropdownMenuItem>Create New Organization</DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </SidebarMenuItem>
//                   <SidebarMenuItem>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <SidebarMenuButton>
//                           <Users className="h-4 w-4" />
//                           <span>Users</span>
//                           <ChevronDown className="ml-auto h-4 w-4" />
//                         </SidebarMenuButton>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent>
//                         <DropdownMenuItem>View Users</DropdownMenuItem>
//                         <DropdownMenuItem>Create New User</DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </SidebarMenuItem>
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//             <SidebarGroup>
//               <SidebarGroupLabel>Configuration</SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   <Collapsible>
//                     <CollapsibleTrigger asChild>
//                       <SidebarMenuButton>
//                         <KeyRound className="h-4 w-4" />
//                         <span>Authentication</span>
//                         <ChevronDown className="ml-auto h-4 w-4" />
//                       </SidebarMenuButton>
//                     </CollapsibleTrigger>
//                     <CollapsibleContent>
//                       <SidebarMenuSub>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Hosted UI</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Methods</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Others</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                       </SidebarMenuSub>
//                     </CollapsibleContent>
//                   </Collapsible>
//                   <Collapsible>
//                     <CollapsibleTrigger asChild>
//                       <SidebarMenuButton>
//                         <Shield className="h-4 w-4" />
//                         <span>Roles</span>
//                         <ChevronDown className="ml-auto h-4 w-4" />
//                       </SidebarMenuButton>
//                     </CollapsibleTrigger>
//                     <CollapsibleContent>
//                       <SidebarMenuSub>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Permissions</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Roles</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Admin Portal Roles</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                       </SidebarMenuSub>
//                     </CollapsibleContent>
//                   </Collapsible>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton asChild>
//                       <Link href="#directory-sync">
//                         <FolderGit2 className="h-4 w-4" />
//                         <span>Directory Sync</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton asChild>
//                       <Link href="#audit-logs">
//                         <Activity className="h-4 w-4" />
//                         <span>Audit Logs</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                   <Collapsible>
//                     <CollapsibleTrigger asChild>
//                       <SidebarMenuButton>
//                         <Code2 className="h-4 w-4" />
//                         <span>FGA</span>
//                         <ChevronDown className="ml-auto h-4 w-4" />
//                       </SidebarMenuButton>
//                     </CollapsibleTrigger>
//                     <CollapsibleContent>
//                       <SidebarMenuSub>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Get Started</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Overview</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Schema</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Resources</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Check</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Query</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Events</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                       </SidebarMenuSub>
//                     </CollapsibleContent>
//                   </Collapsible>
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//             <SidebarGroup>
//               <SidebarGroupLabel>Customization</SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   <Collapsible>
//                     <CollapsibleTrigger asChild>
//                       <SidebarMenuButton>
//                         <PaintBucket className="h-4 w-4" />
//                         <span>Branding</span>
//                         <ChevronDown className="ml-auto h-4 w-4" />
//                       </SidebarMenuButton>
//                     </CollapsibleTrigger>
//                     <CollapsibleContent>
//                       <SidebarMenuSub>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>AuthKit</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Email</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                         <SidebarMenuSubItem>
//                           <SidebarMenuSubButton>Admin Portal</SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                       </SidebarMenuSub>
//                     </CollapsibleContent>
//                   </Collapsible>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton asChild>
//                       <Link href="#domains">
//                         <Globe className="h-4 w-4" />
//                         <span>Domains</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//             <SidebarGroup>
//               <SidebarGroupLabel>Developer</SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton asChild>
//                       <Link href="#redirects">
//                         <Link2 className="h-4 w-4" />
//                         <span>Redirects</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton asChild>
//                       <Link href="#api-keys">
//                         <FileKey className="h-4 w-4" />
//                         <span>API Keys</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton asChild>
//                       <Link href="#webhooks">
//                         <Webhook className="h-4 w-4" />
//                         <span>Webhooks</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton asChild>
//                       <Link href="#events">
//                         <Activity className="h-4 w-4" />
//                         <span>Events</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//           </SidebarContent>
//           <SidebarFooter>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild>
//                   <Link href="#settings">
//                     <Settings className="h-4 w-4" />
//                     <span>Settings</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarFooter>
//         </Sidebar>
//         <div className="flex flex-col">
//           <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
//             <SidebarTrigger />
//             <div className="flex-1">
//               <h1 className="text-lg font-semibold">Dashboard</h1>
//             </div>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   className="flex h-8 w-8 items-center justify-center rounded-full"
//                 >
//                   <img
//                     src="/placeholder.svg"
//                     width="32"
//                     height="32"
//                     className="rounded-full"
//                     alt="Avatar"
//                   />
//                   <span className="sr-only">Toggle user menu</span>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem>Settings</DropdownMenuItem>
//                 <DropdownMenuItem>Support</DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>
//                   Logout
//                   <LogOut className="ml-2 h-4 w-4" />
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </header>
//           <main  className="flex-1 space-y-4 p-8 pt-6">
//             {/* Main content goes here */}
//           </main>
//         </div>
//       </div>
//     </SidebarProvider>
//   )
// }