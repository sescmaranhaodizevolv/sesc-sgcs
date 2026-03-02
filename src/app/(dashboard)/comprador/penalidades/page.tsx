import { GerenciadorPenalidades } from "@/components/features/penalidades/GerenciadorPenalidades";

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <GerenciadorPenalidades viewMode="comprador" />
    </div>
  );
}
