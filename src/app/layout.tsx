import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SGCS - Sistema de Gestão de Contratos e Suprimentos | SESC Maranhão",
    description:
        "Sistema de Gestão de Contratos e Suprimentos do SESC Maranhão. Controle de processos de compras, fornecedores, penalidades e prorrogações.",
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
