"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FilePlus2, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BadgeNew } from "@/components/ui/badge-new";
import { Button } from "@/components/ui/button";
import { FileInput } from "@/components/ui/file-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { deleteAnexo, getAnexos, getProcessoTimeline, uploadAnexo } from "@/services/processosService";
import type { ProcessoAnexo } from "@/services/processosService";
import type { ProcessoTimeline } from "@/types";

type ProcessoTimelineComDetalhes = ProcessoTimeline & {
  responsavel?: { nome: string } | null;
};

interface DetalhesProcessoModalProps {
  isOpen: boolean;
  onClose: () => void;
  processo: any;
  tipo: "diario" | "consolidado";
  canGenerateContract?: boolean;
  isGeneratingContract?: boolean;
  onGenerateContract?: () => void;
  contractAlreadyGenerated?: boolean;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR");
}

function formatCurrency(value: number | string | null | undefined) {
  if (value == null) return "-";

  if (typeof value === "string") return value;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function DetalhesProcessoModal({
  isOpen,
  onClose,
  processo,
  tipo,
  canGenerateContract = false,
  isGeneratingContract = false,
  onGenerateContract,
  contractAlreadyGenerated = false,
}: DetalhesProcessoModalProps) {
  const { currentUser, currentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("dados");
  const [timeline, setTimeline] = useState<ProcessoTimelineComDetalhes[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [anexos, setAnexos] = useState<ProcessoAnexo[]>([]);
  const [isLoadingAnexos, setIsLoadingAnexos] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploadingAnexo, setIsUploadingAnexo] = useState(false);

  const empresaNome = useMemo(
    () => processo?.empresa_vencedora || processo?.fornecedor?.razao_social || "-",
    [processo]
  );
  const responsavelNome = useMemo(() => processo?.responsavel?.nome || "-", [processo]);
  const requisitanteNome = useMemo(() => processo?.requisitante?.nome || "-", [processo]);
  const isGestaoProfile = currentProfile === "admin" || currentProfile === "gestora";
  const processoElegivelContrato = ["Finalizado", "Homologado", "Concluído", "Aprovada"].includes(String(processo?.status || ""));
  const exibirBotaoGerarContrato = tipo === "consolidado" && isGestaoProfile && canGenerateContract && processoElegivelContrato;

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("dados");
      setTimeline([]);
      setAnexos([]);
      setFileToUpload(null);
      return;
    }

    if (activeTab !== "historico" || !processo?.id) return;

    const loadTimeline = async () => {
      setLoadingTimeline(true);

      try {
        const data = await getProcessoTimeline(processo.id);
        setTimeline(data);
      } catch {
        setTimeline([]);
      } finally {
        setLoadingTimeline(false);
      }
    };

    void loadTimeline();
  }, [activeTab, isOpen, processo?.id]);

  useEffect(() => {
    if (!isOpen || activeTab !== "documentos" || !processo?.id) return;

    const loadAnexos = async () => {
      setIsLoadingAnexos(true);

      try {
        const data = await getAnexos(processo.id);
        setAnexos(data);
      } catch {
        setAnexos([]);
      } finally {
        setIsLoadingAnexos(false);
      }
    };

    void loadAnexos();
  }, [activeTab, isOpen, processo?.id]);

  const refreshAnexos = async () => {
    if (!processo?.id) return;
    const data = await getAnexos(processo.id);
    setAnexos(data);
  };

  const handleUploadAnexo = async () => {
    if (!processo?.id || !fileToUpload || !currentUser?.id || isUploadingAnexo) return;

    setIsUploadingAnexo(true);

    try {
      await uploadAnexo(processo.id, fileToUpload, currentUser.id);
      await refreshAnexos();
      setFileToUpload(null);
      toast.success("Anexo enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar anexo", {
        description: error instanceof Error ? error.message : "Não foi possível enviar o anexo.",
      });
    } finally {
      setIsUploadingAnexo(false);
    }
  };

  const handleDeleteAnexo = async (anexoId: string, caminhoArquivo: string) => {
    if (!processo?.id || !currentUser?.id) return;

    try {
      await deleteAnexo(anexoId, caminhoArquivo, processo.id, currentUser.id);
      await refreshAnexos();
      toast.success("Anexo excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir anexo", {
        description: error instanceof Error ? error.message : "Não foi possível excluir o anexo.",
      });
    }
  };

  if (!processo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-6">
          <DialogHeader className="pt-6">
            <DialogTitle>Detalhes do Processo</DialogTitle>
            <DialogDescription>
              {processo.numero_requisicao || processo.numeroRequisicao || processo.numero_processo || "Processo"} - {empresaNome}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full py-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg text-black mb-4">Informações Gerais</h3>
                {exibirBotaoGerarContrato && (
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-900">
                      Este processo está finalizado e pronto para virar um contrato de gestão.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID do Processo</p>
                      <p className="text-base text-black mt-1">{processo.numero_processo || processo.numero_requisicao || processo.numeroRequisicao || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID da Requisição</p>
                    <p className="text-base text-black mt-1">{processo.numero_requisicao || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Objeto</p>
                    <p className="text-base text-black mt-1">{processo.objeto || processo.descricao || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo/Modalidade</p>
                    <p className="text-base text-black mt-1">{processo.modalidade || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="mt-1 inline-flex">
                      <BadgeNew {...getBadgeMappingForStatus(processo.status || "Pendente")}>{processo.status || "-"}</BadgeNew>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prioridade</p>
                    <p className="text-base text-black mt-1">{processo.prioridade || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requisitante</p>
                    <p className="text-base text-black mt-1">{requisitanteNome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Responsável</p>
                    <p className="text-base text-black mt-1">{responsavelNome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fornecedor/Empresa</p>
                    <p className="text-base text-black mt-1">{empresaNome}</p>
                  </div>
                  {tipo === "consolidado" && (
                    <div>
                      <p className="text-sm text-gray-600">Valor</p>
                      <p className="text-base text-black mt-1">{formatCurrency(processo.valor)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Recebimento</p>
                    <p className="text-base text-black mt-1">{formatDate(processo.data_recebimento)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distribuição</p>
                    <p className="text-base text-black mt-1">{formatDate(processo.data_distribuicao)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Finalização</p>
                    <p className="text-base text-black mt-1">{formatDate(processo.data_finalizacao)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Período</p>
                    <p className="text-base text-black mt-1">
                      {formatDate(processo.data_inicio)} - {formatDate(processo.data_fim)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg text-black mb-4">Observações</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm text-gray-700">
                  {processo.observacoes_internas || processo.justificativa_devolucao || "Nenhuma observação cadastrada."}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="historico" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg text-black mb-4">Timeline de Status</h3>
                <div className="space-y-3">
                  {loadingTimeline ? (
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
                      Carregando histórico...
                    </div>
                  ) : timeline.length > 0 ? (
                    timeline.map((evento) => (
                      <div key={evento.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <p className="text-sm text-black">{evento.titulo || "Atualização"}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(evento.criado_em)}</p>
                          </div>
                          <p className="text-xs text-gray-600">
                            {evento.responsavel?.nome || "Sistema"} • {evento.status || "Sem status"}
                          </p>
                          {evento.mensagem && <p className="text-sm text-gray-700 mt-2">{evento.mensagem}</p>}
                          {evento.descricao && <p className="text-sm text-gray-700 mt-2">{evento.descricao}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
                      Nenhum evento registrado para este processo.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documentos" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg text-black mb-4">Documentos Anexados</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600 space-y-3">
                  <FileInput id="detalhes-processo-anexo" accept=".pdf,.doc,.docx" onFileChange={setFileToUpload} />
                  <div className="flex justify-end">
                    <Button size="sm" className="bg-[#003366] hover:bg-[#002244] text-white" onClick={() => void handleUploadAnexo()} disabled={!fileToUpload || isUploadingAnexo}>
                      Enviar
                    </Button>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {isLoadingAnexos ? (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
                      Carregando anexos...
                    </div>
                  ) : anexos.length > 0 ? (
                    anexos.map((anexo) => (
                      <div key={anexo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-gray-600" />
                          <div>
                            <p className="text-sm text-black">{anexo.nome_arquivo}</p>
                            <p className="text-xs text-gray-600">
                              {anexo.criado_por_nome} • {formatDateTime(anexo.criado_em)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(anexo.url_publica, "_blank", "noopener,noreferrer")}>
                            <Download size={16} className="mr-2" />
                            Baixar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void handleDeleteAnexo(anexo.id, anexo.caminho_arquivo)}>
                            <Trash2 size={16} className="mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
                      Nenhum anexo cadastrado para este processo.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t bg-white px-6 py-4">
          {exibirBotaoGerarContrato && (
            <Button
              className="bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => onGenerateContract?.()}
              disabled={isGeneratingContract || contractAlreadyGenerated}
            >
              <FilePlus2 size={16} className="mr-2" />
              {contractAlreadyGenerated ? "Contrato Gerado" : "Gerar Contrato/Consolidar"}
            </Button>
          )}
          <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
