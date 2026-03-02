import React, { useState } from 'react';
import { Search, Eye, HelpCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { BadgeNew } from '../ui/badge-new';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';
import { EmptyState } from '../EmptyState';

interface MinhasRequisicoesProps {
  onDetalhar?: (rcId: string) => void;
  onNavigateToSuporte?: () => void;
}

interface Requisicao {
  id: string;
  objeto: string;
  dataRequisicao: string;
  status: 'Em Análise' | 'Aguardando Atribuição' | 'Aprovado' | 'Devolvido' | 'Finalizado';
  responsavelAtual: string;
  departamento: string;
}

export function MinhasRequisicoes({ onDetalhar, onNavigateToSuporte }: MinhasRequisicoesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Dados mockados - substituir por dados reais do backend
  const requisicoes: Requisicao[] = [
    {
      id: 'RC-2024-001',
      objeto: 'Aquisição de Material de Escritório para Departamento Administrativo',
      dataRequisicao: '01/11/2025',
      status: 'Em Análise',
      responsavelAtual: 'João Silva (Comprador)',
      departamento: 'Administrativo'
    },
    {
      id: 'RC-2024-015',
      objeto: 'Contratação de Serviços de Manutenção Predial',
      dataRequisicao: '28/10/2025',
      status: 'Em Análise',
      responsavelAtual: 'Maria Costa (Analista)',
      departamento: 'Infraestrutura'
    },
    {
      id: 'RC-2024-008',
      objeto: 'Aquisição de Equipamentos de Informática',
      dataRequisicao: '15/10/2025',
      status: 'Aprovado',
      responsavelAtual: 'Carlos Mendes (Supervisor)',
      departamento: 'TI'
    },
    {
      id: 'RC-2024-003',
      objeto: 'Material de Limpeza e Higienização',
      dataRequisicao: '05/10/2025',
      status: 'Devolvido',
      responsavelAtual: 'Ana Santos (Analista)',
      departamento: 'Serviços Gerais'
    },
    {
      id: 'RC-2023-234',
      objeto: 'Mobiliário para Escritório - Cadeiras e Mesas',
      dataRequisicao: '20/09/2025',
      status: 'Finalizado',
      responsavelAtual: 'Processo Concluído',
      departamento: 'Administrativo'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Análise':
        return 'bg-amber-500 text-white border-amber-600';
      case 'Aguardando Atribuição':
        return 'bg-blue-600 text-white border-blue-700';
      case 'Aprovado':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'Devolvido':
        return 'bg-red-600 text-white border-red-700';
      case 'Finalizado':
        return 'bg-slate-600 text-white border-slate-700';
      default:
        return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'Em Análise':
        return 'bg-yellow-500';
      case 'Aguardando Atribuição':
        return 'bg-blue-500';
      case 'Aprovado':
        return 'bg-green-500';
      case 'Devolvido':
        return 'bg-red-500';
      case 'Finalizado':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredRequisicoes = requisicoes.filter((req) => {
    const matchesSearch = req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.objeto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-black font-bold font-normal text-[30px]">Minhas Requisições de Compra</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe o status das suas solicitações de compra
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-gray-300 hover:bg-gray-50"
            onClick={onNavigateToSuporte}
          >
            <HelpCircle size={18} className="mr-2" />
            Central de Suporte
          </Button>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar por ID ou descrição da requisição..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="Em Análise">Em Análise</SelectItem>
              <SelectItem value="Aguardando Atribuição">Aguardando Atribuição</SelectItem>
              <SelectItem value="Aprovado">Aprovado</SelectItem>
              <SelectItem value="Devolvido">Devolvido</SelectItem>
              <SelectItem value="Finalizado">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <Card className="border border-gray-200">
          <CardContent className="p-0">
            {filteredRequisicoes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">ID da RC</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead className="w-[140px]">Data</TableHead>
                    <TableHead className="w-[180px]">Status</TableHead>
                    <TableHead>Responsável Atual</TableHead>
                    <TableHead className="text-right w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequisicoes.map((req) => (
                    <TableRow key={req.id} className="hover:bg-gray-50">
                      <TableCell className="text-black">{req.id}</TableCell>
                      <TableCell className="text-gray-700">
                        <div className="max-w-md">
                          <p className="line-clamp-2">{req.objeto}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">{req.dataRequisicao}</TableCell>
                      <TableCell>
                        <BadgeNew className={getStatusColor(req.status)}>
                          {req.status}
                        </BadgeNew>
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm">{req.responsavelAtual}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDetalhar?.(req.id)}
                        >
                          <Eye size={14} className="mr-1" />
                          Detalhar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={FileText}
                title="Nenhuma requisição encontrada"
                description="Tente ajustar os filtros ou a busca para encontrar suas requisições."
                variant="compact"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}