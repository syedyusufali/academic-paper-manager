import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { insertNoteSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Plus, 
  Search, 
  StickyNote, 
  Edit, 
  Trash2,
  FileText,
  BookOpen,
  Lightbulb
} from "lucide-react";
import type { Note, Paper } from "@shared/schema";

const createNoteSchema = insertNoteSchema;
type CreateNoteData = z.infer<typeof createNoteSchema>;

const sections = [
  { value: "introduction", label: "Introduction" },
  { value: "literature-review", label: "Literature Review" },
  { value: "methodology", label: "Methodology" },
  { value: "results", label: "Results" },
  { value: "discussion", label: "Discussion" },
  { value: "conclusion", label: "Conclusion" },
  { value: "references", label: "References" },
  { value: "general", label: "General" },
];

export function Notes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [paperFilter, setPaperFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notes = [], isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const { data: papers = [], isLoading: papersLoading } = useQuery<Paper[]>({
    queryKey: ["/api/papers"],
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateNoteData>({
    resolver: zodResolver(createNoteSchema),
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: CreateNoteData) => {
      const response = await apiRequest("POST", "/api/notes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      reset();
      setCreateNoteOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateNoteData> }) => {
      const response = await apiRequest("PUT", `/api/notes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      setEditingNote(null);
      reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      await apiRequest("DELETE", `/api/notes/${noteId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const filteredNotes = notes
    .filter(note => {
      const paper = papers.find(p => p.id === note.paperId);
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (paper && paper.title.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPaper = paperFilter === "all" || note.paperId.toString() === paperFilter;
      const matchesSection = sectionFilter === "all" || note.section === sectionFilter;
      return matchesSearch && matchesPaper && matchesSection;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const onSubmit = (data: CreateNoteData) => {
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data });
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setValue("paperId", note.paperId);
    setValue("title", note.title);
    setValue("content", note.content);
    setValue("section", note.section || "");
    setCreateNoteOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateNoteOpen(false);
    setEditingNote(null);
    reset();
  };

  if (notesLoading || papersLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const notesBySection = sections.reduce((acc, section) => {
    acc[section.value] = notes.filter(note => note.section === section.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
          <p className="text-gray-600">Organize research notes and ideas for your papers</p>
        </div>
        <Button onClick={() => setCreateNoteOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <StickyNote className="text-blue-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-green-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Research Notes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notesBySection["literature-review"] || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="text-yellow-600 h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ideas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notesBySection["general"] || 0}
                </p>
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
                  placeholder="Search notes..."
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
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <StickyNote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {notes.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                <p className="text-gray-500 mb-6">Start taking notes to organize your research and ideas</p>
                <Button onClick={() => setCreateNoteOpen(true)}>Create Your First Note</Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes match your search</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const paper = papers.find(p => p.id === note.paperId);
            const section = sections.find(s => s.value === note.section);
            
            return (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{note.title}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {paper && (
                          <span className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>{paper.title}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        disabled={deleteNoteMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-4">{note.content}</p>
                  <div className="flex items-center justify-between">
                    {section && (
                      <Badge variant="outline">{section.label}</Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      Updated {formatRelativeTime(note.updatedAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Note Dialog */}
      <Dialog open={createNoteOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="paperId">Paper</Label>
              <Select
                onValueChange={(value) => setValue("paperId", parseInt(value))}
                defaultValue={editingNote?.paperId.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a paper" />
                </SelectTrigger>
                <SelectContent>
                  {papers.map((paper) => (
                    <SelectItem key={paper.id} value={paper.id.toString()}>
                      {paper.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paperId && (
                <p className="text-sm text-red-600 mt-1">{errors.paperId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter note title"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="section">Section (Optional)</Label>
              <Select
                onValueChange={(value) => setValue("section", value)}
                defaultValue={editingNote?.section || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No section</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.value} value={section.value}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Write your note content here..."
                rows={8}
              />
              {errors.content && (
                <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
              >
                {createNoteMutation.isPending || updateNoteMutation.isPending
                  ? "Saving..."
                  : editingNote
                  ? "Update Note"
                  : "Create Note"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
