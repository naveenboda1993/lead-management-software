"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  Loader2,
  ExternalLink,
  Filter,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/utils/format";
import { toast } from "@/components/ui/toast";

type FilterValue = "ALL" | "READ" | "UNREAD";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterValue>("ALL");

  const filteredNotifications = useMemo(() => {
    if (filter === "ALL") return notifications;
    if (filter === "READ") return notifications.filter((n) => n.read);
    return notifications.filter((n) => !n.read);
  }, [notifications, filter]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with system events and activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
            <SelectTrigger className="h-8 w-[130px]">
              <Filter className="mr-2 h-3 w-3" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="UNREAD">Unread</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              {filter === "UNREAD" ? "No unread notifications" : "No notifications"}
            </p>
            <p className="text-sm text-muted-foreground">
              {filter === "UNREAD"
                ? "You're all caught up!"
                : "Notifications will appear here when there are updates"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredNotifications.length} of {notifications.length}{" "}
              notification{notifications.length !== 1 ? "s" : ""}
              {unreadCount > 0 && (
                <span className="ml-1">
                  (<Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {unreadCount} unread
                  </Badge>)
                </span>
              )}
            </span>
          </div>

          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={
                (notification.link ? "cursor-pointer" : "") +
                (!notification.read
                  ? " border-primary/20 bg-primary/5"
                  : "")
              }
              onClick={() => {
                if (notification.link) {
                  if (!notification.read) handleMarkAsRead(notification.id);
                  router.push(notification.link);
                }
              }}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-start gap-3">
                  <div
                    className={
                      `mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        !notification.read
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`
                    }
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle
                      className={
                        `text-sm ${
                          !notification.read ? "font-semibold" : "font-normal"
                        }`
                      }
                    >
                      {notification.title}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {notification.link && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={notification.link} title="View details">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
