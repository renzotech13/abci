"use server";

import { createClient } from "@/lib/supabase/server";

export async function findCertificate(cert: string): Promise<{ certificateId: string } | null> {
  const supabase = await createClient();
  const trimmed = cert.trim().toUpperCase();
  if (!trimmed) return null;
  const { data } = await supabase.from("dogs").select("certificate_id").eq("certificate_id", trimmed).maybeSingle();
  return data ? { certificateId: data.certificate_id } : null;
}
