import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Search, FileX, Download, FileText } from 'lucide-react';
import { FileInput } from '../ui/file-input';
import { toast } from 'sonner';

export function DesistenciasComprador() {
  const [searchTerm, setSearchTerm] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState('todas');

  const desistencias = [
    {
      id: 1,
      empresa: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua das Flores, 123, Centro, São Paulo - SP, CEP: 01234-567',
      representanteLegal: 'Carlos Alberto Silva',
      emailContato: 'contato@empresaabc.com.br',
      telefone: '(11) 3456-7890',
      processo: '2024-001',
      tipoProcesso: 'Dispensa',
      valorEstimado: 'R$ 85.000,00',
      dataDesistencia: '25/01/2024',
      dataProtocolo: '25/01/2024 14:32',
      numeroProtocolo: 'PROT-2024-001-DES',
      motivo: 'Não atendimento aos requisitos técnicos',
      observacoes: 'A empresa reconhece que não possui a certificação ISO 9001 exigida no edital, impossibilitando sua participação no processo.',
      responsavel: 'Maria Silva',
      documentoAnexado: true,
      nomeDocumento: 'desistencia_abc_2024-001.pdf'
    },
    {
      id: 2,
      empresa: 'Fornecedor XYZ S.A',
      cnpj: '98.765.432/0001-10',
      endereco: 'Av. Paulista, 1500, Bela Vista, São Paulo - SP, CEP: 01310-100',
      representanteLegal: 'Fernanda Oliveira Santos',
      emailContato: 'juridico@fornecedorxyz.com.br',
      telefone: '(11) 2345-6789',
      processo: '2023-089',
      tipoProcesso: 'Licitação (Pesquisa de Preço)',
      valorEstimado: 'R$ 350.000,00',
      dataDesistencia: '20/01/2024',
      dataProtocolo: '20/01/2024 09:15',
      numeroProtocolo: 'PROT-2024-002-DES',
      motivo: 'Problemas financeiros da empresa',
      observacoes: 'Devido a compromissos financeiros já assumidos com outros contratos, a empresa não possui disponibilidade de capital de giro para execução deste projeto.',
      responsavel: 'João Santos',
      documentoAnexado: true,
      nomeDocumento: 'desistencia_xyz_2023-089.pdf'
    },
    {
      id: 3,
      empresa: 'Serviços DEF Eireli',
      cnpj: '45.678.901/0001-23',
      endereco: 'Rua Consolação, 890, Consolação, São Paulo - SP, CEP: 01302-001',
      representanteLegal: 'Ricardo Mendes Costa',
      emailContato: 'comercial@servicosdef.com.br',
      telefone: '(11) 4567-8901',
      processo: '2024-003',
      tipoProcesso: 'Inexigibilidade',
      valorEstimado: 'R$ 125.000,00',
      dataDesistencia: '18/01/2024',
      dataProtocolo: '18/01/2024 16:45',
      numeroProtocolo: 'PROT-2024-003-DES',
      motivo: 'Mudança na estratégia comercial',
      observacoes: 'A direção da empresa redefiniu seu foco de atuação para outros segmentos de mercado, optando por não participar de processos na área de tecnologia.',
      responsavel: 'Ana Costa',
      documentoAnexado: false,
      nomeDocumento: null
    },
    {
      id: 4,
      empresa: 'Tecnologia GHI Ltda',
      cnpj: '78.901.234/0001-56',
      endereco: 'Rua Augusta, 2500, Jardins, São Paulo - SP, CEP: 01412-100',
      representanteLegal: 'Patricia Alves Rodrigues',
      emailContato: 'suporte@tecnologiaghi.com.br',
      telefone: '(11) 5678-9012',
      processo: '2023-095',
      tipoProcesso: 'Dispensa',
      valorEstimado: 'R$ 220.000,00',
      dataDesistencia: '15/01/2024',
      dataProtocolo: '15/01/2024 11:20',
      numeroProtocolo: 'PROT-2024-004-DES',
      motivo: 'Não disponibilidade para execução no prazo',
      observacoes: 'A empresa está com sua equipe técnica totalmente alocada em projetos de longo prazo já contratados, impossibilitando o cumprimento do cronograma exigido.',
      responsavel: 'Carlos Oliveira',
      documentoAnexado: true,
      nomeDocumento: 'desistencia_ghi_2023-095.pdf'
    }
  ];

  const handleDownloadDocument = (desistencia: typeof desistencias[0]) => {
    if (desistencia.documentoAnexado && desistencia.nomeDocumento) {
      // Simula o download criando um blob com conteúdo de exemplo
      const conteudoSimulado = `CARTA DE DESISTÊNCIA\n\nEmpresa: ${desistencia.empresa}\nProcesso: ${desistencia.processo}\nData: ${desistencia.dataDesistencia}\n\nMotivo: ${desistencia.motivo}\n\nResponsável: ${desistencia.responsavel}\n\nAssinatura: ___________________`;
      
      const blob = new Blob([conteudoSimulado], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = desistencia.nomeDocumento;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download concluído', {
        description: `Arquivo ${desistencia.nomeDocumento} baixado com sucesso`
      });
    }
  };

  const empresas = [...new Set(desistencias.map(d => d.empresa))];

  const filteredDesistencias = desistencias.filter(desistencia => {
    const matchesSearch = desistencia.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desistencia.processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desistencia.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmpresa = empresaFilter === 'todas' || desistencia.empresa === empresaFilter;
    return matchesSearch && matchesEmpresa;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Histórico de Desistências</h2>
          <p className="text-gray-600 mt-1">Registro e acompanhamento de desistências de processos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Plus size={20} className="mr-2" />
              Registrar Desistência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nova Desistência</DialogTitle>
              <DialogDescription>
                Registre uma nova desistência de processo licitatório.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="empresa">Empresa</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map(empresa => (
                      <SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="processo">Número do Processo</Label>
                <Input placeholder="Ex: 2024-001" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="motivo">Motivo da Desistência</Label>
                <Textarea placeholder="Descreva o motivo da desistência..." rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="documento">Documento de Desistência</Label>
                <FileInput 
                  id="documento" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Anexe a carta de desistência ou documento comprobatório (PDF, DOC, DOCX, JPG, PNG)
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                  Registrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FileX size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl text-black">{desistencias.length}</p>
              <p className="text-gray-600">Total de Desistências Registradas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por empresa, processo ou motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Empresas</SelectItem>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desistências Table */}
      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de Desistências</CardTitle>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 min-w-[200px]">Empresa</TableHead>
                  <TableHead className="min-w-[120px]">Processo</TableHead>
                  <TableHead className="min-w-[120px]">Data</TableHead>
                  <TableHead className="min-w-[300px]">Motivo</TableHead>
                  <TableHead className="min-w-[140px]">Documento</TableHead>
                  <TableHead className="min-w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredDesistencias.map((desistencia) => (
                <TableRow key={desistencia.id}>
                  <TableCell className="text-black sticky left-0 z-10">{desistencia.empresa}</TableCell>
                  <TableCell className="text-black">{desistencia.processo}</TableCell>
                  <TableCell className="text-gray-600">{desistencia.dataDesistencia}</TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate" title={desistencia.motivo}>
                    {desistencia.motivo}
                  </TableCell>
                  <TableCell>
                    {desistencia.documentoAnexado ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText size={16} className="text-blue-600" />
                        <span className="text-sm">Anexado</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sem documento</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {desistencia.documentoAnexado ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadDocument(desistencia)}
                        title="Baixar documento"
                      >
                        <Download size={16} />
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
