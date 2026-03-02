import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { LogIn, AlertCircle } from 'lucide-react';
import logoSesc from 'figma:asset/65a2ccdbe24189b0e162647b506bcbb31c80579e.png';

interface LoginProps {
  onLoginSuccess: () => void;
  onEsqueciSenha?: () => void;
}

export function Login({ onLoginSuccess, onEsqueciSenha }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    // Simular delay de autenticação
    setTimeout(() => {
      if (usuario === 'admin' && senha === '1234') {
        onLoginSuccess();
      } else {
        setErro('Usuário ou senha incorretos');
        setCarregando(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#004488] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex justify-center mb-4">
              <img src={logoSesc} alt="SESC" className="h-24 w-auto object-contain" />
            </div>
            <CardDescription className="text-center text-gray-600">
              Sistema de Gestão de Contratos e Suprimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário</Label>
                <Input
                  id="usuario"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={carregando}
                  className="h-11"
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={carregando}
                  className="h-11"
                  autoComplete="current-password"
                />
              </div>

              {erro && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    {erro}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-[#003366] hover:bg-[#002244] text-white"
                disabled={carregando || !usuario || !senha}
              >
                {carregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Entrar
                  </>
                )}
              </Button>

              {onEsqueciSenha && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onEsqueciSenha}
                    className="text-sm text-[#003366] hover:text-[#002244] hover:underline"
                    disabled={carregando}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                Desenvolvido para SESC - Sistema de Gestão de Contratos
              </p>
              <p className="text-xs text-center text-gray-400 mt-1">
                Versão 1.0.0
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credenciais de teste - apenas para desenvolvimento */}
        <Card className="mt-4 border border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-xs text-blue-800 mb-2">
              <strong>Credenciais de teste:</strong>
            </p>
            <p className="text-xs text-blue-700">
              Usuário: <code className="bg-white px-1 py-0.5 rounded">admin</code>
            </p>
            <p className="text-xs text-blue-700">
              Senha: <code className="bg-white px-1 py-0.5 rounded">1234</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}