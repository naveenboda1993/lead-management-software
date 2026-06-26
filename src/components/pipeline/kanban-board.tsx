"use client";

import { useCallback, useMemo } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Loader2 } from "lucide-react";
import { usePipeline, useUpdateLeadStage } from "@/hooks/use-pipeline";
import { PIPELINE_STAGES } from "@/lib/constants";
import { LeadStatus, type Lead } from "@/types";
import { KanbanColumn } from "./kanban-column";
import { toast } from "@/components/ui/toast";

export function KanbanBoard() {
  const { data: stages, isLoading, error } = usePipeline();
  const updateStage = useUpdateLeadStage();

  const columnsMap = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    if (stages) {
      for (const stage of stages) {
        map.set(stage.stage, stage.leads);
      }
    }
    return map;
  }, [stages]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const newStatus = destination.droppableId as LeadStatus;

      try {
        await updateStage.mutateAsync({ id: draggableId, status: newStatus });
        toast.success("Lead moved successfully");
      } catch {
        toast.error("Failed to move lead");
      }
    },
    [updateStage]
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load pipeline data</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(({ key, label, color }) => (
          <KanbanColumn
            key={key}
            stage={key}
            label={label}
            color={color}
            leads={columnsMap.get(key) ?? []}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
