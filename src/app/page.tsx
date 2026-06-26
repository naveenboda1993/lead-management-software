export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();

  if (data.session?.user) {
    redirect("/dashboard");
  }

  redirect("/auth/login");
}
