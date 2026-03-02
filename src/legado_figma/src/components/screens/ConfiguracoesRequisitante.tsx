import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, Bell, Shield, Palette, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function ConfiguracoesRequisitante() {
  const [notificacaoEmail, setNotificacaoEmail] = useState(true);
  const [notificacaoPush, setNotificacaoPush] = useState(true);
  const [notificacaoRequisicao, setNotificacaoRequisicao] = useState(true);
  const [notificacaoStatus, setNotificacaoStatus] = useState(true);

  const handleSalvarPerfil = () => {
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleSalvarNotificacoes = () => {
    toast.success('Preferências de notificações salvas com sucesso!');
  };

  const handleSalvarSenha = () => {
    toast.success('Senha alterada com sucesso!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Configurações</h2>
          <p className="text-gray-600 mt-1">Gerencie suas preferências e informações pessoais</p>
        </div>
      </div>

      {/* Tabs de Configurações */}
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        {/* Aba Perfil */}
        <TabsContent value="perfil">
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black flex items-center gap-2">
                <User size={20} />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input 
                    id="nome" 
                    defaultValue="Carlos Oliveira" 
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input 
                    id="matricula" 
                    defaultValue="REQ-2024-001" 
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="email" 
                      type="email"
                      defaultValue="carlos.oliveira@sesc.com.br" 
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="telefone">Telefone</Label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="telefone" 
                      defaultValue="(11) 98765-4321" 
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input 
                    id="departamento" 
                    defaultValue="Operações" 
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input 
                    id="cargo" 
                    defaultValue="Analista de Operações" 
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSalvarPerfil}
                  className="bg-[#003366] hover:bg-[#002244] text-white"
                >
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Notificações */}
        <TabsContent value="notificacoes">
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black flex items-center gap-2">
                <Bell size={20} />
                Preferências de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg text-black mb-4">Canais de Notificação</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex-1">
                        <p className="text-black">Notificações por E-mail</p>
                        <p className="text-sm text-gray-600">Receba atualizações importantes no seu e-mail</p>
                      </div>
                      <Switch 
                        checked={notificacaoEmail}
                        onCheckedChange={setNotificacaoEmail}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex-1">
                        <p className="text-black">Notificações Push</p>
                        <p className="text-sm text-gray-600">Alertas instantâneos no navegador</p>
                      </div>
                      <Switch 
                        checked={notificacaoPush}
                        onCheckedChange={setNotificacaoPush}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg text-black mb-4">Tipos de Notificação</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex-1">
                        <p className="text-black">Nova Requisição Criada</p>
                        <p className="text-sm text-gray-600">Receba confirmação ao criar uma nova requisição</p>
                      </div>
                      <Switch 
                        checked={notificacaoRequisicao}
                        onCheckedChange={setNotificacaoRequisicao}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex-1">
                        <p className="text-black">Mudança de Status</p>
                        <p className="text-sm text-gray-600">Seja notificado quando o status de suas requisições mudar</p>
                      </div>
                      <Switch 
                        checked={notificacaoStatus}
                        onCheckedChange={setNotificacaoStatus}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSalvarNotificacoes}
                  className="bg-[#003366] hover:bg-[#002244] text-white"
                >
                  Salvar Preferências
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Segurança */}
        <TabsContent value="seguranca">
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black flex items-center gap-2">
                <Shield size={20} />
                Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              <div>
                <h3 className="text-lg text-black mb-4">Alterar Senha</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="senha-atual">Senha Atual</Label>
                    <Input 
                      id="senha-atual" 
                      type="password"
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nova-senha">Nova Senha</Label>
                    <Input 
                      id="nova-senha" 
                      type="password"
                      placeholder="Digite sua nova senha"
                    />
                    <p className="text-xs text-gray-500">
                      A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                    <Input 
                      id="confirmar-senha" 
                      type="password"
                      placeholder="Confirme sua nova senha"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg text-black mb-4">Sessões Ativas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-black">Navegador atual</p>
                      <p className="text-sm text-gray-600">Chrome no Windows • São Paulo, SP</p>
                      <p className="text-xs text-gray-500">Último acesso: Agora</p>
                    </div>
                    <span className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded">Ativa</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-black">Navegador móvel</p>
                      <p className="text-sm text-gray-600">Safari no iPhone • São Paulo, SP</p>
                      <p className="text-xs text-gray-500">Último acesso: 2 horas atrás</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Encerrar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSalvarSenha}
                  className="bg-[#003366] hover:bg-[#002244] text-white"
                >
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
