import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatRelativeTime, getProgressPercentage, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Paper } from "@shared/schema";

interface PaperCardProps {
  paper: Paper;
  onClick: () => void;
}

export function PaperCard({ paper, onClick }: PaperCardProps) {
  const progress = getProgressPercentage(paper.currentWordCount, paper.targetWordCount);
  const statusColor = getStatusColor(paper.status);
  const statusLabel = getStatusLabel(paper.status);

  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{paper.title}</h4>
            <p className="text-sm text-gray-600">
              {paper.category} • {paper.dueDate ? `Due: ${formatDate(paper.dueDate)}` : "No due date"}
            </p>
          </div>
          <Badge className={statusColor}>
            {statusLabel}
          </Badge>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>{paper.currentWordCount.toLocaleString()} / {paper.targetWordCount.toLocaleString()} words</span>
          <span>Updated {formatRelativeTime(paper.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
