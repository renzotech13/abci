import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/** Registra una acción de auditoría con el admin actualmente logueado. */
export async function logAdminAction(
  supabase: SupabaseClient<Database>,
  action: string,
  target?: string,
  details?: string,
) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  const { data: profile } = await supabase.from("profiles").select("name").eq("id", data.user.id).maybeSingle();
  await supabase.from("admin_logs").insert({
    admin_id: data.user.id,
    admin_name: profile?.name || "Admin",
    action,
    target: target ?? null,
    details: details ?? null,
  });
}
