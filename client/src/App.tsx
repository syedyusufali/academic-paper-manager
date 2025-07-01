import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { CreatePaperDialog } from "@/components/create-paper-dialog";
import { CreateMilestoneDialog } from "@/components/create-milestone-dialog";
import { AddProgressDialog } from "@/components/add-progress-dialog";
import { Dashboard } from "@/pages/dashboard";
import { Papers } from "@/pages/papers";
import { PaperDetail } from "@/pages/paper-detail";
import { Timeline } from "@/pages/timeline";
import { Milestones } from "@/pages/milestones";
import { Notes } from "@/pages/notes";
import { Progress } from "@/pages/progress";
import NotFound from "@/pages/not-found";
import { 
  Gauge, 
  FileText, 
  Calendar, 
  CheckSquare, 
  StickyNote, 
  TrendingUp 
} from "lucide-react";

// Mobile navigation component
function MobileNavigation() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around">
        <a href="/" className="flex flex-col items-center py-2 px-3 text-primary">
          <Gauge className="h-4 w-4" />
          <span className="text-xs mt-1">Dashboard</span>
        </a>
        <a href="/papers" className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-primary">
          <FileText className="h-4 w-4" />
          <span className="text-xs mt-1">Papers</span>
        </a>
        <a href="/timeline" className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-primary">
          <Calendar className="h-4 w-4" />
          <span className="text-xs mt-1">Timeline</span>
        </a>
        <a href="/progress" className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-primary">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs mt-1">Progress</span>
        </a>
      </div>
    </div>
  );
}

function Router() {
  const [createPaperOpen, setCreatePaperOpen] = useState(false);
  const [createMilestoneOpen, setCreateMilestoneOpen] = useState(false);
  const [addProgressOpen, setAddProgressOpen] = useState(false);

  const handleNewPaper = () => setCreatePaperOpen(true);
  const handleAddNote = () => {
    // Navigate to notes page or open note dialog
    window.location.href = "/notes";
  };
  const handleSetMilestone = () => setCreateMilestoneOpen(true);
  const handleQuickWrite = () => setAddProgressOpen(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar onNewPaper={handleNewPaper} />
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Switch>
            <Route path="/" component={() => 
              <Dashboard 
                onNewPaper={handleNewPaper}
                onAddNote={handleAddNote}
                onSetMilestone={handleSetMilestone}
                onQuickWrite={handleQuickWrite}
              />
            } />
            <Route path="/papers" component={() => <Papers onNewPaper={handleNewPaper} />} />
            <Route path="/papers/:id" component={PaperDetail} />
            <Route path="/timeline" component={Timeline} />
            <Route path="/milestones" component={() => 
              <Milestones onNewMilestone={() => setCreateMilestoneOpen(true)} />
            } />
            <Route path="/notes" component={Notes} />
            <Route path="/progress" component={() => 
              <Progress onAddProgress={() => setAddProgressOpen(true)} />
            } />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <MobileNavigation />
      
      {/* Dialogs */}
      <CreatePaperDialog 
        open={createPaperOpen} 
        onOpenChange={setCreatePaperOpen} 
      />
      <CreateMilestoneDialog 
        open={createMilestoneOpen} 
        onOpenChange={setCreateMilestoneOpen} 
      />
      <AddProgressDialog 
        open={addProgressOpen} 
        onOpenChange={setAddProgressOpen} 
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
