import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperCard } from "@/components/paper-card";
import { useLocation } from "wouter";
import { Search, Plus, FileText } from "lucide-react";
import type { Paper } from "@shared/schema";

interface PapersProps {
  onNewPaper: () => void;
}

export function Papers({ onNewPaper }: PapersProps) {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: papers = [], isLoading } = useQuery<Paper[]>({
    queryKey: ["/api/papers"],
  });

  const filteredPapers = papers
    .filter(paper => {
      const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           paper.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || paper.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
          <h2 className="text-2xl font-bold text-gray-900">My Papers</h2>
          <p className="text-gray-600">Manage all your academic papers in one place</p>
        </div>
        <Button onClick={onNewPaper} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Paper
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search papers..."
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
                <SelectItem value="all">All Papers</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {papers.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No papers yet</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first academic paper</p>
                  <Button onClick={onNewPaper}>Create Your First Paper</Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No papers match your search</h3>
                  <p className="text-gray-500">Try adjusting your search terms or filters</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onClick={() => setLocation(`/papers/${paper.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
