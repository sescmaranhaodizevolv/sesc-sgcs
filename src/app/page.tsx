"use client";

/**
 * Root page - Redireciona para login
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
    const { isAuthInitialized, isAuthenticated, currentProfile } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthInitialized) return;

        if (isAuthenticated) {
            const routes: Record<string, string> = {
                admin: "/admin",
                comprador: "/comprador",
                requisitante: "/requisitante",
                gestora: "/gestora",
            };
            router.push(routes[currentProfile] ?? "/admin");
        } else {
            router.push("/login");
        }
    }, [isAuthInitialized, isAuthenticated, currentProfile, router]);

    return null;
}
