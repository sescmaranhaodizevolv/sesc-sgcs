import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/components/ui/utils";
import type { SortDirection } from "@/hooks/useTableSort";

interface SortableTableHeadProps {
  label: string;
  onClick: () => void;
  currentDirection: SortDirection;
  className?: string;
}

export function SortableTableHead({
  label,
  onClick,
  currentDirection,
  className,
}: SortableTableHeadProps) {
  const Icon =
    currentDirection === "asc"
      ? ChevronUp
      : currentDirection === "desc"
        ? ChevronDown
        : ChevronsUpDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex w-full items-center justify-between gap-2 text-left"
      >
        <span>{label}</span>
        <Icon className={cn("h-4 w-4 text-gray-500", currentDirection && "text-sesc-blue")} />
      </button>
    </TableHead>
  );
}
