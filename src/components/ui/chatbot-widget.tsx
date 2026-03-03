"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { faqItemsIniciais, type FaqItem } from "@/lib/data/faq-mock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatStep = "categorias" | "perguntas" | "resposta";

interface HistoryMessage {
  id: number;
  type: "bot" | "user";
  message: string;
}

const MENSAGEM_INICIAL = "Olá! Sou o assistente virtual do SGCS. Escolha uma categoria para começar.";

export function ChatbotWidget() {
  const router = useRouter();
  const { currentProfile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ChatStep>("categorias");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [chatHistory, setChatHistory] = useState<HistoryMessage[]>([
    { id: 1, type: "bot", message: MENSAGEM_INICIAL }
  ]);

  const categorias = useMemo(
    () => Array.from(new Set(faqItemsIniciais.map((item) => item.categoria))),
    []
  );

  const perguntasDaCategoria = useMemo(
    () => faqItemsIniciais.filter((item) => item.categoria === selectedCategory),
    [selectedCategory]
  );

  const appendHistory = (type: HistoryMessage["type"], message: string) => {
    setChatHistory((prev) => [
      ...prev,
      { id: Date.now() + Math.floor(Math.random() * 1000), type, message }
    ]);
  };

  const resetToStart = () => {
    setStep("categorias");
    setSelectedCategory(null);
    setSelectedFaq(null);
    setChatHistory([{ id: Date.now(), type: "bot", message: MENSAGEM_INICIAL }]);
  };

  const handleSelectCategory = (categoria: string) => {
    setSelectedCategory(categoria);
    setSelectedFaq(null);
    setStep("perguntas");
    appendHistory("user", categoria);
    appendHistory("bot", `Certo. Selecione uma pergunta sobre ${categoria}.`);
  };

  const handleSelectFaq = (faq: FaqItem) => {
    setSelectedFaq(faq);
    setStep("resposta");
    appendHistory("user", faq.pergunta);
    appendHistory("bot", faq.resposta);
  };

  const handleFalarComAtendente = () => {
    const profileRouteMap = {
      admin: "/admin/ajuda",
      comprador: "/comprador/ajuda",
      gestora: "/gestora/ajuda",
      requisitante: "/requisitante/suporte"
    } as const;

    const destino = profileRouteMap[currentProfile];
    setIsOpen(false);
    toast.info("Redirecionando para a Central de Suporte.");
    router.push(destino);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-[#003366] text-white shadow-lg hover:bg-[#002244]"
            aria-label="Abrir assistente virtual"
          >
            {isOpen ? <X size={22} /> : <Bot size={22} />}
          </Button>
        </PopoverTrigger>

        <PopoverContent side="top" align="end" sideOffset={12} className="w-[360px] p-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="border-b bg-gray-50 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-normal">
                  <MessageCircle size={18} className="text-[#003366]" />
                  Assistente Virtual
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar assistente virtual"
                >
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 p-4">
              <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-3">
                  {chatHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${item.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          item.type === "user"
                            ? "rounded-br-none bg-[#003366] text-white"
                            : "rounded-bl-none bg-gray-100 text-black"
                        }`}
                      >
                        {item.message}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="space-y-2 border-t pt-3">
                {step === "categorias" && (
                  <div className="grid grid-cols-1 gap-2">
                    {categorias.map((categoria) => (
                      <Button
                        key={categoria}
                        variant="outline"
                        className="justify-start text-left"
                        onClick={() => handleSelectCategory(categoria)}
                      >
                        {categoria}
                      </Button>
                    ))}
                  </div>
                )}

                {step === "perguntas" && (
                  <div className="grid grid-cols-1 gap-2">
                    {perguntasDaCategoria.map((faq) => (
                      <Button
                        key={faq.id}
                        variant="outline"
                        className="h-auto justify-start whitespace-normal py-2 text-left"
                        onClick={() => handleSelectFaq(faq)}
                      >
                        {faq.pergunta}
                      </Button>
                    ))}
                    <Button variant="ghost" onClick={resetToStart}>
                      Trocar categoria
                    </Button>
                  </div>
                )}

                {step === "resposta" && (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedFaq && (
                      <p className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        Pergunta selecionada: {selectedFaq.pergunta}
                      </p>
                    )}
                    <Button
                      className="bg-[#003366] text-white hover:bg-[#002244]"
                      onClick={resetToStart}
                    >
                      Voltar ao Início
                    </Button>
                    <Button variant="outline" onClick={handleFalarComAtendente}>
                      Falar com Atendente
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
