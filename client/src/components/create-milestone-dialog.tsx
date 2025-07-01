import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMilestoneSchema } from "@shared/schema";
import { z } from "zod";
import type { Paper } from "@shared/schema";

const createMilestoneSchema = insertMilestoneSchema.extend({
  dueDate: z.string(),
});

type CreateMilestoneData = z.infer<typeof createMilestoneSchema>;

interface CreateMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperId?: number;
}

export function CreateMilestoneDialog({ open, onOpenChange, paperId }: CreateMilestoneDialogProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateMilestoneData>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      paperId: paperId || undefined,
    },
  });

  const { data: papers = [] } = useQuery<Paper[]>({
    queryKey: ["/api/papers"],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMilestoneMutation = useMutation({
    mutationFn: async (data: CreateMilestoneData) => {
      const milestoneData = {
        ...data,
        dueDate: new Date(data.dueDate),
      };
      const response = await apiRequest("POST", "/api/milestones", milestoneData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Milestone created successfully",
      });
      reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create milestone",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateMilestoneData) => {
    createMilestoneMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Milestone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter milestone title"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe what needs to be accomplished"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="paperId">Paper</Label>
            <Select
              onValueChange={(value) => setValue("paperId", parseInt(value))}
              defaultValue={paperId?.toString()}
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
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              {...register("dueDate")}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
            )}
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
              disabled={createMilestoneMutation.isPending}
            >
              {createMilestoneMutation.isPending ? "Creating..." : "Create Milestone"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
