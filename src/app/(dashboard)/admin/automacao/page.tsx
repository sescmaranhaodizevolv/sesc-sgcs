"use client";

import { useMemo, useState } from "react";
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

interface ProcessoEnvio {
  id: number;
  idProcesso: string;
  empresa: string;
  valorTotal: string;
  statusAprovacao: string;
  statusEnvio: "Enviado Automaticamente" | "Aguardando Próxima Execução" | "Bloqueado por Exceção";
  dataEnvio?: string;
  responsavel: string;
  observacoes: string;
  tipo: string;
  classificacao: "normal" | "pre-contrato";
  motivoBloqueio?: string;
  dataBloqueio?: string;
  dataAprovacao?: string;
}

const todosProcessos: ProcessoEnvio[] = [
  { id: 1, idProcesso: "Vínculo confirmado no ACompra", empresa: "Empresa ABC Ltda", valorTotal: "R$ 28.500,00", statusAprovacao: "Aprovada", statusEnvio: "Enviado Automaticamente", dataEnvio: "25/01/2024 08:00", responsavel: "Sistema Automático", observacoes: "Processo enviado automaticamente ao fornecedor conforme configuração.", tipo: "Dispensa", classificacao: "normal" },
  { id: 2, idProcesso: "Vínculo confirmado no ACompra", empresa: "Tecnologia GHI Ltda", valorTotal: "R$ 35.200,00", statusAprovacao: "Aprovada", statusEnvio: "Enviado Automaticamente", dataEnvio: "25/01/2024 08:00", responsavel: "Sistema Automático", observacoes: "Envio automático executado com sucesso.", tipo: "Inexigibilidade", classificacao: "normal" },
  { id: 3, idProcesso: "Vínculo confirmado no ACompra", empresa: "Soluções JKL Corp", valorTotal: "R$ 42.800,00", statusAprovacao: "Aprovada", statusEnvio: "Enviado Automaticamente", dataEnvio: "24/01/2024 08:00", responsavel: "Sistema Automático", observacoes: "Processo enviado automaticamente.", tipo: "Licitação (Pesquisa de Preço)", classificacao: "normal" },
  { id: 4, idProcesso: "Aguardando sincronização da RC", empresa: "Fornecedor XYZ S.A", valorTotal: "R$ 31.400,00", statusAprovacao: "Aprovada", statusEnvio: "Aguardando Próxima Execução", dataEnvio: "26/01/2024 08:00", responsavel: "João Santos", observacoes: "Processo aprovado hoje. Será enviado na próxima execução automática às 08:00.", tipo: "Dispensa", classificacao: "normal" },
  { id: 5, idProcesso: "Aguardando sincronização da RC", empresa: "Comércio MNO Ltda", valorTotal: "R$ 27.900,00", statusAprovacao: "Aprovada", statusEnvio: "Aguardando Próxima Execução", dataEnvio: "26/01/2024 08:00", responsavel: "Maria Silva", observacoes: "Aguardando próxima execução automática.", tipo: "Dispensa", classificacao: "normal" },
  { id: 6, idProcesso: "Aguardando vínculo contratual", empresa: "Construção JKL Ltda", valorTotal: "R$ 38.500,00", statusAprovacao: "Aprovada", statusEnvio: "Bloqueado por Exceção", motivoBloqueio: "Pré-Contrato", dataBloqueio: "18/01/2024", dataAprovacao: "12/01/2024", responsavel: "João Santos", observacoes: "Criação de contrato pendente. Aguardando definição de cláusulas específicas antes do envio ao fornecedor.", tipo: "Inexigibilidade", classificacao: "pre-contrato" },
  { id: 7, idProcesso: "Aguardando vínculo contratual", empresa: "Serviços ABC Ltda", valorTotal: "R$ 42.300,00", statusAprovacao: "Aprovada", statusEnvio: "Bloqueado por Exceção", motivoBloqueio: "Pré-Contrato", dataBloqueio: "22/01/2024", dataAprovacao: "16/01/2024", responsavel: "Carlos Oliveira", observacoes: "Processo aguardando assinatura de contrato formal antes do envio automático.", tipo: "Licitação (Pesquisa de Preço)", classificacao: "pre-contrato" },
  { id: 8, idProcesso: "Aguardando vínculo contratual", empresa: "Limpeza XYZ Eireli", valorTotal: "R$ 35.600,00", statusAprovacao: "Aprovada", statusEnvio: "Bloqueado por Exceção", motivoBloqueio: "Pré-Contrato", dataBloqueio: "24/01/2024", dataAprovacao: "20/01/2024", responsavel: "Paula Mendes", observacoes: "Processo aguardando formalização de contrato antes do envio.", tipo: "Dispensa", classificacao: "pre-contrato" },
  { id: 9, idProcesso: "Aguardando vínculo contratual", empresa: "Consultoria MNO Ltda", valorTotal: "R$ 48.200,00", statusAprovacao: "Aprovada", statusEnvio: "Bloqueado por Exceção", motivoBloqueio: "Pré-Contrato", dataBloqueio: "23/01/2024", dataAprovacao: "18/01/2024", responsavel: "Ricardo Costa", observacoes: "Aguardando assinatura do contrato de prestação de serviços.", tipo: "Inexigibilidade", classificacao: "pre-contrato" },
  { id: 10, idProcesso: "Em validação pela automação", empresa: "Tecnologia RST S.A", valorTotal: "R$ 41.900,00", statusAprovacao: "Em Análise", statusEnvio: "Bloqueado por Exceção", motivoBloqueio: "Pré-Contrato", dataBloqueio: "25/01/2024", dataAprovacao: "-", responsavel: "Fernanda Lima", observacoes: "Processo em análise jurídica. Contrato em elaboração.", tipo: "Dispensa", classificacao: "pre-contrato" },
];

const configuracoes = {
  envioAutomaticoHabilitado: true,
  valorPadrao: "R$ 50.000,00",
  horarioEnvio: "08:00",
  frequenciaEnvio: "Diário",
  ultimaExecucao: "25/01/2024 08:00",
  proximaExecucao: "26/01/2024 08:00",
};

export default function EnvioAutomaticoPage() {
  const [activeTab, setActiveTab] = useState("monitoramento");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusEnvioFilter, setStatusEnvioFilter] = useState("todos");
  const [processoSelecionado, setProcessoSelecionado] = useState<ProcessoEnvio | null>(null);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [isConfirmacaoEnvioOpen, setIsConfirmacaoEnvioOpen] = useState(false);
  const [processoParaEnviar, setProcessoParaEnviar] = useState<ProcessoEnvio | null>(null);
  const [tipoEnvio, setTipoEnvio] = useState<"manual" | "liberar">("manual");

  const processosBloqueados = todosProcessos.filter((p) => p.statusEnvio === "Bloqueado por Exceção");
  const processosMonitoramentoFiltrados = todosProcessos.filter((p) => p.statusEnvio !== "Bloqueado por Exceção");
  const currentProcessos = activeTab === "monitoramento" ? processosMonitoramentoFiltrados : processosBloqueados;

  const estatisticas = useMemo(
    () => ({
      totalProcessos: todosProcessos.length,
      enviadosAutomaticamente: todosProcessos.filter((p) => p.statusEnvio === "Enviado Automaticamente").length,
      aguardandoExecucao: todosProcessos.filter((p) => p.statusEnvio === "Aguardando Próxima Execução").length,
      bloqueados: processosBloqueados.length,
      preContratos: processosBloqueados.filter((p) => p.classificacao === "pre-contrato").length,
      valorTotalBloqueado: "R$ 206.500,00",
    }),
    [processosBloqueados],
  );

  const filteredProcessos = currentProcessos.filter((processo) => {
    const matchesSearch =
      processo.idProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.empresa.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "monitoramento") {
      const matchesStatus = statusEnvioFilter === "todos" || processo.statusEnvio === statusEnvioFilter;
      return matchesSearch && matchesStatus;
    }
    if (activeTab === "bloqueados") {
      const matchesMotivo = statusEnvioFilter === "todos" || (statusEnvioFilter === "pre-contrato" && processo.classificacao === "pre-contrato");
      return matchesSearch && matchesMotivo;
    }
    return matchesSearch;
  });

  const abrirDetalhes = (processo: ProcessoEnvio) => {
    setProcessoSelecionado(processo);
    setIsDetalhesModalOpen(true);
  };

  const abrirConfirmacaoEnvio = (processo: ProcessoEnvio, tipo: "manual" | "liberar") => {
    setProcessoParaEnviar(processo);
    setTipoEnvio(tipo);
    setIsConfirmacaoEnvioOpen(true);
  };

  const confirmarEnvio = () => {
    if (!processoParaEnviar) return;
    if (tipoEnvio === "manual") {
      toast.success("Envio manual realizado com sucesso!", {
        description: `O processo ${processoParaEnviar.idProcesso} foi enviado manualmente ao fornecedor.`,
      });
    } else {
      const dataAtual = new Date().toLocaleDateString("pt-BR");
      const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      toast.success("Envio Manual Liberado!", {
        description: `O processo ${processoParaEnviar.idProcesso} foi enviado. Registro: ${dataAtual} ${horaAtual} por Maria Silva.`,
      });
    }
    setIsConfirmacaoEnvioOpen(false);
    setProcessoParaEnviar(null);
  };

  const podeEnviarManualmente = (statusEnvio: ProcessoEnvio["statusEnvio"]) =>
    statusEnvio === "Enviado Automaticamente" || statusEnvio === "Aguardando Próxima Execução";

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-black">Envio Automático</h2>
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
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select defaultValue="diario">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="diario">Diário</SelectItem><SelectItem value="semanal">Semanal</SelectItem><SelectItem value="mensal">Mensal</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Habilitar envio automático</Label></div>
              <div className="flex gap-2"><Button variant="outline" className="flex-1">Cancelar</Button><Button className="flex-1 bg-[#003366] text-white hover:bg-[#002244]">Salvar Configurações</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Regra de Automação:</strong> Processos aprovados manualmente no sistema com valor abaixo de R$ 50.000,00 são enviados automaticamente ao fornecedor todos os dias às 08:00, exceto aqueles bloqueados por exceção de pré-contratos.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><FileText className="text-blue-600" size={20} /></div><div><p className="text-2xl text-blue-600">{estatisticas.totalProcessos}</p><p className="text-sm text-gray-600">Total em Monitoramento</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-green-100 p-2"><CheckCircle className="text-green-600" size={20} /></div><div><p className="text-2xl text-green-600">{estatisticas.enviadosAutomaticamente}</p><p className="text-sm text-gray-600">Enviados Automaticamente</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><Clock className="text-blue-600" size={20} /></div><div><p className="text-2xl text-blue-600">{estatisticas.aguardandoExecucao}</p><p className="text-sm text-gray-600">Aguardando Execução</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-red-100 p-2"><Ban className="text-red-600" size={20} /></div><div><p className="text-2xl text-red-600">{estatisticas.bloqueados}</p><p className="text-sm text-gray-600">Bloqueados por Exceção</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-purple-100 p-2"><DollarSign className="text-purple-600" size={20} /></div><div><p className="text-xl text-purple-600">{estatisticas.valorTotalBloqueado}</p><p className="text-sm text-gray-600">Valor Total Bloqueado</p></div></div></CardContent></Card>
      </div>

      <Card className="border border-gray-200">
        <CardHeader><CardTitle className="flex items-center gap-2 text-xl text-black"><Settings size={24} />Status do Sistema Automático</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">Sistema de envio automático está <strong>ATIVO</strong></AlertDescription></Alert>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Valor Limite:</span><span className="text-black">{configuracoes.valorPadrao}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Horário de Envio:</span><span className="text-black">{configuracoes.horarioEnvio}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Frequência:</span><span className="text-black">{configuracoes.frequenciaEnvio}</span></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Última Execução:</span><span className="text-black">{configuracoes.ultimaExecucao}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Próxima Execução:</span><span className="text-blue-600">{configuracoes.proximaExecucao}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Status:</span><BadgeStatus intent="success" weight="light">Funcionando</BadgeStatus></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monitoramento">Envios em Monitoramento</TabsTrigger>
          <TabsTrigger value="bloqueados">Bloqueados por Exceção (Ação Manual Requerida)</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoramento" className="space-y-4">
          <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex flex-col gap-4 md:flex-row"><div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><Input className="pl-10" placeholder="Buscar por ID do processo ou empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div><div className="w-full md:w-64"><Select value={statusEnvioFilter} onValueChange={setStatusEnvioFilter}><SelectTrigger><SelectValue placeholder="Filtrar por status de envio" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="Enviado Automaticamente">Enviado Automaticamente</SelectItem><SelectItem value="Aguardando Próxima Execução">Aguardando Execução</SelectItem><SelectItem value="Bloqueado por Exceção">Bloqueado por Exceção</SelectItem></SelectContent></Select></div></div></CardContent></Card>
          <Card className="border border-gray-200">
            <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-xl text-black">Processos em Monitoramento</CardTitle><span className="text-sm text-gray-600">{filteredProcessos.length} processos listados</span></div></CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>ID do Processo</TableHead><TableHead>Empresa</TableHead><TableHead>Valor Total</TableHead><TableHead>Status Aprovação</TableHead><TableHead>Status do Envio</TableHead><TableHead>Data/Previsão</TableHead><TableHead>Responsável</TableHead><TableHead className="text-center">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredProcessos.map((processo) => (
                      <TableRow key={processo.id}>
                        <TableCell className="text-black">{processo.idProcesso}</TableCell>
                        <TableCell className="text-black">{processo.empresa}</TableCell>
                        <TableCell className="text-black">{processo.valorTotal}</TableCell>
                        <TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(processo.statusAprovacao)}>{processo.statusAprovacao}</BadgeStatus></TableCell>
                        <TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(processo.statusEnvio)}>{processo.statusEnvio}</BadgeStatus></TableCell>
                        <TableCell className="text-gray-600">{processo.dataEnvio || processo.dataBloqueio || "-"}</TableCell>
                        <TableCell className="text-gray-600">{processo.responsavel}</TableCell>
                        <TableCell><div className="flex items-center justify-center gap-2">{podeEnviarManualmente(processo.statusEnvio) && <Button size="sm" variant="outline" onClick={() => abrirConfirmacaoEnvio(processo, "manual")} className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"><Send size={16} /></Button>}<Button size="sm" variant="outline" onClick={() => abrirDetalhes(processo)}><Eye size={16} /></Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bloqueados" className="space-y-4">
          <Alert className="border-orange-300 bg-orange-50"><AlertCircle className="h-5 w-5 text-orange-600" /><AlertDescription className="text-orange-900"><strong>Atenção - Processos Bloqueados pela Automação:</strong> Estes processos foram impedidos de serem enviados automaticamente devido a regras de exceção configuradas. O envio manual só deve ser realizado após validação da Diretoria/Jurídico, conforme a política estabelecida para cada tipo de exceção.</AlertDescription></Alert>
          <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex flex-col gap-4 md:flex-row"><div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><Input className="pl-10" placeholder="Buscar por ID do processo ou empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div><div className="w-full md:w-64"><Select value={statusEnvioFilter} onValueChange={setStatusEnvioFilter}><SelectTrigger><SelectValue placeholder="Filtrar por motivo" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Motivos</SelectItem><SelectItem value="pre-contrato">Pré-Contrato</SelectItem></SelectContent></Select></div></div></CardContent></Card>
          <Card className="border border-gray-200">
            <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-xl text-black">Processos Bloqueados por Exceção</CardTitle><span className="text-sm text-gray-600">{filteredProcessos.length} processos bloqueados</span></div></CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>ID do Processo</TableHead><TableHead>Empresa</TableHead><TableHead>Valor Total</TableHead><TableHead>Status do Processo</TableHead><TableHead>Data de Aprovação</TableHead><TableHead>Motivo da Exceção</TableHead><TableHead>Responsável</TableHead><TableHead className="text-center">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredProcessos.map((processo) => (
                      <TableRow key={processo.id}>
                        <TableCell className="text-black">{processo.idProcesso}</TableCell>
                        <TableCell className="text-black">{processo.empresa}</TableCell>
                        <TableCell className="text-black">{processo.valorTotal}</TableCell>
                        <TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(processo.statusAprovacao)}>{processo.statusAprovacao}</BadgeStatus></TableCell>
                        <TableCell className="text-gray-600">{processo.dataAprovacao}</TableCell>
                        <TableCell><BadgeStatus size="sm" intent="purple" weight="medium">{processo.motivoBloqueio}</BadgeStatus></TableCell>
                        <TableCell className="text-gray-600">{processo.responsavel}</TableCell>
                        <TableCell><div className="flex items-center justify-center gap-2">{processo.statusAprovacao === "Aprovada" && <Button size="sm" variant="outline" onClick={() => abrirConfirmacaoEnvio(processo, "liberar")} className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"><Send size={16} /></Button>}<Button size="sm" variant="outline" onClick={() => abrirDetalhes(processo)}><Eye size={16} /></Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border border-gray-200"><CardHeader><CardTitle className="flex items-center gap-2 text-lg text-black"><DollarSign size={20} />Configuração de Valores</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="flex items-center justify-between"><span className="text-gray-600">Limite para Envio Automático:</span><span className="text-xl text-black">R$ 50.000,00</span></div><div className="text-sm text-gray-500">Processos abaixo deste valor são enviados automaticamente, exceto os bloqueados por exceção.</div><Button variant="outline" className="w-full"><Edit className="mr-2" size={16} />Alterar Limite</Button></div></CardContent></Card>
            <Card className="border border-gray-200"><CardHeader><CardTitle className="flex items-center gap-2 text-lg text-black"><AlertCircle size={20} />Resumo de Bloqueios</CardTitle></CardHeader><CardContent><div className="space-y-3 text-sm text-gray-600"><div className="flex justify-between"><span>Processos bloqueados:</span><span className="text-black">{estatisticas.bloqueados}</span></div><div className="flex justify-between"><span>Pré-Contratos:</span><span className="text-purple-600">{estatisticas.preContratos}</span></div><div className="flex justify-between"><span>Já aprovados (aguardando gestão):</span><span className="text-green-600">{processosBloqueados.filter((p) => p.statusAprovacao === "Aprovada").length}</span></div></div></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetalhesModalOpen} onOpenChange={setIsDetalhesModalOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl p-0">
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6"><DialogTitle>Detalhes do Processo</DialogTitle><DialogDescription>Informações completas sobre {processoSelecionado?.idProcesso}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4 pb-6">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div><p className="mb-1 text-xs text-gray-600">ID do Processo</p><p className="text-black">{processoSelecionado?.idProcesso}</p></div>
                <div><p className="mb-1 text-xs text-gray-600">Tipo</p><p className="text-black">{processoSelecionado?.tipo}</p></div>
                <div><p className="mb-1 text-xs text-gray-600">Empresa</p><p className="text-black">{processoSelecionado?.empresa}</p></div>
                <div><p className="mb-1 text-xs text-gray-600">Valor Total</p><p className="text-black">{processoSelecionado?.valorTotal}</p></div>
                <div><p className="mb-1 text-xs text-gray-600">Status da Aprovação</p><BadgeStatus size="sm" {...getBadgeMappingForStatus(processoSelecionado?.statusAprovacao || "")}>{processoSelecionado?.statusAprovacao}</BadgeStatus></div>
                <div><p className="mb-1 text-xs text-gray-600">Status do Envio</p><BadgeStatus size="sm" {...getBadgeMappingForStatus(processoSelecionado?.statusEnvio || "")}>{processoSelecionado?.statusEnvio}</BadgeStatus></div>
              </div>
              {processoSelecionado?.motivoBloqueio && <div className="space-y-1.5"><Label>Motivo do Bloqueio</Label><BadgeStatus intent="purple" weight="medium">{processoSelecionado.motivoBloqueio}</BadgeStatus></div>}
              <div className="space-y-1.5"><Label>Observações</Label><div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-gray-700">{processoSelecionado?.observacoes}</div></div>
              <div className="space-y-1.5"><Label>Responsável</Label><p className="text-black">{processoSelecionado?.responsavel}</p></div>
              {processoSelecionado?.statusEnvio === "Bloqueado por Exceção" && <Alert className="border-orange-200 bg-orange-50"><Ban className="h-4 w-4 text-orange-600" /><AlertDescription className="text-orange-800"><strong>Processo Bloqueado:</strong> Este processo não será enviado automaticamente ao fornecedor. Para liberar o envio automático, clique em &quot;Desbloquear Envio&quot;.</AlertDescription></Alert>}
              {processoSelecionado?.statusEnvio === "Enviado Automaticamente" && <Alert className="border-green-200 bg-green-50"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800"><strong>Envio Concluído:</strong> Este processo foi enviado automaticamente ao fornecedor em {processoSelecionado?.dataEnvio}.</AlertDescription></Alert>}
              {processoSelecionado?.statusEnvio === "Aguardando Próxima Execução" && <Alert className="border-blue-200 bg-blue-50"><Clock className="h-4 w-4 text-blue-600" /><AlertDescription className="text-blue-800"><strong>Aguardando Execução:</strong> Este processo será enviado automaticamente na próxima execução agendada para {processoSelecionado?.dataEnvio}.</AlertDescription></Alert>}
            </div>
          </div>
          <DialogFooter className="flex gap-2 rounded-b-[8px] border-t bg-white px-6 pb-4 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsDetalhesModalOpen(false)}>Fechar</Button>
            {processoSelecionado?.statusEnvio === "Bloqueado por Exceção" && <Button className="flex-1 bg-red-600 text-white hover:bg-red-700" onClick={() => { toast.success(`Processo ${processoSelecionado?.idProcesso} desbloqueado!`); setIsDetalhesModalOpen(false); }}>Desbloquear Envio Automático</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmacaoEnvioOpen} onOpenChange={setIsConfirmacaoEnvioOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tipoEnvio === "manual" ? "Confirmar Envio Manual" : "Confirmar Liberação de Envio"}</AlertDialogTitle>
            <AlertDialogDescription>
              {tipoEnvio === "manual" ? (
                <>Você está prestes a enviar manualmente o processo <strong>{processoParaEnviar?.idProcesso}</strong> para o fornecedor <strong>{processoParaEnviar?.empresa}</strong>.<br /><br />Esta ação não pode ser desfeita. O fornecedor receberá a notificação imediatamente.</>
              ) : (
                <>Você está prestes a liberar o envio manual do processo <strong>{processoParaEnviar?.idProcesso}</strong> para o fornecedor <strong>{processoParaEnviar?.empresa}</strong>.<br /><br /><span className="text-orange-600">Este processo estava bloqueado por exceção ({processoParaEnviar?.motivoBloqueio}). Certifique-se de que a validação da Diretoria/Jurídico foi realizada.</span><br /><br />O sistema registrará a data, hora e usuário responsável pelo envio.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-[#003366] text-white hover:bg-[#002244]" onClick={confirmarEnvio}>Confirmar Envio</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
