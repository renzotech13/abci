"use client";

import { Button } from "@/components/ui";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button variant="accent" size="sm" onClick={() => window.print()}>
      <Printer className="w-3.5 h-3.5" /> Imprimir
    </Button>
  );
}
