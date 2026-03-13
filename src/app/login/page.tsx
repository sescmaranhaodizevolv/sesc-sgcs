"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

const ROLE_ROUTE_MAP: Record<UserProfile, string> = {
  admin: "/admin",
  comprador: "/comprador",
  gestora: "/gestora",
  requisitante: "/requisitante",
};

function getRouteByProfile(profile?: string | null): string {
  if (profile && profile in ROLE_ROUTE_MAP) {
    return ROLE_ROUTE_MAP[profile as UserProfile];
  }
  return ROLE_ROUTE_MAP.requisitante;
}

export default function LoginPage() {
  const { isAuthInitialized, isAuthenticated, currentProfile, currentUser } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthInitialized || !isAuthenticated || !currentUser) return;
    router.replace(getRouteByProfile(currentProfile));
  }, [isAuthInitialized, isAuthenticated, currentProfile, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      toast.error(error?.message ?? "Não foi possível realizar login.");
      setIsLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .select("perfil")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      toast.error("Login realizado, mas não foi possível carregar o perfil.");
    } else {
      toast.success("Login realizado com sucesso!");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sesc-blue via-sesc-blue-dark to-[#001a33] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <h1 className="text-3xl font-bold text-white">S</h1>
          </div>
          <h2 className="text-2xl font-bold text-white">ACompra</h2>
          <p className="text-sm text-blue-200 mt-1">Gestão de Compras SESC</p>
          <p className="text-xs text-blue-300 mt-1">SESC Maranhão</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Acesso ao Sistema</h3>
            <p className="text-sm text-gray-500">Insira suas credenciais para continuar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="seu.email@sescma.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Lembrar de mim</span>
                </label>
                <button type="button" className="text-sesc-blue hover:underline font-medium">
                  Esqueci minha senha
                </button>
              </div>

              <Button type="submit" className="w-full bg-sesc-blue hover:bg-sesc-blue-dark" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">Ambiente seguro • Logout automático por inatividade (15 min)</p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-blue-300 mt-6">© 2025 SESC Maranhão. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
