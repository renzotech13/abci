"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export function EventRegisterButton({ eventId, initialRegistered }: { eventId: string; initialRegistered: boolean }) {
  const router = useRouter();
  const [registered, setRegistered] = useState(initialRegistered);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/iniciar-sesion");
      return;
    }
    if (registered) {
      await supabase.from("event_registrations").delete().eq("event_id", eventId).eq("user_id", data.user.id);
      setRegistered(false);
    } else {
      await supabase.from("event_registrations").insert({ event_id: eventId, user_id: data.user.id });
      setRegistered(true);
    }
    setPending(false);
  }

  return (
    <Button onClick={handleToggle} disabled={pending} variant={registered ? "outline" : "accent"} size="sm" className="w-full sm:w-auto">
      {registered ? "Cancelar inscripción" : "Inscribirme"}
    </Button>
  );
}
