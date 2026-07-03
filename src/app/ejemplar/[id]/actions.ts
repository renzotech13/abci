"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDogPhoto(dogId: string, photo: string | undefined) {
  const supabase = await createClient();
  // RLS exige owner_id = auth.uid() o admin — si el usuario no califica, el
  // update simplemente no afecta filas (no lanza error), así que además
  // validamos que sí haya actualizado algo.
  const { data, error } = await supabase
    .from("dogs")
    .update({ photo_url: photo ?? null })
    .eq("id", dogId)
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false as const, error: error?.message ?? "No autorizado" };
  }

  revalidatePath(`/ejemplar/${dogId}`);
  return { ok: true as const };
}
