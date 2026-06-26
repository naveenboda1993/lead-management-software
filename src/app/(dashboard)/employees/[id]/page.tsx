"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEmployee, useAttendance, useLeaves, usePayroll, usePerformanceReviews } from "@/hooks/use-employees";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLES, ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS, LEAVE_STATUS_LABELS, LEAVE_STATUS_COLORS, LEAVE_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const { data: employee, isLoading, error } = useEmployee(employeeId);
  const { data: attendance } = useAttendance({ employee_id: employeeId });
  const { data: leaves } = useLeaves({ employee_id: employeeId });
  const { data: payroll } = usePayroll({ employee_id: employeeId });
  const { data: reviews } = usePerformanceReviews(employeeId);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-destructive">Employee not found</p>
        <Button variant="outline" onClick={() => router.push("/employees")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/employees")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{employee.name}</h1>
            <Badge variant="outline">{ROLES[employee.role]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{employee.email} · {employee.employee_id ?? "No ID"}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Name</dt>
                  <dd className="text-sm">{employee.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                  <dd className="text-sm">{employee.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
                  <dd className="text-sm">{employee.phone ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Role</dt>
                  <dd className="text-sm">{ROLES[employee.role]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Department</dt>
                  <dd className="text-sm">{employee.department ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Designation</dt>
                  <dd className="text-sm">{employee.designation ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Employee ID</dt>
                  <dd className="text-sm">{employee.employee_id ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Date of Joining</dt>
                  <dd className="text-sm">{employee.date_of_joining ? formatDate(employee.date_of_joining) : "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader><CardTitle className="text-base">Attendance History</CardTitle></CardHeader>
            <CardContent>
              {!attendance || attendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 text-xs font-medium">Date</th>
                        <th className="text-left p-2 text-xs font-medium">Status</th>
                        <th className="text-left p-2 text-xs font-medium">In</th>
                        <th className="text-left p-2 text-xs font-medium">Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.slice(0, 10).map((a) => (
                        <tr key={a.id} className="border-b">
                          <td className="p-2 text-sm">{formatDate(a.date)}</td>
                          <td className="p-2">
                            <Badge className={ATTENDANCE_STATUS_COLORS[a.status]} variant="outline">
                              {ATTENDANCE_STATUS_LABELS[a.status]}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm">{a.check_in ?? "-"}</td>
                          <td className="p-2 text-sm">{a.check_out ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves">
          <Card>
            <CardHeader><CardTitle className="text-base">Leave History</CardTitle></CardHeader>
            <CardContent>
              {!leaves || leaves.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave records</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 text-xs font-medium">Type</th>
                        <th className="text-left p-2 text-xs font-medium">From</th>
                        <th className="text-left p-2 text-xs font-medium">To</th>
                        <th className="text-left p-2 text-xs font-medium">Days</th>
                        <th className="text-left p-2 text-xs font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((l) => (
                        <tr key={l.id} className="border-b">
                          <td className="p-2 text-sm">{LEAVE_TYPE_LABELS[l.leave_type]}</td>
                          <td className="p-2 text-sm">{formatDate(l.start_date)}</td>
                          <td className="p-2 text-sm">{formatDate(l.end_date)}</td>
                          <td className="p-2 text-sm">{l.total_days}</td>
                          <td className="p-2">
                            <Badge className={LEAVE_STATUS_COLORS[l.status]} variant="outline">
                              {LEAVE_STATUS_LABELS[l.status]}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader><CardTitle className="text-base">Payroll History</CardTitle></CardHeader>
            <CardContent>
              {!payroll || payroll.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payroll records</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 text-xs font-medium">Period</th>
                        <th className="text-left p-2 text-xs font-medium">Net Salary</th>
                        <th className="text-left p-2 text-xs font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payroll.map((p) => (
                        <tr key={p.id} className="border-b">
                          <td className="p-2 text-sm">{p.month}/{p.year}</td>
                          <td className="p-2 text-sm font-medium">{formatCurrency(p.net_salary)}</td>
                          <td className="p-2">
                            <Badge variant={p.payment_status === "PAID" ? "default" : "secondary"}>
                              {p.payment_status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader><CardTitle className="text-base">Performance Reviews</CardTitle></CardHeader>
            <CardContent>
              {!reviews || reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No performance reviews</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <Card key={r.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium">{r.review_period}</p>
                            <p className="text-xs text-muted-foreground">Rating: {r.rating}/10</p>
                          </div>
                          <Badge variant="outline">{r.rating}/10</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.feedback}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
