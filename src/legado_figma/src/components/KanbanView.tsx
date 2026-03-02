import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BadgeNew } from './ui/badge-new';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { MoreVertical, Eye, Calendar, Building2, FileText } from 'lucide-react';
import { getBadgeMappingForStatus } from '../lib/badge-mappings';

interface KanbanViewProps {
  processos: any[];
  onViewDetails: (processo: any) => void;
  onEdit: (processo: any) => void;
  onDelete?: (processo: any) => void;
  tipo: 'diario' | 'consolidado';
  onStatusChange?: (processoId: string, newStatus: string) => void;
  allowDrag?: boolean; // Permite drag and drop
}

interface DraggableCardProps {
  processo: any;
  tipo: 'diario' | 'consolidado';
  onViewDetails: (processo: any) => void;
  onEdit: (processo: any) => void;
  onDelete?: (processo: any) => void;
  allowDrag?: boolean;
}

function DraggableCard({ processo, tipo, onViewDetails, onEdit, onDelete, allowDrag }: DraggableCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (allowDrag === false) {
      e.preventDefault();
      return;
    }
    const data = {
      id: processo.id,
      currentStatus: tipo === 'diario' ? processo.status : processo.statusContrato
    };
    e.dataTransfer.setData('processo', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
    // Adiciona um pouco de transparência visual
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  return (
    <div
      draggable={allowDrag !== false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ cursor: allowDrag !== false ? 'move' : 'default' }}
    >
      <Card className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          {/* Header do card */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">{processo.id}</p>
              <h4 className="text-sm text-black line-clamp-2">
                {processo.empresa}
              </h4>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                  <MoreVertical size={14} className="text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(processo)}>
                  <Eye size={16} className="mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(processo)}>
                  Editar
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(processo)}
                    className="text-red-600"
                  >
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Informações do processo */}
          <div className="space-y-2">
            {tipo === 'diario' ? (
              <>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <FileText size={12} className="flex-shrink-0" />
                  <span className="truncate">{processo.tipo}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar size={12} className="flex-shrink-0" />
                  <span>Início: {processo.dataInicio}</span>
                </div>
                {processo.regional && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Building2 size={12} className="flex-shrink-0" />
                    <span className="truncate">{processo.regional}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs text-black">
                  <span className="flex-shrink-0">Valor:</span>
                  <span className="truncate">{processo.valor}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar size={12} className="flex-shrink-0" />
                  <span>Vigência: {processo.dataFimVigencia}</span>
                </div>
              </>
            )}
          </div>

          {/* Badge de status */}
          <div className="pt-2 border-t border-gray-100">
            <BadgeNew 
              {...getBadgeMappingForStatus(tipo === 'diario' ? processo.status : processo.statusContrato)}
              size="sm"
            >
              {tipo === 'diario' ? processo.status : processo.statusContrato}
            </BadgeNew>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DroppableColumnProps {
  column: any;
  columnProcessos: any[];
  tipo: 'diario' | 'consolidado';
  onViewDetails: (processo: any) => void;
  onEdit: (processo: any) => void;
  onDelete?: (processo: any) => void;
  onDrop: (processoId: string, newStatus: string) => void;
  allowDrag?: boolean;
}

function DroppableColumn({ column, columnProcessos, tipo, onViewDetails, onEdit, onDelete, onDrop, allowDrag }: DroppableColumnProps) {
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessário para permitir drop
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('processo'));
      if (data.currentStatus !== column.id) {
        onDrop(data.id, column.id);
      }
    } catch (error) {
      console.error('Erro ao processar drop:', error);
    }
  };

  const backgroundColor = isOver ? 'rgba(0, 51, 102, 0.05)' : undefined;

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-shrink-0 w-[320px]"
    >
      <Card className="border border-gray-200 h-full" style={{ backgroundColor }}>
        <CardHeader className="pb-3" style={{ borderBottom: `3px solid ${column.color}` }}>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="text-black">{column.title}</span>
            <span 
              className="text-sm px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: column.color }}
            >
              {columnProcessos.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {columnProcessos.length === 0 ? (
            <div className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isOver ? 'border-[#003366] bg-blue-50' : 'border-gray-200'
            }`}>
              <p className="text-sm text-gray-400">
                {isOver ? 'Solte aqui' : 'Nenhum processo'}
              </p>
            </div>
          ) : (
            columnProcessos.map((processo) => (
              <DraggableCard
                key={processo.id}
                processo={processo}
                tipo={tipo}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onDelete={onDelete}
                allowDrag={allowDrag}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function KanbanView({ processos, onViewDetails, onEdit, onDelete, tipo, onStatusChange, allowDrag }: KanbanViewProps) {
  // Definir colunas baseado no tipo
  const columns = tipo === 'diario' 
    ? [
        { id: 'Em Análise', title: 'Em Análise', color: '#155dfc' },
        { id: 'Aguardando Documentação', title: 'Aguardando Documentação', color: '#3b82f6' },
        { id: 'Devolvido ao Administrador', title: 'Devolvido ao Admin', color: '#f59e0b' },
        { id: 'Aprovado', title: 'Aprovado', color: '#22c55e' },
        { id: 'Finalizado', title: 'Finalizado', color: '#10b981' },
      ]
    : [
        { id: 'Ativo', title: 'Ativo', color: '#22c55e' },
        { id: 'Em Renovação', title: 'Em Renovação', color: '#155dfc' },
        { id: 'Vencido', title: 'Vencido', color: '#e7000b' },
        { id: 'Cancelado', title: 'Cancelado', color: '#6b7280' },
      ];

  // Agrupar processos por status
  const groupedProcessos = columns.reduce((acc, column) => {
    acc[column.id] = processos.filter(p => 
      tipo === 'diario' ? p.status === column.id : p.statusContrato === column.id
    );
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnProcessos = groupedProcessos[column.id] || [];
        
        return (
          <DroppableColumn
            key={column.id}
            column={column}
            columnProcessos={columnProcessos}
            tipo={tipo}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            onDrop={onStatusChange ? (processoId, newStatus) => onStatusChange(processoId, newStatus) : () => {}}
            allowDrag={allowDrag}
          />
        );
      })}
    </div>
  );
}