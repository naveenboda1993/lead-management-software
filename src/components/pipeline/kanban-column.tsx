"use client";

import { Droppable } from "@hello-pangea/dnd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { LeadCard } from "./lead-card";
import type { Lead, LeadStatus } from "@/types";

interface KanbanColumnProps {
  stage: LeadStatus;
  label: string;
  color: string;
  leads: Lead[];
}

export function KanbanColumn({ stage, label, color, leads }: KanbanColumnProps) {
  const totalValue = leads.reduce(
    (sum, lead) => sum + (lead.estimated_deal_value ?? 0),
    0
  );

  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", color.split(" ")[0])} />
          <span className="truncate text-sm font-semibold">{label}</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
            {leads.length}
          </span>
        </div>
        {totalValue > 0 && (
          <span className="shrink-0 text-xs font-medium text-emerald-600">
            {formatCurrency(totalValue)}
          </span>
        )}
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <ScrollArea className="flex-1">
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "flex flex-col gap-2 p-2 min-h-[120px] transition-colors",
                snapshot.isDraggingOver && "bg-muted/50"
              )}
            >
              {leads.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-xs text-muted-foreground">No leads</p>
                </div>
              )}
              {leads.map((lead, index) => (
                <LeadCard key={lead.id} lead={lead} index={index} />
              ))}
              {provided.placeholder}
            </div>
          </ScrollArea>
        )}
      </Droppable>
    </div>
  );
}
