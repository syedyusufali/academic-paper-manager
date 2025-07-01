import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperCard } from "@/components/paper-card";
import { ProgressChart } from "@/components/progress-chart";
import { useLocation } from "wouter";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  PenTool, 
  Pen, 
  StickyNote, 
  Flag, 
  Download,
  Check,
  TriangleAlert,
  Edit,
  Calendar as CalendarIcon
} from "lucide-react";
import { formatRelativeTime, getDueDateUrgency, getUrgencyColor, getUrgencyLabel } from "@/lib/utils";
import type { Paper, Milestone } from "@shared/schema";

interface DashboardStats {
  activePapers: number;
  completedPapers: number;
  dueSoon: number;
  totalWords: number;
}

interface DashboardProps {
  onNewPaper: () => void;
  onAddNote: () => void;
  onSetMilestone: () => void;
  onQuickWrite: () => void;
}

export function Dashboard({ onNewPaper, onAddNote, onSetMilestone, onQuickWrite }: DashboardProps) {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: papers = [], isLoading: papersLoading } = useQuery<Paper[]>({
    queryKey: ["/api/papers"],
  });

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  const activePapers = papers.filter(p => p.status !== "completed").slice(0, 3);
  const upcomingMilestones = milestones
    .filter(m => !m.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const recentActivity = [
    {
      id: 1,
      type: "milestone",
      title: "Completed milestone",
      description: "Literature Review milestone completed",
      time: "2 hours ago",
      icon: Check,
      iconColor: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      id: 2,
      type: "progress",
      title: "Added progress",
      description: "480 words added to Introduction section",
      time: "4 hours ago",
      icon: Pen,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 3,
      type: "note",
      title: "Created note",
      description: "New research note created",
      time: "Yesterday",
      icon: StickyNote,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      id: 4,
      type: "deadline",
      title: "Updated deadline",
      description: "Data Analysis milestone deadline updated",
      time: "2 days ago",
      icon: CalendarIcon,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  if (statsLoading || papersLoading || milestonesLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Manage your academic papers and track your progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="text-primary h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Papers</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activePapers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedPapers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Due This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.dueSoon || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PenTool className="text-purple-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Words Written</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalWords ? `${(stats.totalWords / 1000).toFixed(1)}K` : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Papers & Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Papers */}
        <Card>
          <CardHeader>
            <CardTitle>Active Papers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePapers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No active papers yet</p>
                <Button onClick={onNewPaper}>Create Your First Paper</Button>
              </div>
            ) : (
              activePapers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onClick={() => setLocation(`/papers/${paper.id}`)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <ProgressChart />
      </div>

      {/* Recent Activity & Upcoming Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center`}>
                      <activity.icon className={`${activity.iconColor} h-4 w-4`} />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMilestones.length === 0 ? (
                <div className="text-center py-8">
                  <Flag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No upcoming milestones</p>
                  <Button onClick={onSetMilestone} variant="outline">Set a Milestone</Button>
                </div>
              ) : (
                upcomingMilestones.map((milestone) => {
                  const urgency = getDueDateUrgency(milestone.dueDate);
                  const urgencyColor = getUrgencyColor(urgency);
                  const urgencyLabel = getUrgencyLabel(urgency);
                  
                  return (
                    <div key={milestone.id} className={`flex items-center justify-between p-3 rounded-lg border ${urgencyColor}`}>
                      <div className="flex items-center">
                        {urgency === "urgent" || urgency === "overdue" ? (
                          <TriangleAlert className="text-red-500 mr-3 h-4 w-4" />
                        ) : urgency === "soon" ? (
                          <Clock className="text-yellow-500 mr-3 h-4 w-4" />
                        ) : (
                          <CalendarIcon className="text-blue-500 mr-3 h-4 w-4" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                          <p className="text-xs text-gray-500">
                            {papers.find(p => p.id === milestone.paperId)?.title}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium">{urgencyLabel}</span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={onQuickWrite}
            >
              <Pen className="text-primary h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Quick Write</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={onAddNote}
            >
              <StickyNote className="text-primary h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Add Note</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={onSetMilestone}
            >
              <Flag className="text-primary h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Set Milestone</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => {
                // TODO: Implement export functionality
                console.log("Export report clicked");
              }}
            >
              <Download className="text-primary h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Export Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
