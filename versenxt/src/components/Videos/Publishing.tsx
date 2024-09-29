import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { trpc } from '../../trpc/client';

interface PublishingProps {
  project: {
    id: number;
    title: string;
    description: string | null;
    // Add other project properties as needed
  };
}

export default function Publishing({ project }: PublishingProps) {
  const [publishDetails, setPublishDetails] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'How-to & Style',
    commentsEnabled: true,
    publishDate: '',
    notifySubscribers: true,
    isPremiere: false,
  });

  const utils = trpc.useUtils();
  const { data: currentPublishDetails, isLoading, error } = trpc.projectPage.getProjectDetails.useQuery(project.id);

  const updatePublishDetailsMutation = trpc.projectPage.updatePublishDetails.useMutation({
    onSuccess: () => {
      utils.projectPage.getProjectDetails.invalidate(project.id);
    }
  });

  useEffect(() => {
    if (currentPublishDetails) {
      setPublishDetails({
        title: currentPublishDetails.title || '',
        description: currentPublishDetails.description || '',
        tags: currentPublishDetails.keywords?.map(k => k.word).join(', ') || '',
        category: currentPublishDetails.publishDetails?.platform || 'How-to & Style',
        commentsEnabled: true, // Assuming this is not stored in the backend
        publishDate: currentPublishDetails.publishDetails?.publishDate || '',
        notifySubscribers: true, // Assuming this is not stored in the backend
        isPremiere: false, // Assuming this is not stored in the backend
      });
    }
  }, [currentPublishDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPublishDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setPublishDetails(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    try {
      await updatePublishDetailsMutation.mutateAsync({
        projectId: project.id,
        publishDate: publishDetails.publishDate,
        platform: publishDetails.category,
        status: 'scheduled', // You might want to make this dynamic
      });
      // Handle successful update
    } catch (error) {
      console.error('Failed to update publish details:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
              <Input 
                id="title" 
                name="title"
                placeholder="Enter video title" 
                value={publishDetails.title}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="Enter video description" 
                className="min-h-[100px]" 
                value={publishDetails.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-muted-foreground mb-1">Tags</label>
              <Input 
                id="tags" 
                name="tags"
                placeholder="Enter tags separated by commas" 
                value={publishDetails.tags}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
              <select 
                className="w-full border rounded p-2"
                name="category"
                value={publishDetails.category}
                onChange={handleInputChange}
              >
                <option>How-to & Style</option>
                <option>Food & Drink</option>
                <option>Education</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="comments-enabled" 
                checked={publishDetails.commentsEnabled}
                onCheckedChange={handleSwitchChange('commentsEnabled')}
              />
              <label htmlFor="comments-enabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Enable comments
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input 
                type="datetime-local" 
                name="publishDate"
                value={publishDetails.publishDate}
                onChange={handleInputChange}
              />
              <Button onClick={handleSave}>Schedule</Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="notify-subscribers" 
                checked={publishDetails.notifySubscribers}
                onCheckedChange={handleSwitchChange('notifySubscribers')}
              />
              <label htmlFor="notify-subscribers" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Notify subscribers
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="premiere" 
                checked={publishDetails.isPremiere}
                onCheckedChange={handleSwitchChange('isPremiere')}
              />
              <label htmlFor="premiere" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Set as premiere
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cross-Platform Sharing</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-4">
                {[
                  { platform: "Twitter", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/></svg> },
                  { platform: "Facebook", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg> },
                  { platform: "Instagram", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg> },
                  { platform: "LinkedIn", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                  { platform: "TikTok", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.platform}</span>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">Share Now</Button>
        </CardContent>
      </Card>
    </div>
  )
}