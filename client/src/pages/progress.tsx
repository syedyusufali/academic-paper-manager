import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar as CalendarIcon,
  BarChart3,
  Edit,
  Trash2
} from "lucide-react";
import type { ProgressEntry, Paper } from "@shared/schema";

interface ProgressProps {
  onAddProgress: () => void;
}

export function Progress({ onAddProgress }: ProgressProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [paperFilter, setPaperFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data: progressEntries = [], isLoading: progressLoading } = useQuery<ProgressEntry[]>({
    queryKey: ["/api/progress"],
  });

  const { data: papers = [], isLoading: papersLoading } = useQuery<Paper[]>({
    queryKey: ["/api/papers"],
  });

  const filteredEntries = progressEntries
    .filter(entry => {
      const paper = papers.find(p => p.id === entry.paperId);
      const matchesSearch = (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (paper && paper.title.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPaper = paperFilter === "all" || entry.paperId.toString() === paperFilter;
      
      let matchesDate = true;
      if (dateFilter !== "all") {
        const entryDate = new Date(entry.date);
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        switch (dateFilter) {
          case "today":
            matchesDate = entryDate.toDateString() === new Date().toDateString();
            break;
          case "week":
            matchesDate = entryDate >= startOfWeek;
            break;
          case "month":
            matchesDate = entryDate >= startOfMonth;
            break;
        }
      }
      
      return matchesSearch && matchesPaper && matchesDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate statistics
  const totalWords = progressEntries.reduce((sum, entry) => sum + entry.wordsWritten, 0);
  const totalTime = progressEntries.reduce((sum, entry) => sum + entry.timeSpent, 0);
  const totalEntries = progressEntries.length;
  const averageWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

  // Calculate this week's progress
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const thisWeekEntries = progressEntries.filter(entry => new Date(entry.date) >= startOfWeek);
  const thisWeekWords = thisWeekEntries.reduce((sum, entry) => sum + entry.wordsWritten, 0);
  const thisWeekTime = thisWeekEntries.reduce((sum, entry) => sum + entry.timeSpent, 0);

  // Group entries by date for timeline view
  const entriesByDate = filteredEntries.reduce((groups, entry) => {
    const dateKey = new Date(entry.date).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
    return groups;
  }, {} as Record<string, typeof filteredEntries>);

  if (progressLoading || papersLoading) {
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
            <Skeleton key={i} className="h-32" />
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
          <h2 className="text-2xl font-bold text-gray-900">Progress</h2>
          <p className="text-gray-600">Track your daily writing progress and productivity</p>
        </div>
        <Button onClick={onAddProgress} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Progress
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="text-blue-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Words</p>
                <p className="text-2xl font-bold text-gray-900">{totalWords.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-green-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(totalTime / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{thisWeekWords.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-orange-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg/Entry</p>
                <p className="text-2xl font-bold text-gray-900">{averageWordsPerEntry}</p>
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
                  placeholder="Search progress entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Progress Timeline */}
      {Object.keys(entriesByDate).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {progressEntries.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No progress entries yet</h3>
                <p className="text-gray-500 mb-6">Start tracking your writing progress to see your productivity over time</p>
                <Button onClick={onAddProgress}>Add Your First Progress Entry</Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No progress entries match your search</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(entriesByDate).map(([dateKey, entries]) => {
            const date = new Date(dateKey);
            const dayTotal = entries.reduce((sum, entry) => ({
              words: sum.words + entry.wordsWritten,
              time: sum.time + entry.timeSpent
            }), { words: 0, time: 0 });
            
            return (
              <Card key={dateKey}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{formatDate(date)}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{dayTotal.words} words</span>
                      <span>{dayTotal.time} minutes</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {entries.map((entry) => {
                      const paper = papers.find(p => p.id === entry.paperId);
                      
                      return (
                        <div key={entry.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="font-medium text-gray-900">
                                {entry.wordsWritten.toLocaleString()} words
                              </span>
                              <span className="text-sm text-gray-600">
                                {entry.timeSpent} minutes
                              </span>
                              {paper && (
                                <span className="text-sm text-gray-600">
                                  • {paper.title}
                                </span>
                              )}
                            </div>
                            {entry.description && (
                              <p className="text-sm text-gray-700">{entry.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(entry.createdAt)}
                            </span>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
