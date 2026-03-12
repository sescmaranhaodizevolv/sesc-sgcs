"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Send, User, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  buscarFaqPorTermo,
  getFaqCategories,
  getQuestionsByCategory,
  type FaqItem,
} from "@/services/faqService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import botSesc from "@/assets/bot_sesc.png";

type ActionKind = "category" | "question" | "back" | "support";

interface ChatAction {
  id: string;
  label: string;
  kind: ActionKind;
  category?: string;
  faq?: FaqItem;
}

interface HistoryMessage {
  id: number;
  type: "bot" | "user";
  message: string;
  actions?: ChatAction[];
}

const MENSAGEM_INICIAL = "Olá! Sou o COINFriend. Escolha um assunto ou digite sua dúvida.";

function createMessage(type: HistoryMessage["type"], message: string, actions?: ChatAction[]): HistoryMessage {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    type,
    message,
    actions,
  };
}

function createCategoryActions(categories: string[]): ChatAction[] {
  return categories.map((category) => ({
    id: `category-${category}`,
    label: category,
    kind: "category",
    category,
  }));
}

function createQuestionActions(category: string, questions: FaqItem[]): ChatAction[] {
  return [
    ...questions.map((faq) => ({
      id: `question-${faq.id}`,
      label: faq.pergunta,
      kind: "question" as const,
      faq,
      category,
    })),
    {
      id: `back-${category}`,
      label: "⬅️ Voltar ao Menu Principal",
      kind: "back",
    },
  ];
}

export function ChatbotWidget() {
  const router = useRouter();
  const { currentProfile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<HistoryMessage[]>([]);
  const [showNudge, setShowNudge] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const categoryActions = useMemo(() => createCategoryActions(categories), [categories]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory, isSearching, isBootstrapping, isOpen]);

  useEffect(() => {
    if (currentProfile !== "requisitante") return;

    const bootstrap = async () => {
      setIsBootstrapping(true);

      try {
        const data = await getFaqCategories();
        setCategories(data);
        setChatHistory([createMessage("bot", MENSAGEM_INICIAL, createCategoryActions(data))]);
      } catch {
        setCategories([]);
        setChatHistory([
          createMessage(
            "bot",
            "Olá! Sou o COINFriend. No momento nao consegui carregar os assuntos, mas voce pode digitar sua duvida ou falar com o suporte."
          ),
        ]);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [currentProfile]);

  useEffect(() => {
    if (hasInteracted || isOpen) {
      setShowNudge(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowNudge(true);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [hasInteracted, isOpen]);

  if (currentProfile !== "requisitante") {
    return null;
  }

  const dismissNudge = () => {
    setHasInteracted(true);
    setShowNudge(false);
  };

  const appendHistory = (message: HistoryMessage) => {
    setChatHistory((prev) => [...prev, message]);
  };

  const clearInteractiveActions = () => {
    setChatHistory((prev) => prev.map((item) => (item.actions?.length ? { ...item, actions: [] } : item)));
  };

  const showMainMenu = (message = MENSAGEM_INICIAL) => {
    clearInteractiveActions();
    appendHistory(createMessage("bot", message, categoryActions));
  };

  const handleOpenChange = (open: boolean) => {
    dismissNudge();
    setIsOpen(open);
  };

  const handleFalarComAtendente = () => {
    const profileRouteMap = {
      admin: "/admin/ajuda",
      comprador: "/comprador/ajuda",
      gestora: "/gestora/ajuda",
      requisitante: "/requisitante/suporte",
    } as const;

    dismissNudge();
    setIsOpen(false);
    toast.info("Redirecionando para a Central de Suporte do ACompra.");
    router.push(profileRouteMap[currentProfile]);
  };

  const handleCategorySelect = async (category: string) => {
    dismissNudge();
    clearInteractiveActions();
    appendHistory(createMessage("user", category));
    setIsSearching(true);

    try {
      const questions = await getQuestionsByCategory(category);
      appendHistory(
        createMessage(
          "bot",
          questions.length > 0
            ? `Encontrei estas perguntas em ${category}. Escolha a que faz mais sentido para voce.`
            : `Nao encontrei perguntas cadastradas em ${category}. Voce pode voltar ao menu principal ou falar com o suporte.`,
          createQuestionActions(category, questions)
        )
      );
    } catch {
      appendHistory(
        createMessage(
          "bot",
          "Nao consegui carregar essa categoria agora. Tente novamente ou escolha outro assunto.",
          [
            { id: `retry-back-${category}`, label: "⬅️ Voltar ao Menu Principal", kind: "back" },
            { id: `retry-support-${category}`, label: "Falar com Suporte", kind: "support" },
          ]
        )
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuestionSelect = (faq: FaqItem) => {
    dismissNudge();
    clearInteractiveActions();
    appendHistory(createMessage("user", faq.pergunta));
    appendHistory(createMessage("bot", faq.resposta, [{ id: `back-root-${faq.id}`, label: "⬅️ Voltar ao Menu Principal", kind: "back" }]));
  };

  const handleBack = () => {
    dismissNudge();
    clearInteractiveActions();
    appendHistory(createMessage("user", "Voltar ao menu principal"));
    showMainMenu("Tudo bem! Selecione outro assunto abaixo ou digite sua duvida.");
  };

  const handleAsk = async () => {
    const termo = query.trim();
    if (!termo || isSearching) return;

    dismissNudge();
    clearInteractiveActions();
    appendHistory(createMessage("user", termo));
    setQuery("");
    setIsSearching(true);

    try {
      const resultados = await buscarFaqPorTermo(termo);

      if (resultados.length > 0) {
        const best = resultados[0];
        appendHistory(createMessage("bot", best.resposta, [{ id: `back-search-${best.id}`, label: "⬅️ Voltar ao Menu Principal", kind: "back" }]));
      } else {
        appendHistory(
          createMessage(
            "bot",
            "Nao entendi muito bem. Tente selecionar uma destas categorias:",
            categoryActions
          )
        );
      }
    } catch {
      appendHistory(
        createMessage(
          "bot",
          "Nao consegui consultar a base de conhecimento no momento. Se preferir, escolha uma categoria ou fale com o suporte.",
          [...categoryActions, { id: "support-fallback", label: "Falar com Suporte", kind: "support" }]
        )
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.kind === "category" && action.category) {
      void handleCategorySelect(action.category);
      return;
    }

    if (action.kind === "question" && action.faq) {
      handleQuestionSelect(action.faq);
      return;
    }

    if (action.kind === "back") {
      handleBack();
      return;
    }

    if (action.kind === "support") {
      appendHistory(createMessage("user", "Falar com Suporte"));
      handleFalarComAtendente();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {showNudge && !isOpen && (
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className="max-w-[220px] rounded-2xl border border-blue-100 bg-white/95 px-4 py-2 text-sm text-slate-700 shadow-lg backdrop-blur transition-transform hover:-translate-y-0.5"
          aria-label="Abrir conversa com o COINFriend"
        >
          Olá! Posso te ajudar?
        </button>
      )}

      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={dismissNudge}
            className="group relative flex h-[74px] w-[74px] items-end justify-center overflow-hidden rounded-full border-2 border-white/20 bg-gradient-to-br from-[#003366] to-[#004a94] p-0 shadow-2xl outline-none transition-all duration-300 hover:scale-110 hover:brightness-110 hover:-rotate-[5deg] focus-visible:ring-2 focus-visible:ring-[#003366]/30 sm:h-[82px] sm:w-[82px]"
            aria-label={isOpen ? "Fechar COINFriend" : "Abrir COINFriend"}
          >
            <img
              src={botSesc.src}
              alt="COINFriend"
              className="relative mt-2 h-[76px] w-[76px] self-end object-contain object-bottom drop-shadow-[0_12px_24px_rgba(15,23,42,0.3)] sm:h-[84px] sm:w-[84px]"
            />
            <span className="absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#002d5a] text-white shadow-lg transition-colors group-hover:bg-[#001f40] sm:h-8 sm:w-8">
              {isOpen ? <X size={16} /> : <MessageCircle size={16} />}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent side="top" align="end" sideOffset={12} className="flex h-[420px] w-[95vw] max-w-[360px] flex-col p-0 md:h-[500px] md:w-[360px]">
          <Card className="flex h-full flex-1 flex-col overflow-hidden border-0 shadow-none">
            <CardHeader className="border-b bg-gray-50 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-base font-normal">
                  <div className="flex h-8 w-8 items-end justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-[#003366] to-[#004a94] shadow-sm">
                    <img src={botSesc.src} alt="Avatar do COINFriend" className="h-[34px] w-[34px] object-contain object-bottom" />
                  </div>
                  <div className="flex flex-col">
                    <span>COINFriend</span>
                    <span className="text-xs text-gray-500">Assistente oficial do ACompra</span>
                  </div>
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenChange(false)} aria-label="Fechar COINFriend">
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
              <ScrollArea className="flex-1 overflow-y-auto pr-3">
                <div className="space-y-4 pb-1">
                  {chatHistory.map((item) => (
                    <div key={item.id} className={`flex items-end gap-2 ${item.type === "user" ? "justify-end" : "justify-start"}`}>
                      {item.type === "bot" && (
                        <div className="flex h-8 w-8 shrink-0 items-end justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-[#003366] to-[#004a94]">
                          <img src={botSesc.src} alt="COINFriend" className="h-[34px] w-[34px] object-contain object-bottom" />
                        </div>
                      )}

                      <div className={`max-w-[85%] space-y-3 break-words rounded-2xl px-3 py-2 text-sm ${item.type === "user" ? "rounded-br-none bg-[#003366] text-white" : "rounded-bl-none bg-gray-100 text-black"}`}>
                        <div>{item.message}</div>

                        {item.actions && item.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.actions.map((action) => (
                              <Button
                                key={action.id}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-auto max-w-full whitespace-normal rounded-full px-3 py-1.5 text-left text-xs"
                                onClick={() => handleActionClick(action)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>

                      {item.type === "user" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  ))}

                  {(isSearching || isBootstrapping) && (
                    <div className="flex items-end gap-2 justify-start">
                      <div className="flex h-8 w-8 shrink-0 items-end justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-[#003366] to-[#004a94]">
                        <img src={botSesc.src} alt="COINFriend" className="h-[34px] w-[34px] object-contain object-bottom" />
                      </div>
                      <div className="rounded-2xl rounded-bl-none bg-gray-100 px-3 py-2 text-sm text-black">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#003366] [animation-delay:-0.25s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#003366] [animation-delay:-0.12s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#003366]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="shrink-0 border-t bg-white pt-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Digite sua dúvida..."
                    value={query}
                    onChange={(event) => {
                      dismissNudge();
                      setQuery(event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleAsk();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="bg-[#003366] text-white hover:bg-[#002244]"
                    onClick={() => void handleAsk()}
                    disabled={isSearching || isBootstrapping || !query.trim()}
                  >
                    {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
