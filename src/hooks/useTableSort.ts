import { useMemo, useState } from "react";

type SortDirection = "asc" | "desc" | null;

interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

function parseDateValue(value: string): number | null {
  const trimmed = value.trim();
  const brDateMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (brDateMatch) {
    const day = Number(brDateMatch[1]);
    const month = Number(brDateMatch[2]);
    const year = Number(brDateMatch[3]);
    return new Date(year, month - 1, day).getTime();
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) return parsed;

  return null;
}

function getComparableValue(value: unknown): string | number {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const asDate = parseDateValue(value);
    if (asDate !== null) return asDate;
    return value.toLocaleLowerCase();
  }

  if (value instanceof Date) return value.getTime();

  if (typeof value === "boolean") return Number(value);

  if (value == null) return "";

  return String(value).toLocaleLowerCase();
}

export function useTableSort<T extends object>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: null,
    direction: null,
  });

  const items = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    const sortKey = sortConfig.key;
    const direction = sortConfig.direction;

    const sortedItems = [...data].sort((a, b) => {
      const aValue = getComparableValue(a[sortKey]);
      const bValue = getComparableValue(b[sortKey]);

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortedItems;
  }, [data, sortConfig]);

  const requestSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current.key !== key || current.direction === null) {
        return { key, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }

      return { key: null, direction: null };
    });
  };

  return { items, requestSort, sortConfig };
}

export type { SortDirection, SortConfig };
