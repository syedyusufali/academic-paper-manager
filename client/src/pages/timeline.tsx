import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getDueDateUrgency, getUrgencyColor, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Calendar, Clock, Flag, FileText } from "lucide-react";
import type { Paper, Milestone } from "@shared/schema";

export function Timeline() {
  const { data: papers = [], isLoading: papersLoading } = useQuery<Paper[]>({
    queryKey: ["/api/papers"],
  });

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  const loading = papersLoading || milestonesLoading;

  // Combine papers and milestones into timeline events
  const timelineEvents = [
    ...papers.map(paper => ({
      id: `paper-${paper.id}`,
      type: 'paper' as const,
      title: paper.title,
      date: paper.dueDate ? new Date(paper.dueDate) : null,
      status: paper.status,
      category: paper.category,
      data: paper,
    })),
    ...milestones.map(milestone => ({
      id: `milestone-${milestone.id}`,
      type: 'milestone' as const,
      title: milestone.title,
      date: new Date(milestone.dueDate),
      status: milestone.completed ? 'completed' : 'pending',
      paper: papers.find(p => p.id === milestone.paperId),
      data: milestone,
    }))
  ]
    .filter(event => event.date) // Only include events with dates
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  // Group events by month
  const groupedEvents = timelineEvents.reduce((groups, event) => {
    const monthKey = event.date!.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(event);
    return groups;
  }, {} as Record<string, typeof timelineEvents>);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-20" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Timeline</h2>
        <p className="text-gray-600">View all your papers and milestones in chronological order</p>
      </div>

      {/* Timeline */}
      {Object.keys(groupedEvents).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timeline events</h3>
            <p className="text-gray-500">Create papers with due dates and set milestones to see your timeline</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([month, events]) => (
            <div key={month} className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
              </div>
              
              <div className="space-y-3 pl-8 border-l-2 border-gray-200">
                {events.map((event, index) => (
                  <div key={event.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-10 top-3 w-3 h-3 bg-primary rounded-full border-2 border-white shadow"></div>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {event.type === 'paper' ? (
                                <FileText className="h-4 w-4 text-primary" />
                              ) : (
                                <Flag className="h-4 w-4 text-orange-500" />
                              )}
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(event.date!)}</span>
                              </span>
                              
                              {event.type === 'paper' && (
                                <span>{event.category}</span>
                              )}
                              
                              {event.type === 'milestone' && event.paper && (
                                <span>Paper: {event.paper.title}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {event.type === 'paper' ? (
                              <Badge className={getStatusColor(event.status)}>
                                {getStatusLabel(event.status)}
                              </Badge>
                            ) : (
                              <Badge className={event.status === 'completed' ? 'bg-green-100 text-green-800' : getUrgencyColor(getDueDateUrgency(event.date!))}>
                                {event.status === 'completed' ? 'Completed' : 'Pending'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
