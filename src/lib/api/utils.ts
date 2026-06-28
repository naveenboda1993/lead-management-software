import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function getSupabase() {
  return createClient();
}

export async function getAuthenticatedUser() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return { user: user ?? null, supabase, error: user ? null : "Unauthorized" };
}

export async function getUserProfile(supabase: Awaited<ReturnType<typeof getSupabase>>, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return profile as Record<string, unknown> | null;
}

export async function getOrganizationId(supabase: Awaited<ReturnType<typeof getSupabase>>, userId: string) {
  const profile = await getUserProfile(supabase, userId);
  return profile?.organization_id as string | null;
}

export async function logAuditEvent(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  params: {
    action: string;
    entity_type: string;
    entity_id: string;
    user_id: string;
    organization_id: string;
    changes?: Record<string, unknown> | null;
    ip_address?: string | null;
  }
) {
  const { error } = await supabase.from("audit_logs").insert({
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    user_id: params.user_id,
    organization_id: params.organization_id,
    changes: params.changes ?? null,
    ip_address: params.ip_address ?? null,
  });
  if (error) console.error("Failed to log audit event:", error.message);
}

export async function logActivity(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  params: {
    lead_id?: string | null;
    type: string;
    description: string;
    created_by: string;
    metadata?: Record<string, unknown> | null;
  }
) {
  const { error } = await supabase.from("activities").insert({
    lead_id: params.lead_id ?? null,
    type: params.type,
    description: params.description,
    created_by: params.created_by,
    metadata: params.metadata ?? null,
  });
  if (error) console.error("Failed to log activity:", error.message);
}

export function generateLeadNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `LEAD-${year}${month}${day}-${random}`;
}

export function unauthorized() {
  return NextResponse.json(
    { data: null, error: "Unauthorized", success: false },
    { status: 401 }
  );
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json(
    { data: null, error: message, success: false },
    { status: 403 }
  );
}

export function notFound(entity = "Resource") {
  return NextResponse.json(
    { data: null, error: `${entity} not found`, success: false },
    { status: 404 }
  );
}

export function badRequest(error: string) {
  return NextResponse.json(
    { data: null, error, success: false },
    { status: 400 }
  );
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json(
    { data: null, error: message, success: false },
    { status: 500 }
  );
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { data, error: null, success: true },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    success: true,
    error: null,
  });
}

export function parseNumericParam(
  value: string | null | undefined,
  fallback: number
): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

export function parseClientInfo(userAgent: string) {
  const ua = userAgent.toLowerCase();
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  if (ua.includes("firefox") && !ua.includes("seamonkey")) browser = "Firefox";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("opr") || ua.includes("opera")) browser = "Opera";
  else if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";

  if (ua.includes("windows nt 10")) os = "Windows 10";
  else if (ua.includes("windows nt 11")) os = "Windows 11";
  else if (ua.includes("mac os x")) os = "macOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("ios") || (ua.includes("iphone") && !ua.includes("ipad"))) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";

  if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android") && !ua.includes("tablet")) device = "Mobile";
  else if (ua.includes("tablet") || ua.includes("ipad")) device = "Tablet";

  return { browser, os, device };
}

export function extractClientInfo(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? null;
  const browserInfo = parseClientInfo(userAgent);

  return {
    ...browserInfo,
    userAgent,
    ip,
    city: request.headers.get("x-vercel-ip-city") ?? null,
    region: request.headers.get("x-vercel-ip-country-region") ?? null,
    country: request.headers.get("x-vercel-ip-country") ?? null,
    latitude: request.headers.get("x-vercel-ip-latitude") ?? null,
    longitude: request.headers.get("x-vercel-ip-longitude") ?? null,
  };
}
