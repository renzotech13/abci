import { createClient } from "@/lib/supabase/server";
import { EventsList } from "./EventsList";

export default async function EventsPage() {
  const supabase = await createClient();
  const [{ data: events }, { data: claims }] = await Promise.all([
    supabase.from("events").select("*").order("date"),
    supabase.auth.getClaims(),
  ]);
  const userId = claims?.claims?.sub as string | undefined;

  let registeredIds: string[] = [];
  if (userId) {
    const { data: regs } = await supabase.from("event_registrations").select("event_id").eq("user_id", userId);
    registeredIds = (regs ?? []).map(r => r.event_id);
  }

  return <EventsList events={events ?? []} registeredIds={registeredIds} />;
}
