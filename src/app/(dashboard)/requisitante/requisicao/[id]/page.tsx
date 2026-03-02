"use client";

/**
 * Requisitante - Detalhe da Requisição com StatusTimeline
 * Somente leitura, sem dados financeiros / observações internas (RN-VIS)
 */
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeStatus } from "@/components/ui/badge-status";
import { StatusTimeline } from "@/components/features/StatusTimeline";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { requisicoesCompra } from "@/lib/dados-sistema";
import type { EtapaTimeline } from "@/types";

function getTimelineEtapas(
    statusRequisicao: string,
    isDevolvida: boolean,
    responsavelAtual: string
): EtapaTimeline[] {
    const normalizarStatus = (status: string) => status.trim().toLowerCase();

    const definirEstadoEtapa = (
        etapa: EtapaTimeline,
        status: EtapaTimeline["status"],
        data: string
    ): EtapaTimeline => ({
        ...etapa,
        status,
        data,
    });

    const etapasBase: EtapaTimeline[] = [
        {
            titulo: "RC recebida pelo setor de compras",
            responsavel: "Setor de Compras",
            data: "Pendente",
            status: "pendente",
            mensagem: "A requisição foi recebida e registrada no fluxo de compras.",
        },
        {
            titulo: "Aguardando atribuição",
            responsavel: "Coordenação de Compras",
            data: "Pendente",
            status: "pendente",
            mensagem: "A requisição aguarda definição do comprador responsável.",
        },
        {
            titulo: "Análise de RC",
            responsavel: "Setor de Compras",
            data: "Pendente",
            status: "pendente",
            mensagem: "A documentação e o escopo da requisição estão em validação.",
        },
        {
            titulo: "Em cotação",
            responsavel: responsavelAtual || "Comprador responsável",
            data: "Pendente",
            status: "pendente",
            mensagem: "As cotações com fornecedores estão sendo conduzidas.",
        },
        {
            titulo: "Tramitando para aprovação",
            responsavel: "Gestão",
            data: "Pendente",
            status: "pendente",
            mensagem: "A requisição está em tramitação para decisão de aprovação.",
        },
        {
            titulo: "Aprovada",
            responsavel: "Aprovador final",
            data: "Pendente",
            status: "pendente",
            mensagem: "A requisição foi validada e autorizada para execução.",
        },
        {
            titulo: "Aguardando entrega",
            responsavel: "Fornecedor / Almoxarifado",
            data: "Pendente",
            status: "pendente",
            mensagem: "Aguardando entrega dos itens ou conclusão do serviço contratado.",
        },
        {
            titulo: "Finalizado",
            responsavel: "Setor Requisitante",
            data: "Pendente",
            status: "pendente",
            mensagem: "Processo concluído com entrega registrada e aceite final.",
        },
    ];

    const statusNormalizado = normalizarStatus(statusRequisicao);
    const statusParaIndiceAtual: Record<string, number> = {
        "rc recebida pelo setor de compras": 0,
        "aguardando atribuição": 1,
        "aguardando atribuicao": 1,
        "análise de rc": 2,
        "analise de rc": 2,
        "em análise": 2,
        "em analise": 2,
        "em cotação": 3,
        "em cotacao": 3,
        "tramitando para aprovação": 4,
        "tramitando para aprovacao": 4,
        "aprovada": 5,
        "aprovado": 5,
        "aguardando entrega": 6,
        "finalizado": 7,
        "finalizada": 7,
    };

    const statusIndicaDevolucao =
        statusNormalizado === "devolvido ao requisitante" ||
        statusNormalizado === "rc devolvida para ajuste";

    if (isDevolvida || statusIndicaDevolucao) {
        const etapasAnteriores = etapasBase
            .slice(0, 3)
            .map((etapa) => definirEstadoEtapa(etapa, "concluido", "Concluído"));

        const etapaDevolucao: EtapaTimeline = {
            titulo: "Devolvido ao Requisitante",
            responsavel: responsavelAtual || "Requisitante",
            data: "Ação necessária",
            status: "em-andamento",
            mensagem: "A requisição precisa de ajustes antes de seguir para cotação.",
        };

        const etapasPosteriores = etapasBase
            .slice(3)
            .map((etapa) => definirEstadoEtapa(etapa, "pendente", "Pendente"));

        return [...etapasAnteriores, etapaDevolucao, ...etapasPosteriores];
    }

    const indiceEtapaAtual = statusParaIndiceAtual[statusNormalizado] ?? 2;

    return etapasBase.map((etapa, index) => {
        if (index < indiceEtapaAtual) {
            return definirEstadoEtapa(etapa, "concluido", "Concluído");
        }

        if (index === indiceEtapaAtual) {
            return definirEstadoEtapa(etapa, "em-andamento", "Em andamento");
        }

        return definirEstadoEtapa(etapa, "pendente", "Pendente");
    });
}

export default function DetalheRequisicaoPage() {
    const params = useParams();
    const router = useRouter();
    const rcId = params.id as string;

    const requisicao = requisicoesCompra.find((r) => r.id === rcId);

    if (!requisicao) {
        return (
            <div className="p-6">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft size={16} className="mr-2" /> Voltar
                </Button>
                <div className="mt-8 text-center">
                    <p className="text-lg text-gray-600">Requisição não encontrada.</p>
                </div>
            </div>
        );
    }

    const statusMapping = getBadgeMappingForStatus(requisicao.status);
    const isDevolvida =
        requisicao.status === "RC devolvida para ajuste" ||
        requisicao.status === "Devolvido ao Requisitante";
    const timelineEtapas = getTimelineEtapas(
        requisicao.status,
        isDevolvida,
        requisicao.responsavelAtual
    );

    return (
        <div className="p-6 space-y-6">
            {/* Voltar */}
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft size={16} className="mr-2" /> Voltar para Minhas Requisições
            </Button>

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl text-black">{requisicao.id}</h2>
                        <BadgeStatus {...statusMapping}>{requisicao.status}</BadgeStatus>
                    </div>
                    <p className="text-lg text-gray-700">{requisicao.objeto}</p>
                </div>
            </div>

            {/* Alerta de Devolução */}
            {isDevolvida && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-800 mb-1">
                        ⚠️ Sua Requisição foi Devolvida
                    </h4>
                    <p className="text-sm text-red-700">
                        Sua requisição de compra foi devolvida para ajustes. Por favor,
                        revise os comentários abaixo e acesse a Central de Suporte para
                        dúvidas.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Detalhes */}
                    <Card className="border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Detalhes da Requisição</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Data da Requisição</p>
                                        <p className="text-sm font-medium">{requisicao.dataRequisicao}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <User size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Responsável Atual</p>
                                        <p className="text-sm font-medium">{requisicao.responsavelAtual}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Building size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Departamento</p>
                                        <p className="text-sm font-medium">{requisicao.departamento}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                    Descrição
                                </h4>
                                <p className="text-sm text-gray-600">{requisicao.descricao}</p>
                            </div>

                            {/* Aviso de dados ocultos (RN-VIS-002/003) */}
                            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                                ℹ️ Dados financeiros, fornecedores e observações internas não
                                estão disponíveis para este perfil.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card className="border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Linha do Tempo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StatusTimeline etapas={timelineEtapas} />
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Lateral */}
                <div className="space-y-6">
                    {/* Ações rápidas */}
                    <Card className="border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Ações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                📋 Imprimir Requisição
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                💬 Abrir Chamado de Suporte
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
