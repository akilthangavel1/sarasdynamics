"use client";

import {
  ResizableTable,
  type Employee,
} from "@/components/ui/resizable-table";

export default function ResizableTableDemo() {
  const handleEmployeeSelect = (employeeId: string) => {
    console.log(`Selected employee:`, employeeId);
  };

  const handleColumnResize = (columnKey: string, newWidth: number) => {
    console.log(`Column ${columnKey} resized to ${newWidth}px`);
  };

  return (
    <div className="w-full bg-background py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <ResizableTable 
          title="Employee" 
          onEmployeeSelect={handleEmployeeSelect}
          onColumnResize={handleColumnResize}
        />
      </div>
    </div>
  );
}

export { ResizableTableDemo };
