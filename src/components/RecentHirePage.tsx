import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { ResizableTable } from "@/components/ui/resizable-table";

interface RecentHirePageProps {
  onBackToHome?: () => void;
}

export function RecentHirePage({ onBackToHome }: RecentHirePageProps) {
  const handleEmployeeSelect = (employeeId: string) => {
    // Selection handler
  };

  const handleColumnResize = (columnKey: string, newWidth: number) => {
    // Column resize handler
  };

  return (
    <div id="recent-hire-page" className="w-full min-h-screen bg-white text-zinc-900 flex flex-col">
      {/* Sticky Responsive Header Navigation with Admin item */}
      <Navbar1Demo />

      {/* Main Content Area - Table Alone */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <ResizableTable
          title="Employee"
          onEmployeeSelect={handleEmployeeSelect}
          onColumnResize={handleColumnResize}
        />
      </main>
    </div>
  );
}

export default RecentHirePage;
