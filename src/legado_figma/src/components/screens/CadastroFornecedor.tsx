import React, { useState } from 'react';
import { Building2, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';

interface CadastroFornecedorProps {
  onVoltar?: () => void;
}

export function CadastroFornecedor({ onVoltar }: CadastroFornecedorProps) {
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    categoria: '',
    telefone: '',
    email: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    contatoNome: '',
    contatoCargo: '',
    contatoTelefone: '',
    contatoEmail: '',
    observacoes: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    handleChange('cnpj', formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.razaoSocial || !formData.cnpj || !formData.email || !formData.categoria) {
      toast.error('Campos obrigatórios não preenchidos', {
        description: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return;
    }

    toast.success('Fornecedor cadastrado com sucesso!', {
      description: `${formData.razaoSocial} foi adicionado ao sistema.`
    });

    // Limpar formulário
    setFormData({
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      inscricaoEstadual: '',
      categoria: '',
      telefone: '',
      email: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      contatoNome: '',
      contatoCargo: '',
      contatoTelefone: '',
      contatoEmail: '',
      observacoes: ''
    });
  };

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Fornecedores</span>
            <span className="text-gray-400">/</span>
            <span className="text-black">Novo Cadastro</span>
          </div>
          {onVoltar && (
            <Button 
              onClick={onVoltar} 
              variant="outline" 
              className="border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-black">Cadastro de Fornecedor</h1>
          <p className="text-gray-600 mt-1">
            Preencha os dados do fornecedor para cadastrá-lo no sistema
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="max-w-4xl space-y-6">
            
            {/* Alerta */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Campos marcados com <span className="text-red-600">*</span> são obrigatórios
              </AlertDescription>
            </Alert>

            {/* Dados da Empresa */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <Building2 size={20} className="text-[#003366]" />
                  Dados da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razaoSocial" className="text-sm text-gray-700 mb-2 block">
                      Razão Social <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={(e) => handleChange('razaoSocial', e.target.value)}
                      placeholder="Digite a razão social"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="nomeFantasia" className="text-sm text-gray-700 mb-2 block">
                      Nome Fantasia
                    </Label>
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={(e) => handleChange('nomeFantasia', e.target.value)}
                      placeholder="Digite o nome fantasia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnpj" className="text-sm text-gray-700 mb-2 block">
                      CNPJ <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleCNPJChange(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="inscricaoEstadual" className="text-sm text-gray-700 mb-2 block">
                      Inscrição Estadual
                    </Label>
                    <Input
                      id="inscricaoEstadual"
                      value={formData.inscricaoEstadual}
                      onChange={(e) => handleChange('inscricaoEstadual', e.target.value)}
                      placeholder="Digite a inscrição estadual"
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria" className="text-sm text-gray-700 mb-2 block">
                      Categoria <span className="text-red-600">*</span>
                    </Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
                      <SelectTrigger id="categoria">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="material-escritorio">Material de Escritório</SelectItem>
                        <SelectItem value="informatica">Informática</SelectItem>
                        <SelectItem value="limpeza">Limpeza</SelectItem>
                        <SelectItem value="construcao">Construção</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="mobiliario">Mobiliário</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="telefone" className="text-sm text-gray-700 mb-2 block">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
                      E-mail <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@empresa.com.br"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-normal text-[16px] py-[8px]">Endereço</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="cep" className="text-sm text-gray-700 mb-2 block">
                      CEP
                    </Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleChange('cep', e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="endereco" className="text-sm text-gray-700 mb-2 block">
                      Endereço
                    </Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleChange('endereco', e.target.value)}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero" className="text-sm text-gray-700 mb-2 block">
                      Número
                    </Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleChange('numero', e.target.value)}
                      placeholder="Nº"
                    />
                  </div>

                  <div>
                    <Label htmlFor="complemento" className="text-sm text-gray-700 mb-2 block">
                      Complemento
                    </Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleChange('complemento', e.target.value)}
                      placeholder="Sala, Andar, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro" className="text-sm text-gray-700 mb-2 block">
                      Bairro
                    </Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleChange('bairro', e.target.value)}
                      placeholder="Bairro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade" className="text-sm text-gray-700 mb-2 block">
                      Cidade
                    </Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleChange('cidade', e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado" className="text-sm text-gray-700 mb-2 block">
                      Estado
                    </Label>
                    <Select value={formData.estado} onValueChange={(value) => handleChange('estado', value)}>
                      <SelectTrigger id="estado">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">SP</SelectItem>
                        <SelectItem value="RJ">RJ</SelectItem>
                        <SelectItem value="MG">MG</SelectItem>
                        <SelectItem value="ES">ES</SelectItem>
                        {/* Adicionar outros estados conforme necessário */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato Principal */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-normal text-[16px] py-[8px]">Contato Principal</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contatoNome" className="text-sm text-gray-700 mb-2 block">
                      Nome do Contato
                    </Label>
                    <Input
                      id="contatoNome"
                      value={formData.contatoNome}
                      onChange={(e) => handleChange('contatoNome', e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contatoCargo" className="text-sm text-gray-700 mb-2 block">
                      Cargo
                    </Label>
                    <Input
                      id="contatoCargo"
                      value={formData.contatoCargo}
                      onChange={(e) => handleChange('contatoCargo', e.target.value)}
                      placeholder="Cargo do contato"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contatoTelefone" className="text-sm text-gray-700 mb-2 block">
                      Telefone do Contato
                    </Label>
                    <Input
                      id="contatoTelefone"
                      value={formData.contatoTelefone}
                      onChange={(e) => handleChange('contatoTelefone', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contatoEmail" className="text-sm text-gray-700 mb-2 block">
                      E-mail do Contato
                    </Label>
                    <Input
                      id="contatoEmail"
                      type="email"
                      value={formData.contatoEmail}
                      onChange={(e) => handleChange('contatoEmail', e.target.value)}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-normal text-[16px] py-[8px]">Observações</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais sobre o fornecedor..."
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex gap-3 justify-end pt-4">
              {onVoltar && (
                <Button 
                  type="button"
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50"
                  onClick={onVoltar}
                >
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit"
                className="bg-[#003366] hover:bg-[#002244] text-white"
              >
                <Save size={18} className="mr-2" />
                Salvar Fornecedor
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
