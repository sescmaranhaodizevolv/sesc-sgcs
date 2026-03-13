"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

type ProfileRow = {
  id: string;
  nome: string | null;
  email: string | null;
  perfil: UserProfile;
  departamento: string | null;
  ativo: boolean;
  ultimo_acesso: string | null;
  avatar_url: string | null;
};

type AuthUser = User & {
  profile: ProfileRow | null;
};

interface AuthContextData {
  isAuthInitialized: boolean;
  isAuthenticated: boolean;
  currentProfile: UserProfile;
  currentUser: AuthUser | null;
  session: Session | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = "requisitante";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const loadProfile = useCallback(
    async (user: User): Promise<ProfileRow | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        return null;
      }

      return data as ProfileRow;
    },
    [supabase]
  );

  const syncFromSession = useCallback(
    async (nextSession: Session | null) => {
      setSession(nextSession);

      if (!nextSession?.user) {
        setCurrentUser(null);
        setCurrentProfile(DEFAULT_PROFILE);
        return;
      }

      const profile = await loadProfile(nextSession.user);
      const resolvedProfile = profile?.perfil ?? DEFAULT_PROFILE;

      setCurrentProfile(resolvedProfile);
      setCurrentUser({ ...nextSession.user, profile });
    },
    [loadProfile]
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      await syncFromSession(initialSession);

      if (isMounted) {
        setIsAuthInitialized(true);
      }
    };

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncFromSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, syncFromSession]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
    setCurrentProfile(DEFAULT_PROFILE);
    router.push("/login");
  }, [router, supabase]);

  useIdleLogout({
    onIdle: () => {
      void logout();
    },
    enabled: Boolean(session?.user),
  });

  const value = useMemo(
    () => ({
      isAuthInitialized,
      isAuthenticated: Boolean(session?.user),
      currentProfile,
      currentUser,
      session,
      logout,
    }),
    [isAuthInitialized, session, currentProfile, currentUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
