"use client";

import { useRouter } from "next/navigation";
import { Draggable } from "@hello-pangea/dnd";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Lead } from "@/types";
import type { CSSProperties } from "react";

interface LeadCardProps {
  lead: Lead;
  index: number;
}

export function LeadCard({ lead, index }: LeadCardProps) {
  const router = useRouter();

  const initials = `${lead.first_name[0]}${lead.last_name[0]}`.toUpperCase();

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => {
        const draggableStyle = provided.draggableProps.style as CSSProperties | undefined;
        return (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={draggableStyle}
          {...provided.dragHandleProps}
          onClick={() => router.push(`/leads/${lead.id}`)}
          className={cn(
            "rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md cursor-pointer",
            snapshot.isDragging && "shadow-lg ring-2 ring-primary/20"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {lead.first_name} {lead.last_name}
              </p>
              {lead.company && (
                <p className="truncate text-xs text-muted-foreground">
                  {lead.company}
                </p>
              )}
            </div>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            {lead.estimated_deal_value ? (
              <span className="text-xs font-semibold text-emerald-600">
                {formatCurrency(lead.estimated_deal_value)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0", PRIORITY_COLORS[lead.priority])}
            >
              {PRIORITY_LABELS[lead.priority]}
            </Badge>
          </div>
        </div>
      );
    }}
    </Draggable>
  );
}
