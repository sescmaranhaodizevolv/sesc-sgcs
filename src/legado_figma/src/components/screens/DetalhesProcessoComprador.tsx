import React, { useState } from 'react';
import { ArrowLeft, Save, FileText, Calendar, DollarSign, Building2, User, TrendingUp, Clock, Ban, Upload, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { BadgeNew } from '../ui/badge-new';
import { Alert, AlertDescription } from '../ui/alert';
import { getBadgeMappingForStatus, getBadgeMappingForTipoDocumento } from '../../lib/badge-mappings';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { FileInput } from '../ui/file-input';
import { toast } from 'sonner@2.0.3';

interface DetalhesProcessoCompradorProps {
  processoId?: string;
  onVoltar?: () => void;
}

export function DetalhesProcessoComprador({ processoId = 'PROC-2024-156', onVoltar }: DetalhesProcessoCompradorProps) {
  const [activeTab, setActiveTab] = useState('dados-gerais');
  const [isNovoRealinhamentoOpen, setIsNovoRealinhamentoOpen] = useState(false);
  const [isNovaProrrogacaoOpen, setIsNovaProrrogacaoOpen] = useState(false);
  const [isNovaPenalidadeOpen, setIsNovaPenalidadeOpen] = useState(false);
  const [isUploadDocumentoOpen, setIsUploadDocumentoOpen] = useState(false);
  const [isDevolverAdminOpen, setIsDevolverAdminOpen] = useState(false);
  const [justificativaDevolucao, setJustificativaDevolucao] = useState('');

  // Dados do processo (simulado)
  const processo = {
    id: processoId,
    titulo: 'Aquisição de Material de Escritório',
    modalidade: 'Dispensa',
    status: 'Em Análise',
    responsavel: 'João Silva',
    dataInicio: '01/11/2025',
    empresa: 'Papelaria ABC Ltda',
    valor: 'R$ 15.000,00',
    observacoes: 'Processo em andamento, aguardando validação de documentos.'
  };

  const [formData, setFormData] = useState({
    status: processo.status,
    observacoes: processo.observacoes
  });

  const realinhamentos = [
    {
      id: 1,
      contrato: 'CONT-2024-089',
      item: 'Material de Limpeza',
      valorOriginal: 'R$ 5.000,00',
      valorSolicitado: 'R$ 6.200,00',
      justificativa: 'Aumento de custos de insumos',
      data: '15/10/2025',
      status: 'Em Análise'
    }
  ];

  const prorrogacoes = [
    {
      id: 1,
      contrato: 'CONT-2024-067',
      vigenciaAtual: '31/12/2025',
      novaPrazo: '30/06/2026',
      motivo: 'Continuidade do serviço essencial',
      data: '10/10/2025',
      status: 'Aprovada'
    }
  ];

  const penalidades = [
    {
      id: 1,
      fornecedor: 'Tech Solutions Ltda',
      tipo: 'Atraso na Entrega',
      valor: 'R$ 2.500,00',
      data: '05/10/2025',
      status: 'Aplicada'
    }
  ];

  const documentos = [
    {
      id: 1,
      nome: 'Proposta Comercial - Papelaria ABC.pdf',
      tipo: 'Proposta',
      tamanho: '2.3 MB',
      dataUpload: '02/11/2025',
      uploadPor: 'João Silva'
    },
    {
      id: 2,
      nome: 'RC_PROC-2024-156.pdf',
      tipo: 'RC',
      tamanho: '1.8 MB',
      dataUpload: '01/11/2025',
      uploadPor: 'Sistema'
    }
  ];

  const handleSalvar = () => {
    toast.success('Processo atualizado com sucesso!', {
      description: `As alterações em ${processoId} foram salvas.`
    });
  };

  const handleNovoRealinhamento = () => {
    toast.success('Realinhamento registrado!', {
      description: 'O realinhamento foi adicionado ao processo.'
    });
    setIsNovoRealinhamentoOpen(false);
  };

  const handleNovaProrrogacao = () => {
    toast.success('Prorrogação registrada!', {
      description: 'A prorrogação foi adicionada ao processo.'
    });
    setIsNovaProrrogacaoOpen(false);
  };

  const handleNovaPenalidade = () => {
    toast.success('Penalidade aplicada!', {
      description: 'A penalidade foi registrada no sistema.'
    });
    setIsNovaPenalidadeOpen(false);
  };

  const handleUploadDocumento = () => {
    toast.success('Documento anexado!', {
      description: 'O documento foi vinculado ao processo com sucesso.'
    });
    setIsUploadDocumentoOpen(false);
  };

  const handleDevolverAdmin = () => {
    toast.success('Processo devolvido!', {
      description: 'O processo foi devolvido para análise administrativa.'
    });
    setIsDevolverAdminOpen(false);
    setJustificativaDevolucao('');
  };

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {onVoltar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onVoltar}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={18} className="mr-2" />
                Voltar
              </Button>
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-black">Detalhes do Processo {processoId}</h1>
                <BadgeNew {...getBadgeMappingForStatus(processo.status)}>
                  {processo.status}
                </BadgeNew>
              </div>
              <p className="text-gray-600">{processo.titulo}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDevolverAdminOpen} onOpenChange={setIsDevolverAdminOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Devolver ao Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Devolver ao Administrador</DialogTitle>
                  <DialogDescription>
                    Você encontrou um problema que impede o andamento? Devolva este processo ao Administrador com uma justificativa detalhada.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Ban size={16} className="text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-sm">
                      <strong>Atenção:</strong> O processo será retornado ao Administrador para análise e decisão sobre os próximos passos.
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Label htmlFor="justificativa-devolucao">Justificativa da Devolução *</Label>
                    <Textarea 
                      id="justificativa-devolucao" 
                      rows={5}
                      value={justificativaDevolucao}
                      onChange={(e) => setJustificativaDevolucao(e.target.value)}
                      placeholder="Descreva detalhadamente o motivo da devolução (ex: documentação incompleta, especificações técnicas inadequadas, valores incompatíveis...)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Esta justificativa será enviada ao Administrador para análise.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDevolverAdminOpen(false);
                      setJustificativaDevolucao('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={handleDevolverAdmin}
                    disabled={!justificativaDevolucao.trim()}
                  >
                    Confirmar Devolução
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button 
              className="bg-[#003366] hover:bg-[#002244] text-white"
              onClick={handleSalvar}
            >
              <Save size={18} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Informações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Empresa</p>
              <p className="text-sm text-black">{processo.empresa}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded-lg">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Data de Início</p>
              <p className="text-sm text-black">{processo.dataInicio}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-lg">
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Valor</p>
              <p className="text-sm text-black">{processo.valor}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-orange-100 p-2 rounded-lg">
              <User size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Responsável</p>
              <p className="text-sm text-black">{processo.responsavel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content com Abas */}
      <div className="px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dados-gerais">Dados Gerais</TabsTrigger>
            <TabsTrigger value="realinhamento">Realinhamento</TabsTrigger>
            <TabsTrigger value="prorrogacao">Prorrogação</TabsTrigger>
            <TabsTrigger value="penalidades">Penalidades</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          {/* Aba: Dados Gerais */}
          <TabsContent value="dados-gerais">
            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <CardTitle className="text-xl text-black px-[0px] py-[8px]">Informações do Processo</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <FileText size={16} className="text-blue-600" />
                  <AlertDescription className="text-sm text-gray-700">
                    Você pode editar o status e as observações deste processo porque você é o responsável.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="id">ID do Processo</Label>
                    <Input id="id" value={processo.id} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label htmlFor="modalidade">Modalidade</Label>
                    <Input id="modalidade" value={processo.modalidade} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label htmlFor="status">Status Atual *</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aguardando Documentação">Aguardando Documentação</SelectItem>
                        <SelectItem value="Em Análise">Em Análise</SelectItem>
                        <SelectItem value="Aprovado">Aprovado</SelectItem>
                        <SelectItem value="Finalizado">Finalizado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input id="responsavel" value={processo.responsavel} disabled className="bg-gray-50" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input id="empresa" value={processo.empresa} disabled className="bg-gray-50" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="observacoes">Observações Internas</Label>
                    <Textarea 
                      id="observacoes" 
                      rows={4}
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Adicione observações sobre o andamento do processo..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Use este campo para registrar o andamento e substituir anotações em planilhas.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Realinhamento */}
          <TabsContent value="realinhamento">
            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-black px-[0px] py-[8px]">Realinhamentos de Preço</CardTitle>
                  <Dialog open={isNovoRealinhamentoOpen} onOpenChange={setIsNovoRealinhamentoOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                        <TrendingUp size={18} className="mr-2" />
                        Novo Realinhamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Registrar Realinhamento de Preço</DialogTitle>
                        <DialogDescription>
                          Adicione as informações do realinhamento solicitado pelo fornecedor.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="contrato-realinhamento">Contrato</Label>
                            <Input id="contrato-realinhamento" placeholder="Ex: CONT-2024-001" />
                          </div>
                          <div>
                            <Label htmlFor="item-realinhamento">Item</Label>
                            <Input id="item-realinhamento" placeholder="Ex: Material de Limpeza" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="valor-original">Valor Original</Label>
                            <Input id="valor-original" placeholder="R$ 0,00" />
                          </div>
                          <div>
                            <Label htmlFor="valor-solicitado">Valor Solicitado</Label>
                            <Input id="valor-solicitado" placeholder="R$ 0,00" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="justificativa-realinhamento">Justificativa</Label>
                          <Textarea id="justificativa-realinhamento" rows={3} placeholder="Descreva o motivo do realinhamento..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNovoRealinhamentoOpen(false)}>Cancelar</Button>
                        <Button className="bg-[#003366] hover:bg-[#002244]" onClick={handleNovoRealinhamento}>Registrar Realinhamento</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {realinhamentos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Valor Original</TableHead>
                        <TableHead>Valor Solicitado</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realinhamentos.map((realinhamento) => (
                        <TableRow key={realinhamento.id}>
                          <TableCell className="text-black">{realinhamento.contrato}</TableCell>
                          <TableCell className="text-gray-700">{realinhamento.item}</TableCell>
                          <TableCell className="text-gray-700">{realinhamento.valorOriginal}</TableCell>
                          <TableCell className="text-black">{realinhamento.valorSolicitado}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{realinhamento.data}</TableCell>
                          <TableCell>
                            <BadgeNew {...getBadgeMappingForStatus(realinhamento.status)}>{realinhamento.status}</BadgeNew>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Ver Detalhes</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center">
                    <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-2">Nenhum realinhamento registrado</p>
                    <p className="text-sm text-gray-500">Clique em "Novo Realinhamento" para adicionar um registro.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Prorrogação */}
          <TabsContent value="prorrogacao">
            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-black px-[0px] py-[8px]">Prorrogações de Contrato</CardTitle>
                  <Dialog open={isNovaProrrogacaoOpen} onOpenChange={setIsNovaProrrogacaoOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                        <Clock size={18} className="mr-2" />
                        Nova Prorrogação
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Registrar Prorrogação de Processo</DialogTitle>
                        <DialogDescription>
                          Adicione as informações da prorrogação solicitada.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="contrato-prorrogacao">Contrato</Label>
                          <Input id="contrato-prorrogacao" placeholder="Ex: CONT-2024-001" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="vigencia-atual">Vigência Atual</Label>
                            <Input id="vigencia-atual" type="date" />
                          </div>
                          <div>
                            <Label htmlFor="nova-vigencia">Nova Vigência</Label>
                            <Input id="nova-vigencia" type="date" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="motivo-prorrogacao">Motivo da Prorrogação</Label>
                          <Textarea id="motivo-prorrogacao" rows={3} placeholder="Descreva o motivo da prorrogação..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNovaProrrogacaoOpen(false)}>Cancelar</Button>
                        <Button className="bg-[#003366] hover:bg-[#002244]" onClick={handleNovaProrrogacao}>Registrar Prorrogação</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {prorrogacoes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Vigência Atual</TableHead>
                        <TableHead>Nova Vigência</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prorrogacoes.map((prorrogacao) => (
                        <TableRow key={prorrogacao.id}>
                          <TableCell className="text-black">{prorrogacao.contrato}</TableCell>
                          <TableCell className="text-gray-700">{prorrogacao.vigenciaAtual}</TableCell>
                          <TableCell className="text-gray-700">{prorrogacao.novaPrazo}</TableCell>
                          <TableCell className="text-gray-700">{prorrogacao.motivo}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{prorrogacao.data}</TableCell>
                          <TableCell>
                            <BadgeNew {...getBadgeMappingForStatus(prorrogacao.status)}>{prorrogacao.status}</BadgeNew>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Ver Detalhes</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center">
                    <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-2">Nenhuma prorrogação registrada</p>
                    <p className="text-sm text-gray-500">Clique em "Nova Prorrogação" para adicionar um registro.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Penalidades */}
          <TabsContent value="penalidades">
            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-black px-[0px] py-[8px]">Penalidades Aplicadas</CardTitle>
                  <Dialog open={isNovaPenalidadeOpen} onOpenChange={setIsNovaPenalidadeOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                        <Ban size={18} className="mr-2" />
                        Aplicar Penalidade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Aplicar Penalidade</DialogTitle>
                        <DialogDescription>
                          Registre a penalidade conforme a Resolução aplicável.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="fornecedor-penalidade">Fornecedor</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o fornecedor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="abc">Papelaria ABC Ltda</SelectItem>
                              <SelectItem value="xyz">Tech Solutions Ltda</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="tipo-penalidade">Tipo de Penalidade</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="atraso">Atraso na Entrega</SelectItem>
                              <SelectItem value="qualidade">Qualidade Inadequada</SelectItem>
                              <SelectItem value="descumprimento">Descumprimento Contratual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="valor-penalidade">Valor da Multa</Label>
                          <Input id="valor-penalidade" placeholder="R$ 0,00" />
                        </div>
                        <div>
                          <Label htmlFor="justificativa-penalidade">Justificativa</Label>
                          <Textarea id="justificativa-penalidade" rows={3} placeholder="Descreva o motivo da penalidade..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNovaPenalidadeOpen(false)}>Cancelar</Button>
                        <Button className="bg-[#003366] hover:bg-[#002244]" onClick={handleNovaPenalidade}>Aplicar Penalidade</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {penalidades.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {penalidades.map((penalidade) => (
                        <TableRow key={penalidade.id}>
                          <TableCell className="text-black">{penalidade.fornecedor}</TableCell>
                          <TableCell className="text-gray-700">{penalidade.tipo}</TableCell>
                          <TableCell className="text-black">{penalidade.valor}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{penalidade.data}</TableCell>
                          <TableCell>
                            <BadgeNew {...getBadgeMappingForStatus(penalidade.status)}>{penalidade.status}</BadgeNew>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Ver Detalhes</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center">
                    <Ban size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-2">Nenhuma penalidade aplicada</p>
                    <p className="text-sm text-gray-500">Clique em "Aplicar Penalidade" para adicionar um registro.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Documentos */}
          <TabsContent value="documentos">
            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-black px-[0px] py-[8px]">Documentos do Processo</CardTitle>
                  <Dialog open={isUploadDocumentoOpen} onOpenChange={setIsUploadDocumentoOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                        <Upload size={18} className="mr-2" />
                        Upload de Documento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload de Documento</DialogTitle>
                        <DialogDescription>
                          Anexe documentos ao processo (PDF, DOC, XLS).
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="tipo-documento">Tipo de Documento</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="proposta">Proposta Comercial</SelectItem>
                              <SelectItem value="rc">RC (Requisição de Compra)</SelectItem>
                              <SelectItem value="atestado">Atestado de Capacidade</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Arquivo</Label>
                          <FileInput accept=".pdf,.doc,.docx,.xls,.xlsx" />
                          <p className="text-xs text-gray-500 mt-1">Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadDocumentoOpen(false)}>Cancelar</Button>
                        <Button className="bg-[#003366] hover:bg-[#002244]" onClick={handleUploadDocumento}>Fazer Upload</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {documentos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Arquivo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead>Data de Upload</TableHead>
                        <TableHead>Upload por</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documentos.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="text-black">{doc.nome}</TableCell>
                          <TableCell>
                            <BadgeNew {...getBadgeMappingForTipoDocumento(doc.tipo)}>{doc.tipo}</BadgeNew>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">{doc.tamanho}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{doc.dataUpload}</TableCell>
                          <TableCell className="text-gray-700">{doc.uploadPor}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-2">Nenhum documento anexado</p>
                    <p className="text-sm text-gray-500">Clique em "Upload de Documento" para adicionar arquivos.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}