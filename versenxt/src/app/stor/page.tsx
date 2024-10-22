'use client'

import React, { useState, useEffect } from 'react';
import { trpc } from '../../utils/trpc';
import { CommentSection } from 'react-comments-section';
import 'react-comments-section/dist/index.css';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";

interface Project {
  id: number;
  title: string;
  mainStages: Array<{
    id: number;
    name: string;
    subStages: Array<{
      id: number;
      name: string;
    }>;
  }>;
}

interface Comment {
  comId: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  text: string;
  replies: Comment[];
}

const CommentPage = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedMainStageId, setSelectedMainStageId] = useState<number | null>(null);
  const [selectedSubStageId, setSelectedSubStageId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const { data: user } = trpc.users.getUser.useQuery();
  const { data: userTeams } = trpc.users.getUserTeams.useQuery();
  const { data: projects, refetch: refetchProjects } = trpc.projects.getByTeamId.useQuery(
    selectedTeamId || -1,
    { enabled: !!selectedTeamId }
  );
  const { data: mentionableUsers } = trpc.comments.getMentionableUsers.useQuery(
    selectedProjectId || -1,
    { enabled: !!selectedProjectId }
  );

  const createCommentMutation = trpc.comments.create.useMutation();
  const updateCommentMutation = trpc.comments.update.useMutation();
  const deleteCommentMutation = trpc.comments.delete.useMutation();

  useEffect(() => {
    if (selectedProjectId) {
      fetchComments();
    }
  }, [selectedProjectId, selectedMainStageId, selectedSubStageId]);

  const fetchComments = async () => {
    if (selectedProjectId) {
      const fetchedComments = await trpc.comments.getByProject.query({
        projectId: selectedProjectId,
        mainStageId: selectedMainStageId || undefined,
        subStageId: selectedSubStageId || undefined,
      });
      setComments(transformComments(fetchedComments));
    }
  };

  const transformComments = (apiComments: any[]): Comment[] => {
    return apiComments.map(comment => ({
      comId: comment.id.toString(),
      userId: comment.author.id.toString(),
      fullName: comment.author.user.name,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.user.name)}`,
      text: comment.content,
      replies: comment.replies ? transformComments(comment.replies) : [],
    }));
  };

  const handleAddComment = async (text: string, parentId: string | null) => {
    if (!selectedProjectId) return;

    try {
      await createCommentMutation.mutateAsync({
        content: text,
        projectId: selectedProjectId,
        mainStageId: selectedMainStageId || undefined,
        subStageId: selectedSubStageId || undefined,
        parentId: parentId ? parseInt(parentId) : undefined,
      });
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (text: string, commentId: string) => {
    try {
      await updateCommentMutation.mutateAsync({
        id: parseInt(commentId),
        content: text,
      });
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(parseInt(commentId));
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Comments Section</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={selectedTeamId?.toString() || undefined}
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
              {userTeams?.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTeamId && (
            <Select
              value={selectedProjectId?.toString() || undefined}
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

          {selectedProjectId && (
            <Select
              value={selectedMainStageId?.toString() || undefined}
              onValueChange={(value) => {
                setSelectedMainStageId(Number(value));
                setSelectedSubStageId(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Main Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Main Stages</SelectItem>
                {projects?.find(p => p.id === selectedProjectId)?.mainStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id.toString()}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedMainStageId && (
            <Select
              value={selectedSubStageId?.toString() || undefined}
              onValueChange={(value) => setSelectedSubStageId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Sub-Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sub-Stages</SelectItem>
                {projects?.find(p => p.id === selectedProjectId)?.mainStages
                  .find(s => s.id === selectedMainStageId)?.subStages.map((subStage) => (
                    <SelectItem key={subStage.id} value={subStage.id.toString()}>
                      {subStage.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          {selectedProjectId && (
            <CommentSection
              currentUser={{
                currentUserId: user?.id.toString() || '',
                currentUserFullName: user?.name || '',
                currentUserProfilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}`
              }}
              commentData={comments}
              onSubmitAction={(data: { text: string, parentOfCommentId: string | null }) => {
                handleAddComment(data.text, data.parentOfCommentId);
              }}
              onEditAction={(data: { text: string, comId: string }) => {
                handleEditComment(data.text, data.comId);
              }}
              onDeleteAction={(data: { comIdToDelete: string }) => {
                handleDeleteComment(data.comIdToDelete);
              }}
              currentData={(data) => {
                console.log('current data', data);
              }}
              logIn={{
                loginLink: '/login',
                signupLink: '/signup'
              }}
              customNoComment={() => <div>No comments yet. Be the first to comment!</div>}
              inputStyle={{ border: '1px solid #00000020', borderRadius: '8px' }}
              formStyle={{ backgroundColor: 'white' }}
              submitBtnStyle={{ backgroundColor: '#4a90e2', color: 'white' }}
              cancelBtnStyle={{ border: '1px solid gray', backgroundColor: 'white', color: 'black' }}
              replyInputStyle={{ borderBottom: '1px solid black', color: 'black' }}
              advancedInput={true}
              enableMentions={true}
              mentionUsers={mentionableUsers?.map(user => ({
                id: user.id.toString(),
                displayName: user.name,
                profilePictureUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
              })) || []}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentPage;