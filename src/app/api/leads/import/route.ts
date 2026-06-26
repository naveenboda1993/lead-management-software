/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import Papa from "papaparse";
import { createLeadSchema } from "@/lib/validations/lead";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logAuditEvent,
  generateLeadNumber,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return badRequest("CSV file is required");

    const csvText = await file.text();
    const { data: rows, errors: parseErrors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parseErrors.length > 0) {
      return badRequest(`CSV parse error: ${parseErrors[0].message}`);
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return badRequest("CSV file is empty or has no data rows");
    }

    const fieldMapping = (row: Record<string, unknown>) => ({
      first_name: row.first_name || row["First Name"] || row["FirstName"] || "",
      last_name: row.last_name || row["Last Name"] || row["LastName"] || "",
      email: row.email || row["Email"] || row["Email Address"] || "",
      mobile: row.mobile || row["Mobile"] || row["Phone"] || row.phone || "",
      company: row.company || row["Company"] || null,
      job_title: row.job_title || row["Job Title"] || row["JobTitle"] || null,
      industry: row.industry || row["Industry"] || null,
      lead_source: String(row.lead_source || row["Lead Source"] || row["LeadSource"] || "MANUAL_ENTRY").toUpperCase(),
      status: String(row.status || row["Status"] || "NEW").toUpperCase(),
      priority: String(row.priority || row["Priority"] || "MEDIUM").toUpperCase(),
      estimated_deal_value: row.estimated_deal_value || row["Estimated Deal Value"] || row["Deal Value"] || null,
      notes: row.notes || row["Notes"] || null,
      tags: row.tags ? String(row.tags).split(";").map((t: string) => t.trim()).filter(Boolean) : null,
    });

    const validLeads: Record<string, unknown>[] = [];
    const failedRows: { row: number; error: string }[] = [];
    let duplicateCount = 0;

    const { data: existingLeads } = await supabase
      .from("leads")
      .select("email, mobile")
      .eq("organization_id", orgId);

    const existingEmails = new Set(existingLeads?.map((l) => l.email?.toLowerCase()) ?? []);
    const existingMobiles = new Set(existingLeads?.map((l) => l.mobile) ?? []);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as Record<string, unknown>;
      const mapped = fieldMapping(row);

      const parsed = createLeadSchema.safeParse(mapped);
      if (!parsed.success) {
        failedRows.push({
          row: i + 1,
          error: parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
        });
        continue;
      }

      const emailLower = parsed.data.email.toLowerCase();
      if (existingEmails.has(emailLower) || existingMobiles.has(parsed.data.mobile)) {
        duplicateCount++;
        continue;
      }

      existingEmails.add(emailLower);
      existingMobiles.add(parsed.data.mobile);

      validLeads.push({
        ...parsed.data,
        lead_number: generateLeadNumber(),
        organization_id: orgId,
        owner_id: user.id,
        assigned_to: user.id,
        lead_source: parsed.data.lead_source || "CSV_UPLOAD",
      });
    }

    let insertedCount = 0;

    if (validLeads.length > 0) {
      const { error: insertError } = await supabase
        .from("leads")
        .insert(validLeads as any)
        .select("id");

      if (insertError) return serverError(insertError);
      insertedCount = validLeads.length;
    }

    await logAuditEvent(supabase, {
      action: "IMPORT",
      entity_type: "lead",
      entity_id: "bulk_import",
      user_id: user.id,
      changes: {
        total: rows.length,
        inserted: insertedCount,
        failed: failedRows.length,
        duplicates: duplicateCount,
      },
    });

    return successResponse({
      summary: {
        total: rows.length,
        success: insertedCount,
        failed: failedRows.length,
        duplicates: duplicateCount,
      },
      failed_rows: failedRows.length > 0 ? failedRows : undefined,
    }, 201);
  } catch (error) {
    return serverError(error);
  }
}

function unauthorized() {
  return Response.json(
    { data: null, error: "Unauthorized", success: false },
    { status: 401 }
  );
}
