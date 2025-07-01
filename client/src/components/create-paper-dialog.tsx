import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPaperSchema } from "@shared/schema";
import { z } from "zod";

const createPaperSchema = insertPaperSchema.extend({
  dueDate: z.string().optional(),
});

type CreatePaperData = z.infer<typeof createPaperSchema>;

interface CreatePaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePaperDialog({ open, onOpenChange }: CreatePaperDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePaperData>({
    resolver: zodResolver(createPaperSchema),
    defaultValues: {
      targetWordCount: 5000,
      currentWordCount: 0,
      status: "research",
    },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPaperMutation = useMutation({
    mutationFn: async (data: CreatePaperData) => {
      const paperData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      };
      const response = await apiRequest("POST", "/api/papers", paperData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Paper created successfully",
      });
      reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create paper",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePaperData) => {
    createPaperMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Paper</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter paper title"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="e.g. Computer Science, Psychology"
            />
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the paper"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="targetWordCount">Target Word Count</Label>
            <Input
              id="targetWordCount"
              type="number"
              {...register("targetWordCount", { valueAsNumber: true })}
              placeholder="5000"
            />
            {errors.targetWordCount && (
              <p className="text-sm text-red-600 mt-1">{errors.targetWordCount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate")}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPaperMutation.isPending}
            >
              {createPaperMutation.isPending ? "Creating..." : "Create Paper"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
