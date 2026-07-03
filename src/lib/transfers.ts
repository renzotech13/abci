import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Aprueba un traspaso y, si el destinatario ya tiene cuenta ABCI (email
 * coincide con un profile), reasigna dogs.owner_id — el código original
 * solo marcaba el traspaso como "approved" sin mover la propiedad real.
 */
export async function approveTransfer(
  supabase: SupabaseClient<Database>,
  transfer: { id: string; dog_id: string; to_email: string },
) {
  const { data: recipient } = await supabase
    .from("profiles")
    .select("id, name")
    .ilike("email", transfer.to_email)
    .maybeSingle();

  if (recipient) {
    await supabase.from("dogs").update({
      owner_id: recipient.id,
      owner_name: recipient.name,
    }).eq("id", transfer.dog_id);
  }

  await supabase.from("transfers").update({
    status: "approved",
    completed_at: new Date().toISOString(),
  }).eq("id", transfer.id);

  return { reassigned: !!recipient };
}
