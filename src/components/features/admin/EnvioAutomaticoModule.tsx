"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Info,
  Search,
  Send,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { createClient } from "@/lib/supabase/client";
import { desbloquearEnvioAutomatico, getProcessosEnvioAutomatico, registrarEnvioManual, type ProcessoEnvioAutomatico } from "@/services/automacaoService";

export function EnvioAutomaticoModule({ title = "Envio Automático" }: { title?: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = useState("monitoramento");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusEnvioFilter, setStatusEnvioFilter] = useState("todos");
  const [processos, setProcessos] = useState<ProcessoEnvioAutomatico[]>([]);
  const [processoSelecionado, setProcessoSelecionado] = useState<ProcessoEnvioAutomatico | null>(null);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [isConfirmacaoEnvioOpen, setIsConfirmacaoEnvioOpen] = useState(false);
  const [processoParaEnviar, setProcessoParaEnviar] = useState<ProcessoEnvioAutomatico | null>(null);
  const [tipoEnvio, setTipoEnvio] = useState<"manual" | "liberar">("manual");

  const loadData = async () => {
    try {
      setProcessos(await getProcessosEnvioAutomatico());
    } catch (error) {
      toast.error("Erro ao carregar monitoramento automático", {
        description: error instanceof Error ? error.message : "Não foi possível carregar os processos do Supabase.",
      });
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`envio-automatico-${title}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "processos" }, () => {
        void loadData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, title]);

  const processosBloqueados = processos.filter((p) => p.status_envio === "Bloqueado por Exceção");
  const processosMonitoramentoFiltrados = processos.filter((p) => p.status_envio !== "Bloqueado por Exceção");
  const currentProcessos = activeTab === "monitoramento" ? processosMonitoramentoFiltrados : processosBloqueados;

  const estatisticas = useMemo(
    () => ({
      totalProcessos: processos.length,
      enviadosAutomaticamente: processos.filter((p) => p.status_envio === "Enviado Automaticamente").length,
      aguardandoExecucao: processos.filter((p) => p.status_envio === "Aguardando Próxima Execução").length,
      bloqueados: processosBloqueados.length,
      preContratos: processosBloqueados.filter((p) => p.classificacao === "pre-contrato").length,
      valorTotalBloqueado: processosBloqueados
        .reduce((acc, processo) => acc + Number((processo.valor_total || "0").replace(/[^0-9,-]/g, "").replace(/\./g, "").replace(/,/g, ".")), 0)
        .toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    }),
    [processos, processosBloqueados],
  );

  const filteredProcessos = currentProcessos.filter((processo) => {
    const matchesSearch =
      processo.id_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.empresa.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "monitoramento") {
      const matchesStatus = statusEnvioFilter === "todos" || processo.status_envio === statusEnvioFilter;
      return matchesSearch && matchesStatus;
    }

    const matchesMotivo = statusEnvioFilter === "todos" || (statusEnvioFilter === "pre-contrato" && processo.classificacao === "pre-contrato");
    return matchesSearch && matchesMotivo;
  });

  const abrirDetalhes = (processo: ProcessoEnvioAutomatico) => {
    setProcessoSelecionado(processo);
    setIsDetalhesModalOpen(true);
  };

  const abrirConfirmacaoEnvio = (processo: ProcessoEnvioAutomatico, tipo: "manual" | "liberar") => {
    setProcessoParaEnviar(processo);
    setTipoEnvio(tipo);
    setIsConfirmacaoEnvioOpen(true);
  };

  const confirmarEnvio = async () => {
    if (!processoParaEnviar) return;

    try {
      if (tipoEnvio === "manual") {
        await registrarEnvioManual(processoParaEnviar.id);
        toast.success("Envio manual registrado com sucesso!", {
          description: `O processo ${processoParaEnviar.id_processo} foi registrado para envio ao fornecedor.`,
        });
      } else {
        await desbloquearEnvioAutomatico(processoParaEnviar.id);
        toast.success("Envio automático liberado!", {
          description: `O processo ${processoParaEnviar.id_processo} voltou ao fluxo automático.`,
        });
      }

      setIsConfirmacaoEnvioOpen(false);
      setProcessoParaEnviar(null);
      await loadData();
    } catch (error) {
      toast.error("Erro ao registrar ação de envio", {
        description: error instanceof Error ? error.message : "Não foi possível concluir a ação solicitada.",
      });
    }
  };

  const podeEnviarManualmente = (statusEnvio: ProcessoEnvioAutomatico["status_envio"]) =>
    statusEnvio === "Enviado Automaticamente" || statusEnvio === "Aguardando Próxima Execução";

  const configuracoes = {
    envioAutomaticoHabilitado: true,
    valorPadrao: "R$ 50.000,00",
    horarioEnvio: "08:00",
    frequenciaEnvio: "Diário",
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-black">{title}</h2>
          <p className="mt-1 text-gray-600">Monitoramento do fluxo de automação de processos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] text-white hover:bg-[#002244]"><Settings className="mr-2" size={20} />Configurações Gerais</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurações do Envio Automático</DialogTitle>
              <DialogDescription>Configure os parâmetros globais do sistema de envio automático.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Valor Padrão Global</Label><Input defaultValue="50.000,00" /></div>
              <div className="space-y-2"><Label>Horário de Envio</Label><Input type="time" defaultValue="08:00" /></div>
              <div className="space-y-2"><Label>Frequência</Label><Select defaultValue="diario"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="diario">Diário</SelectItem><SelectItem value="semanal">Semanal</SelectItem><SelectItem value="mensal">Mensal</SelectItem></SelectContent></Select></div>
              <div className="flex items-center gap-2">{title === "Envio Automático" ? <Checkbox defaultChecked /> : <Switch defaultChecked />}<Label>Habilitar envio automático</Label></div>
              <div className="flex gap-2"><Button variant="outline" className="flex-1">Cancelar</Button><Button className="flex-1 bg-[#003366] text-white hover:bg-[#002244]">Salvar Configurações</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800"><strong>Regra de Automação:</strong> Processos aprovados com valor abaixo de {configuracoes.valorPadrao} são enviados automaticamente ao fornecedor, exceto aqueles bloqueados por exceção.</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><FileText className="text-blue-600" size={20} /></div><div><p className="text-2xl text-blue-600">{estatisticas.totalProcessos}</p><p className="text-sm text-gray-600">Total em Monitoramento</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-green-100 p-2"><CheckCircle className="text-green-600" size={20} /></div><div><p className="text-2xl text-green-600">{estatisticas.enviadosAutomaticamente}</p><p className="text-sm text-gray-600">Enviados Automaticamente</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><Clock className="text-blue-600" size={20} /></div><div><p className="text-2xl text-blue-600">{estatisticas.aguardandoExecucao}</p><p className="text-sm text-gray-600">Aguardando Execução</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-red-100 p-2"><Ban className="text-red-600" size={20} /></div><div><p className="text-2xl text-red-600">{estatisticas.bloqueados}</p><p className="text-sm text-gray-600">Bloqueados por Exceção</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-purple-100 p-2"><DollarSign className="text-purple-600" size={20} /></div><div><p className="text-xl text-purple-600">{estatisticas.valorTotalBloqueado}</p><p className="text-sm text-gray-600">Valor Total Bloqueado</p></div></div></CardContent></Card>
      </div>

      <Card className="border border-gray-200"><CardHeader><CardTitle className="flex items-center gap-2 text-xl text-black"><Settings size={24} />Status do Sistema Automático</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 gap-6 md:grid-cols-2"><div className="space-y-4"><Alert className="border-green-200 bg-green-50"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">Sistema de envio automático está <strong>ATIVO</strong></AlertDescription></Alert><div className="space-y-2"><div className="flex justify-between"><span className="text-gray-600">Valor Limite:</span><span className="text-black">{configuracoes.valorPadrao}</span></div><div className="flex justify-between"><span className="text-gray-600">Horário de Envio:</span><span className="text-black">{configuracoes.horarioEnvio}</span></div><div className="flex justify-between"><span className="text-gray-600">Frequência:</span><span className="text-black">{configuracoes.frequenciaEnvio}</span></div></div></div><div className="space-y-2"><div className="flex justify-between"><span className="text-gray-600">Status:</span><BadgeStatus intent="success" weight="light">Funcionando</BadgeStatus></div><div className="flex justify-between"><span className="text-gray-600">Bloqueios por exceção:</span><span className="text-black">{estatisticas.bloqueados}</span></div></div></div></CardContent></Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="monitoramento">Envios em Monitoramento</TabsTrigger><TabsTrigger value="bloqueados">Bloqueados por Exceção (Ação Manual Requerida)</TabsTrigger></TabsList>

        <TabsContent value="monitoramento" className="space-y-4">
          <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex flex-col gap-4 md:flex-row"><div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><Input className="pl-10" placeholder="Buscar por ID do processo ou empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div><div className="w-full md:w-64"><Select value={statusEnvioFilter} onValueChange={setStatusEnvioFilter}><SelectTrigger><SelectValue placeholder="Filtrar por status de envio" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="Enviado Automaticamente">Enviado Automaticamente</SelectItem><SelectItem value="Aguardando Próxima Execução">Aguardando Execução</SelectItem><SelectItem value="Bloqueado por Exceção">Bloqueado por Exceção</SelectItem></SelectContent></Select></div></div></CardContent></Card>
          <Card className="border border-gray-200"><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-xl text-black">Processos em Monitoramento</CardTitle><span className="text-sm text-gray-600">{filteredProcessos.length} processos listados</span></div></CardHeader><CardContent><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ID do Processo</TableHead><TableHead>Empresa</TableHead><TableHead>Valor Total</TableHead><TableHead>Status Aprovação</TableHead><TableHead>Status do Envio</TableHead><TableHead>Data/Previsão</TableHead><TableHead>Responsável</TableHead><TableHead className="text-center">Ações</TableHead></TableRow></TableHeader><TableBody>{filteredProcessos.map((processo) => <TableRow key={processo.id}><TableCell className="text-black">{processo.id_processo}</TableCell><TableCell className="text-black">{processo.empresa}</TableCell><TableCell className="text-black">{processo.valor_total}</TableCell><TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(processo.status_aprovacao)}>{processo.status_aprovacao}</BadgeStatus></TableCell><TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(processo.status_envio)}>{processo.status_envio}</BadgeStatus></TableCell><TableCell className="text-gray-600">{processo.data_envio || processo.data_bloqueio || "-"}</TableCell><TableCell className="text-gray-600">{processo.responsavel}</TableCell><TableCell><div className="flex items-center justify-center gap-2">{podeEnviarManualmente(processo.status_envio) && <Button size="sm" variant="outline" onClick={() => abrirConfirmacaoEnvio(processo, "manual")} className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"><Send size={16} /></Button>}<Button size="sm" variant="outline" onClick={() => abrirDetalhes(processo)}><Eye size={16} /></Button></div></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
        </TabsContent>

        <TabsContent value="bloqueados" className="space-y-4">
          <Alert className="border-orange-300 bg-orange-50"><AlertCircle className="h-5 w-5 text-orange-600" /><AlertDescription className="text-orange-900"><strong>Atenção - Processos Bloqueados pela Automação:</strong> Estes processos exigem ação manual antes do envio ao fornecedor.</AlertDescription></Alert>
          <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex flex-col gap-4 md:flex-row"><div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><Input className="pl-10" placeholder="Buscar por ID do processo ou empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div><div className="w-full md:w-64"><Select value={statusEnvioFilter} onValueChange={setStatusEnvioFilter}><SelectTrigger><SelectValue placeholder="Filtrar por motivo" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Motivos</SelectItem><SelectItem value="pre-contrato">Pré-Contrato</SelectItem></SelectContent></Select></div></div></CardContent></Card>
          <Card className="border border-gray-200"><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-xl text-black">Processos Bloqueados por Exceção</CardTitle><span className="text-sm text-gray-600">{filteredProcessos.length} processos bloqueados</span></div></CardHeader><CardContent><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ID do Processo</TableHead><TableHead>Empresa</TableHead><TableHead>Valor Total</TableHead><TableHead>Status do Processo</TableHead><TableHead>Data de Aprovação</TableHead><TableHead>Motivo da Exceção</TableHead><TableHead>Responsável</TableHead><TableHead className="text-center">Ações</TableHead></TableRow></TableHeader><TableBody>{filteredProcessos.map((processo) => <TableRow key={processo.id}><TableCell className="text-black">{processo.id_processo}</TableCell><TableCell className="text-black">{processo.empresa}</TableCell><TableCell className="text-black">{processo.valor_total}</TableCell><TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(processo.status_aprovacao)}>{processo.status_aprovacao}</BadgeStatus></TableCell><TableCell className="text-gray-600">{processo.data_aprovacao || "-"}</TableCell><TableCell><BadgeStatus size="sm" intent="purple" weight="medium">{processo.motivo_bloqueio || "Pré-Contrato"}</BadgeStatus></TableCell><TableCell className="text-gray-600">{processo.responsavel}</TableCell><TableCell><div className="flex items-center justify-center gap-2"><Button size="sm" variant="outline" onClick={() => abrirConfirmacaoEnvio(processo, "liberar")} className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"><Send size={16} /></Button><Button size="sm" variant="outline" onClick={() => abrirDetalhes(processo)}><Eye size={16} /></Button></div></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Card className="border border-gray-200"><CardHeader><CardTitle className="flex items-center gap-2 text-lg text-black"><DollarSign size={20} />Configuração de Valores</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="flex items-center justify-between"><span className="text-gray-600">Limite para Envio Automático:</span><span className="text-xl text-black">{configuracoes.valorPadrao}</span></div><div className="text-sm text-gray-500">Processos abaixo deste valor seguem fluxo automático, exceto os bloqueados por exceção.</div><Button variant="outline" className="w-full"><Edit className="mr-2" size={16} />Alterar Limite</Button></div></CardContent></Card><Card className="border border-gray-200"><CardHeader><CardTitle className="flex items-center gap-2 text-lg text-black"><AlertCircle size={20} />Resumo de Bloqueios</CardTitle></CardHeader><CardContent><div className="space-y-3 text-sm text-gray-600"><div className="flex justify-between"><span>Processos bloqueados:</span><span className="text-black">{estatisticas.bloqueados}</span></div><div className="flex justify-between"><span>Pré-Contratos:</span><span className="text-purple-600">{estatisticas.preContratos}</span></div><div className="flex justify-between"><span>Já aprovados (aguardando gestão):</span><span className="text-green-600">{processosBloqueados.filter((p) => p.status_aprovacao === "Aprovada" || p.status_aprovacao === "Aprovado").length}</span></div></div></CardContent></Card></div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetalhesModalOpen} onOpenChange={setIsDetalhesModalOpen}><DialogContent className="max-h-[85vh] max-w-2xl p-0"><div className="flex-1 overflow-y-auto px-6"><DialogHeader className="pt-6"><DialogTitle>Detalhes do Processo</DialogTitle><DialogDescription>Informações completas sobre {processoSelecionado?.id_processo}</DialogDescription></DialogHeader><div className="space-y-4 py-4 pb-6"><div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4"><div><p className="mb-1 text-xs text-gray-600">ID do Processo</p><p className="text-black">{processoSelecionado?.id_processo}</p></div><div><p className="mb-1 text-xs text-gray-600">Tipo</p><p className="text-black">{processoSelecionado?.tipo}</p></div><div><p className="mb-1 text-xs text-gray-600">Empresa</p><p className="text-black">{processoSelecionado?.empresa}</p></div><div><p className="mb-1 text-xs text-gray-600">Valor Total</p><p className="text-black">{processoSelecionado?.valor_total}</p></div><div><p className="mb-1 text-xs text-gray-600">Status da Aprovação</p><BadgeStatus size="sm" {...getBadgeMappingForStatus(processoSelecionado?.status_aprovacao || "")}>{processoSelecionado?.status_aprovacao}</BadgeStatus></div><div><p className="mb-1 text-xs text-gray-600">Status do Envio</p><BadgeStatus size="sm" {...getBadgeMappingForStatus(processoSelecionado?.status_envio || "")}>{processoSelecionado?.status_envio}</BadgeStatus></div></div><div className="space-y-1.5"><Label>Observações</Label><div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-gray-700">{processoSelecionado?.observacoes}</div></div><div className="space-y-1.5"><Label>Responsável</Label><p className="text-black">{processoSelecionado?.responsavel}</p></div></div></div><DialogFooter className="flex gap-2 rounded-b-[8px] border-t bg-white px-6 pb-4 pt-4"><Button variant="outline" className="flex-1" onClick={() => setIsDetalhesModalOpen(false)}>Fechar</Button>{processoSelecionado?.status_envio === "Bloqueado por Exceção" && <Button className="flex-1 bg-red-600 text-white hover:bg-red-700" onClick={() => abrirConfirmacaoEnvio(processoSelecionado, "liberar")}>Desbloquear Envio Automático</Button>}</DialogFooter></DialogContent></Dialog>

      <AlertDialog open={isConfirmacaoEnvioOpen} onOpenChange={setIsConfirmacaoEnvioOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{tipoEnvio === "manual" ? "Confirmar Envio Manual" : "Confirmar Liberação de Envio"}</AlertDialogTitle><AlertDialogDescription>{tipoEnvio === "manual" ? <>Você está prestes a registrar o envio manual do processo <strong>{processoParaEnviar?.id_processo}</strong> para o fornecedor <strong>{processoParaEnviar?.empresa}</strong>.</> : <>Você está prestes a liberar o fluxo automático do processo <strong>{processoParaEnviar?.id_processo}</strong>.</>}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-[#003366] text-white hover:bg-[#002244]" onClick={() => void confirmarEnvio()}>Confirmar Envio</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
