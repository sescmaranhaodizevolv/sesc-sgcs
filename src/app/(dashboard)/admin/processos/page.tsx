import { ProcessosModule } from "@/components/features/processos/ProcessosModule";

export default function AdminProcessosPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ProcessosModule perfil="admin" />
    </div>
  );
}
