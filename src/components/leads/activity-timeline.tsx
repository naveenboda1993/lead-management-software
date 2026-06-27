"use client";

import {
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  UserPlus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Edit3,
  Loader2,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Activity } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  NOTE: FileText,
  FOLLOW_UP: MessageSquare,
  LEAD_CREATED: UserPlus,
  LEAD_UPDATED: Edit3,
  STATUS_CHANGE: RefreshCw,
  WON: CheckCircle,
  LOST: XCircle,
};

const ACTIVITY_COLORS: Record<string, string> = {
  CALL: "bg-blue-100 text-blue-600",
  EMAIL: "bg-purple-100 text-purple-600",
  MEETING: "bg-orange-100 text-orange-600",
  NOTE: "bg-slate-100 text-slate-600",
  FOLLOW_UP: "bg-teal-100 text-teal-600",
  LEAD_CREATED: "bg-green-100 text-green-600",
  LEAD_UPDATED: "bg-amber-100 text-amber-600",
  STATUS_CHANGE: "bg-indigo-100 text-indigo-600",
  WON: "bg-emerald-100 text-emerald-600",
  LOST: "bg-red-100 text-red-600",
};

interface ActivityTimelineProps {
  activities: Activity[];
  loading?: boolean;
}

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[500px]">
      <div className="relative space-y-0">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
        {activities.map((activity) => {
          const typeKey = activity.type.toUpperCase();
          const Icon =
            ACTIVITY_ICONS[typeKey] ?? ActivityIconsDefault;
          const colorClass = ACTIVITY_COLORS[typeKey] ?? "bg-slate-100 text-slate-600";

          return (
            <div key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                  colorClass
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-1 pt-1.5 min-w-0">
                <p className="text-sm font-medium">{activity.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatRelativeTime(activity.created_at)}</span>
                  {activity.created_by && (
                    <>
                      <span>·</span>
                      <span>by {activity.created_by}</span>
                    </>
                  )}
                </div>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-1 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                    {Object.entries(activity.metadata).map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                        <span>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function ActivityIconsDefault({ className }: { className?: string }) {
  return <FileText className={cn("h-4 w-4", className)} />;
}
