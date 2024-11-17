// components/FileFilter.tsx
import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Search,
  SortAsc,
  SortDesc,
  Filter,
  X,
  Calendar,
  FileType,
} from 'lucide-react';

interface FileFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  fileType: string;
  onFileTypeChange: (value: string) => void;
  dateRange: { from?: Date; to?: Date } | null;
  onDateRangeChange: (range: { from?: Date; to?: Date } | null) => void;
  onReset: () => void;
  className?: string;
}


export function FileFilter({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  fileType,
  onFileTypeChange,
  dateRange,
  onDateRangeChange,
  onReset,
  className
}: FileFilterProps) {
  // Helper function to check if date range is active
  const hasDateRange = () => {
    return dateRange && (dateRange.from || dateRange.to);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="size">Size</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Select value={fileType} onValueChange={onFileTypeChange}>
          <SelectTrigger className="w-[160px]">
            <FileType className="h-4 w-4 mr-2" />
            <SelectValue placeholder="File type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={hasDateRange() ? 'secondary' : 'outline'}
          size="sm"
          className="space-x-2"
          onClick={() => {
            // Implement date range picker dialog
          }}
        >
          <Calendar className="h-4 w-4" />
          <span>Date Range</span>
        </Button>
        {(search || fileType !== 'all' || hasDateRange()) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
