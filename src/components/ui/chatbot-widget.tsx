"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, MessageCircle, User, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { faqItemsIniciais, type FaqItem } from "@/lib/data/faq-mock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  if (currentProfile !== "requisitante") {
    return null;
  }

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

        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="flex max-h-[85vh] w-[360px] flex-col p-0"
        >
          <Card className="flex flex-1 flex-col overflow-hidden border-0 shadow-none">
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

            <CardContent className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4">
                {chatHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-end gap-2 ${item.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {item.type === "bot" && (
                      <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 text-[#003366] flex items-center justify-center">
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm ${
                        item.type === "user"
                          ? "rounded-br-none bg-[#003366] text-white"
                          : "rounded-bl-none bg-gray-100 text-black"
                      }`}
                    >
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

              <div className="shrink-0 mt-3 pt-3 border-t bg-white">
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
