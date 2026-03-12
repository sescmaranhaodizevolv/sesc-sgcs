"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, FileX, Download, FileText, Upload } from "lucide-react";
import { FileInput } from "@/components/ui/file-input";
import { toast } from "sonner";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getFornecedores } from "@/services/fornecedoresService";
import { getProcessos } from "@/services/processosService";
import { getDocumentos, uploadDocumento } from "@/services/documentosService";
import { getDesistencias, registrarDesistencia, type Desistencia } from "@/services/penalidadesService";
import type { Fornecedor, ProcessoComDetalhes } from "@/types";

interface DesistenciasModuleProps {
  viewMode: "admin" | "comprador";
}

interface DesistenciaTabela {
  id: string;
  fornecedorId: string | null;
  processoId: string;
  empresa: string;
  processo: string;
  dataDesistencia: string;
  dataDesistenciaRaw: string;
  motivo: string;
  status: string;
  documentoPath: string | null;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

export function DesistenciasModule({ viewMode }: DesistenciasModuleProps) {
  const { currentProfile, currentUser } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const canRegister = viewMode === "admin" || currentProfile === "comprador";

  const [searchTerm, setSearchTerm] = useState("");
  const [empresaFilter, setEmpresaFilter] = useState("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [desistenciasRaw, setDesistenciasRaw] = useState<Desistencia[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [processos, setProcessos] = useState<ProcessoComDetalhes[]>([]);
  const [formData, setFormData] = useState({ fornecedorId: "", processoId: "", motivo: "" });
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [desistencias, fornecedoresData, processosData] = await Promise.all([
        getDesistencias(),
        getFornecedores(),
        getProcessos(),
      ]);
      setDesistenciasRaw(desistencias);
      setFornecedores(fornecedoresData);
      setProcessos(processosData);
    } catch (error) {
      toast.error("Erro ao carregar desistências", {
        description: error instanceof Error ? error.message : "Não foi possível carregar o módulo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("desistencias-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "desistencias" }, () => {
        void loadData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const desistencias = useMemo<DesistenciaTabela[]>(
    () =>
      desistenciasRaw.map((item) => ({
        id: item.id,
        fornecedorId: item.fornecedor_id,
        processoId: item.processo_id,
        empresa: item.fornecedor?.razao_social || "-",
        processo: item.processo?.numero_requisicao || "-",
        dataDesistencia: formatDate(item.criado_em),
        dataDesistenciaRaw: item.criado_em,
        motivo: item.motivo,
        status: item.status,
        documentoPath: item.documento_path,
      })),
    [desistenciasRaw]
  );

  const empresas = useMemo(
    () => Array.from(new Set(desistencias.map((item) => item.empresa).filter((empresa) => empresa && empresa !== "-"))),
    [desistencias]
  );

  const filteredDesistencias = useMemo(
    () =>
      desistencias.filter((item) => {
        const termo = searchTerm.toLowerCase();
        const matchesSearch =
          item.empresa.toLowerCase().includes(termo) ||
          item.processo.toLowerCase().includes(termo) ||
          item.motivo.toLowerCase().includes(termo);
        const matchesEmpresa = empresaFilter === "todas" || item.empresa === empresaFilter;
        return matchesSearch && matchesEmpresa;
      }),
    [desistencias, empresaFilter, searchTerm]
  );

  const { items: sortedDesistencias, requestSort: sortDesistencias, sortConfig: configDesistencias } = useTableSort(filteredDesistencias);

  const handleRegistrar = async () => {
    if (!currentUser?.id || !formData.processoId || !formData.motivo || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const processo = processos.find((item) => item.id === formData.processoId);
      const fornecedorId = formData.fornecedorId || processo?.fornecedor_id || null;
      const fornecedor = fornecedores.find((item) => item.id === fornecedorId);

      let documentoPath: string | null = null;

      if (documentoFile) {
        const documento = await uploadDocumento(
          documentoFile,
          {
            fornecedor_id: fornecedorId,
            processo_id: formData.processoId,
            empresa: fornecedor?.razao_social || processo?.empresa_vencedora || "-",
            processo: processo?.numero_requisicao || formData.processoId,
            tipo: "Desistência",
            categoria: "Desistência",
            periodo: new Date().getFullYear().toString(),
            palavras_chave: ["desistência", fornecedor?.razao_social || "", processo?.numero_requisicao || ""],
            descricao: formData.motivo,
            titulo: `Desistência - ${processo?.numero_requisicao || formData.processoId}`,
            acesso_publico: false,
          },
          currentUser.id
        );
        documentoPath = documento.caminho_arquivo;
      }

      await registrarDesistencia({
        processo_id: formData.processoId,
        fornecedor_id: fornecedorId,
        motivo: formData.motivo,
        documento_path: documentoPath,
        registrado_por: currentUser.id,
      });

      toast.success("Desistência registrada com sucesso!");
      setIsDialogOpen(false);
      setDocumentoFile(null);
      setFormData({ fornecedorId: "", processoId: "", motivo: "" });
    } catch (error) {
      toast.error("Erro ao registrar desistência", {
        description: error instanceof Error ? error.message : "Não foi possível concluir o registro.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDocument = async (desistencia: DesistenciaTabela) => {
    if (!desistencia.documentoPath) return;

    try {
      const documentos = await getDocumentos({ processo_id: desistencia.processoId, tipo: "Desistência" });
      const documento = documentos.find((item) => item.caminho_arquivo === desistencia.documentoPath);

      if (!documento?.url_assinada) {
        toast.error("Documento não encontrado para esta desistência.");
        return;
      }

      window.open(documento.url_assinada, "_blank", "noopener,noreferrer");
      toast.success("Download iniciado");
    } catch (error) {
      toast.error("Erro ao baixar documento", {
        description: error instanceof Error ? error.message : "Não foi possível gerar o link do documento.",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Histórico de Desistências</h2>
          <p className="text-gray-600 mt-1">Registro e acompanhamento de desistências de processos</p>
        </div>
        {canRegister && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />Registrar Desistência
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nova Desistência</DialogTitle>
                <DialogDescription>Registre uma nova desistência de processo licitatório.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Select value={formData.fornecedorId} onValueChange={(value) => setFormData((prev) => ({ ...prev, fornecedorId: value }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                    <SelectContent>
                      {fornecedores.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>{empresa.razao_social}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="processo">Número do Processo</Label>
                  <Select value={formData.processoId} onValueChange={(value) => setFormData((prev) => ({ ...prev, processoId: value }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione o processo" /></SelectTrigger>
                    <SelectContent>
                      {processos.map((processo) => (
                        <SelectItem key={processo.id} value={processo.id}>{processo.numero_requisicao || processo.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="motivo">Motivo da Desistência</Label>
                  <Textarea id="motivo" placeholder="Descreva o motivo da desistência..." rows={3} value={formData.motivo} onChange={(e) => setFormData((prev) => ({ ...prev, motivo: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="documento">Documento de Desistência</Label>
                  <FileInput id="documento" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onFileChange={setDocumentoFile} />
                  <p className="text-xs text-gray-500 mt-1">Anexe a carta de desistência ou documento comprobatório (PDF, DOC, DOCX, JPG, PNG)</p>
                </div>
                <DialogFooter className="px-0 pb-0 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" disabled={isSubmitting} onClick={() => void handleRegistrar()}>Registrar</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg"><FileX size={24} className="text-red-600" /></div>
            <div>
              <p className="text-2xl text-black">{desistencias.length}</p>
              <p className="text-gray-600">Total de Desistências Registradas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por empresa, processo ou motivo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
            <div className="w-full md:w-64"><Select value={empresaFilter} onValueChange={setEmpresaFilter}><SelectTrigger><SelectValue placeholder="Filtrar por empresa" /></SelectTrigger><SelectContent><SelectItem value="todas">Todas as Empresas</SelectItem>{empresas.map((empresa) => (<SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>))}</SelectContent></Select></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de Desistências</CardTitle></CardHeader>
        <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead label="Empresa" onClick={() => sortDesistencias("empresa")} currentDirection={configDesistencias?.key === "empresa" ? configDesistencias.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" />
                  <SortableTableHead label="Processo" onClick={() => sortDesistencias("processo")} currentDirection={configDesistencias?.key === "processo" ? configDesistencias.direction : null} className="min-w-[120px]" />
                  <SortableTableHead label="Data" onClick={() => sortDesistencias("dataDesistenciaRaw")} currentDirection={configDesistencias?.key === "dataDesistenciaRaw" ? configDesistencias.direction : null} className="min-w-[120px]" />
                  <SortableTableHead label="Motivo" onClick={() => sortDesistencias("motivo")} currentDirection={configDesistencias?.key === "motivo" ? configDesistencias.direction : null} className="min-w-[300px]" />
                  <TableHead className="min-w-[140px]">Documento</TableHead>
                  <TableHead className="min-w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDesistencias.map((desistencia) => (
                  <TableRow key={desistencia.id}>
                    <TableCell className="text-black sticky left-0 z-10 bg-white">{desistencia.empresa}</TableCell>
                    <TableCell className="text-black">{desistencia.processo}</TableCell>
                    <TableCell className="text-gray-600">{desistencia.dataDesistencia}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate" title={desistencia.motivo}>{desistencia.motivo}</TableCell>
                    <TableCell>
                      {desistencia.documentoPath ? (
                        <div className="flex items-center gap-2 text-gray-600"><FileText size={16} className="text-blue-600" /><span className="text-sm">Anexado</span></div>
                      ) : (
                        <span className="text-sm text-gray-400">Sem documento</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {desistencia.documentoPath ? (
                        <Button size="sm" variant="outline" onClick={() => void handleDownloadDocument(desistencia)} title="Baixar documento"><Download size={16} /></Button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && sortedDesistencias.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">Nenhuma desistência encontrada.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DesistenciasModule;
