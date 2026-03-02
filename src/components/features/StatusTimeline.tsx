/**
 * StatusTimeline - Linha do Tempo de status (Requisitante)
 * Exibe etapas visuais com cores e ícones conforme o status
 */
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { EtapaTimeline } from "@/types";

interface StatusTimelineProps {
    etapas: EtapaTimeline[];
}

const statusConfig = {
    concluido: {
        icon: <CheckCircle size={20} className="text-green-600" />,
        bg: "bg-green-100",
        border: "border-green-300",
        line: "bg-green-300",
        label: "Concluído",
    },
    "em-andamento": {
        icon: <Clock size={20} className="text-blue-600" />,
        bg: "bg-blue-100",
        border: "border-blue-300",
        line: "bg-blue-300",
        label: "Em Andamento",
    },
    pendente: {
        icon: <AlertCircle size={20} className="text-gray-400" />,
        bg: "bg-gray-100",
        border: "border-gray-200",
        line: "bg-gray-200",
        label: "Pendente",
    },
};

export function StatusTimeline({ etapas }: StatusTimelineProps) {
    return (
        <div className="space-y-0">
            {etapas.map((etapa, index) => {
                const config = statusConfig[etapa.status];
                const isLast = index === etapas.length - 1;

                return (
                    <div key={index} className="flex gap-4">
                        {/* Coluna da linha e ícone */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full ${config.bg} ${config.border} border-2 flex items-center justify-center flex-shrink-0`}
                            >
                                {config.icon}
                            </div>
                            {!isLast && (
                                <div className={`w-0.5 h-full min-h-[40px] ${config.line}`} />
                            )}
                        </div>

                        {/* Conteúdo da etapa */}
                        <div className="pb-6 flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-gray-900">
                                    {etapa.titulo}
                                </h4>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${etapa.status === "concluido"
                                            ? "bg-green-100 text-green-700"
                                            : etapa.status === "em-andamento"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                >
                                    {config.label}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Responsável: {etapa.responsavel}
                            </p>
                            <p className="text-xs text-gray-400">{etapa.data}</p>
                            {etapa.mensagem && (
                                <p className="text-xs text-gray-600 mt-1 italic">
                                    {etapa.mensagem}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
