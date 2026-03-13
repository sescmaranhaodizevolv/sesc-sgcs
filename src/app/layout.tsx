import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ACompra - Gestão de Compras SESC",
    description:
        "ACompra, plataforma de gestão de compras do SESC Maranhão. Controle de processos de compras, fornecedores, penalidades e prorrogações.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        richColors
                        closeButton
                        expand={false}
                        toastOptions={{
                            style: { margin: "8px" },
                            className: "toast-custom",
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
