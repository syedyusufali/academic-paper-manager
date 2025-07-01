import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, getDueDateUrgency, getUrgencyColor, getUrgencyLabel } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  CheckCircle, 
  Flag, 
  Clock, 
  TriangleAlert,
  Calendar as CalendarIcon,
  Edit,
  Trash2
} from "lucide-react";
import type { Milestone, Paper } from "@shared/schema";

interface MilestonesProps {
  onNewMilestone: () => void;
}

export function Milestones({ onNewMilestone }: MilestonesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paperFilter, setPaperFilter] = useState<string>("all");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  const { data: papers = [], isLoading: papersLoading } = useQuery<Paper[]>({
    queryKey: ["/api/papers"],
  });

  const completeMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      const response = await apiRequest("PUT", `/api/milestones/${milestoneId}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
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

  const deleteMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      await apiRequest("DELETE", `/api/milestones/${milestoneId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Milestone deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete milestone",
        variant: "destructive",
      });
    },
  });

  const filteredMilestones = milestones
    .filter(milestone => {
      const paper = papers.find(p => p.id === milestone.paperId);
      const matchesSearch = milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (milestone.description && milestone.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (paper && paper.title.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "completed" && milestone.completed) ||
                           (statusFilter === "pending" && !milestone.completed);
      const matchesPaper = paperFilter === "all" || milestone.paperId.toString() === paperFilter;
      return matchesSearch && matchesStatus && matchesPaper;
    })
    .sort((a, b) => {
      // Sort by completion status first (pending first), then by due date
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const pendingMilestones = milestones.filter(m => !m.completed);
  const completedMilestones = milestones.filter(m => m.completed);
  const overdueMilestones = pendingMilestones.filter(m => new Date(m.dueDate) < new Date());
  const dueSoonMilestones = pendingMilestones.filter(m => {
    const urgency = getDueDateUrgency(m.dueDate);
    return urgency === "urgent" || urgency === "soon";
  });

  if (milestonesLoading || papersLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Milestones</h2>
          <p className="text-gray-600">Track important deadlines and achievements</p>
        </div>
        <Button onClick={onNewMilestone} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Milestone
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Flag className="text-blue-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingMilestones.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{completedMilestones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <TriangleAlert className="text-red-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{overdueMilestones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search milestones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Milestones</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paperFilter} onValueChange={setPaperFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by paper" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Papers</SelectItem>
                {papers.map((paper) => (
                  <SelectItem key={paper.id} value={paper.id.toString()}>
                    {paper.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Milestones List */}
      {filteredMilestones.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Flag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {milestones.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones yet</h3>
                <p className="text-gray-500 mb-6">Create your first milestone to track important deadlines</p>
                <Button onClick={onNewMilestone}>Create Your First Milestone</Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones match your search</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMilestones.map((milestone) => {
            const paper = papers.find(p => p.id === milestone.paperId);
            const urgency = getDueDateUrgency(milestone.dueDate);
            const urgencyColor = getUrgencyColor(urgency);
            const urgencyLabel = getUrgencyLabel(urgency);
            
            return (
              <Card key={milestone.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => completeMilestoneMutation.mutate(milestone.id)}
                        disabled={milestone.completed || completeMilestoneMutation.isPending}
                        className="mt-1"
                      >
                        <CheckCircle className={`h-5 w-5 ${milestone.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`} />
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-medium ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {milestone.title}
                          </h3>
                          {!milestone.completed && (
                            <Badge className={urgencyColor}>{urgencyLabel}</Badge>
                          )}
                          {milestone.completed && (
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          )}
                        </div>
                        
                        {milestone.description && (
                          <p className="text-gray-600 mb-3">{milestone.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Due: {formatDate(milestone.dueDate)}</span>
                          </span>
                          {paper && (
                            <span className="flex items-center space-x-1">
                              <Flag className="h-4 w-4" />
                              <span>Paper: {paper.title}</span>
                            </span>
                          )}
                          {milestone.completed && milestone.completedAt && (
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>Completed: {formatDate(milestone.completedAt)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteMilestoneMutation.mutate(milestone.id)}
                        disabled={deleteMilestoneMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
