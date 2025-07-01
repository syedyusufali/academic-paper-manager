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
import { insertProgressEntrySchema } from "@shared/schema";
import { z } from "zod";
import type { Paper } from "@shared/schema";

const addProgressSchema = insertProgressEntrySchema.extend({
  date: z.string(),
});

type AddProgressData = z.infer<typeof addProgressSchema>;

interface AddProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperId?: number;
}

export function AddProgressDialog({ open, onOpenChange, paperId }: AddProgressDialogProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddProgressData>({
    resolver: zodResolver(addProgressSchema),
    defaultValues: {
      paperId: paperId || undefined,
      date: today,
      wordsWritten: 0,
      timeSpent: 0,
    },
  });

  const { data: papers = [] } = useQuery<Paper[]>({
    queryKey: ["/api/papers"],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addProgressMutation = useMutation({
    mutationFn: async (data: AddProgressData) => {
      const progressData = {
        ...data,
        date: new Date(data.date),
      };
      const response = await apiRequest("POST", "/api/progress", progressData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Progress entry added successfully",
      });
      reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add progress entry",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddProgressData) => {
    addProgressMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Progress Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="wordsWritten">Words Written</Label>
            <Input
              id="wordsWritten"
              type="number"
              {...register("wordsWritten", { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.wordsWritten && (
              <p className="text-sm text-red-600 mt-1">{errors.wordsWritten.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
            <Input
              id="timeSpent"
              type="number"
              {...register("timeSpent", { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.timeSpent && (
              <p className="text-sm text-red-600 mt-1">{errors.timeSpent.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="What did you work on?"
              rows={3}
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
              disabled={addProgressMutation.isPending}
            >
              {addProgressMutation.isPending ? "Adding..." : "Add Progress"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
