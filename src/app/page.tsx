"use client";

/**
 * Root page - Redireciona para login
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
    const { isAuthInitialized, isAuthenticated, currentProfile, currentUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthInitialized) return;

        if (isAuthenticated) {
            if (!currentUser) return;

            const routes: Record<string, string> = {
                admin: "/admin",
                comprador: "/comprador",
                requisitante: "/requisitante",
                gestora: "/gestora",
            };
            router.replace(routes[currentProfile] ?? "/admin");
        } else {
            router.replace("/login");
        }
    }, [isAuthInitialized, isAuthenticated, currentProfile, currentUser, router]);

    return null;
}
