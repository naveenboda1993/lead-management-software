"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { User, Attendance, Leave, Payroll, PerformanceReview } from "@/types";

const supabase = createClient();

export interface EmployeeFilters {
  search?: string;
  department?: string;
  role?: string;
}

async function fetchEmployees(filters?: EmployeeFilters): Promise<User[]> {
  let query = supabase.from("profiles").select("*").order("name", { ascending: true });

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%`
    );
  }
  if (filters?.department) {
    query = query.eq("department", filters.department);
  }
  if (filters?.role) {
    query = query.eq("role", filters.role);
  }

  const { data } = await query;
  return (data ?? []) as User[];
}

async function fetchEmployee(id: string): Promise<User | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
  return data as User | null;
}

async function fetchAttendance(filters?: { employee_id?: string; date_from?: string; date_to?: string }): Promise<Attendance[]> {
  let query = supabase.from("attendance").select("*").order("date", { ascending: false });

  if (filters?.employee_id) {
    query = query.eq("employee_id", filters.employee_id);
  }
  if (filters?.date_from) {
    query = query.gte("date", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("date", filters.date_to);
  }

  const { data } = await query;
  return (data ?? []) as Attendance[];
}

async function updateAttendance({ id, ...input }: Partial<Attendance> & { id: string }): Promise<Attendance> {
  const { data, error } = await supabase
    .from("attendance")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Attendance;
}

async function createAttendance(input: Partial<Attendance>): Promise<Attendance> {
  const { data, error } = await supabase
    .from("attendance")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Attendance;
}

async function fetchLeaves(filters?: { employee_id?: string; status?: string[] }): Promise<Leave[]> {
  let query = supabase.from("leaves").select("*").order("created_at", { ascending: false });

  if (filters?.employee_id) {
    query = query.eq("employee_id", filters.employee_id);
  }
  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }

  const { data } = await query;
  return (data ?? []) as Leave[];
}

async function updateLeave({ id, ...input }: Partial<Leave> & { id: string }): Promise<Leave> {
  const { data, error } = await supabase
    .from("leaves")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Leave;
}

async function createLeave(input: Partial<Leave>): Promise<Leave> {
  const { data, error } = await supabase
    .from("leaves")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Leave;
}

async function fetchPayroll(filters?: { employee_id?: string; month?: number; year?: number }): Promise<Payroll[]> {
  let query = supabase.from("payroll").select("*").order("year", { ascending: false }).order("month", { ascending: false });

  if (filters?.employee_id) {
    query = query.eq("employee_id", filters.employee_id);
  }
  if (filters?.month) {
    query = query.eq("month", filters.month);
  }
  if (filters?.year) {
    query = query.eq("year", filters.year);
  }

  const { data } = await query;
  return (data ?? []) as Payroll[];
}

async function createPayroll(input: Partial<Payroll>): Promise<Payroll> {
  const { data, error } = await supabase
    .from("payroll")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Payroll;
}

async function updatePayroll({ id, ...input }: Partial<Payroll> & { id: string }): Promise<Payroll> {
  const { data, error } = await supabase
    .from("payroll")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Payroll;
}

async function fetchPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
  let query = supabase.from("performance_reviews").select("*").order("created_at", { ascending: false });
  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }
  const { data } = await query;
  return (data ?? []) as PerformanceReview[];
}

async function createPerformanceReview(input: Partial<PerformanceReview>): Promise<PerformanceReview> {
  const { data, error } = await supabase
    .from("performance_reviews")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PerformanceReview;
}

export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => fetchEmployees(filters),
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id!),
    enabled: !!id,
  });
}

export function useAttendance(filters?: { employee_id?: string; date_from?: string; date_to?: string }) {
  return useQuery({
    queryKey: ["attendance", filters],
    queryFn: () => fetchAttendance(filters),
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useLeaves(filters?: { employee_id?: string; status?: string[] }) {
  return useQuery({
    queryKey: ["leaves", filters],
    queryFn: () => fetchLeaves(filters),
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useUpdateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function usePayroll(filters?: { employee_id?: string; month?: number; year?: number }) {
  return useQuery({
    queryKey: ["payroll", filters],
    queryFn: () => fetchPayroll(filters),
  });
}

export function useCreatePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
    },
  });
}

export function useUpdatePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
    },
  });
}

export function usePerformanceReviews(employeeId?: string) {
  return useQuery({
    queryKey: ["performance-reviews", employeeId],
    queryFn: () => fetchPerformanceReviews(employeeId),
  });
}

export function useCreatePerformanceReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPerformanceReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-reviews"] });
    },
  });
}
