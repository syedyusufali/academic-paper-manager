import { GraduationCap, Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GraduationCap className="text-primary text-2xl" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">Academic Paper Manager</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
