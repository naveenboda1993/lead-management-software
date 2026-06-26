"use client";

import { KanbanBoard } from "@/components/pipeline/kanban-board";

export default function PipelinePage() {
  return (
    <div className="h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] min-h-[300px] space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">
          Drag and drop leads to update their stage
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
