/**
 * BadgeStatus - Badge com sistema de cores global
 * Usa o mapeamento de badge-mappings para consistência visual
 */
import { cn } from "@/lib/utils";
import type { BadgeIntent, BadgeWeight } from "@/types";

interface BadgeStatusProps {
    intent: BadgeIntent;
    weight: BadgeWeight;
    size?: "xs" | "sm" | "md";
    children: React.ReactNode;
    className?: string;
}

/** Classes de cor por intent e weight */
const colorMap: Record<BadgeIntent, Record<BadgeWeight, string>> = {
    success: {
        heavy: "bg-green-600 text-white",
        medium: "bg-green-100 text-green-800 border border-green-200",
        light: "bg-green-50 text-green-700",
    },
    info: {
        heavy: "bg-blue-600 text-white",
        medium: "bg-blue-100 text-blue-800 border border-blue-200",
        light: "bg-blue-50 text-blue-700",
    },
    warning: {
        heavy: "bg-yellow-500 text-white",
        medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        light: "bg-yellow-50 text-yellow-700",
    },
    danger: {
        heavy: "bg-red-600 text-white",
        medium: "bg-red-100 text-red-800 border border-red-200",
        light: "bg-red-50 text-red-700",
    },
    neutral: {
        heavy: "bg-gray-600 text-white",
        medium: "bg-gray-100 text-gray-800 border border-gray-200",
        light: "bg-gray-50 text-gray-600",
    },
    purple: {
        heavy: "bg-purple-600 text-white",
        medium: "bg-purple-100 text-purple-800 border border-purple-200",
        light: "bg-purple-50 text-purple-700",
    },
    orange: {
        heavy: "bg-orange-600 text-white",
        medium: "bg-orange-100 text-orange-800 border border-orange-200",
        light: "bg-orange-50 text-orange-700",
    },
};

const sizeMap = {
    xs: "text-xs px-1.5 py-0.5",
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1",
};

export function BadgeStatus({
    intent,
    weight,
    size = "sm",
    children,
    className,
}: BadgeStatusProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full font-medium whitespace-nowrap",
                colorMap[intent][weight],
                sizeMap[size],
                className
            )}
        >
            {children}
        </span>
    );
}
