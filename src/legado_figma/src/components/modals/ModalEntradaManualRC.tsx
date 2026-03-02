import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ModalEntradaManualRCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dados: DadosRC) => void;
}

export interface DadosRC {
  numeroRC: string;
  requisitante: string;
  departamento: string;
  objeto: string;
  categoria: string;
  prioridade: string;
  valorEstimado: string;
  prazoEntrega: string;
  justificativa: string;
  observacoes: string;
}

export function ModalEntradaManualRC({ open, onOpenChange, onConfirm }: ModalEntradaManualRCProps) {
  const [formData, setFormData] = useState<DadosRC>({
    numeroRC: '',
    requisitante: '',
    departamento: '',
    objeto: '',
    categoria: '',
    prioridade: 'Média',
    valorEstimado: '',
    prazoEntrega: '',
    justificativa: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof DadosRC, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!formData.numeroRC.trim()) {
      novosErros.numeroRC = 'Número da RC é obrigatório';
    }
    if (!formData.requisitante.trim()) {
      novosErros.requisitante = 'Requisitante é obrigatório';
    }
    if (!formData.departamento.trim()) {
      novosErros.departamento = 'Departamento é obrigatório';
    }
    if (!formData.objeto.trim()) {
      novosErros.objeto = 'Objeto é obrigatório';
    }
    if (!formData.categoria) {
      novosErros.categoria = 'Categoria é obrigatória';
    }
    if (!formData.valorEstimado.trim()) {
      novosErros.valorEstimado = 'Valor estimado é obrigatório';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = () => {
    if (validarFormulario()) {
      onConfirm(formData);
      toast.success('RC registrada manualmente com sucesso!');
      resetForm();
      onOpenChange(false);
    } else {
      toast.error('Por favor, preencha todos os campos obrigatórios');
    }
  };

  const resetForm = () => {
    setFormData({
      numeroRC: '',
      requisitante: '',
      departamento: '',
      objeto: '',
      categoria: '',
      prioridade: 'Média',
      valorEstimado: '',
      prazoEntrega: '',
      justificativa: '',
      observacoes: ''
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-6">
          <DialogHeader className="pt-6 sticky top-0 bg-white z-10 pb-4">
            <DialogTitle className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-1" size={24} />
              <div>
                <p className="text-xl">Entrada Manual de RC</p>
                <p className="text-sm text-gray-600 mt-1">
                  Modo de contingência - Insira manualmente os dados da Requisição de Compras
                </p>
              </div>
            </DialogTitle>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Este formulário permite o registro manual de 
                Requisições de Compra. Preencha todos os campos obrigatórios para garantir o 
                processamento correto da solicitação.
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-6 pb-4">
            {/* Seção 1: Identificação */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b pb-2">Identificação da RC</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="numeroRC">
                    Número da RC <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="numeroRC"
                    placeholder="Ex: RC-2024-089"
                    value={formData.numeroRC}
                    onChange={(e) => handleChange('numeroRC', e.target.value)}
                    className={errors.numeroRC ? 'border-red-500' : ''}
                  />
                  {errors.numeroRC && (
                    <p className="text-xs text-red-500">{errors.numeroRC}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prioridade">
                    Prioridade <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value) => handleChange('prioridade', value)}
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
            </div>

            {/* Seção 2: Solicitante */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b pb-2">Dados do Solicitante</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="requisitante">
                    Nome do Requisitante <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="requisitante"
                    placeholder="Ex: Carlos Alberto"
                    value={formData.requisitante}
                    onChange={(e) => handleChange('requisitante', e.target.value)}
                    className={errors.requisitante ? 'border-red-500' : ''}
                  />
                  {errors.requisitante && (
                    <p className="text-xs text-red-500">{errors.requisitante}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="departamento">
                    Departamento/Área <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.departamento}
                    onValueChange={(value) => handleChange('departamento', value)}
                  >
                    <SelectTrigger id="departamento" className={errors.departamento ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alimentação">Alimentação</SelectItem>
                      <SelectItem value="TI">TI</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="Eventos">Eventos</SelectItem>
                      <SelectItem value="RH">RH</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.departamento && (
                    <p className="text-xs text-red-500">{errors.departamento}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seção 3: Objeto da Requisição */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b pb-2">Objeto da Requisição</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="objeto">
                    Descrição do Objeto <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="objeto"
                    placeholder="Descreva detalhadamente o que está sendo requisitado..."
                    rows={3}
                    value={formData.objeto}
                    onChange={(e) => handleChange('objeto', e.target.value)}
                    className={errors.objeto ? 'border-red-500' : ''}
                  />
                  {errors.objeto && (
                    <p className="text-xs text-red-500">{errors.objeto}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="categoria">
                      Categoria <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => handleChange('categoria', value)}
                    >
                      <SelectTrigger id="categoria" className={errors.categoria ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                        <SelectItem value="Materiais">Materiais</SelectItem>
                        <SelectItem value="Serviços">Serviços</SelectItem>
                        <SelectItem value="Obras">Obras</SelectItem>
                        <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="Mobiliário">Mobiliário</SelectItem>
                        <SelectItem value="Alimentação">Alimentação</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.categoria && (
                      <p className="text-xs text-red-500">{errors.categoria}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="valorEstimado">
                      Valor Estimado <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="valorEstimado"
                      placeholder="Ex: R$ 50.000,00"
                      value={formData.valorEstimado}
                      onChange={(e) => handleChange('valorEstimado', e.target.value)}
                      className={errors.valorEstimado ? 'border-red-500' : ''}
                    />
                    {errors.valorEstimado && (
                      <p className="text-xs text-red-500">{errors.valorEstimado}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 4: Prazos e Justificativa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b pb-2">Prazos e Justificativas</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prazoEntrega">Prazo de Entrega Desejado</Label>
                  <Input
                    id="prazoEntrega"
                    type="date"
                    value={formData.prazoEntrega}
                    onChange={(e) => handleChange('prazoEntrega', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="justificativa">Justificativa da Requisição</Label>
                  <Textarea
                    id="justificativa"
                    placeholder="Justifique a necessidade desta requisição..."
                    rows={3}
                    value={formData.justificativa}
                    onChange={(e) => handleChange('justificativa', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="observacoes">Observações Adicionais</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações complementares relevantes..."
                    rows={2}
                    value={formData.observacoes}
                    onChange={(e) => handleChange('observacoes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={handleSubmit}>
            Registrar RC Manualmente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
