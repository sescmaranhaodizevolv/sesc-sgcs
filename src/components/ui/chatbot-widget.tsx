"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, MessageCircle, Send, User, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { buscarFaqPorTermo, type FaqItem } from "@/services/faqService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface HistoryMessage {
  id: number;
  type: "bot" | "user";
  message: string;
}

const MENSAGEM_INICIAL = "Olá! Digite sua dúvida sobre contratos, penalidades ou processos e eu vou consultar nossa base de conhecimento.";

export function ChatbotWidget() {
  const router = useRouter();
  const { currentProfile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<FaqItem[]>([]);
  const [chatHistory, setChatHistory] = useState<HistoryMessage[]>([{ id: 1, type: "bot", message: MENSAGEM_INICIAL }]);

  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setQuery("");
    }
  }, [isOpen]);

  if (currentProfile !== "requisitante") {
    return null;
  }

  const appendHistory = (type: HistoryMessage["type"], message: string) => {
    setChatHistory((prev) => [...prev, { id: Date.now() + Math.floor(Math.random() * 1000), type, message }]);
  };

  const handleFalarComAtendente = () => {
    const profileRouteMap = {
      admin: "/admin/ajuda",
      comprador: "/comprador/ajuda",
      gestora: "/gestora/ajuda",
      requisitante: "/requisitante/suporte",
    } as const;

    const destino = profileRouteMap[currentProfile];
    setIsOpen(false);
    toast.info("Redirecionando para a Central de Suporte.");
    router.push(destino);
  };

  const handleAsk = async () => {
    const termo = query.trim();
    if (!termo || isSearching) return;

    appendHistory("user", termo);
    setQuery("");
    setIsSearching(true);

    try {
      const resultados = await buscarFaqPorTermo(termo);
      setSuggestions(resultados.slice(0, 3));

      if (resultados.length > 0) {
        appendHistory("bot", resultados[0].resposta);
      } else {
        appendHistory("bot", "Não encontrei uma resposta exata agora. Vou te transferir para um humano.");
      }
    } catch {
      appendHistory("bot", "Não consegui consultar a base de conhecimento no momento. Vou te transferir para um humano.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (faq: FaqItem) => {
    appendHistory("user", faq.pergunta);
    appendHistory("bot", faq.resposta);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full bg-[#003366] text-white shadow-lg hover:bg-[#002244]" aria-label="Abrir assistente virtual">
            {isOpen ? <X size={22} /> : <Bot size={22} />}
          </Button>
        </PopoverTrigger>

        <PopoverContent side="top" align="end" sideOffset={12} className="flex max-h-[85vh] w-[360px] flex-col p-0">
          <Card className="flex flex-1 flex-col overflow-hidden border-0 shadow-none">
            <CardHeader className="border-b bg-gray-50 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-normal">
                  <MessageCircle size={18} className="text-[#003366]" />
                  Assistente Virtual
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)} aria-label="Fechar assistente virtual">
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4">
                {chatHistory.map((item) => (
                  <div key={item.id} className={`flex items-end gap-2 ${item.type === "user" ? "justify-end" : "justify-start"}`}>
                    {item.type === "bot" && (
                      <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 text-[#003366] flex items-center justify-center">
                        <Bot size={16} />
                      </div>
                    )}

                    <div className={`max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm ${item.type === "user" ? "rounded-br-none bg-[#003366] text-white" : "rounded-bl-none bg-gray-100 text-black"}`}>
                      {item.message}
                    </div>

                    {item.type === "user" && (
                      <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {suggestions.length > 0 && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <p className="text-xs text-gray-500">Respostas relacionadas</p>
                  <div className="grid gap-2">
                    {suggestions.map((faq) => (
                      <Button key={faq.id} variant="outline" className="h-auto justify-start whitespace-normal py-2 text-left" onClick={() => handleSuggestionClick(faq)}>
                        {faq.pergunta}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="shrink-0 mt-3 pt-3 border-t bg-white space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Digite sua dúvida..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleAsk();
                      }
                    }}
                  />
                  <Button size="icon" className="bg-[#003366] hover:bg-[#002244] text-white" onClick={() => void handleAsk()} disabled={isSearching || !query.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
                <Button variant="outline" onClick={handleFalarComAtendente} className="w-full">
                  Falar com Atendente
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
