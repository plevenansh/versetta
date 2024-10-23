// components/FileBreadcrumb.tsx
import React from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from '../lib/utils';

interface BreadcrumbItem {
  id: number;
  name: string;
  path: string;
}

interface FileBreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
  className?: string;
}

export function FileBreadcrumb({
  items,
  onNavigate,
  className
}: FileBreadcrumbProps) {
  return (
    <nav className={cn("flex items-center space-x-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8"
        onClick={() => onNavigate('')}
      >
        <Home className="h-4 w-4" />
      </Button>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === items.length - 1 ? (
            <Button
              variant="ghost"
              size="sm"
              className="font-medium"
              disabled
            >
              {item.name}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {item.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {items
                  .slice(0, index + 1)
                  .map((menuItem) => (
                    <DropdownMenuItem
                      key={menuItem.id}
                      onClick={() => onNavigate(menuItem.path)}
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      {menuItem.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}