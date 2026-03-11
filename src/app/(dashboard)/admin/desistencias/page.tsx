"use client";

import DesistenciasModule from "@/components/features/penalidades/DesistenciasModule";

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DesistenciasModule viewMode="admin" />
    </div>
  );
}
