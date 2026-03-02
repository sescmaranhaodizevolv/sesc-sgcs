import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import logoSesc from 'figma:asset/65a2ccdbe24189b0e162647b506bcbb31c80579e.png';

interface AlterarSenhaProps {
  email: string;
  onSenhaAlterada: () => void;
}

export function AlterarSenha({ email, onSenhaAlterada }: AlterarSenhaProps) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const validarSenha = () => {
    if (novaSenha.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres';
    }
    if (novaSenha !== confirmarSenha) {
      return 'As senhas não coincidem';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const erroValidacao = validarSenha();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSalvando(true);

    // Simular alteração de senha
    setTimeout(() => {
      setSalvando(false);
      setSucesso(true);

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        onSenhaAlterada();
      }, 2000);
    }, 1500);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Fraca', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Média', color: 'bg-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Forte', color: 'bg-green-500' };
    }
    return { strength: 2, label: 'Média', color: 'bg-yellow-500' };
  };

  const passwordStrength = getPasswordStrength(novaSenha);

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#004488] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex justify-center mb-4">
                <img src={logoSesc} alt="SESC" className="h-24 w-auto object-contain" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl text-gray-900">Senha Alterada com Sucesso!</h3>
                  <p className="text-sm text-gray-600">
                    Sua senha foi atualizada com sucesso.
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  Desenvolvido para SESC - Sistema de Gestão de Contratos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#004488] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex justify-center mb-4">
              <img src={logoSesc} alt="SESC" className="h-24 w-auto object-contain" />
            </div>
            <CardDescription className="text-center text-gray-600">
              Criar Nova Senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="novaSenha"
                    type={mostrarNovaSenha ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    disabled={salvando}
                    className="h-11 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Indicador de força da senha */}
                {novaSenha && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Força da senha: <span className={passwordStrength.strength === 3 ? 'text-green-600' : passwordStrength.strength === 2 ? 'text-yellow-600' : 'text-red-600'}>{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={mostrarConfirmarSenha ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    disabled={salvando}
                    className="h-11 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Requisitos de senha */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-700 mb-2">Requisitos da senha:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${novaSenha.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    Mínimo de 6 caracteres
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${novaSenha === confirmarSenha && novaSenha ? 'bg-green-500' : 'bg-gray-300'}`} />
                    As senhas devem coincidir
                  </li>
                </ul>
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
                disabled={salvando || !novaSenha || !confirmarSenha}
              >
                {salvando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Lock size={18} className="mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                Desenvolvido para SESC - Sistema de Gestão de Contratos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}