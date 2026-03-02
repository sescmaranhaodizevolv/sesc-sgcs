/**
 * EmptyState - Componente para estados vazios
 */
import { FileText } from "lucide-react";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="text-gray-300 mb-4">
                {icon ?? <FileText size={48} />}
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-400 max-w-sm mb-4">{description}</p>
            )}
            {action}
        </div>
    );
}
