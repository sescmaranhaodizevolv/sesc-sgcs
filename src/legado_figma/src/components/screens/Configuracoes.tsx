import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  Save,
  Camera,
  CheckCircle,
  MessageCircle,
  ExternalLink,
  Key,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  Globe
} from 'lucide-react';

interface ConfiguracoesProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  currentProfile?: 'admin' | 'comprador' | 'requisitante' | 'gestora';
}

export function Configuracoes({ activeTab = 'perfil', onTabChange, currentProfile = 'admin' }: ConfiguracoesProps) {
  const [selectedTab, setSelectedTab] = useState(activeTab);
  const [notificacaoSalva, setNotificacaoSalva] = useState(false);
  
  // Estados para gerenciamento de APIs customizadas
  const [isNovaApiModalOpen, setIsNovaApiModalOpen] = useState(false);
  const [isEditarApiModalOpen, setIsEditarApiModalOpen] = useState(false);
  const [apiEditando, setApiEditando] = useState<any>(null);
  const [apisCustomizadas, setApisCustomizadas] = useState([
    {
      id: 1,
      nome: 'Tawk.to - Chatbot de Suporte',
      urlBase: 'https://embed.tawk.to',
      descricao: 'Plataforma de chat ao vivo e chatbot para atendimento e suporte aos usuários do sistema',
      ativo: true,
      dataCriacao: '05/01/2026',
      tipo: 'chatbot'
    },
    {
      id: 2,
      nome: 'API de Validação de CNPJ',
      urlBase: 'https://api.cnpj.ws/v2',
      descricao: 'Validação automática de dados cadastrais de fornecedores via consulta de CNPJ',
      ativo: true,
      dataCriacao: '08/01/2026',
      tipo: 'validacao'
    }
  ]);
  const [novaApi, setNovaApi] = useState({
    nome: '',
    urlBase: '',
    apiKey: '',
    descricao: '',
    ativo: true
  });

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    onTabChange?.(tab);
  };

  const handleSalvar = () => {
    setNotificacaoSalva(true);
    setTimeout(() => setNotificacaoSalva(false), 3000);
  };

  // Dados específicos por perfil
  const perfilData = {
    admin: {
      nome: 'Administrador',
      cargo: 'Gerente de Processos',
      email: 'admin@sesc.com.br',
      telefone: '(11) 98765-4321',
      departamento: 'Suprimentos e Contratos',
      matricula: 'ADM-2024-001',
      iniciais: 'AD'
    },
    comprador: {
      nome: 'Carlos Mendes',
      cargo: 'Comprador Responsável',
      email: 'carlos.mendes@sesc.com.br',
      telefone: '(11) 97654-3210',
      departamento: 'Compras e Suprimentos',
      matricula: 'COM-2024-015',
      iniciais: 'CM'
    },
    requisitante: {
      nome: 'João Silva',
      cargo: 'Requisitante',
      email: 'joao.silva@sesc.com.br',
      telefone: '(11) 96543-2109',
      departamento: 'Operações',
      matricula: 'REQ-2024-042',
      iniciais: 'JS'
    },
    gestora: {
      nome: 'Maria Oliveira',
      cargo: 'Gestora de Contratos',
      email: 'maria.oliveira@sesc.com.br',
      telefone: '(11) 95432-1098',
      departamento: 'Contratos e Negociações',
      matricula: 'GES-2024-020',
      iniciais: 'MO'
    }
  };

  // Garantir que currentProfile seja válido
  const profileKey = (currentProfile && ['admin', 'comprador', 'requisitante', 'gestora'].includes(currentProfile)) 
    ? currentProfile 
    : 'admin';
  
  const dadosUsuario = perfilData[profileKey];

  const configuracoesSistema = [
    {
      categoria: 'Notificações',
      configuracoes: [
        { nome: 'E-mails de alertas', ativo: true },
        { nome: 'Notificações no sistema', ativo: true },
        { nome: 'E-mail de alertas de penalidades', ativo: true },
        { nome: 'Notificações de prorrogação de processos', ativo: true },
        { nome: 'Alertas de documentos vencidos', ativo: true }
      ]
    },
    {
      categoria: 'Segurança',
      configuracoes: [
        { nome: 'Logout automático por inatividade', ativo: true },
        { nome: 'Log de atividades dos usuários', ativo: true },
        { nome: 'Backup automático diário', ativo: true }
      ]
    },
    ...(currentProfile === 'admin' ? [{
      categoria: 'Sistema',
      configuracoes: [
        { nome: 'Envio automático para fornecedores', ativo: true },
        { nome: 'Limpeza automática de logs antigos', ativo: true },
        { nome: 'Indexação automática de documentos', ativo: false }
      ]
    }] : [])
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Configurações</h2>
          <p className="text-gray-600 mt-1">Gerencie seu perfil e configurações do sistema</p>
        </div>
      </div>

      {notificacaoSalva && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Alterações salvas com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Modal: Adicionar Nova API */}
      <Dialog open={isNovaApiModalOpen} onOpenChange={setIsNovaApiModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={20} className="text-[#003366]" />
              Adicionar Nova API
            </DialogTitle>
            <DialogDescription>
              Configure uma nova API customizada para integração com o SGCS
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nova-api-nome">Nome da API *</Label>
              <Input 
                id="nova-api-nome" 
                placeholder="Ex: Sistema ERP, API de Consulta CNPJ, etc."
                value={novaApi.nome}
                onChange={(e) => setNovaApi({...novaApi, nome: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nova-api-url">URL Base *</Label>
              <Input 
                id="nova-api-url" 
                placeholder="Ex: https://api.exemplo.com.br/v1"
                value={novaApi.urlBase}
                onChange={(e) => setNovaApi({...novaApi, urlBase: e.target.value})}
              />
              <p className="text-xs text-gray-600">Endereço base da API (incluindo protocolo e versão)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nova-api-key">API Key / Token de Autenticação</Label>
              <Input 
                id="nova-api-key" 
                type="password"
                placeholder="••••••••••••••••••••••••••••••••"
                value={novaApi.apiKey}
                onChange={(e) => setNovaApi({...novaApi, apiKey: e.target.value})}
              />
              <p className="text-xs text-gray-600">Chave de autenticação fornecida pelo provedor da API</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nova-api-descricao">Descrição</Label>
              <Textarea 
                id="nova-api-descricao" 
                placeholder="Descreva o propósito desta integração..."
                value={novaApi.descricao}
                onChange={(e) => setNovaApi({...novaApi, descricao: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-black">Ativar API imediatamente</p>
                <p className="text-xs text-gray-600 mt-1">A API estará disponível para uso assim que for salva</p>
              </div>
              <Switch 
                checked={novaApi.ativo}
                onCheckedChange={(checked) => setNovaApi({...novaApi, ativo: checked})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNovaApiModalOpen(false);
                setNovaApi({ nome: '', urlBase: '', apiKey: '', descricao: '', ativo: true });
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => {
                const novaApiCompleta = {
                  id: apisCustomizadas.length + 1,
                  ...novaApi,
                  dataCriacao: new Date().toLocaleDateString('pt-BR')
                };
                setApisCustomizadas([...apisCustomizadas, novaApiCompleta]);
                setIsNovaApiModalOpen(false);
                setNovaApi({ nome: '', urlBase: '', apiKey: '', descricao: '', ativo: true });
                handleSalvar();
              }}
            >
              <Save size={16} className="mr-2" />
              Salvar API
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar API */}
      <Dialog open={isEditarApiModalOpen} onOpenChange={setIsEditarApiModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={20} className="text-[#003366]" />
              Editar API
            </DialogTitle>
            <DialogDescription>
              Atualize as configurações da API {apiEditando?.nome}
            </DialogDescription>
          </DialogHeader>
          
          {apiEditando && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editar-api-nome">Nome da API *</Label>
                <Input 
                  id="editar-api-nome" 
                  defaultValue={apiEditando.nome}
                  onChange={(e) => setApiEditando({...apiEditando, nome: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editar-api-url">URL Base *</Label>
                <Input 
                  id="editar-api-url" 
                  defaultValue={apiEditando.urlBase}
                  onChange={(e) => setApiEditando({...apiEditando, urlBase: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editar-api-key">API Key / Token de Autenticação</Label>
                <Input 
                  id="editar-api-key" 
                  type="password"
                  placeholder="••••••••••••••••••••••••••••••••"
                />
                <p className="text-xs text-gray-600">Deixe em branco para manter a chave atual</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editar-api-descricao">Descrição</Label>
                <Textarea 
                  id="editar-api-descricao" 
                  defaultValue={apiEditando.descricao}
                  onChange={(e) => setApiEditando({...apiEditando, descricao: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-black">Status da API</p>
                  <p className="text-xs text-gray-600 mt-1">Ative ou desative esta integração</p>
                </div>
                <Switch 
                  checked={apiEditando.ativo}
                  onCheckedChange={(checked) => setApiEditando({...apiEditando, ativo: checked})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditarApiModalOpen(false);
                setApiEditando(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => {
                setApisCustomizadas(apisCustomizadas.map(api => 
                  api.id === apiEditando?.id ? apiEditando : api
                ));
                setIsEditarApiModalOpen(false);
                setApiEditando(null);
                handleSalvar();
              }}
            >
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className={`grid w-full max-w-2xl ${currentProfile === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="perfil">Meu Perfil</TabsTrigger>
          <TabsTrigger value="sistema">Configurações do Sistema</TabsTrigger>
          {currentProfile === 'admin' && (
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          )}
        </TabsList>

        {/* Tab: Meu Perfil */}
        <TabsContent value="perfil" className="space-y-6">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                <User size={20} className="text-[#003366]" />
                Informações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-[#003366] text-white text-2xl">
                      {dadosUsuario.iniciais}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 bg-[#003366] hover:bg-[#002244] text-white p-2 rounded-full transition-colors">
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg text-black">Foto de Perfil</h3>
                  <p className="text-sm text-gray-600 mt-1">JPG, PNG ou GIF. Máximo 2MB.</p>
                </div>
              </div>

              {/* Informações Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" defaultValue={dadosUsuario.nome} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" defaultValue={dadosUsuario.cargo} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" defaultValue={dadosUsuario.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" defaultValue={dadosUsuario.telefone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input id="departamento" defaultValue={dadosUsuario.departamento} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input id="matricula" defaultValue={dadosUsuario.matricula} disabled />
                </div>
              </div>

              <Button 
                className="bg-[#003366] hover:bg-[#002244] text-white"
                onClick={handleSalvar}
              >
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                <Shield size={20} className="text-[#003366]" />
                Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              <div className="space-y-2">
                <Label htmlFor="senha-atual">Senha Atual</Label>
                <Input id="senha-atual" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nova-senha">Nova Senha</Label>
                <Input id="nova-senha" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                <Input id="confirmar-senha" type="password" placeholder="••••••••" />
              </div>

              <Button 
                className="bg-[#003366] hover:bg-[#002244] text-white"
                onClick={handleSalvar}
              >
                <Save size={16} className="mr-2" />
                Atualizar Senha
              </Button>
            </CardContent>
          </Card>

        </TabsContent>

        {/* Tab: Configurações do Sistema */}
        <TabsContent value="sistema" className="space-y-6">
          {configuracoesSistema.map((grupo, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  {grupo.categoria === 'Notificações' && <Bell size={20} className="text-[#003366]" />}
                  {grupo.categoria === 'Segurança' && <Shield size={20} className="text-[#003366]" />}
                  {grupo.categoria === 'Sistema' && <Database size={20} className="text-[#003366]" />}
                  {grupo.categoria}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
                {grupo.configuracoes.map((config, configIndex) => (
                  <div key={configIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm text-black">{config.nome}</p>
                    <Switch defaultChecked={config.ativo} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button 
              className="bg-[#003366] hover:bg-[#002244] text-white"
              onClick={handleSalvar}
            >
              <Save size={16} className="mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </TabsContent>

        {/* Tab: Integrações */}
        <TabsContent value="integracoes" className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Configure as APIs externas que serão integradas ao SGCS. As credenciais são criptografadas e armazenadas de forma segura.
            </AlertDescription>
          </Alert>

          {/* APIs Integradas */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <Globe size={20} className="text-[#003366]" />
                  APIs Integradas
                </CardTitle>
                <Button 
                  size="sm"
                  className="bg-[#003366] hover:bg-[#002244] text-white"
                  onClick={() => setIsNovaApiModalOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar Nova API
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-[24px] pr-[24px] pb-[24px] pl-[24px]">
              {apisCustomizadas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Globe size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Nenhuma API configurada.</p>
                  <p className="text-xs mt-1">Clique em "Adicionar Nova API" para começar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apisCustomizadas.map((api) => (
                    <div 
                      key={api.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-black text-base">{api.nome}</h3>
                            <div className="flex items-center gap-1.5">
                              {api.ativo ? (
                                <>
                                  <CheckCircle2 size={14} className="text-green-600" />
                                  <span className="text-xs text-green-600 font-medium">Ativo</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle size={14} className="text-gray-400" />
                                  <span className="text-xs text-gray-500">Inativo</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <LinkIcon size={14} className="text-gray-500" />
                            <span className="text-gray-700">{api.urlBase}</span>
                          </div>
                          
                          <p className="text-sm text-gray-600">{api.descricao}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                            <span>Criado em: {api.dataCriacao}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9"
                            onClick={() => {
                              setApiEditando(api);
                              setIsEditarApiModalOpen(true);
                            }}
                          >
                            <Edit size={14} className="mr-1.5" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir a API "${api.nome}"?`)) {
                                setApisCustomizadas(apisCustomizadas.filter(a => a.id !== api.id));
                                handleSalvar();
                              }
                            }}
                          >
                            <Trash2 size={14} className="mr-1.5" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Informações */}
          <Card className="border border-gray-200 bg-gray-50">
            <CardContent className="pt-[24px] pr-[24px] pb-[24px] pl-[24px]">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-black mb-2">Informações sobre Integrações</h4>
                  <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                    <li>Todas as credenciais de API são criptografadas e armazenadas de forma segura</li>
                    <li>APIs inativas não consumirão recursos do sistema</li>
                    <li>Você pode editar ou remover integrações a qualquer momento</li>
                    <li>Para o Tawk.to, acesse <a href="https://dashboard.tawk.to" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dashboard.tawk.to</a> para obter as credenciais</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}