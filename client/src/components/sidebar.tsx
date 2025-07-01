import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Gauge, 
  FileText, 
  Calendar, 
  CheckSquare, 
  StickyNote, 
  TrendingUp, 
  Settings, 
  Plus 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Gauge },
  { name: "My Papers", href: "/papers", icon: FileText },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "Milestones", href: "/milestones", icon: CheckSquare },
  { name: "Notes", href: "/notes", icon: StickyNote },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onNewPaper: () => void;
}

export function Sidebar({ onNewPaper }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 hidden lg:block">
      <nav className="p-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-gray-200 mt-8">
        <Button 
          onClick={onNewPaper}
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Paper
        </Button>
      </div>
    </aside>
  );
}
