import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import logoSesc from 'figma:asset/65a2ccdbe24189b0e162647b506bcbb31c80579e.png';

interface RecuperarSenhaProps {
  onVoltar: () => void;
  onRedirecionarAlteracao: (email: string) => void;
}

export function RecuperarSenha({ onVoltar, onRedirecionarAlteracao }: RecuperarSenhaProps) {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    // Simular envio de email
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      setCountdown(3);
    }, 2000);
  };

  // Countdown e redirecionamento automático
  useEffect(() => {
    if (enviado && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (enviado && countdown === 0) {
      onRedirecionarAlteracao(email);
    }
  }, [enviado, countdown, email, onRedirecionarAlteracao]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#004488] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex justify-center mb-4">
              <img src={logoSesc} alt="SESC" className="h-24 w-auto object-contain" />
            </div>
            <CardDescription className="text-center text-gray-600">
              {enviado ? 'Link enviado com sucesso!' : 'Recuperação de Senha'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!enviado ? (
              <>
                <p className="text-sm text-gray-600 mb-6 text-center">
                  Digite seu e-mail para receber o link de recuperação de senha
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@sesc.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={enviando}
                      className="h-11"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#003366] hover:bg-[#002244] text-white"
                    disabled={enviando || !email}
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail size={18} className="mr-2" />
                        Enviar Link de Recuperação
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={onVoltar}
                    disabled={enviando}
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Voltar ao Login
                  </Button>
                </form>
              </>
            ) : (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Um link de recuperação foi enviado para <strong>{email}</strong>
                  </AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Redirecionando para alteração de senha em
                    </p>
                    <div className="text-4xl text-[#003366]">
                      {countdown}
                    </div>
                    <p className="text-xs text-gray-500">
                      segundos...
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => onRedirecionarAlteracao(email)}
                    className="w-full"
                  >
                    Ir agora
                  </Button>
                </div>
              </div>
            )}

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
