"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BadgeNew } from '@/components/ui/badge-new';
import { FileText, Eye, Download, AlertTriangle } from 'lucide-react';
import { getBadgeMappingForStatus } from '@/lib/badge-mappings';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DetalhesProcessoModalProps {
  isOpen: boolean;
  onClose: () => void;
  processo: any;
  tipo: 'diario' | 'consolidado';
}

export function DetalhesProcessoModal({ isOpen, onClose, processo, tipo }: DetalhesProcessoModalProps) {
  if (!processo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-6">
          <DialogHeader className="pt-6">
            <DialogTitle>Detalhes do Processo</DialogTitle>
            <DialogDescription>
              {processo.id} - {processo.empresa}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="dados" className="w-full py-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            {/* Tab: Dados */}
            <TabsContent value="dados" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg text-black mb-4">Informações Gerais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID do Processo</p>
                    <p className="text-base text-black mt-1">{processo.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Empresa</p>
                    <p className="text-base text-black mt-1">{processo.empresa}</p>
                  </div>
                  
                  {tipo === 'diario' ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Tipo/Modalidade</p>
                        <p className="text-base text-black mt-1">{processo.tipo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="mt-1">
                          <BadgeNew {...getBadgeMappingForStatus(processo.status)}>
                            {processo.status}
                          </BadgeNew>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data Distribuição RC</p>
                        <p className="text-base text-black mt-1">{processo.dataDistribuicaoRC}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data de Início</p>
                        <p className="text-base text-black mt-1">{processo.dataInicio}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Responsável</p>
                        <p className="text-base text-black mt-1">{processo.responsavel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Regional</p>
                        <p className="text-base text-black mt-1">{processo.regional}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Valor</p>
                        <p className="text-base text-black mt-1">{processo.valor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status do Contrato</p>
                        <div className="mt-1">
                          <BadgeNew {...getBadgeMappingForStatus(processo.statusContrato)}>
                            {processo.statusContrato}
                          </BadgeNew>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data Fim da Vigência</p>
                        <p className="text-base text-black mt-1">{processo.dataFimVigencia}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {tipo === 'diario' && (
                <div>
                  <h3 className="text-lg text-black mb-4">Informações Adicionais</h3>
                  
                  {/* Alerta de Devolução ao Administrador */}
                  {processo.status === 'Devolvido ao Administrador' && processo.justificativaDevolucao && (
                    <Alert className="bg-yellow-50 border-yellow-300 mb-4">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-900">
                        <p className="font-semibold mb-2">⚠️ Processo Devolvido pelo Comprador</p>
                        <p className="text-sm mb-1"><strong>Comprador responsável:</strong> {processo.responsavel}</p>
                        <p className="text-sm mb-2"><strong>Motivo da devolução:</strong></p>
                        <div className="bg-white border border-yellow-200 rounded p-3 text-sm text-gray-800">
                          {processo.justificativaDevolucao}
                        </div>
                        <p className="text-xs mt-2 text-yellow-700">
                          Esta requisição precisa da sua análise para definir os próximos passos: reatribuir, devolver ao requisitante ou rejeitar.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Observações</p>
                    <p className="text-base text-black mt-2">
                      Processo em andamento. Acompanhamento regular necessário para garantir cumprimento dos prazos estabelecidos.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab: Histórico */}
            <TabsContent value="historico" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg text-black mb-4">Timeline de Status</h3>
                <div className="space-y-3">
                  {tipo === 'diario' ? (
                    <>
                      <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-black">Processo distribuído</p>
                            <p className="text-xs text-gray-500">{processo.dataDistribuicaoRC}</p>
                          </div>
                          <p className="text-xs text-gray-600">
                            Processo distribuído à Regional Compras • por Sistema
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-black">Processo iniciado</p>
                            <p className="text-xs text-gray-500">{processo.dataInicio}</p>
                          </div>
                          <p className="text-xs text-gray-600">
                            Processo iniciado por {processo.responsavel}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-black">Status atual: {processo.status}</p>
                            <p className="text-xs text-gray-500">Atualizado hoje</p>
                          </div>
                          <p className="text-xs text-gray-600">
                            Última atualização por {processo.responsavel}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-black">Documentação anexada</p>
                            <p className="text-xs text-gray-500">05/11/2025</p>
                          </div>
                          <p className="text-xs text-gray-600">
                            3 documentos anexados ao processo
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-black">Contrato homologado</p>
                            <p className="text-xs text-gray-500">01/01/2024</p>
                          </div>
                          <p className="text-xs text-gray-600">
                            Contrato oficialmente registrado no sistema
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-black">Status atual: {processo.statusContrato}</p>
                            <p className="text-xs text-gray-500">Atualizado hoje</p>
                          </div>
                          <p className="text-xs text-gray-600">
                            Vigência até {processo.dataFimVigencia}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab: Documentos */}
            <TabsContent value="documentos" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg text-black mb-4">Documentos Anexados</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-black">Requisição de Compra.pdf</p>
                        <p className="text-xs text-gray-600">
                          Enviado em {tipo === 'diario' ? processo.dataDistribuicaoRC : '01/01/2024'} • 245 KB
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download size={16} className="mr-2" />
                      Baixar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-black">Proposta Comercial.pdf</p>
                        <p className="text-xs text-gray-600">
                          Enviado em {tipo === 'diario' ? processo.dataInicio : '15/01/2024'} • 1.2 MB
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download size={16} className="mr-2" />
                      Baixar
                    </Button>
                  </div>

                  {tipo === 'consolidado' && (
                    <>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-gray-600" />
                          <div>
                            <p className="text-sm text-black">Contrato Assinado.pdf</p>
                            <p className="text-xs text-gray-600">
                              Enviado em 20/01/2024 • 856 KB
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download size={16} className="mr-2" />
                          Baixar
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-gray-600" />
                          <div>
                            <p className="text-sm text-black">Termo de Referência.pdf</p>
                            <p className="text-xs text-gray-600">
                              Enviado em 25/01/2024 • 512 KB
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download size={16} className="mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-black">Documentação Fiscal.pdf</p>
                        <p className="text-xs text-gray-600">
                          Enviado em 05/11/2025 • 678 KB
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download size={16} className="mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t bg-white pt-4 pb-4 px-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
