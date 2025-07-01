import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  formatDate, 
  formatRelativeTime, 
  getProgressPercentage, 
  getStatusColor, 
  getStatusLabel,
  getDueDateUrgency,
  getUrgencyColor,
  getUrgencyLabel
} from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  Flag,
  StickyNote
} from "lucide-react";
import type { Paper, Milestone, Note, ProgressEntry } from "@shared/schema";

export function PaperDetail() {
  const { id } = useParams();
  const paperId = parseInt(id as string);
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: paper, isLoading: paperLoading } = useQuery<Paper>({
    queryKey: ["/api/papers", paperId],
  });

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones", paperId],
    queryFn: () => fetch(`/api/milestones?paperId=${paperId}`, { credentials: "include" }).then(res => res.json()),
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes", paperId],
    queryFn: () => fetch(`/api/notes?paperId=${paperId}`, { credentials: "include" }).then(res => res.json()),
  });

  const { data: progressEntries = [], isLoading: progressLoading } = useQuery<ProgressEntry[]>({
    queryKey: ["/api/progress", paperId],
    queryFn: () => fetch(`/api/progress?paperId=${paperId}`, { credentials: "include" }).then(res => res.json()),
  });

  const completeMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      const response = await apiRequest("PUT", `/api/milestones/${milestoneId}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones", paperId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Milestone completed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete milestone",
        variant: "destructive",
      });
    },
  });

  if (paperLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Paper not found</h3>
            <p className="text-gray-500">The paper you're looking for doesn't exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = getProgressPercentage(paper.currentWordCount, paper.targetWordCount);
  const statusColor = getStatusColor(paper.status);
  const statusLabel = getStatusLabel(paper.status);
  const completedMilestones = milestones.filter(m => m.completed);
  const pendingMilestones = milestones.filter(m => !m.completed);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{paper.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>{paper.category}</span>
            <Badge className={statusColor}>{statusLabel}</Badge>
            {paper.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due: {formatDate(paper.dueDate)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Progress
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Description */}
                {paper.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{paper.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Writing Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Word Count</span>
                          <span>{paper.currentWordCount.toLocaleString()} / {paper.targetWordCount.toLocaleString()} words</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-sm text-gray-500 mt-1">{progress}% complete</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {progressLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-12" />
                        ))}
                      </div>
                    ) : progressEntries.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No progress entries yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {progressEntries.slice(0, 5).map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {entry.wordsWritten} words • {entry.timeSpent} minutes
                              </p>
                              {entry.description && (
                                <p className="text-sm text-gray-600">{entry.description}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(entry.date)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Milestones</CardTitle>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Milestone
                  </Button>
                </CardHeader>
                <CardContent>
                  {milestonesLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : milestones.length === 0 ? (
                    <div className="text-center py-8">
                      <Flag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No milestones set yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {milestones.map((milestone) => {
                        const urgency = getDueDateUrgency(milestone.dueDate);
                        const urgencyColor = getUrgencyColor(urgency);
                        const urgencyLabel = getUrgencyLabel(urgency);
                        
                        return (
                          <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => completeMilestoneMutation.mutate(milestone.id)}
                                disabled={milestone.completed || completeMilestoneMutation.isPending}
                              >
                                <CheckCircle className={`h-4 w-4 ${milestone.completed ? 'text-green-500' : 'text-gray-400'}`} />
                              </Button>
                              <div>
                                <p className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {milestone.title}
                                </p>
                                {milestone.description && (
                                  <p className="text-sm text-gray-600">{milestone.description}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Due: {formatDate(milestone.dueDate)}
                                </p>
                              </div>
                            </div>
                            {!milestone.completed && (
                              <Badge className={urgencyColor}>{urgencyLabel}</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Notes</CardTitle>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </CardHeader>
                <CardContent>
                  {notesLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                      ))}
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-8">
                      <StickyNote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No notes yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{note.title}</h4>
                            <div className="flex items-center space-x-2">
                              {note.section && (
                                <Badge variant="outline">{note.section}</Badge>
                              )}
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                          <p className="text-xs text-gray-500">
                            Updated {formatRelativeTime(note.updatedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Progress Entries</CardTitle>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Entry
                  </Button>
                </CardHeader>
                <CardContent>
                  {progressLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : progressEntries.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No progress entries yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {progressEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="flex items-center space-x-4 mb-1">
                              <span className="font-medium text-gray-900">
                                {entry.wordsWritten.toLocaleString()} words
                              </span>
                              <span className="text-sm text-gray-600">
                                {entry.timeSpent} minutes
                              </span>
                            </div>
                            {entry.description && (
                              <p className="text-sm text-gray-600">{entry.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(entry.date)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(entry.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Progress</span>
                </div>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Milestones</span>
                </div>
                <span className="font-medium">{completedMilestones.length}/{milestones.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <StickyNote className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Notes</span>
                </div>
                <span className="font-medium">{notes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Entries</span>
                </div>
                <span className="font-medium">{progressEntries.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingMilestones.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming milestones</p>
              ) : (
                <div className="space-y-3">
                  {pendingMilestones.slice(0, 3).map((milestone) => {
                    const urgency = getDueDateUrgency(milestone.dueDate);
                    const urgencyColor = getUrgencyColor(urgency);
                    const urgencyLabel = getUrgencyLabel(urgency);
                    
                    return (
                      <div key={milestone.id} className={`p-3 rounded-lg border ${urgencyColor}`}>
                        <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                        <p className="text-xs text-gray-500">{urgencyLabel}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
