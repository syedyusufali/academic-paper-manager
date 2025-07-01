import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { ProgressEntry } from "@shared/schema";

export function ProgressChart() {
  const { data: progressEntries = [], isLoading } = useQuery<ProgressEntry[]>({
    queryKey: ["/api/progress"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="chart-container rounded-lg p-6 mb-4">
              <div className="flex items-end justify-between h-32 space-x-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-8 bg-gray-300 rounded-t h-16"></div>
                    <div className="w-8 h-3 bg-gray-300 rounded mt-2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate weekly progress
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    
    const dayEntries = progressEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });
    
    const totalWords = dayEntries.reduce((sum, entry) => sum + entry.wordsWritten, 0);
    const totalTime = dayEntries.reduce((sum, entry) => sum + entry.timeSpent, 0);
    
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      words: totalWords,
      time: totalTime,
    };
  });

  const maxWords = Math.max(...weeklyData.map(d => d.words), 1);
  const totalWeekWords = weeklyData.reduce((sum, day) => sum + day.words, 0);
  const totalWeekTime = weeklyData.reduce((sum, day) => sum + day.time, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chart-container rounded-lg p-6 mb-4">
          <div className="flex items-end justify-between h-32 space-x-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-primary rounded-t transition-all duration-300"
                  style={{ 
                    height: `${Math.max((day.words / maxWords) * 100, 5)}%`
                  }}
                  title={`${day.words} words`}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalWeekWords.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Words This Week</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{(totalWeekTime / 60).toFixed(1)}</p>
            <p className="text-sm text-gray-600">Hours Writing</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
