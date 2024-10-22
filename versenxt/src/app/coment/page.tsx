"use client";
import React, { useState,useCallback , useEffect } from 'react';
import { trpc } from '../../utils/trpc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { MessageCircle, Reply, Send, ChevronUp, ChevronDown, Edit, Trash } from 'lucide-react';

interface Team {
  id: number;
  name: string;
}

interface Project {
  id: number;
  title: string;
}

interface MainStage {
  id: number;
  name: string;
}

interface SubStage {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  profilePictureUrl?: string;
}

interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  mentions: User[];
  replies: Comment[];
  depth: number;
  subStageName?: string;
}

const CommentPage: React.FC = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedMainStageId, setSelectedMainStageId] = useState<number | null>(null);
  const [selectedSubStageId, setSelectedSubStageId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const { data: teams } = trpc.users.getUserTeams.useQuery();
  const { data: projects } = trpc.projects.getByTeamId.useQuery(selectedTeamId || -1, {
    enabled: !!selectedTeamId
  });
  const { data: projectDetails } = trpc.projectPage.getProjectDetails.useQuery(selectedProjectId || -1, {
    enabled: !!selectedProjectId
  });
  const { data: mentionableUsers } = trpc.comments.getMentionableUsers.useQuery(selectedProjectId || -1, {
    enabled: !!selectedProjectId
  });
  
  const { data: commentsData, refetch: refetchComments } = trpc.comments.getByProject.useQuery({
    projectId: selectedProjectId || -1,
    mainStageId: selectedMainStageId || null,
    subStageId: selectedSubStageId || null,
  }, {
    enabled: !!selectedProjectId
  });

  const { data: currentUser } = trpc.users.getUser.useQuery();

  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => refetchComments()
  });

  const updateCommentMutation = trpc.comments.update.useMutation({
    onSuccess: () => refetchComments()
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => refetchComments()
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const formatComment = useCallback((comment: any, depth: number = 0): Comment => {
    return {
      id: comment.id.toString(),
      author: {
        id: comment.author.id,
        name: comment.author.user.name,
        profilePictureUrl: comment.author.user.profilePictureUrl,
      },
      content: comment.content,
      createdAt: formatTimeAgo(comment.createdAt),
      mentions: comment.mentions.map((mention: any) => ({
        id: mention.teamMember.id,
        name: mention.teamMember.user.name,
      })),
      replies: comment.replies ? comment.replies.map((reply: any) => formatComment(reply, depth + 1)) : [],
      depth,
      subStageName: comment.subStage?.name,
    };
  }, []);

  useEffect(() => {
    if (commentsData) {
      const formattedComments = commentsData.map(comment => formatComment(comment));
      setComments(formattedComments);
    }
  }, [commentsData, formatComment]);

  const handleAddComment = (content: string, parentId?: string) => {
    createCommentMutation.mutate({
      content,
      projectId: selectedProjectId!,
      mainStageId: selectedMainStageId || undefined,
      subStageId: selectedSubStageId || undefined,
      parentId: parentId ? parseInt(parentId) : undefined,
      mentions: extractMentions(content),
    });
    setNewComment('');
    setReplyingTo(null);
  };

  const handleUpdateComment = (commentId: string, newContent: string) => {
    updateCommentMutation.mutate({
      id: parseInt(commentId),
      content: newContent,
      mentions: extractMentions(newContent),
    });
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(parseInt(commentId));
    }
  };

  const extractMentions = (text: string): number[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = text.match(mentionRegex) || [];
    return mentions
      .map(mention => {
        const user = mentionableUsers?.find(u => u.name === mention.slice(1));
        return user ? user.id : null;
      })
      .filter((id): id is number => id !== null);
  };

  const toggleExpanded = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, isLastChild: boolean) => {
    const isExpanded = expandedComments.has(comment.id);
    const hasChildren = comment.replies.length > 0;
    const isEditing = editingCommentId === comment.id;

    return (
      <div key={comment.id} className="relative">
        <div className={`mb-4 ${comment.depth > 0 ? 'ml-8' : ''}`}>
          {comment.depth > 0 && (
            <div 
              className="absolute left-0 w-6 border-l-2 border-gray-200"
              style={{
                top: '0',
                bottom: isLastChild ? '50%' : '0',
                borderBottomLeftRadius: isLastChild ? '8px' : '0'
              }}
            />
          )}
          <div className="flex items-start space-x-4 relative">
            {comment.depth > 0 && (
              <div 
                className="absolute left-[-24px] top-4 w-6 border-t-2 border-gray-200"
              />
            )}
            <Avatar>
              <AvatarImage src={comment.author.profilePictureUrl} alt={comment.author.name} />
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{comment.author.name}</span>
                <span className="text-sm text-muted-foreground">{comment.createdAt}</span>
                {comment.subStageName && (
                  <Badge variant="outline">{comment.subStageName}</Badge>
                )}
              </div>
              {isEditing ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="mb-2"
                />
              ) : (
                <p>{comment.content}</p>
              )}
              {comment.mentions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {comment.mentions.map((mention) => (
                    <Badge key={mention.id} variant="secondary">@{mention.name}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center space-x-2 mt-2">
                {!isEditing && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)}>
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    {hasChildren && (
                      <Button variant="ghost" size="sm" onClick={() => toggleExpanded(comment.id)}>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        {isExpanded ? 'Collapse' : `Show Replies (${comment.replies.length})`}
                      </Button>
                    )}
                    {currentUser?.id === comment.author.id && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditContent(comment.content);
                        }}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </>
                )}
                {isEditing && (
                  <>
                    <Button size="sm" onClick={() => handleUpdateComment(comment.id, editContent)}>
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingCommentId(null);
                      setEditContent('');
                    }}>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
              {replyingTo === comment.id && (
                <div className="mt-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a reply..."
                    className="mb-2"
                  />
                  <Button size="sm" onClick={() => handleAddComment(newComment, comment.id)}>
                    <Send className="h-4 w-4 mr-1" />
                    Send Reply
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="ml-8">
            {comment.replies.map((reply, index) => renderComment(reply, index === comment.replies.length - 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Comment Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          <Select
              value={selectedTeamId?.toString()}
              onValueChange={(value) => {
                setSelectedTeamId(Number(value));
                setSelectedProjectId(null);
                setSelectedMainStageId(null);
                setSelectedSubStageId(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team: Team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTeamId && (
              <Select
                value={selectedProjectId?.toString()}
                onValueChange={(value) => {
                  setSelectedProjectId(Number(value));
                  setSelectedMainStageId(null);
                  setSelectedSubStageId(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project: Project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedProjectId && projectDetails?.mainStages && (
              <Select
                value={selectedMainStageId?.toString()}
                onValueChange={(value) => {
                  setSelectedMainStageId(Number(value));
                  setSelectedSubStageId(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Main Stage" />
                </SelectTrigger>
                <SelectContent>
                  {projectDetails.mainStages.map((stage: MainStage) => (
                    <SelectItem key={stage.id} value={stage.id.toString()}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedMainStageId && projectDetails?.mainStages && (
              <Select
                value={selectedSubStageId?.toString()}
                onValueChange={(value) => setSelectedSubStageId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sub Stage" />
                </SelectTrigger>
                <SelectContent>
                  {projectDetails.mainStages
                    .find((stage: MainStage) => stage.id === selectedMainStageId)
                    ?.subStages.map((subStage: SubStage) => (
                      <SelectItem key={subStage.id} value={subStage.id.toString()}>
                        {subStage.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProjectId && currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Comments</span>
              <Badge variant="secondary">{projectDetails?.title}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {comments.map((comment, index) => renderComment(comment, index === comments.length - 1))}
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Use @ to mention someone
                </div>
                <Button onClick={() => handleAddComment(newComment)}>
                  <Send className="h-4 w-4 mr-1" />
                  Post Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommentPage;