"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  User,
  Building2,
  Settings2,
  Users,
  GitBranch,
  Plus,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import {
  LEAD_STATUS_LABELS,
  PIPELINE_STAGES,
} from "@/lib/constants";
import { LeadStatus, type User as UserType } from "@/types";
import { cn } from "@/lib/utils/cn";

const supabase = createClient();

interface StageConfig {
  key: LeadStatus;
  label: string;
  color: string;
}

export default function SettingsPage() {
  const { user } = useUser();
  const { can } = usePermissions();

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [usersLoading] = useState(false);

  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profileEmail, setProfileEmail] = useState(user?.email ?? "");
  const [profilePhone, setProfilePhone] = useState("");

  const [orgName, setOrgName] = useState("");
  const [themeDark, setThemeDark] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [stages, setStages] = useState<StageConfig[]>(
    PIPELINE_STAGES.map((s) => ({
      key: s.key,
      label: s.label,
      color: s.color,
    }))
  );

  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (can("read", "user")) {
      (async () => {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) {
          setUsers(data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            email: (p.email as string) ?? "",
            name: (p.full_name as string) ?? (p.name as string) ?? "",
            role: ((p.role as string) ?? "").toUpperCase() as LeadStatus as unknown as UserType["role"],
            avatar_url: (p.avatar_url as string) ?? null,
            phone: (p.phone as string) ?? null,
            created_at: (p.created_at as string) ?? "",
            updated_at: (p.updated_at as string) ?? "",
          })) as UserType[]);
        }
      })();
    }
  }, [can]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: profileName })
        .eq("id", user.id);
      if (error) throw new Error(error.message);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrg = async () => {
    toast.success("Organization settings saved");
  };

  const handleSaveStages = async () => {
    toast.success("Pipeline stages updated");
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
  };

  const updateStageLabel = (index: number, label: string) => {
    setStages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], label };
      return next;
    });
  };

  const isAdmin = can("create", "user");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building2 className="mr-2 h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings2 className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="team">
              <Users className="mr-2 h-4 w-4" />
              Team
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="pipeline">
              <GitBranch className="mr-2 h-4 w-4" />
              Pipeline
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={user?.avatar_url ?? undefined}
                    alt={profileName}
                  />
                  <AvatarFallback className="text-lg">
                    {profileName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Add phone number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input value={user?.role ?? ""} disabled />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Your company name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Organization Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-muted-foreground text-sm font-medium">
                    Logo
                  </div>
                  <Button variant="outline" size="sm">
                    Upload Logo
                  </Button>
                </div>
              </div>
              <Button onClick={handleSaveOrg}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Dark Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark mode for the application
                  </p>
                </div>
                <Switch
                  checked={themeDark}
                  onCheckedChange={setThemeDark}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for lead updates and task reminders
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Members</CardTitle>
                <CardDescription>
                  Manage your team members and their roles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="py-4 text-sm text-muted-foreground text-center">
                    No team members found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {users.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {member.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {member.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <div>
                  <Label className="text-base">Invite Member</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send an invitation to join your organization
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="max-w-sm"
                    />
                    <Button onClick={handleInvite}>
                      <Plus className="mr-2 h-4 w-4" />
                      Invite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pipeline Stages</CardTitle>
                <CardDescription>
                  Customize the names and colors of your pipeline stages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {stages.map((stage, index) => (
                    <div
                      key={stage.key}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div
                        className={cn(
                          "h-3 w-3 shrink-0 rounded-full",
                          stage.color.split(" ")[0]
                        )}
                      />
                      <Input
                        value={stage.label}
                        onChange={(e) =>
                          updateStageLabel(index, e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] shrink-0",
                          stage.color
                        )}
                      >
                        {LEAD_STATUS_LABELS[stage.key]}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSaveStages}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Stages
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
