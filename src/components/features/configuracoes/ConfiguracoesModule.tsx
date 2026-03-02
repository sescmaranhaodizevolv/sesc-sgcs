"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Camera,
  CheckCircle,
  CheckCircle2,
  Database,
  Edit, 
  Globe,
  Link as LinkIcon,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface ApiCustomizada {
  id: number;
  nome: string;
  urlBase: string;
  descricao: string;
  ativo: boolean;
  dataCriacao: string;
  tipo?: string;
}

interface NovaApiForm {
  nome: string;
  urlBase: string;
  apiKey: string;
  descricao: string;
  ativo: boolean;
}

interface ConfiguracoesProps {
  perfil?: "admin" | "comprador" | "requisitante" | "gestora";
}

const perfilAdmin = {
  nome: "Administrador",
  cargo: "Gerente de Processos",
  email: "admin@sesc.com.br",
  telefone: "(11) 98765-4321",
  departamento: "Suprimentos e Contratos",
  matricula: "ADM-2024-001",
  iniciais: "AD",
};

const perfilComprador = {
  nome: "João Santos",
  cargo: "Comprador Sênior",
  email: "joao.santos@sesc.com.br",
  telefone: "(11) 91234-5678",
  departamento: "Compras",
  matricula: "COMP-2024-042",
  iniciais: "JS",
};

const configuracoesSistema = [
  {
    categoria: "Notificações",
    configuracoes: [
      { nome: "E-mails de alertas", ativo: true },
      { nome: "Notificações no sistema", ativo: true },
      { nome: "E-mail de alertas de penalidades", ativo: true },
      { nome: "Notificações de prorrogação de processos", ativo: true },
      { nome: "Alertas de documentos vencidos", ativo: true },
    ],
  },
  {
    categoria: "Segurança",
    configuracoes: [
      { nome: "Logout automático por inatividade", ativo: true },
      { nome: "Log de atividades dos usuários", ativo: true },
      { nome: "Backup automático diário", ativo: true },
    ],
  },
  {
    categoria: "Sistema",
    configuracoes: [
      { nome: "Envio automático para fornecedores", ativo: true },
      { nome: "Limpeza automática de logs antigos", ativo: true },
      { nome: "Indexação automática de documentos", ativo: false },
    ],
  },
];

export function ConfiguracoesModule({ perfil = "admin" }: ConfiguracoesProps) {
  const [selectedTab, setSelectedTab] = useState("perfil");
  const [notificacaoSalva, setNotificacaoSalva] = useState(false);
  const [isNovaApiModalOpen, setIsNovaApiModalOpen] = useState(false);
  const [isEditarApiModalOpen, setIsEditarApiModalOpen] = useState(false);
  const [apiEditando, setApiEditando] = useState<ApiCustomizada | null>(null);
  const [apisCustomizadas, setApisCustomizadas] = useState<ApiCustomizada[]>([
    { id: 1, nome: "Tawk.to - Chatbot de Suporte", urlBase: "https://embed.tawk.to", descricao: "Plataforma de chat ao vivo e chatbot para atendimento e suporte aos usuários do sistema", ativo: true, dataCriacao: "05/01/2026", tipo: "chatbot" },
    { id: 2, nome: "API de Validação de CNPJ", urlBase: "https://api.cnpj.ws/v2", descricao: "Validação automática de dados cadastrais de fornecedores via consulta de CNPJ", ativo: true, dataCriacao: "08/01/2026", tipo: "validacao" },
  ]);
  const [novaApi, setNovaApi] = useState<NovaApiForm>({ nome: "", urlBase: "", apiKey: "", descricao: "", ativo: true });

  const dadosPerfil = perfil === "admin" ? perfilAdmin : perfilComprador;
  const isAdmin = perfil === "admin";

  const handleSalvar = () => {
    setNotificacaoSalva(true);
    setTimeout(() => setNotificacaoSalva(false), 3000);
  };

  const salvarNovaApi = () => {
    const api: ApiCustomizada = { id: apisCustomizadas.length + 1, nome: novaApi.nome, urlBase: novaApi.urlBase, descricao: novaApi.descricao, ativo: novaApi.ativo, dataCriacao: new Date().toLocaleDateString("pt-BR") };
    setApisCustomizadas((prev) => [...prev, api]);
    setNovaApi({ nome: "", urlBase: "", apiKey: "", descricao: "", ativo: true });
    setIsNovaApiModalOpen(false);
    handleSalvar();
  };

  const salvarEdicaoApi = () => {
    if (!apiEditando) return;
    setApisCustomizadas((prev) => prev.map((api) => (api.id === apiEditando.id ? apiEditando : api)));
    setApiEditando(null);
    setIsEditarApiModalOpen(false);
    handleSalvar();
  };

  const totalApisAtivas = useMemo(() => apisCustomizadas.filter((api) => api.ativo).length, [apisCustomizadas]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl text-black">Configurações</h2>
        <p className="mt-1 text-gray-600">Gerencie seu perfil e configurações do sistema</p>
      </div>

      {notificacaoSalva && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Alterações salvas com sucesso!</AlertDescription>
        </Alert>
      )}

      {/* Modais de API (Apenas Admin) */}
      {isAdmin && (
        <>
          <Dialog open={isNovaApiModalOpen} onOpenChange={setIsNovaApiModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Plus className="text-[#003366]" size={20} />Adicionar Nova API</DialogTitle>
                <DialogDescription>Configure uma nova API customizada para integração com o SGCS</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label htmlFor="nova-api-nome">Nome da API *</Label><Input id="nova-api-nome" placeholder="Ex: Sistema ERP, API de Consulta CNPJ, etc." value={novaApi.nome} onChange={(e) => setNovaApi({ ...novaApi, nome: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="nova-api-url">URL Base *</Label><Input id="nova-api-url" placeholder="Ex: https://api.exemplo.com.br/v1" value={novaApi.urlBase} onChange={(e) => setNovaApi({ ...novaApi, urlBase: e.target.value })} /><p className="text-xs text-gray-600">Endereço base da API (incluindo protocolo e versão)</p></div>
                <div className="space-y-2"><Label htmlFor="nova-api-key">API Key / Token de Autenticação</Label><Input id="nova-api-key" type="password" placeholder="••••••••••••••••••••••••••••••••" value={novaApi.apiKey} onChange={(e) => setNovaApi({ ...novaApi, apiKey: e.target.value })} /><p className="text-xs text-gray-600">Chave de autenticação fornecida pelo provedor da API</p></div>
                <div className="space-y-2"><Label htmlFor="nova-api-descricao">Descrição</Label><Textarea id="nova-api-descricao" placeholder="Descreva o propósito desta integração..." value={novaApi.descricao} onChange={(e) => setNovaApi({ ...novaApi, descricao: e.target.value })} rows={3} /></div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4"><div><p className="text-sm font-medium text-black">Ativar API imediatamente</p><p className="mt-1 text-xs text-gray-600">A API estará disponível para uso assim que for salva</p></div><Switch checked={novaApi.ativo} onCheckedChange={(checked) => setNovaApi({ ...novaApi, ativo: checked })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsNovaApiModalOpen(false); setNovaApi({ nome: "", urlBase: "", apiKey: "", descricao: "", ativo: true }); }}>Cancelar</Button>
                <Button className="bg-[#003366] text-white hover:bg-[#002244]" onClick={salvarNovaApi}><Save className="mr-2" size={16} />Salvar API</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditarApiModalOpen} onOpenChange={setIsEditarApiModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Edit className="text-[#003366]" size={20} />Editar API</DialogTitle>
                <DialogDescription>Atualize as configurações da API {apiEditando?.nome}</DialogDescription>
              </DialogHeader>
              {apiEditando && (
                <div className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="editar-api-nome">Nome da API *</Label><Input id="editar-api-nome" defaultValue={apiEditando.nome} onChange={(e) => setApiEditando({ ...apiEditando, nome: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="editar-api-url">URL Base *</Label><Input id="editar-api-url" defaultValue={apiEditando.urlBase} onChange={(e) => setApiEditando({ ...apiEditando, urlBase: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="editar-api-key">API Key / Token de Autenticação</Label><Input id="editar-api-key" type="password" placeholder="••••••••••••••••••••••••••••••••" /><p className="text-xs text-gray-600">Deixe em branco para manter a chave atual</p></div>
                  <div className="space-y-2"><Label htmlFor="editar-api-descricao">Descrição</Label><Textarea id="editar-api-descricao" defaultValue={apiEditando.descricao} onChange={(e) => setApiEditando({ ...apiEditando, descricao: e.target.value })} rows={3} /></div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4"><div><p className="text-sm font-medium text-black">Status da API</p><p className="mt-1 text-xs text-gray-600">Ative ou desative esta integração</p></div><Switch checked={apiEditando.ativo} onCheckedChange={(checked) => setApiEditando({ ...apiEditando, ativo: checked })} /></div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsEditarApiModalOpen(false); setApiEditando(null); }}>Cancelar</Button>
                <Button className="bg-[#003366] text-white hover:bg-[#002244]" onClick={salvarEdicaoApi}><Save className="mr-2" size={16} />Salvar Alterações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className={`grid w-full max-w-2xl ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
          <TabsTrigger value="perfil">Meu Perfil</TabsTrigger>
          <TabsTrigger value="sistema">Configurações do Sistema</TabsTrigger>
          {isAdmin && <TabsTrigger value="integracoes">Integrações</TabsTrigger>}
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="flex items-center gap-2 py-2 text-base font-normal"><User className="text-[#003366]" size={20} />Informações do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6 pt-0">
              <div className="flex items-center gap-6">
                <div className="relative mt-6">
                  <Avatar className="h-24 w-24"><AvatarFallback className="bg-[#003366] text-2xl text-white">{dadosPerfil.iniciais}</AvatarFallback></Avatar>
                  <button className="absolute bottom-0 right-0 rounded-full bg-[#003366] p-2 text-white transition-colors hover:bg-[#002244]"><Camera size={16} /></button>
                </div>
                <div className="mt-6"><h3 className="text-lg text-black">Foto de Perfil</h3><p className="mt-1 text-sm text-gray-600">JPG, PNG ou GIF. Máximo 2MB.</p></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="nome">Nome Completo</Label><Input id="nome" defaultValue={dadosPerfil.nome} /></div>
                <div className="space-y-2"><Label htmlFor="cargo">Cargo</Label><Input id="cargo" defaultValue={dadosPerfil.cargo} disabled={!isAdmin} /></div>
                <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" defaultValue={dadosPerfil.email} /></div>
                <div className="space-y-2"><Label htmlFor="telefone">Telefone</Label><Input id="telefone" defaultValue={dadosPerfil.telefone} /></div>
                <div className="space-y-2"><Label htmlFor="departamento">Departamento</Label><Input id="departamento" defaultValue={dadosPerfil.departamento} disabled={!isAdmin} /></div>
                <div className="space-y-2"><Label htmlFor="matricula">Matrícula</Label><Input id="matricula" defaultValue={dadosPerfil.matricula} disabled /></div>
              </div>
              <Button className="bg-[#003366] text-white hover:bg-[#002244]" onClick={handleSalvar}><Save className="mr-2" size={16} />Salvar Alterações</Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50"><CardTitle className="flex items-center gap-2 py-2 text-base font-normal"><Shield className="text-[#003366]" size={20} />Segurança da Conta</CardTitle></CardHeader>
            <CardContent className="space-y-4 px-6 pb-6 pt-4">
              <div className="space-y-2"><Label htmlFor="senha-atual">Senha Atual</Label><Input id="senha-atual" type="password" placeholder="••••••••" /></div>
              <div className="space-y-2"><Label htmlFor="nova-senha">Nova Senha</Label><Input id="nova-senha" type="password" placeholder="••••••••" /></div>
              <div className="space-y-2"><Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label><Input id="confirmar-senha" type="password" placeholder="••••••••" /></div>
              <Button className="bg-[#003366] text-white hover:bg-[#002244]" onClick={handleSalvar}><Save className="mr-2" size={16} />Atualizar Senha</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-6">
          {configuracoesSistema.map((grupo) => (
            <Card key={grupo.categoria} className="border border-gray-200">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="flex items-center gap-2 py-2 text-base font-normal">
                  {grupo.categoria === "Notificações" && <Bell className="text-[#003366]" size={20} />}
                  {grupo.categoria === "Segurança" && <Shield className="text-[#003366]" size={20} />}
                  {grupo.categoria === "Sistema" && <Database className="text-[#003366]" size={20} />}
                  {grupo.categoria}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6 pt-4">
                {grupo.configuracoes.map((config) => (
                  <div key={config.nome} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                    <p className="text-sm text-black">{config.nome}</p>
                    <Switch defaultChecked={config.ativo} disabled={!isAdmin} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          {isAdmin && (
            <div className="flex justify-end"><Button className="bg-[#003366] text-white hover:bg-[#002244]" onClick={handleSalvar}><Save className="mr-2" size={16} />Salvar Configurações</Button></div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="integracoes" className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50"><AlertCircle className="h-4 w-4 text-blue-600" /><AlertDescription className="text-blue-800">Configure as APIs externas que serão integradas ao SGCS. As credenciais são criptografadas e armazenadas de forma segura.</AlertDescription></Alert>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="border border-gray-200"><CardContent className="p-4"><p className="text-sm text-gray-600">Total de APIs</p><p className="text-2xl text-black">{apisCustomizadas.length}</p></CardContent></Card>
              <Card className="border border-gray-200"><CardContent className="p-4"><p className="text-sm text-gray-600">APIs Ativas</p><p className="text-2xl text-green-600">{totalApisAtivas}</p></CardContent></Card>
              <Card className="border border-gray-200"><CardContent className="p-4"><p className="text-sm text-gray-600">APIs Inativas</p><p className="text-2xl text-gray-600">{apisCustomizadas.length - totalApisAtivas}</p></CardContent></Card>
            </div>

            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 py-2 text-base font-normal"><Globe className="text-[#003366]" size={20} />APIs Integradas</CardTitle>
                  <Button size="sm" className="bg-[#003366] text-white hover:bg-[#002244]" onClick={() => setIsNovaApiModalOpen(true)}><Plus className="mr-2" size={16} />Adicionar Nova API</Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-6">
                {apisCustomizadas.length === 0 ? (
                  <div className="py-8 text-center text-gray-500"><Globe className="mx-auto mb-3 text-gray-400" size={48} /><p className="text-sm">Nenhuma API configurada.</p><p className="mt-1 text-xs">Clique em "Adicionar Nova API" para começar.</p></div>
                ) : (
                  <div className="space-y-4">
                    {apisCustomizadas.map((api) => (
                      <div key={api.id} className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-base font-medium text-black">{api.nome}</h3>
                              <div className="flex items-center gap-1.5">
                                {api.ativo ? (<><CheckCircle2 className="text-green-600" size={14} /><span className="text-xs font-medium text-green-600">Ativo</span></>) : (<><AlertCircle className="text-gray-400" size={14} /><span className="text-xs text-gray-500">Inativo</span></>)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm"><LinkIcon className="text-gray-500" size={14} /><span className="text-gray-700">{api.urlBase}</span></div>
                            <p className="text-sm text-gray-600">{api.descricao}</p>
                            <div className="pt-1 text-xs text-gray-500"><span>Criado em: {api.dataCriacao}</span></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-9" onClick={() => { setApiEditando(api); setIsEditarApiModalOpen(true); }}><Edit className="mr-1.5" size={14} />Editar</Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (confirm(`Deseja realmente excluir a API "${api.nome}"?`)) {
                                  setApisCustomizadas((prev) => prev.filter((a) => a.id !== api.id));
                                  handleSalvar();
                                }
                              }}
                            >
                              <Trash2 className="mr-1.5" size={14} />
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

            <Card className="border border-gray-200 bg-gray-50">
              <CardContent className="px-6 pb-6 pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 shrink-0 text-blue-600" size={20} />
                  <div className="flex-1">
                    <h4 className="mb-2 text-sm font-medium text-black">Informações sobre Integrações</h4>
                    <ul className="list-inside list-disc space-y-1.5 text-sm text-gray-700">
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
        )}
      </Tabs>
    </div>
  );
}
