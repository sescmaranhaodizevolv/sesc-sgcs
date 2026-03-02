import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Label } from '../ui/label';
import { FileSpreadsheet, FileText, Filter, BarChart3, TrendingUp, Calendar, DollarSign, FileCheck } from 'lucide-react';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';

export function RelatoriosComprador() {
  const [tipoRelatorio, setTipoRelatorio] = useState('processos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [empresaFilter, setEmpresaFilter] = useState('todas');
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Dados de Processos
  const dadosProcessos = [
    {
      id: 1,
      empresa: 'Empresa ABC Ltda',
      processo: '2024-001',
      tipo: 'Pregão Eletrônico',
      valor: 'R$ 125.000,00',
      status: 'Aprovado',
      dataInicio: '15/01/2024',
      dataFim: '15/07/2024',
      responsavel: 'Maria Silva'
    },
    {
      id: 2,
      empresa: 'Fornecedor XYZ S.A',
      processo: '2024-002',
      tipo: 'Tomada de Preços',
      valor: 'R$ 89.500,00',
      status: 'Em Análise',
      dataInicio: '18/01/2024',
      dataFim: '18/08/2024',
      responsavel: 'João Santos'
    },
    {
      id: 3,
      empresa: 'Serviços DEF Eireli',
      processo: '2024-003',
      tipo: 'Convite',
      valor: 'R$ 45.200,00',
      status: 'Rejeitado',
      dataInicio: '20/01/2024',
      dataFim: '20/07/2024',
      responsavel: 'Ana Costa'
    },
    {
      id: 4,
      empresa: 'Tecnologia GHI Ltda',
      processo: '2024-004',
      tipo: 'Pregão Eletrônico',
      valor: 'R$ 210.000,00',
      status: 'Pendente',
      dataInicio: '22/01/2024',
      dataFim: '22/10/2024',
      responsavel: 'Carlos Oliveira'
    }
  ];

  // Dados de Desistências
  const dadosDesistencias = [
    {
      id: 101,
      empresa: 'Fornecedor Beta Ltda',
      processo: '2024-015',
      motivo: 'Preço inviável',
      dataDesistencia: '10/02/2024',
      valorEstimado: 'R$ 45.000,00',
      responsavel: 'Carlos Oliveira'
    },
    {
      id: 102,
      empresa: 'Empresa Gama S.A',
      processo: '2024-018',
      motivo: 'Não atende requisitos técnicos',
      dataDesistencia: '15/02/2024',
      valorEstimado: 'R$ 78.500,00',
      responsavel: 'Maria Silva'
    },
    {
      id: 103,
      empresa: 'Serviços Delta Eireli',
      processo: '2024-020',
      motivo: 'Prazo de entrega incompatível',
      dataDesistencia: '22/02/2024',
      valorEstimado: 'R$ 32.000,00',
      responsavel: 'João Santos'
    }
  ];

  // Dados de Realinhamento de Preços
  const dadosRealinhamento = [
    {
      id: 201,
      empresa: 'Empresa ABC Ltda',
      processo: '2024-007',
      valorOriginal: 'R$ 125.000,00',
      valorRealinhado: 'R$ 145.000,00',
      percentualAumento: '+16%',
      dataRealinhamento: '05/03/2024',
      justificativa: 'Aumento no custo de matéria-prima',
      status: 'Aprovado'
    },
    {
      id: 202,
      empresa: 'Tecnologia GHI Ltda',
      processo: '2024-011',
      valorOriginal: 'R$ 89.000,00',
      valorRealinhado: 'R$ 98.500,00',
      percentualAumento: '+10.7%',
      dataRealinhamento: '12/03/2024',
      justificativa: 'Inflação e reajuste salarial',
      status: 'Aprovado'
    },
    {
      id: 203,
      empresa: 'Fornecedor XYZ S.A',
      processo: '2024-013',
      valorOriginal: 'R$ 56.000,00',
      valorRealinhado: 'R$ 62.000,00',
      percentualAumento: '+10.7%',
      dataRealinhamento: '18/03/2024',
      justificativa: 'Aumento de combustíveis',
      status: 'Em Análise'
    }
  ];

  // Dados de Penalidades
  const dadosPenalidades = [
    {
      id: 301,
      empresa: 'Construtora Epsilon Ltda',
      processo: '2024-009',
      tipoPenalidade: 'Multa',
      valor: 'R$ 15.000,00',
      motivo: 'Atraso na entrega',
      dataAplicacao: '08/03/2024',
      status: 'Aplicada'
    },
    {
      id: 302,
      empresa: 'Fornecedor Zeta S.A',
      processo: '2024-012',
      tipoPenalidade: 'Advertência',
      valor: '-',
      motivo: 'Qualidade do produto abaixo do esperado',
      dataAplicacao: '15/03/2024',
      status: 'Aplicada'
    },
    {
      id: 303,
      empresa: 'Serviços Theta Eireli',
      processo: '2024-014',
      tipoPenalidade: 'Suspensão Temporária',
      valor: '-',
      motivo: 'Descumprimento de cláusula contratual',
      dataAplicacao: '22/03/2024',
      status: 'Em Recurso'
    }
  ];

  // Dados de Prorrogações
  const dadosProrrogacoes = [
    {
      id: 401,
      empresa: 'Empresa ABC Ltda',
      processo: 'CONT-2023-045',
      dataVencimentoOriginal: '30/03/2024',
      novaDataVencimento: '30/09/2024',
      prazoAdicional: '6 meses',
      dataSolicitacao: '10/02/2024',
      justificativa: 'Continuidade do serviço essencial',
      status: 'Aprovada'
    },
    {
      id: 402,
      empresa: 'Tecnologia GHI Ltda',
      processo: 'CONT-2023-032',
      dataVencimentoOriginal: '15/04/2024',
      novaDataVencimento: '15/10/2024',
      prazoAdicional: '6 meses',
      dataSolicitacao: '20/02/2024',
      justificativa: 'Necessidade de manutenção contínua',
      status: 'Aprovada'
    },
    {
      id: 403,
      empresa: 'Fornecedor XYZ S.A',
      processo: 'CONT-2024-001',
      dataVencimentoOriginal: '30/05/2024',
      novaDataVencimento: '30/08/2024',
      prazoAdicional: '3 meses',
      dataSolicitacao: '05/03/2024',
      justificativa: 'Processo licitatório substituto em andamento',
      status: 'Em Análise'
    }
  ];

  // Dados de Contratos
  const dadosContratos = [
    {
      id: 501,
      numeroContrato: 'CONT-2024-001',
      empresa: 'Empresa ABC Ltda',
      objeto: 'Fornecimento de Material de Escritório',
      valor: 'R$ 125.000,00',
      dataInicio: '01/01/2024',
      dataTermino: '31/12/2024',
      status: 'Ativo',
      tipo: 'Fornecimento'
    },
    {
      id: 502,
      numeroContrato: 'CONT-2024-002',
      empresa: 'Tecnologia GHI Ltda',
      objeto: 'Manutenção de Sistema de TI',
      valor: 'R$ 210.000,00',
      dataInicio: '15/01/2024',
      dataTermino: '15/01/2025',
      status: 'Ativo',
      tipo: 'Serviço'
    },
    {
      id: 503,
      numeroContrato: 'CONT-2023-045',
      empresa: 'Fornecedor XYZ S.A',
      objeto: 'Limpeza e Conservação',
      valor: 'R$ 89.500,00',
      dataInicio: '01/06/2023',
      dataTermino: '31/05/2024',
      status: 'Ativo',
      tipo: 'Serviço'
    },
    {
      id: 504,
      numeroContrato: 'CONT-2023-032',
      empresa: 'Serviços DEF Eireli',
      objeto: 'Segurança Patrimonial',
      valor: 'R$ 156.000,00',
      dataInicio: '01/03/2023',
      dataTermino: '28/02/2024',
      status: 'Inativo',
      tipo: 'Serviço'
    }
  ];

  // Dados de Fornecedores
  const dadosFornecedores = [
    {
      id: 601,
      nome: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      categoria: 'Produtos',
      totalContratos: 3,
      valorTotal: 'R$ 315.000,00',
      status: 'Ativo',
      dataRegistro: '15/01/2023',
      atestados: 5
    },
    {
      id: 602,
      nome: 'Tecnologia GHI Ltda',
      cnpj: '55.444.333/0001-22',
      categoria: 'Tecnologia',
      totalContratos: 2,
      valorTotal: 'R$ 420.000,00',
      status: 'Ativo',
      dataRegistro: '10/10/2022',
      atestados: 8
    },
    {
      id: 603,
      nome: 'Fornecedor XYZ S.A',
      cnpj: '98.765.432/0001-10',
      categoria: 'Serviços',
      totalContratos: 4,
      valorTotal: 'R$ 567.000,00',
      status: 'Ativo',
      dataRegistro: '20/12/2022',
      atestados: 6
    },
    {
      id: 604,
      nome: 'Serviços DEF Eireli',
      cnpj: '11.222.333/0001-44',
      categoria: 'Serviços',
      totalContratos: 1,
      valorTotal: 'R$ 156.000,00',
      status: 'Inativo',
      dataRegistro: '05/11/2022',
      atestados: 3
    }
  ];

  const resumoEstatisticas = {
    totalProcessos: dadosProcessos.length,
    totalDesistencias: dadosDesistencias.length,
    totalRealinhamentos: dadosRealinhamento.length,
    totalPenalidades: dadosPenalidades.length,
    totalProrrogacoes: dadosProrrogacoes.length,
    totalContratos: dadosContratos.length,
    totalFornecedores: dadosFornecedores.length
  };

  const getDadosPorTipo = () => {
    switch (tipoRelatorio) {
      case 'desistencias':
        return dadosDesistencias;
      case 'realinhamento':
        return dadosRealinhamento;
      case 'penalidades':
        return dadosPenalidades;
      case 'prorrogacoes':
        return dadosProrrogacoes;
      case 'contratos':
        return dadosContratos;
      case 'fornecedores':
        return dadosFornecedores;
      default:
        return dadosProcessos;
    }
  };

  const filteredData = getDadosPorTipo();

  const exportToExcel = () => {
    const tipoRelatorioNome = {
      'processos': 'Processos',
      'desistencias': 'Histórico de Desistências',
      'realinhamento': 'Realinhamento de Preços',
      'penalidades': 'Penalidades',
      'prorrogacoes': 'Prorrogações de Processos',
      'contratos': 'Contratos',
      'fornecedores': 'Fornecedores'
    }[tipoRelatorio];
    
    console.log(`Exportando ${filteredData.length} registros para Excel...`);
    alert(`Relatório "${tipoRelatorioNome}" exportado para Excel com sucesso!\n${filteredData.length} registros foram exportados com base nos filtros aplicados.`);
  };

  const exportToPDF = () => {
    const tipoRelatorioNome = {
      'processos': 'Processos',
      'desistencias': 'Histórico de Desistências',
      'realinhamento': 'Realinhamento de Preços',
      'penalidades': 'Penalidades',
      'prorrogacoes': 'Prorrogações de Processos',
      'contratos': 'Contratos',
      'fornecedores': 'Fornecedores'
    }[tipoRelatorio];
    
    console.log(`Exportando ${filteredData.length} registros para PDF...`);
    alert(`Relatório "${tipoRelatorioNome}" exportado para PDF com sucesso!\n${filteredData.length} registros foram exportados com base nos filtros aplicados.`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Relatórios</h2>
          <p className="text-gray-600 mt-1">Área de filtros, resultados e exportação de relatórios de todos os módulos</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white">
              <FileSpreadsheet size={20} className="mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700 text-white">
              <FileText size={20} className="mr-2" />
              Exportar PDF
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            * Exporta todos os registros conforme filtros aplicados
          </p>
        </div>
      </div>

      {/* Resumo de Dados - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-black">{resumoEstatisticas.totalProcessos}</p>
                <p className="text-sm text-gray-600">Total de Processos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileCheck size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl text-green-600">{resumoEstatisticas.totalContratos}</p>
                <p className="text-sm text-gray-600">Contratos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl text-purple-600">{resumoEstatisticas.totalRealinhamentos}</p>
                <p className="text-sm text-gray-600">Realinhamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-2xl text-orange-600">{resumoEstatisticas.totalProrrogacoes}</p>
                <p className="text-sm text-gray-600">Prorrogações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área de Filtros */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-[0px] pt-[24px] pr-[24px] pl-[24px]">
          <CardTitle className="text-xl text-black flex items-center gap-2">
            <Filter size={20} />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Linha - Tipo de Relatório */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="space-y-1.5">
              <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processos">Processos</SelectItem>
                  <SelectItem value="desistencias">Histórico de Desistências</SelectItem>
                  <SelectItem value="realinhamento">Realinhamento de Preços</SelectItem>
                  <SelectItem value="penalidades">Penalidades</SelectItem>
                  <SelectItem value="prorrogacoes">Prorrogações de Processos</SelectItem>
                  <SelectItem value="fornecedores">Fornecedores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros Dinâmicos por Tipo de Relatório */}
          {tipoRelatorio === 'processos' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="em-análise">Em Análise</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
          )}

          {(tipoRelatorio === 'desistencias' || tipoRelatorio === 'realinhamento' || tipoRelatorio === 'penalidades' || tipoRelatorio === 'prorrogacoes') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
          )}

          {tipoRelatorio === 'contratos' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
          )}

          {tipoRelatorio === 'fornecedores' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    <SelectItem value="produtos">Produtos</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="construcao">Construção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="dataInicio">Data Registro</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Filter size={16} className="mr-2" />
              Aplicar Filtros
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter('todos');
                setEmpresaFilter('todas');
                setCategoriaFilter('todas');
                setDataInicio('');
                setDataFim('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>



      {/* Tabela de Resultados - Processos */}
      {tipoRelatorio === 'processos' && (
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Relatório de Processos</CardTitle>
              <span className="text-sm text-gray-600">
                {filteredData.length} registros
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Empresa</TableHead>
                    <TableHead className="min-w-[120px]">Processo</TableHead>
                    <TableHead className="min-w-[180px]">Tipo</TableHead>
                    <TableHead className="min-w-[120px]">Valor</TableHead>
                    <TableHead className="min-w-[140px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Data Início</TableHead>
                    <TableHead className="min-w-[120px]">Data Fim</TableHead>
                    <TableHead className="min-w-[160px]">Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredData as typeof dadosProcessos).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-black">{item.empresa}</TableCell>
                      <TableCell className="text-black">{item.processo}</TableCell>
                      <TableCell className="text-gray-600">{item.tipo}</TableCell>
                      <TableCell className="text-black">{item.valor}</TableCell>
                      <TableCell>
                        <BadgeNew {...getBadgeMappingForStatus(item.status)}>
                          {item.status}
                        </BadgeNew>
                      </TableCell>
                      <TableCell className="text-gray-600">{item.dataInicio}</TableCell>
                      <TableCell className="text-gray-600">{item.dataFim}</TableCell>
                      <TableCell className="text-gray-600">{item.responsavel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Resultados - Desistências */}
      {tipoRelatorio === 'desistencias' && (
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-black">Relatório de Histórico de Desistências</CardTitle>
              <span className="text-sm text-gray-600">{filteredData.length} registros</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Processo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Data Desistência</TableHead>
                    <TableHead>Valor Estimado</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredData as typeof dadosDesistencias).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-black">{item.empresa}</TableCell>
                      <TableCell className="text-black">{item.processo}</TableCell>
                      <TableCell className="text-gray-600">{item.motivo}</TableCell>
                      <TableCell className="text-gray-600">{item.dataDesistencia}</TableCell>
                      <TableCell className="text-black">{item.valorEstimado}</TableCell>
                      <TableCell className="text-gray-600">{item.responsavel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Resultados - Realinhamento */}
      {tipoRelatorio === 'realinhamento' && (
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-black">Relatório de Realinhamento de Preços</CardTitle>
              <span className="text-sm text-gray-600">{filteredData.length} registros</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Processo</TableHead>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Valor Realinhado</TableHead>
                    <TableHead>Percentual</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Justificativa</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredData as typeof dadosRealinhamento).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-black">{item.empresa}</TableCell>
                      <TableCell className="text-black">{item.processo}</TableCell>
                      <TableCell className="text-gray-600">{item.valorOriginal}</TableCell>
                      <TableCell className="text-black">{item.valorRealinhado}</TableCell>
                      <TableCell className="text-red-600">{item.percentualAumento}</TableCell>
                      <TableCell className="text-gray-600">{item.dataRealinhamento}</TableCell>
                      <TableCell className="text-gray-600">{item.justificativa}</TableCell>
                      <TableCell>
                        <BadgeNew {...getBadgeMappingForStatus(item.status)}>
                          {item.status}
                        </BadgeNew>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Resultados - Penalidades */}
      {tipoRelatorio === 'penalidades' && (
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-black">Relatório de Penalidades</CardTitle>
              <span className="text-sm text-gray-600">{filteredData.length} registros</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Processo</TableHead>
                    <TableHead>Tipo de Penalidade</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Data Aplicação</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredData as typeof dadosPenalidades).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-black">{item.empresa}</TableCell>
                      <TableCell className="text-black">{item.processo}</TableCell>
                      <TableCell className="text-gray-600">{item.tipoPenalidade}</TableCell>
                      <TableCell className="text-black">{item.valor}</TableCell>
                      <TableCell className="text-gray-600">{item.motivo}</TableCell>
                      <TableCell className="text-gray-600">{item.dataAplicacao}</TableCell>
                      <TableCell>
                        <BadgeNew {...getBadgeMappingForStatus(item.status)}>
                          {item.status}
                        </BadgeNew>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Resultados - Prorrogações */}
      {tipoRelatorio === 'prorrogacoes' && (
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-black">Relatório de Prorrogações de Processos</CardTitle>
              <span className="text-sm text-gray-600">{filteredData.length} registros</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Vencimento Original</TableHead>
                    <TableHead>Nova Data</TableHead>
                    <TableHead>Prazo Adicional</TableHead>
                    <TableHead>Data Solicitação</TableHead>
                    <TableHead>Justificativa</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredData as typeof dadosProrrogacoes).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-black">{item.empresa}</TableCell>
                      <TableCell className="text-black">{item.processo}</TableCell>
                      <TableCell className="text-gray-600">{item.dataVencimentoOriginal}</TableCell>
                      <TableCell className="text-black">{item.novaDataVencimento}</TableCell>
                      <TableCell className="text-gray-600">{item.prazoAdicional}</TableCell>
                      <TableCell className="text-gray-600">{item.dataSolicitacao}</TableCell>
                      <TableCell className="text-gray-600">{item.justificativa}</TableCell>
                      <TableCell>
                        <BadgeNew {...getBadgeMappingForStatus(item.status)}>
                          {item.status}
                        </BadgeNew>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Resultados - Contratos */}
      {tipoRelatorio === 'contratos' && (
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-black">Relatório de Contratos</CardTitle>
              <span className="text-sm text-gray-600">{filteredData.length} registros</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Contrato</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Término</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredData as typeof dadosContratos).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-black">{item.numeroContrato}</TableCell>
                      <TableCell className="text-black">{item.empresa}</TableCell>
                      <TableCell className="text-gray-600">{item.objeto}</TableCell>
                      <TableCell className="text-black">{item.valor}</TableCell>
                      <TableCell className="text-gray-600">{item.dataInicio}</TableCell>
                      <TableCell className="text-gray-600">{item.dataTermino}</TableCell>
                      <TableCell>
                        <BadgeNew {...getBadgeMappingForStatus(item.status)}>
                          {item.status}
                        </BadgeNew>
                      </TableCell>
                      <TableCell className="text-gray-600">{item.tipo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Resultados - Fornecedores */}
      {tipoRelatorio === 'fornecedores' && (
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-black">Relatório de Fornecedores</CardTitle>
              <span className="text-sm text-gray-600">{filteredData.length} registros</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome/Razão Social</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Total Contratos</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Atestados</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredData as typeof dadosFornecedores).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-black">{item.nome}</TableCell>
                      <TableCell className="text-black">{item.cnpj}</TableCell>
                      <TableCell className="text-gray-600">{item.categoria}</TableCell>
                      <TableCell className="text-gray-600">{item.totalContratos}</TableCell>
                      <TableCell className="text-black">{item.valorTotal}</TableCell>
                      <TableCell className="text-gray-600">{item.atestados}</TableCell>
                      <TableCell>
                        <BadgeNew {...getBadgeMappingForStatus(item.status)}>
                          {item.status}
                        </BadgeNew>
                      </TableCell>
                      <TableCell className="text-gray-600">{item.dataRegistro}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}