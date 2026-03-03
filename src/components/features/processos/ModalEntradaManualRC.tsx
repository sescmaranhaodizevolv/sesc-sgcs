"use client";

import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Prioridade } from "@/types";

interface ModalEntradaManualRCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfil: "admin" | "comprador";
  responsavelPadrao?: string;
  responsaveisDisponiveis: string[];
  onConfirm: (dados: DadosEntradaManualRC) => void;
}

export interface DadosEntradaManualRC {
  numeroRC: string;
  requisitante: string;
  departamento: string;
  objeto: string;
  modalidade: string;
  responsavel: string;
  prioridade: Prioridade;
  valorEstimado: string;
  prazoEntrega: string;
  justificativa: string;
  observacoes: string;
}

const estadoInicial: DadosEntradaManualRC = {
  numeroRC: "",
  requisitante: "",
  departamento: "",
  objeto: "",
  modalidade: "",
  responsavel: "",
  prioridade: "Média",
  valorEstimado: "",
  prazoEntrega: "",
  justificativa: "",
  observacoes: "",
};

export function ModalEntradaManualRC({
  open,
  onOpenChange,
  perfil,
  responsavelPadrao,
  responsaveisDisponiveis,
  onConfirm,
}: ModalEntradaManualRCProps) {
  const [formData, setFormData] = useState<DadosEntradaManualRC>(estadoInicial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const responsavelFinal = useMemo(() => {
    if (perfil === "comprador") {
      return responsavelPadrao ?? "";
    }
    return formData.responsavel;
  }, [perfil, responsavelPadrao, formData.responsavel]);

  const handleChange = (field: keyof DadosEntradaManualRC, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const novo = { ...prev };
        delete novo[field];
        return novo;
      });
    }
  };

  const validar = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.numeroRC.trim()) novosErros.numeroRC = "ID da RC é obrigatório";
    if (!formData.requisitante.trim()) novosErros.requisitante = "Requisitante é obrigatório";
    if (!formData.objeto.trim()) novosErros.objeto = "Objeto é obrigatório";
    if (!formData.modalidade) novosErros.modalidade = "Modalidade é obrigatória";
    if (!responsavelFinal) novosErros.responsavel = "Responsável é obrigatório";

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const resetForm = () => {
    setFormData(estadoInicial);
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validar()) return;

    onConfirm({
      ...formData,
      responsavel: responsavelFinal,
    });
    resetForm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl p-0">
        <div className="flex-1 overflow-y-auto px-6">
          <DialogHeader className="sticky top-0 z-10 bg-white pb-4 pt-6">
            <DialogTitle className="flex items-start gap-3">
              <AlertCircle className="mt-1 text-yellow-600" size={20} />
              <div>
                <p className="text-xl text-black">Cadastro Manual de Processo</p>
                <DialogDescription>
                  Entrada manual de RC para criação imediata de processo.
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="numero-rc">
                  ID da RC <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numero-rc"
                  placeholder="Ex: RC 123/2026"
                  value={formData.numeroRC}
                  onChange={(e) => handleChange("numeroRC", e.target.value)}
                  className={errors.numeroRC ? "border-red-500" : ""}
                />
                {errors.numeroRC && <p className="text-xs text-red-500">{errors.numeroRC}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) =>
                    handleChange("prioridade", value as DadosEntradaManualRC["prioridade"])
                  }
                >
                  <SelectTrigger id="prioridade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="requisitante">
                  Requisitante <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="requisitante"
                  placeholder="Nome do requisitante"
                  value={formData.requisitante}
                  onChange={(e) => handleChange("requisitante", e.target.value)}
                  className={errors.requisitante ? "border-red-500" : ""}
                />
                {errors.requisitante && <p className="text-xs text-red-500">{errors.requisitante}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="departamento">Departamento/Area</Label>
                <Input
                  id="departamento"
                  placeholder="Ex: TI, Eventos, Infraestrutura"
                  value={formData.departamento}
                  onChange={(e) => handleChange("departamento", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="objeto">
                Objeto <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="objeto"
                rows={3}
                placeholder="Descreva o objeto da compra"
                value={formData.objeto}
                onChange={(e) => handleChange("objeto", e.target.value)}
                className={errors.objeto ? "border-red-500" : ""}
              />
              {errors.objeto && <p className="text-xs text-red-500">{errors.objeto}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="modalidade">
                  Modalidade <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.modalidade} onValueChange={(value) => handleChange("modalidade", value)}>
                  <SelectTrigger id="modalidade" className={errors.modalidade ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dispensa">Dispensa</SelectItem>
                    <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                    <SelectItem value="Licitacao (Pesquisa de Preco)">Licitacao (Pesquisa de Preco)</SelectItem>
                    <SelectItem value="Pregao Eletronico">Pregao Eletronico</SelectItem>
                  </SelectContent>
                </Select>
                {errors.modalidade && <p className="text-xs text-red-500">{errors.modalidade}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="responsavel">
                  Responsavel <span className="text-red-500">*</span>
                </Label>
                {perfil === "admin" ? (
                  <Select value={formData.responsavel} onValueChange={(value) => handleChange("responsavel", value)}>
                    <SelectTrigger id="responsavel" className={errors.responsavel ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione o comprador" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsaveisDisponiveis.map((nome) => (
                        <SelectItem key={nome} value={nome}>
                          {nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="responsavel" value={responsavelFinal} disabled className="bg-gray-50" />
                )}
                {errors.responsavel && <p className="text-xs text-red-500">{errors.responsavel}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="valor-estimado">Valor Estimado</Label>
                <Input
                  id="valor-estimado"
                  placeholder="Ex: R$ 120.000,00"
                  value={formData.valorEstimado}
                  onChange={(e) => handleChange("valorEstimado", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prazo-entrega">Prazo de Entrega</Label>
                <Input
                  id="prazo-entrega"
                  type="date"
                  value={formData.prazoEntrega}
                  onChange={(e) => handleChange("prazoEntrega", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="justificativa">Justificativa</Label>
              <Textarea
                id="justificativa"
                rows={3}
                value={formData.justificativa}
                onChange={(e) => handleChange("justificativa", e.target.value)}
              />
            </div>

            <div className="space-y-1.5 pb-3">
              <Label htmlFor="observacoes">Observacoes Internas</Label>
              <Textarea
                id="observacoes"
                rows={2}
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 rounded-b-[8px] border-t bg-white px-6 pb-4 pt-4">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button className="flex-1 bg-[#003366] text-white hover:bg-[#002244]" onClick={handleSubmit}>
            Criar Processo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
